import pytesseract
import cv2
from ai_engine.text.phishing_model import detect_phishing

def detect_image_phishing(image_path: str) -> dict:
    img = cv2.imread(image_path)
    if img is None:
        return {"score": 0.0, "ocr_text": "", "signals": []}

    # Extract text with Tesseract
    try:
        text = pytesseract.image_to_string(img)
    except Exception:
        text = ""

    # Skip empty images
    if len(text.strip()) < 5:
        return {"score": 0.0, "ocr_text": "", "signals": ["No text detected in image"]}

    # Analyze text using hybrid model
    analysis = detect_phishing(text)
    
    return {
        "score": analysis["final_score"],
        "ocr_text": text.strip(),
        "signals": analysis["signals"]
    }
