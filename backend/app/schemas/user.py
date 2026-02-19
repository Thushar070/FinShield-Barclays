from pydantic import BaseModel
from typing import Optional


class UserProfile(BaseModel):
    id: str
    email: str
    username: str
    role: str
    created_at: str
    total_scans: int = 0

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    username: Optional[str] = None
