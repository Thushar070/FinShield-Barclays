from fastapi import APIRouter
from backend.app.services.threat_intel_service import threat_intel_engine

router = APIRouter(prefix="/api/v1/intel", tags=["Threat Intelligence"])

@router.get("/status")
async def get_intel_status():
    """
    Returns the current global intelligence threat level.
    """
    status = threat_intel_engine.get_current_threat_status()
    return {
        "success": True,
        "data": status
    }
