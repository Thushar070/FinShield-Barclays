import logging
import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import ALLOWED_ORIGINS, LOG_LEVEL
from backend.app.database import init_db
from backend.app.middleware.error_handler import (
    ErrorHandlerMiddleware,
    RequestLoggingMiddleware,
    extract_message,
)
from backend.app.routes.auth import router as auth_router
from backend.app.routes.analyze import router as analyze_router
from backend.app.routes.image import router as image_router
from backend.app.routes.audio import router as audio_router
from backend.app.routes.video import router as video_router
from backend.app.routes.history import router as history_router
from backend.app.routes.user import router as user_router
from backend.app.routes.reports import router as reports_router

load_dotenv()

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("finshield")

app = FastAPI(
    title="FinShield API",
    description="Privacy-First AI Fraud Detection Platform",
    version="2.0.0",
    docs_url="/docs",
)


# -- Exception handlers (run BEFORE middleware for these types) --

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    """Convert Pydantic validation errors into a flat string the frontend can render."""
    msg = extract_message(exc.errors())
    logger.warning(f"Validation error on {request.url.path}: {msg}")
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": msg},
    )


@app.exception_handler(HTTPException)
async def http_error_handler(request: Request, exc: HTTPException):
    msg = extract_message(exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": msg},
    )


@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error"},
    )


# -- Middleware stack --

app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- Routes --
app.include_router(auth_router)
app.include_router(analyze_router)
app.include_router(image_router)
app.include_router(audio_router)
app.include_router(video_router)
app.include_router(history_router)
app.include_router(user_router)
app.include_router(reports_router)


@app.on_event("startup")
def startup():
    logger.info("Initializing FinShield database...")
    init_db()
    logger.info("FinShield API v2.0.0 ready")


@app.get("/")
def root():
    return {"success": True, "message": "FinShield API v2.0.0 — Privacy-First AI Fraud Detection"}
