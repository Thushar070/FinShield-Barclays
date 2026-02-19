import os
import shutil
import logging
import uuid
import time
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend.app.models import Scan, ScanFile, RiskScore, Explanation
from backend.app.config import UPLOAD_DIR
from backend.app.security.validators import compute_file_hash, sanitize_filename

from ai_engine.text.phishing_model import detect_phishing
from ai_engine.image.image_detector import detect_image_phishing
from ai_engine.image.ai_image_detector import detect_ai_generated
from ai_engine.audio.audio_detector import detect_audio_fraud
from ai_engine.video.video_detector import detect_video_fraud
from ai_engine.explainability import explain_text, explain_image, explain_audio, explain_video

logger = logging.getLogger("finshield")

os.makedirs(UPLOAD_DIR, exist_ok=True)


def _severity(score: float) -> str:
    if score >= 0.8:
        return "CRITICAL"
    if score >= 0.6:
        return "HIGH"
    if score >= 0.3:
        return "MEDIUM"
    return "LOW"


def _validate_mime(file, allowed_prefixes: list):
    """Strict execution control: Prevent invalid file types from entering the AI pipeline."""
    if not file.content_type:
        logger.warning(f"Validation failed: Missing Content-Type for file {file.filename}")
        raise HTTPException(status_code=400, detail="Missing Content-Type header")
    
    # Check if content type matches any allowed prefix (e.g., 'image/')
    if not any(file.content_type.startswith(p) for p in allowed_prefixes):
        allowed_str = ", ".join([p.rstrip('/') for p in allowed_prefixes])
        logger.warning(f"Validation failed: Invalid MIME {file.content_type} for file {file.filename}. Expected {allowed_str}")
        raise HTTPException(
            status_code=400, 
            detail=f"File type '{file.content_type}' not allowed for this scan. Expected: {allowed_str}"
        )


def analyze_text(db: Session, user_id: str, text: str) -> dict:
    start_time = time.time()
    logger.info(f"Starting TEXT analysis for user {user_id} (Length: {len(text)})")
    
    if not text or not text.strip():
         raise HTTPException(status_code=400, detail="Input text cannot be empty")

    try:
        # Now returns dict: {final_score, ai_score, heuristic_score, signals, ...}
        analysis = detect_phishing(text)
        logger.info(f"AI Model finished in {time.time() - start_time:.2f}s. Score: {analysis['final_score']}")
        
        score = analysis["final_score"]
        
        # Pass known signals to explainer
        explanation_data = explain_text(text, score, known_signals=analysis["signals"])
        
        # Enforce severity consistency here
        severity_label = _severity(score)

        scan = Scan(
            user_id=user_id,
            scan_type="text",
            input_preview=text[:100],
            risk_score=score,
            severity=severity_label.lower(), # Keep internal lowercase for DB consistency if enum? Or just string.
            status="completed"
        )
        db.add(scan)
        db.flush()

        # Store detailed model breakdown
        db.add(RiskScore(scan_id=scan.id, model_name="bert-tiny-finetuned", score=analysis["ai_score"], category="ai_inference"))
        db.add(RiskScore(scan_id=scan.id, model_name="heuristic-engine", score=analysis["heuristic_score"], category="rule_engine"))

        exp = Explanation(
            scan_id=scan.id,
            fraud_category=explanation_data["fraud_category"],
            signals=explanation_data["signals"],
            reasoning=explanation_data["reasoning"],
            confidence=explanation_data["confidence"],
            model_used=explanation_data["model_used"]
        )
        db.add(exp)
        db.commit()
        db.refresh(scan)
        
        logger.info(f"Scan {scan.id} saved successfully.")

        return _format_scan_response(scan, explanation_data, [
            {"model": "bert-tiny", "score": analysis["ai_score"], "category": "ai_inference"},
            {"model": "heuristic", "score": analysis["heuristic_score"], "category": "heuristic"}
        ])
    except Exception as e:
        logger.error(f"Text analysis failed: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Analysis engine error: {str(e)}")


def analyze_image_file(db: Session, user_id: str, file) -> dict:
    start_time = time.time()
    logger.info(f"Starting IMAGE analysis for user {user_id}: {file.filename}")
    
    _validate_mime(file, ["image/"])
    
    file_path = _save_upload(file)
    try:
        ocr_result = detect_image_phishing(file_path)
        ai_score = detect_ai_generated(file_path)
        
        logger.info(f"Image analysis finished in {time.time() - start_time:.2f}s.")
        
        ocr_score = ocr_result["score"]
        final_score = round(max(ocr_score, ai_score), 2)
        severity_label = _severity(final_score)
        
        explanation_data = explain_image(
            file.filename, 
            ocr_text=ocr_result["ocr_text"], 
            ocr_score=ocr_score, 
            ai_score=ai_score, 
            final_score=final_score
        )

        scan = Scan(
            user_id=user_id,
            scan_type="image",
            input_preview=file.filename,
            risk_score=final_score,
            severity=severity_label.lower(),
            status="completed"
        )
        db.add(scan)
        db.flush()

        file_hash = compute_file_hash(file_path)
        sf = ScanFile(scan_id=scan.id, filename=file.filename, file_type=file.content_type, file_size=file.size, file_hash=file_hash)
        db.add(sf)

        db.add(RiskScore(scan_id=scan.id, model_name="tesseract-ocr+hybrid", score=ocr_score, category="phishing_text"))
        db.add(RiskScore(scan_id=scan.id, model_name="ai-image-detector", score=ai_score, category="ai_generated"))

        exp = Explanation(scan_id=scan.id, fraud_category=explanation_data["fraud_category"], signals=explanation_data["signals"], reasoning=explanation_data["reasoning"], confidence=explanation_data["confidence"], model_used=explanation_data["model_used"])
        db.add(exp)
        db.commit()
        db.refresh(scan)

        return _format_scan_response(scan, explanation_data, [
            {"model": "ocr-hybrid", "score": ocr_score, "category": "phishing_text"},
            {"model": "ai-visual", "score": ai_score, "category": "ai_generated"}
        ])
    except Exception as e:
        logger.error(f"Image analysis failed: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Image analysis error: {str(e)}")
    finally:
        _cleanup(file_path)


