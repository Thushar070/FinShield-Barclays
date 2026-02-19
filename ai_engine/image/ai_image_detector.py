from transformers import pipeline
from PIL import Image

# AI-generated image detector model
detector=pipeline(
    "image-classification",
    model="umm-maybe/AI-image-detector"
)

def detect_ai_generated(image_path:str)->float:
    img=Image.open(image_path)
    result=detector(img)[0]

    label=result["label"].lower()
    score=result["score"]

    # if model says AI-generated → high risk
    if "ai" in label or "generated" in label:
        return round(score,2)
    else:
        return round(1-score,2)
