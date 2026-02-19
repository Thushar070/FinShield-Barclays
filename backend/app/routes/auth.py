from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.auth import SignupRequest, LoginRequest, RefreshRequest
from backend.app.services.auth_service import signup_user, login_user, refresh_tokens

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    result = signup_user(db, data.email, data.username, data.password)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"success": True, "message": "Account created", **result}


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    result = login_user(db, data.email, data.password)
    if "error" in result:
        raise HTTPException(status_code=401, detail=result["error"])
    return {"success": True, "message": "Login successful", **result}


@router.post("/refresh")
def refresh(data: RefreshRequest, db: Session = Depends(get_db)):
    result = refresh_tokens(db, data.refresh_token)
    if "error" in result:
        raise HTTPException(status_code=401, detail=result["error"])
    return {"success": True, "message": "Tokens refreshed", **result}
