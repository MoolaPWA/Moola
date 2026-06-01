import json
import time
import logging
from datetime import datetime, timezone
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger("http.access")

class AccessLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception as e:
            logger.exception("Unhandled exception")
            raise
        duration_ms = int((time.perf_counter() - start) * 1000)
        user_id = getattr(request.state, "user_id", None)
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
            "user_id": str(user_id) if user_id else "anonymous"
        }
        msg = json.dumps(log_data)
        if 200 <= response.status_code < 300:
            logger.info(msg)
        elif 400 <= response.status_code < 500:
            logger.warning(msg)
        else:
            logger.error(msg)
        return response
