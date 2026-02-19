from fastapi import APIRouter,UploadFile,File
import shutil,os

from ai_engine.image.image_detector import detect_image_phishing
from ai_engine.image.ai_image_detector import detect_ai_generated

router=APIRouter()

UPLOAD_DIR="uploads"
os.makedirs(UPLOAD_DIR,exist_ok=True)

@router.post("/analyze-image")
async def analyze_image(file:UploadFile=File(...)):
    file_path=os.path.join(UPLOAD_DIR,file.filename)

    # save uploaded file
    with open(file_path,"wb") as buffer:
        shutil.copyfileobj(file.file,buffer)

    # run both detectors
    ocr_score=detect_image_phishing(file_path)
    ai_score=detect_ai_generated(file_path)

    final=max(ocr_score,ai_score)

    return {
        "type":"image",
        "image_risk":final,
        "ocr_risk":ocr_score,
        "ai_image_risk":ai_score
    }
