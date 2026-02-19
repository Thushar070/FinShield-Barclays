from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.dependencies import get_current_user
from backend.app.models import User, Scan

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/profile")
def get_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total = db.query(Scan).filter(Scan.user_id == user.id).count()
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else "",
        "total_scans": total
    }
