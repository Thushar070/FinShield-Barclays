import pytesseract
from PIL import Image
from ai_engine.text.phishing_model import detect_phishing

# Tell python where tesseract is installed (Windows path)
pytesseract.pytesseract.tesseract_cmd=r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def detect_image_phishing(image_path:str)->float:
    try:
        img=Image.open(image_path)

        # extract text from image
        extracted_text=pytesseract.image_to_string(img)

        if not extracted_text.strip():
            return 0.0

        # reuse text detector on OCR output
        score=detect_phishing(extracted_text)
        return score

    except Exception:
        return 0.0
