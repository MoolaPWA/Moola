import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from core.limiter import limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
import uvicorn

from api import router as api_router
from core.config import settings
from core.db_helper import db_helper
from core.middleware import AccessLogMiddleware

# Базовая настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[logging.StreamHandler()]
)
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    print("Dispose engine")
    await db_helper.dispose()

main_app = FastAPI(lifespan=lifespan)
main_app.state.limiter = limiter
main_app.add_middleware(SlowAPIMiddleware)

# CORS
main_app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Безопасные заголовки
main_app.add_middleware(SecurityHeadersMiddleware)

# Кастомный middleware логирования запросов
main_app.add_middleware(AccessLogMiddleware)

main_app.include_router(api_router, prefix=settings.api.prefix)

if __name__ == "__main__":
    uvicorn.run(
        "main:main_app",
        host=settings.run.host,
        port=settings.run.port,
        reload=True
    )
