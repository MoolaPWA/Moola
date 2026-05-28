from pydantic import BaseModel
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv, find_dotenv

def load_env():
    dotenv_path = find_dotenv()
    if dotenv_path:
        load_dotenv(dotenv_path)
        print(f"✅ .env загружен из {dotenv_path}")
    else:
        print("⚠️ Файл .env не найден")

load_env()

class RunConfig(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8000

class ApiPrefix(BaseModel):
    prefix: str = "/api"

class DatabaseConfig(BaseModel):
    user: str = os.getenv("DB_USER")
    password: str = os.getenv("DB_PASSWORD")
    name: str = os.getenv("DB_NAME")
    host: str = os.getenv("DB_HOST")
    port: str = os.getenv("DB_PORT")
    echo: bool = False
    echo_pool: bool = False
    pool_size: int = 50
    max_overflow: int = 10

    @property
    def url(self) -> str:
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

class Token(BaseModel):
    secret_key: str = os.getenv("SECRET_KEY")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30

class CorsConfig(BaseModel):               # <-- новый класс
    allowed_origins: list[str] = [
        "http://localhost:5173",
        "https://your-production-domain.com"   # замените на реальный домен
    ]

class Settings(BaseSettings):
    run: RunConfig = RunConfig()
    api: ApiPrefix = ApiPrefix()
    db: DatabaseConfig = DatabaseConfig()
    token: Token = Token()
    cors: CorsConfig = CorsConfig()         # <-- добавляем

settings = Settings()
