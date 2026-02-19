from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.dependencies import get_current_user
from backend.app.models import User
from backend.app.schemas.scan import TextAnalysisRequest
from backend.app.services.scan_service import analyze_text

router = APIRouter(tags=["Text Analysis"])


@router.post("/analyze")
def analyze(data: TextAnalysisRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return analyze_text(db, user.id, data.text)
