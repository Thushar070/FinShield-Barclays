from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ScanResponse(BaseModel):
    id: str
    scan_type: str
    input_preview: Optional[str] = None
    risk_score: float
    severity: str
    status: str
    tags: Optional[str] = None
    created_at: str
    explanation: Optional[dict] = None
    risk_breakdown: Optional[List[dict]] = None

    class Config:
        from_attributes = True


class ScanHistoryResponse(BaseModel):
    scans: List[ScanResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class TextAnalysisRequest(BaseModel):
    text: str


class ScanStatsResponse(BaseModel):
    total_scans: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    avg_risk_score: float
    scans_by_type: dict
    recent_trend: List[dict]
