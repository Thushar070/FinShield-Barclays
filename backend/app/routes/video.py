from fastapi import APIRouter,UploadFile,File
import shutil,os
from ai_engine.video.video_detector import detect_video_fraud

router=APIRouter()

UPLOAD_DIR="uploads"
os.makedirs(UPLOAD_DIR,exist_ok=True)

@router.post("/analyze-video")
async def analyze_video(file:UploadFile=File(...)):
    file_path=os.path.join(UPLOAD_DIR,file.filename)

    with open(file_path,"wb") as buffer:
        shutil.copyfileobj(file.file,buffer)

    score=detect_video_fraud(file_path)

    return {
        "type":"video",
        "video_risk":score
    }
