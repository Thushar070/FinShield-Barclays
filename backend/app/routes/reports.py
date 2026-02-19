import io
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.database import get_db
from backend.app.dependencies import get_current_user
from backend.app.models import User, Scan, Explanation, RiskScore

router = APIRouter(prefix="/reports", tags=["Reports"])
logger = logging.getLogger("finshield")


@router.get("/export")
def export_csv(
    scan_type: str = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Scan).filter(Scan.user_id == user.id)
    if scan_type and scan_type != "all":
        query = query.filter(Scan.scan_type == scan_type)

    scans = query.order_by(desc(Scan.created_at)).all()

    output = io.StringIO()
    output.write("Scan ID,Type,Risk Score,Severity,Status,Date,Input Preview\n")
    for s in scans:
        preview = (s.input_preview or "").replace(",", " ")
        created = s.created_at.isoformat() if s.created_at else ""
        output.write(f"{s.id},{s.scan_type},{s.risk_score},{s.severity},{s.status},{created},{preview}\n")

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=finshield_export_{datetime.now().strftime('%Y%m%d')}.csv"}
    )


@router.get("/pdf/{scan_id}")
def generate_pdf(scan_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == user.id).first()
    if not scan:
        return {"error": "Scan not found"}

    exp = db.query(Explanation).filter(Explanation.scan_id == scan_id).first()
    scores = db.query(RiskScore).filter(RiskScore.scan_id == scan_id).all()

    try:
        from fpdf import FPDF

        pdf = FPDF()
        pdf.add_page()

        # Header
        pdf.set_font("Helvetica", "B", 20)
        pdf.cell(0, 15, "FinShield Fraud Report", ln=True, align="C")
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 8, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True, align="C")
        pdf.ln(10)

        # Scan Details
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "Scan Details", ln=True)
        pdf.set_font("Helvetica", "", 11)
        pdf.cell(0, 7, f"Scan ID: {scan.id}", ln=True)
        pdf.cell(0, 7, f"Type: {scan.scan_type.upper()}", ln=True)
        pdf.cell(0, 7, f"Date: {scan.created_at.isoformat() if scan.created_at else 'N/A'}", ln=True)
        pdf.cell(0, 7, f"Input: {scan.input_preview or 'N/A'}", ln=True)
        pdf.ln(5)

        # Risk Assessment
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "Risk Assessment", ln=True)
        pdf.set_font("Helvetica", "", 11)
        pdf.cell(0, 7, f"Overall Risk Score: {scan.risk_score}", ln=True)
        pdf.cell(0, 7, f"Severity: {scan.severity.upper()}", ln=True)
        pdf.ln(5)

        # Model Breakdown
        if scores:
            pdf.set_font("Helvetica", "B", 14)
            pdf.cell(0, 10, "Model Breakdown", ln=True)
            pdf.set_font("Helvetica", "", 11)
            for rs in scores:
                pdf.cell(0, 7, f"  {rs.model_name}: {rs.score} ({rs.category})", ln=True)
            pdf.ln(5)

        # Explanation
        if exp:
            pdf.set_font("Helvetica", "B", 14)
            pdf.cell(0, 10, "AI Explanation", ln=True)
            pdf.set_font("Helvetica", "", 11)
            pdf.cell(0, 7, f"Category: {exp.fraud_category}", ln=True)
            pdf.cell(0, 7, f"Confidence: {exp.confidence}", ln=True)
            pdf.cell(0, 7, f"Model: {exp.model_used}", ln=True)
            pdf.ln(3)
            pdf.set_font("Helvetica", "", 10)
            pdf.multi_cell(0, 6, f"Reasoning: {exp.reasoning}")

            if exp.signals:
                pdf.ln(3)
                pdf.set_font("Helvetica", "B", 11)
                pdf.cell(0, 7, "Detected Signals:", ln=True)
                pdf.set_font("Helvetica", "", 10)
                for signal in exp.signals:
                    pdf.cell(0, 6, f"  - {signal}", ln=True)

        content = pdf.output()
        return StreamingResponse(
            io.BytesIO(content),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=finshield_report_{scan_id[:8]}.pdf"}
        )
    except ImportError:
        return {"error": "PDF generation not available. Install fpdf2."}
