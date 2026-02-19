from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.dependencies import get_current_user
from backend.app.models import User
from backend.app.services.scan_service import analyze_audio_file

router = APIRouter(tags=["Audio Analysis"])


@router.post("/analyze-audio")
async def analyze_audio(file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return analyze_audio_file(db, user.id, file)
