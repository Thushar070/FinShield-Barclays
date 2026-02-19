# FinShield – Privacy-First AI Fraud Detection Platform

## Overview

FinShield is a privacy-focused, AI-powered fraud detection system designed to help banking customers identify potential scams before financial damage occurs. The platform analyzes user-submitted content such as text messages, images, audio, and video to detect phishing attempts, credential exposure, spoofed websites, deepfake voice scams, and other AI-generated fraud threats.

The system operates fully offline using locally hosted machine learning models to ensure that no sensitive user data leaves the environment.

---

## Key Features

* Multi-modal fraud detection (Text, Image, Audio, Video)
* AI-powered phishing and scam identification
* Credential exposure detection
* Deepfake voice risk estimation
* Screenshot phishing analysis using OCR
* Unified fraud risk scoring engine
* Human-readable explanations
* Privacy-first architecture with no external data transmission
* Modular backend suitable for future banking integration
* Scan history dashboard and risk visualization

---

## System Architecture

The platform follows a modular pipeline:

1. User uploads suspicious content
2. Privacy layer removes sensitive metadata
3. Multi-modal AI engines analyze inputs
4. Risk scoring model combines indicators
5. Dashboard displays risk level and reasoning

---

## Technology Stack

### Frontend

* React.js
* HTML/CSS
* JavaScript

### Backend

* FastAPI (Python)
* Uvicorn
* REST API architecture

### AI & Data Processing

* Hugging Face Transformers
* PyTorch / ONNX Runtime
* OpenCV
* Tesseract OCR
* Faster-Whisper (audio transcription)
* NumPy / Pandas

---

## Installation Guide

### Backend

```
cd backend
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
```

### Frontend

```
cd frontend
npm install
npm start
```

AI models will download automatically on first run.

---

## Usage

1. Start backend server
2. Start frontend
3. Upload suspicious content
4. View fraud risk score and explanation

---

## Future Enhancements

* Browser extension for real-time phishing alerts
* Mobile fraud detection companion app
* Federated learning for secure cross-bank collaboration
* Automated fraud mitigation recommendations
* Enterprise-level fraud intelligence dashboard

---

## Team Members

* Thushar
* Samyuktha
* Saranya
* Vedika
* Russheka

---

## License

This project is developed for academic and hackathon purposes.
