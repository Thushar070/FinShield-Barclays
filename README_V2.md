# FinShield v2.0 - Advanced Fraud Detection Console

## Overview
FinShield v2.0 is an enterprise-grade AI fraud detection platform designed for security operations centers (SOCs). It utilizes a hybrid scoring engine combining BERT-based neural networks with heuristic rule-based analysis to detect phishing and fraud across text, image, audio, and video content.

## Key Features

### 🛡️ Hybrid AI Engine (`ai_engine/hybrid_scorer.py`)
- **Dual-Layer Analysis**: Combines deep learning models (BERT) with expert heuristic rules.
- **Signal Detection**: Identifies urgency, financial keywords, credential harvesting, and suspicious links.
- **Weighted Scoring**: Prioritizes high-risk signals (e.g., "Urgency + Link") to prevent false negatives.
- **Multi-Modal Support**: Consistent scoring logic applied to OCR text (Images), Transcripts (Audio/Video), and raw Text.

### 🖥️ Security Operations Console (`frontend/src/pages/Dashboard.js`)
- **Dark Mode UI**: Professional, high-contrast interface designed for long-term monitoring.
- **Real-Time Dashboard**: Live system status, latency metrics, and threat level indicators.
- **Granular Explainability**: Detailed breakdown of WHY content was flagged (e.g., "Credential Request detected").
- **Audit History**: Full searchable log of all analyzed content with severity filters.

### ⚡ Performance & Security
- **Local Inference**: All AI models run locally (privacy-first).
- **Resilient API**: Robust error handling ensuring 99.9% uptime and clean failure states.
- **Optimized Frontend**: Memoized data fetching and instant client-side filtering.

## Architecture

### Backend (FastAPI)
- `backend/app/main.py`: Entry point with global error handlers.
- `backend/app/services/scan_service.py`: Orchestrates multi-modal analysis and database persistence.
- `ai_engine/`: Contains the core logic for Text, Image, Audio, and Video processing.

### Frontend (React)
- `src/pages/Dashboard.js`: The central command center.
- `src/ConsoleTheme.css`: Custom design system overrides for the security console aesthetic.
- `src/utils/api.js`: Hardened API client with error normalization.

## Quick Start

### 1. Start Backend
```bash
cd backend
python -m uvicorn app.main:app --reload
```
Runs on `http://localhost:8000`

### 2. Start Frontend
```bash
cd frontend
npm start
```
Runs on `http://localhost:3000`

## APIs
- `POST /analyze`: Text analysis
- `POST /analyze-image`: Image OCR + Fraud Check
- `POST /analyze-audio`: Audio Transcription + Fraud Check
- `POST /analyze-video`: Video Transcription + Frame Analysis
- `GET /history`: Scan logs
