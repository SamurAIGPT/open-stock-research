"""Crypto Market Data Router."""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Header
from ..models import CryptoMarketQuote
from ..services.crypto_service import get_top_crypto_markets, get_crypto_quote

router = APIRouter(prefix="/api/crypto", tags=["Crypto Market Data"])


@router.get("/markets", response_model=list[CryptoMarketQuote])
async def crypto_markets_endpoint(
    limit: int = Query(15, ge=1, le=50),
    x_api_key: Optional[str] = Header(None, alias="x-api-key"),
    x_treg_token: Optional[str] = Header(None, alias="x-treg-token"),
):
    """Retrieve top cryptocurrency market overview with 24h change and sparkline."""
    return await get_top_crypto_markets(limit=limit, api_key=x_api_key, treg_token=x_treg_token)


@router.get("/quote/{coin_id}", response_model=CryptoMarketQuote)
async def crypto_quote_endpoint(
    coin_id: str,
    x_api_key: Optional[str] = Header(None, alias="x-api-key"),
    x_treg_token: Optional[str] = Header(None, alias="x-treg-token"),
):
    """Retrieve single crypto coin spot quote."""
    quote = await get_crypto_quote(coin_id=coin_id, api_key=x_api_key, treg_token=x_treg_token)
    if not quote:
        raise HTTPException(status_code=404, detail=f"Crypto quote for {coin_id} not found or provider unconfigured.")
    return quote
