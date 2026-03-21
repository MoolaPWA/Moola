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
    host: str = '127.0.0.1'
    port: str = os.getenv("DB_PORT", "5433")

    echo: bool = False
    echo_pool: bool = False
    pool_size: int = 50
    max_overflow: int = 10

    @property
    def url(self) -> str:
        """Строка подключения к базе данных (формируется из полей)"""
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

class Settings(BaseSettings):
    run: RunConfig = RunConfig()
    api: ApiPrefix = ApiPrefix()
    db: DatabaseConfig = DatabaseConfig()

settings = Settings()
