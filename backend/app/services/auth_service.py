from sqlalchemy.orm import Session
from backend.app.models import User
from backend.app.security.password import hash_password, verify_password
from backend.app.security.jwt_handler import create_access_token, create_refresh_token, decode_token


def signup_user(db: Session, email: str, username: str, password: str) -> dict:
    if db.query(User).filter(User.email == email).first():
        return {"error": "Email already registered"}
    if db.query(User).filter(User.username == username).first():
        return {"error": "Username already taken"}

    user = User(
        email=email,
        username=username,
        password_hash=hash_password(password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    tokens = _generate_tokens(user)
    return tokens


def login_user(db: Session, email: str, password: str) -> dict:
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user or not verify_password(password, user.password_hash):
        return {"error": "Invalid email or password"}

    return _generate_tokens(user)


def refresh_tokens(db: Session, refresh_token: str) -> dict:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        return {"error": "Invalid refresh token"}

    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        return {"error": "User not found"}

    return _generate_tokens(user)


def _generate_tokens(user: User) -> dict:
    token_data = {"sub": user.id, "email": user.email, "role": user.role}
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "role": user.role
        }
    }
