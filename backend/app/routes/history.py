from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.dependencies import get_current_user
from backend.app.models import User
from backend.app.services.history_service import get_scan_history, get_scan_detail, get_scan_stats

router = APIRouter(prefix="/history", tags=["Scan History"])


@router.get("/")
def list_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    scan_type: str = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_scan_history(db, user.id, page, per_page, scan_type)


@router.get("/stats")
def stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_scan_stats(db, user.id)


@router.get("/{scan_id}")
def detail(scan_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = get_scan_detail(db, user.id, scan_id)
    if not result:
        return {"error": "Scan not found"}
    return result
