import logging
from transformers import pipeline
from PIL import Image

logger = logging.getLogger("finshield")

# lazy load
detector = None

def _get_detector():
    global detector
    if detector is None:
        logger.info("Initializing AI image detection model lazily...")
        detector = pipeline(
            "image-classification",
            model="umm-maybe/AI-image-detector"
        )
    return detector

def detect_ai_generated(image_path:str)->float:
    img=Image.open(image_path)
    model = _get_detector()
    result=model(img)[0]

    label=result["label"].lower()
    score=result["score"]

    # if model says AI-generated → high risk
    if "ai" in label or "generated" in label:
        return round(score,2)
    else:
        return round(1-score,2)
