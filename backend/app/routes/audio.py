from fastapi import APIRouter,UploadFile,File
import shutil,os
from ai_engine.audio.audio_detector import detect_audio_fraud

router=APIRouter()

UPLOAD_DIR="uploads"
os.makedirs(UPLOAD_DIR,exist_ok=True)

@router.post("/analyze-audio")
async def analyze_audio(file:UploadFile=File(...)):
    file_path=os.path.join(UPLOAD_DIR,file.filename)

    with open(file_path,"wb") as buffer:
        shutil.copyfileobj(file.file,buffer)

    score=detect_audio_fraud(file_path)

    return {
        "type":"audio",
        "audio_risk":score
    }
