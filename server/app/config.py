"""Configuration settings for Open Stock Research."""

import os
from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "Open Stock Research"
    app_version: str = "0.1.0"
    environment: str = os.getenv("ENV", "development")
    port: int = int(os.getenv("PORT", "8000"))
    host: str = os.getenv("HOST", "0.0.0.0")

    # Muapi / Treg credentials
    muapi_api_key: str = os.getenv("MUAPI_API_KEY", "")
    muapi_base_url: str = os.getenv("MUAPI_BASE_URL", "https://api.muapi.ai")
    treg_api_token: str = os.getenv("TREG_API_TOKEN", "")
    treg_base_url: str = os.getenv("TREG_BASE_URL", "https://treg.to")

    # Storage paths
    data_dir: str = os.getenv("DATA_DIR", "data")

    # CORS Origins
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:8002",
        "http://127.0.0.1:8002",
        "*",
    ]


def load_settings() -> Settings:
    s = Settings()
    settings_file = os.path.join(s.data_dir, "settings.json")
    if os.path.exists(settings_file):
        try:
            import json
            with open(settings_file, "r", encoding="utf-8") as f:
                saved = json.load(f)
                if saved.get("muapi_api_key"):
                    s.muapi_api_key = saved["muapi_api_key"]
                if saved.get("treg_api_token"):
                    s.treg_api_token = saved["treg_api_token"]
        except Exception:
            pass
    return s


settings = load_settings()
