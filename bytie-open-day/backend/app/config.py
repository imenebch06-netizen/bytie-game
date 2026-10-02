from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent  # dossier backend/


class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017"
    PORT: int = 8000

    # Analyse de fin de partie générée par Gemini (clé à créer sur https://aistudio.google.com/apikey)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash-lite"
    GEMINI_TIMEOUT_SEC: float = 30.0

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",  # lu depuis backend/.env quel que soit le dossier de lancement
        extra="ignore",
        env_file_encoding="utf-8",
    )


settings = Settings()
