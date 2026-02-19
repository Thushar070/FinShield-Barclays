import math
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from backend.app.models import Scan, Explanation, RiskScore


def get_scan_history(db: Session, user_id: str, page: int = 1, per_page: int = 10, scan_type: str = None) -> dict:
    query = db.query(Scan).filter(Scan.user_id == user_id)

    if scan_type and scan_type != "all":
        query = query.filter(Scan.scan_type == scan_type)

    total = query.count()
    total_pages = max(1, math.ceil(total / per_page))
    page = min(page, total_pages)

    scans = query.order_by(desc(Scan.created_at)).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "success": True,
        "scans": [_format(db, s) for s in scans],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }


def get_scan_detail(db: Session, user_id: str, scan_id: str) -> dict | None:
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == user_id).first()
    if not scan:
        return None
    return _format(db, scan)


def get_scan_stats(db: Session, user_id: str) -> dict:
    all_scans = db.query(Scan).filter(Scan.user_id == user_id).all()
    total = len(all_scans)

    if total == 0:
        return {
            "success": True,
            "total_scans": 0,
            "average_risk_score": 0.0,
            "severity_breakdown": {"critical": 0, "high": 0, "medium": 0, "low": 0},
            "scans_by_type": {},
            "recent_trend": []
        }

    # Severity Breakdown
    breakdown = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for s in all_scans:
        # DB stores lowercase, map to lowercase key
        sev = s.severity.lower() if s.severity and s.severity.lower() in breakdown else "low"
        breakdown[sev] += 1

    # Average Score
    avg_score = sum(s.risk_score for s in all_scans) / total

    # By Type
    by_type = {}
    for s in all_scans:
        by_type[s.scan_type] = by_type.get(s.scan_type, 0) + 1

    # Recent Trend (last 7 days)
    now = datetime.now() 
    trend = []
    
    daily_counts = {}
    for s in all_scans:
        if s.created_at:
            day_str = s.created_at.strftime("%Y-%m-%d")
            daily_counts[day_str] = daily_counts.get(day_str, 0) + 1
            
    for i in range(6, -1, -1):
        d = now - timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        label = d.strftime("%m/%d")
        trend.append({
            "date": label,
            "count": daily_counts.get(d_str, 0)
        })

    return {
        "success": True,
        "total_scans": total,
        "average_risk_score": round(avg_score, 2),
        "severity_breakdown": breakdown,
        "scans_by_type": by_type,
        "recent_trend": trend
    }


def _format(db: Session, scan: Scan) -> dict:
    exp = db.query(Explanation).filter(Explanation.scan_id == scan.id).first()
    scores = db.query(RiskScore).filter(RiskScore.scan_id == scan.id).all()

    explanation_dict = None
    if exp:
        explanation_dict = {
            "fraud_category": exp.fraud_category,
            "signals": exp.signals,
            "reasoning": exp.reasoning,
            "confidence": exp.confidence,
            "model_used": exp.model_used
        }
    elif scan.status == "completed":
        explanation_dict = {
            "fraud_category": "unknown",
            "signals": [],
            "reasoning": "Legacy scan data - no explanation available.",
            "confidence": scan.risk_score,
            "model_used": "legacy-model"
        }

    breakdown = [{"model": rs.model_name, "score": rs.score, "category": rs.category} for rs in scores]
    
    severity_upper = scan.severity.upper() if scan.severity else "LOW"

    return {
        "id": scan.id,
        "type": scan.scan_type, # Standardized
        "scan_type": scan.scan_type, # Compatibility
        "input_preview": scan.input_preview,
        "risk_score": scan.risk_score,
        "severity": severity_upper, # Standardized UPPERCASE
        "status": scan.status,
        "timestamp": scan.created_at.isoformat() if scan.created_at else "", # Standardized
        "created_at": scan.created_at.isoformat() if scan.created_at else "",
        "explanation": explanation_dict,
        "risk_breakdown": breakdown
    }
