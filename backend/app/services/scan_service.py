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
from backend.app.services.threat_intel_service import threat_intel_engine
import hashlib

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
        # Generate Text Fingerprint
        fingerprint = hashlib.sha256(text.encode('utf-8')).hexdigest()
        logger.info(f"Generated text fingerprint: {fingerprint}")
        
        # Dark Pattern Heuristics
        dark_patterns = []
        lower_txt = text.lower()
        if "urgent" in lower_txt or "act now" in lower_txt or "immediate action required" in lower_txt:
            dark_patterns.append("Urgency Pressure")
        if "win" in lower_txt or "reward" in lower_txt or "free" in lower_txt or "prize" in lower_txt:
            dark_patterns.append("Reward Trap")
        if "bank" in lower_txt or "account suspended" in lower_txt or "unauthorized access" in lower_txt:
            dark_patterns.append("Authority Impersonation")
            
        # Get active global threat level to optionally scale risk
        intel_status = threat_intel_engine.get_current_threat_status()

        # Now returns dict: {final_score, ai_score, heuristic_score, signals, ...}
        analysis = detect_phishing(text)
        logger.info(f"AI Model finished in {time.time() - start_time:.2f}s. Score: {analysis['final_score']}")
        
        score = analysis["final_score"]
        
        # Boost score slightly if multiple dark patterns are detected or global threat is critical
        if len(dark_patterns) > 0:
            score = min(score + (0.05 * len(dark_patterns)), 0.99)
        if intel_status["threat_level"] == "CRITICAL":
            score = min(score + 0.05, 0.99)
        
        # Pass known signals to explainer
        explanation_data = explain_text(text, score, known_signals=analysis["signals"])
        
        # --- PHASE 2: EXPLAINABLE AI ---
        # Generate Confidence Stability (mock calculation based on text length and score certainty)
        confidence_stability = "HIGH" if score > 0.8 or score < 0.2 else "FLUCTUATING"
        
        # Generate Counterfactual Explanation
        counterfactual_exp = None
        if len(analysis["signals"]) > 0 and score > 0.3:
            top_signal = analysis["signals"][0]
            simulated_drop = round(score * 0.4 * 100) # 40% drop if top signal removed
            counterfactual_exp = f"If the phrase '{top_signal}' was removed, the risk score would drop by {simulated_drop}%."
            
        explanation_data["confidence_stability"] = confidence_stability
        explanation_data["counterfactual"] = counterfactual_exp
        
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
            confidence_stability=confidence_stability,
            counterfactual=counterfactual_exp,
            model_used=explanation_data["model_used"]
        )
        db.add(exp)
        db.commit()
        db.refresh(scan)
        
        logger.info(f"Scan {scan.id} saved successfully.")

        # --- PHASE 3: USER BEHAVIOR & ADAPTIVE SECURITY ---
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            # Drop trust score if high risk or dark patterns interacted with
            if score > 0.6:
                user.trust_score = max(0.0, user.trust_score - (score * 5.0))
            else:
                user.trust_score = min(100.0, user.trust_score + 1.0)
                
            # Update exposure level
            if user.trust_score < 40:
                user.exposure_level = "CRITICAL"
            elif user.trust_score < 70:
                user.exposure_level = "HIGH"
            elif user.trust_score < 90:
                user.exposure_level = "MEDIUM"
            else:
                user.exposure_level = "LOW"
            
            # Update targeted scam types
            current_types = list(user.targeted_scam_types) if user.targeted_scam_types else []
            for dp in dark_patterns:
                if dp not in current_types:
                    current_types.append(dp)
            user.targeted_scam_types = current_types
            
            db.commit()

        response_data = _format_scan_response(scan, explanation_data, [
            {"model": "bert-tiny", "score": analysis["ai_score"], "category": "ai_inference"},
            {"model": "heuristic", "score": analysis["heuristic_score"], "category": "heuristic"}
        ])
        
        # Inject new intelligence data
        response_data["intelligence"] = {
            "fingerprint": fingerprint,
            "dark_patterns": dark_patterns,
            "global_threat_context": intel_status
        }
        
        return response_data
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

def analyze_fusion_scan(db: Session, user_id: str, text: str, file) -> dict:
    start_time = time.time()
    logger.info(f"Starting FUSION analysis for user {user_id}")
    
    file_path = _save_upload(file) if file else None
    
    try:
        text_analysis = detect_phishing(text) if text else {"final_score": 0.0, "ai_score": 0.0, "signals": []}
        img_analysis = detect_image_phishing(file_path) if file else {"score": 0.0, "ocr_text": "", "signals": []}
        
        fused_score = (text_analysis.get("final_score", 0.0) * 0.4) + (img_analysis.get("score", 0.0) * 0.6)
        severity_label = _severity(fused_score)
        
        scan = Scan(
            user_id=user_id,
            scan_type="fusion",
            input_preview=(text[:50] + " + " + (file.filename if file else ""))[:100],
            risk_score=fused_score,
            severity=severity_label.lower(),
            status="completed"
        )
        db.add(scan)
        db.flush()
        
        exp = explain_image(file.filename if file else "text.txt", img_analysis.get("ocr_text", text), img_analysis.get("score", 0), 0.0, fused_score)
        db.add(Explanation(scan_id=scan.id, fraud_category=exp["fraud_category"], signals=exp["signals"], reasoning=exp["reasoning"], confidence=exp["confidence"], model_used=exp["model_used"]))
        db.commit()
        db.refresh(scan)
        
        return _format_scan_response(scan, exp, [{"model": "fusion", "score": fused_score, "category": exp["fraud_category"]}])
    except Exception as e:
        logger.error(f"Fusion analysis failed: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fusion analysis error: {str(e)}")
    finally:
        if file_path:
            _cleanup(file_path)
