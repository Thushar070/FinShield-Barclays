from ai_engine.hybrid_scorer import analyze_heuristic_signals

def explain_text(text: str, score: float, known_signals: list = None) -> dict:
    """
    Generates explanation for text analysis.
    If known_signals provided (from hybrid scorer), uses them directly.
    Otherwise runs heuristic analysis locally.
    """
    if known_signals is None:
        analysis = analyze_heuristic_signals(text)
        signals = analysis["signals"]
    else:
        signals = known_signals

    category = _categorize(signals, score)

    if score >= 0.8:
        reasoning = f"CRITICAL RISK: Analysis detected {len(signals)} strong fraud indicators. The content contains specific patterns highly correlated with {category.replace('_', ' ')}. Do not interact with links or attachments."
    elif score >= 0.6:
        reasoning = f"HIGH RISK: This content shows multiple signs of {category.replace('_', ' ')}. {len(signals)} suspicious signal(s) were flagged. Proceed with extreme caution."
    elif score >= 0.3:
        reasoning = f"MEDIUM RISK: Some suspicious elements were detected. While not definitively malicious, verify the sender independently."
    else:
        reasoning = "LOW RISK: Content appears legitimate. No significant fraud indicators were found."

    if not signals and score < 0.3:
        signals.append("No specific threats detected")

    return {
        "fraud_category": category,
        "signals": signals,
        "reasoning": reasoning,
        "confidence": score,
        "model_used": "Hybrid (BERT + Heuristics)"
    }


def explain_image(filename: str, ocr_text: str, ocr_score: float, ai_score: float, final_score: float) -> dict:
    # Run text heuristics on OCR content
    text_analysis = analyze_heuristic_signals(ocr_text)
    text_signals = text_analysis["signals"]
    
    signals = []
    if ai_score > 0.6:
        signals.append(f"Image likely AI-generated (Confidence: {int(ai_score*100)}%)")
    
    # Merge text signals
    signals.extend([f"OCR: {s}" for s in text_signals])

    category = "ai_generated" if ai_score > ocr_score else "phishing_document"
    
    if final_score >= 0.7:
        reasoning = f"HIGH RISK IMAGE: detected {len(signals)} specific threat indicators. "
        if ai_score > 0.7:
            reasoning += "Primary risk is AI manipulation/deepfake content. "
        else:
            reasoning += "Primary risk is textual phishing content within the image. "
    elif final_score >= 0.4:
        reasoning = "MEDIUM RISK: Image contains suspicious elements. Verify source authenticity."
    else:
        reasoning = "LOW RISK: Image appears benign."

    return {
        "fraud_category": category,
        "signals": signals,
        "reasoning": reasoning,
        "confidence": final_score,
        "model_used": "Multi-Modal (OCR + visual-bert + heuristics)"
    }


def explain_audio(filename: str, transcription: str, score: float) -> dict:
    # Run heuristics on transcription
    text_analysis = analyze_heuristic_signals(transcription)
    text_signals = text_analysis["signals"]

    signals = []
    if score > 0.6:
        signals.append("Voice pattern matches known vishing signatures")
    
    signals.extend([f"Audio content: {s}" for s in text_signals])

    category = "vishing"
    if score >= 0.7:
        reasoning = f"HIGH RISK AUDIO: {len(signals)} fraud indicators detected in speech patterns and content. Likely a vishing attempt."
    elif score >= 0.4:
        reasoning = "MEDIUM RISK: Speech contains some suspicious keywords or patterns."
    else:
        reasoning = "LOW RISK: Audio appears legitimate."

    return {
        "fraud_category": category,
        "signals": signals,
        "reasoning": reasoning,
        "confidence": score,
        "model_used": "Audio-Hybrid (Whisper + heuristics)"
    }


def explain_video(filename: str, transcription: str, score: float) -> dict:
    # Run heuristics on transcription
    text_analysis = analyze_heuristic_signals(transcription)
    text_signals = text_analysis["signals"]

    signals = []
    if score > 0.6:
        signals.append("Visual content flagged as suspicious deepfake/manipulated")
    
    signals.extend([f"Video Audio: {s}" for s in text_signals])

    category = "multimedia_fraud"
    
    if score >= 0.7:
        reasoning = f"HIGH RISK VIDEO: Strong evidence of manipulation or fraud in both visual and audio tracks."
    else:
        reasoning = "Analysis complete. Review signals above."

    return {
        "fraud_category": category,
        "signals": signals,
        "reasoning": reasoning,
        "confidence": score,
        "model_used": "Video-Hybrid (Frame analysis + Audio heuristics)"
    }


def _categorize(signals: list, score: float) -> str:
    # determine category based on most frequent signal type
    text = " ".join(signals).lower()
    if "urgent" in text: return "urgency_scam"
    if "bank" in text or "payment" in text: return "financial_fraud"
    if "password" in text or "login" in text: return "credential_harvesting"
    if "threat" in text: return "coercion/extortion"
    if score > 0.5: return "general_suspicious"
    return "benign"
