from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.dependencies import get_current_user
from backend.app.models import User
from backend.app.schemas.scan import TextAnalysisRequest
from backend.app.services.scan_service import analyze_text, analyze_fusion_scan

router = APIRouter(tags=["Text Analysis"])


@router.post("/analyze")
def analyze(data: TextAnalysisRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return analyze_text(db, user.id, data.text)

@router.post("/analyze/fusion")
def analyze_fusion(text: str = Form(""), file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not text and not file:
        raise HTTPException(status_code=400, detail="Must provide text or file for fusion scan.")
    return analyze_fusion_scan(db, user.id, text, file)
