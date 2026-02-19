import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON, Enum as SAEnum
from sqlalchemy.orm import relationship
from backend.app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")  # user / admin
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    scan_type = Column(String, nullable=False)  # text / image / audio / video
    input_preview = Column(String, nullable=True)  # first 100 chars or filename
    risk_score = Column(Float, default=0.0)
    severity = Column(String, default="low")  # low / medium / high / critical
    status = Column(String, default="completed")  # pending / completed / failed
    tags = Column(String, nullable=True)  # comma-separated tags
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="scans")
    file = relationship("ScanFile", back_populates="scan", uselist=False, cascade="all, delete-orphan")
    risk_scores = relationship("RiskScore", back_populates="scan", cascade="all, delete-orphan")
    explanation = relationship("Explanation", back_populates="scan", uselist=False, cascade="all, delete-orphan")


class ScanFile(Base):
    __tablename__ = "scan_files"

    id = Column(String, primary_key=True, default=generate_uuid)
    scan_id = Column(String, ForeignKey("scans.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    file_hash = Column(String, nullable=True)

    scan = relationship("Scan", back_populates="file")


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(String, primary_key=True, default=generate_uuid)
    scan_id = Column(String, ForeignKey("scans.id"), nullable=False)
    model_name = Column(String, nullable=False)
    score = Column(Float, default=0.0)
    category = Column(String, nullable=True)

    scan = relationship("Scan", back_populates="risk_scores")


class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(String, primary_key=True, default=generate_uuid)
    scan_id = Column(String, ForeignKey("scans.id"), nullable=False)
    fraud_category = Column(String, nullable=True)
    signals = Column(JSON, nullable=True)
    reasoning = Column(Text, nullable=True)
    confidence = Column(Float, default=0.0)
    model_used = Column(String, nullable=True)

    scan = relationship("Scan", back_populates="explanation")
