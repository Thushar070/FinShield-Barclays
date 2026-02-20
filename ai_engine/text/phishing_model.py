import logging
from transformers import pipeline
from ai_engine.hybrid_scorer import analyze_heuristic_signals, combine_scores

logger = logging.getLogger("finshield")

# lazy load
classifier = None

def _get_classifier():
    global classifier
    if classifier is None:
        logger.info("Initializing text classification model lazily...")
        classifier = pipeline(
            "text-classification",
            model="mrm8488/bert-tiny-finetuned-sms-spam-detection"
        )
    return classifier

def detect_phishing(text: str) -> dict:
    """
    Returns full analysis including hybrid score, raw scores, and signals.
    """
    if not text.strip():
        return {
            "final_score": 0.0,
            "ai_score": 0.0,
            "heuristic_score": 0.0,
            "signals": ["No content provided"]
        }

    # 1. AI BERT Model
    model = _get_classifier()
    result = model(text[:512])[0]
    # BERT model returns LABEL_0 (Benign) or LABEL_1 (Spam/Phishing)
    # The 'score' is confidence in that label.
    # We normalize to always return P(Phishing)
    if result["label"].lower() in ["spam", "phishing", "label_1"]:
        ai_score = round(result["score"], 2)
    else:
        ai_score = round(1 - result["score"], 2)

    # 2. Heuristic Analysis
    heuristic_data = analyze_heuristic_signals(text)
    heuristic_score = heuristic_data["heuristic_score"]

    # 3. Combine
    final_score = combine_scores(ai_score, heuristic_data)

    return {
        "final_score": final_score,
        "ai_score": ai_score,
        "heuristic_score": heuristic_score,
        "signals": heuristic_data["signals"],
        "categories": heuristic_data["categories"]
    }

def get_legacy_score(text: str) -> float:
    """Wrapper for older consumers expecting just a float"""
    return detect_phishing(text)["final_score"]
