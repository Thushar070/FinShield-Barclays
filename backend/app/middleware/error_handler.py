from fastapi import Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import logging
import time
import traceback

logger = logging.getLogger("finshield")


def extract_message(detail):
    """Safely convert any error detail into a plain string."""
    if isinstance(detail, str):
        return detail
    if isinstance(detail, list):
        messages = []
        for item in detail:
            if isinstance(item, dict):
                field = item.get("loc", ["", ""])[-1]
                msg = item.get("msg", "Invalid value")
                messages.append(f"{field}: {msg}" if field and field != "__root__" else msg)
            elif isinstance(item, str):
                messages.append(item)
            else:
                messages.append(str(item))
        return "; ".join(messages) if messages else "Validation error"
    if isinstance(detail, dict):
        return detail.get("message") or detail.get("msg") or detail.get("error") or str(detail)
    return str(detail)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            logger.error(f"Unhandled error: {str(e)}\n{traceback.format_exc()}")
            return JSONResponse(
                status_code=500,
                content={"success": False, "message": "Internal server error"}
            )


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        duration = round(time.time() - start, 3)
        logger.info(
            f"{request.method} {request.url.path} "
            f"status={response.status_code} duration={duration}s"
        )
        return response
