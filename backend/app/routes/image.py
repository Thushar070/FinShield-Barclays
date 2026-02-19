from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.dependencies import get_current_user
from backend.app.models import User
from backend.app.services.scan_service import analyze_image_file

router = APIRouter(tags=["Image Analysis"])


@router.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return analyze_image_file(db, user.id, file)
