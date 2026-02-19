from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.dependencies import get_current_user
from backend.app.models import User
from backend.app.services.scan_service import analyze_video_file

router = APIRouter(tags=["Video Analysis"])


@router.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return analyze_video_file(db, user.id, file)
