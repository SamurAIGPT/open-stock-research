"""Settings & API Credentials Router."""

import os
import json
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter
from ..config import settings

router = APIRouter(prefix="/api/settings", tags=["Settings"])


class SettingsPayload(BaseModel):
    muapi_api_key: Optional[str] = ""
    treg_api_token: Optional[str] = ""


@router.get("")
async def get_settings_endpoint():
    """Retrieve current provider credentials and connection status."""
    return {
        "muapi_api_key": settings.muapi_api_key,
        "treg_api_token": settings.treg_api_token,
        "has_muapi_key": bool(settings.muapi_api_key),
        "has_treg_token": bool(settings.treg_api_token),
        "muapi_base_url": settings.muapi_base_url,
        "treg_base_url": settings.treg_base_url,
    }


@router.post("")
async def save_settings_endpoint(payload: SettingsPayload):
    """Save provider credentials into runtime settings and disk storage."""
    if payload.muapi_api_key is not None:
        settings.muapi_api_key = payload.muapi_api_key.strip()
    if payload.treg_api_token is not None:
        settings.treg_api_token = payload.treg_api_token.strip()

    # Persist to disk
    os.makedirs(settings.data_dir, exist_ok=True)
    settings_file = os.path.join(settings.data_dir, "settings.json")
    try:
        with open(settings_file, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "muapi_api_key": settings.muapi_api_key,
                    "treg_api_token": settings.treg_api_token,
                },
                f,
                indent=2,
            )
    except Exception as e:
        return {"status": "error", "message": f"Failed to persist settings: {str(e)}"}

    return {
        "status": "success",
        "has_muapi_key": bool(settings.muapi_api_key),
        "has_treg_token": bool(settings.treg_api_token),
    }