def analyze_audio_file(db: Session, user_id: str, file) -> dict:
    start_time = time.time()
    logger.info(f"Starting AUDIO analysis for user {user_id}: {file.filename}")
    _validate_mime(file, ["audio/"])

    file_path = _save_upload(file)
    try:
        result = detect_audio_fraud(file_path)
        score = result["score"]
        severity_label = _severity(score)
        logger.info(f"Audio analysis finished in {time.time() - start_time:.2f}s. Score: {score}")
        
        explanation_data = explain_audio(file.filename, transcription=result["transcription"], score=score)

        scan = Scan(user_id=user_id, scan_type="audio", input_preview=file.filename, risk_score=score, severity=severity_label.lower(), status="completed")
        db.add(scan)
        db.flush()

        file_hash = compute_file_hash(file_path)
        db.add(ScanFile(scan_id=scan.id, filename=file.filename, file_type=file.content_type, file_size=file.size, file_hash=file_hash))
        db.add(RiskScore(scan_id=scan.id, model_name="whisper-hybrid", score=score, category="audio_phishing"))

        db.add(Explanation(scan_id=scan.id, fraud_category=explanation_data["fraud_category"], signals=explanation_data["signals"], reasoning=explanation_data["reasoning"], confidence=explanation_data["confidence"], model_used=explanation_data["model_used"]))
        db.commit()
        db.refresh(scan)

        return _format_scan_response(scan, explanation_data, [{"model": "whisper-hybrid", "score": score, "category": "audio_phishing"}])
    except Exception as e:
        logger.error(f"Audio analysis failed: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Audio analysis error: {str(e)}")
    finally:
        _cleanup(file_path)


def analyze_video_file(db: Session, user_id: str, file) -> dict:
    start_time = time.time()
    logger.info(f"Starting VIDEO analysis for user {user_id}: {file.filename}")
    _validate_mime(file, ["video/"])

    file_path = _save_upload(file)
    try:
        result = detect_video_fraud(file_path)
        score = result["score"]
        severity_label = _severity(score)
        logger.info(f"Video analysis finished in {time.time() - start_time:.2f}s. Score: {score}")
        
        explanation_data = explain_video(file.filename, transcription=result["transcription"], score=score)

        scan = Scan(user_id=user_id, scan_type="video", input_preview=file.filename, risk_score=score, severity=severity_label.lower(), status="completed")
        db.add(scan)
        db.flush()

        file_hash = compute_file_hash(file_path)
        db.add(ScanFile(scan_id=scan.id, filename=file.filename, file_type=file.content_type, file_size=file.size, file_hash=file_hash))
        db.add(RiskScore(scan_id=scan.id, model_name="video-fusion", score=score, category="video_fraud"))

        db.add(Explanation(scan_id=scan.id, fraud_category=explanation_data["fraud_category"], signals=explanation_data["signals"], reasoning=explanation_data["reasoning"], confidence=explanation_data["confidence"], model_used=explanation_data["model_used"]))
        db.commit()
        db.refresh(scan)

        return _format_scan_response(scan, explanation_data, [{"model": "video-fusion", "score": score, "category": "video_fraud"}])
    except Exception as e:
        logger.error(f"Video analysis failed: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Video analysis error: {str(e)}")
    finally:
        _cleanup(file_path)


def _save_upload(file) -> str:
    safe_name = sanitize_filename(file.filename)
    base, ext = os.path.splitext(safe_name)
    unique_name = f"{base}_{uuid.uuid4().hex[:8]}{ext}"
    
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return file_path


def _cleanup(file_path: str):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        logger.warning(f"Failed to clean up {file_path}: {e}")


def _format_scan_response(scan: Scan, explanation: dict, risk_breakdown: list) -> dict:
    severity_upper = scan.severity.upper() if scan.severity else "LOW"
    
    return {
        "success": True, # Explicit success flag for api consistency
        "id": scan.id,
        "type": scan.scan_type, # Standardized key: type
        "scan_type": scan.scan_type, # Keep legacy key for compatibility
        "input_preview": scan.input_preview,
        "risk_score": scan.risk_score,
        "severity": severity_upper, # Standardized: UPPERCASE
        "timestamp": scan.created_at.isoformat() if scan.created_at else datetime.now().isoformat(), # Standardized key: timestamp
        "created_at": scan.created_at.isoformat() if scan.created_at else datetime.now().isoformat(),
        "status": scan.status,
        "explanation": explanation,
        "risk_breakdown": risk_breakdown
    }
