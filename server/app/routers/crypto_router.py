"""Crypto Market Router — Read-only quotes & rankings (CoinGecko via Muapi)."""

from fastapi import APIRouter, HTTPException, Query
from ..models import CryptoMarketQuote
from ..services.crypto_service import get_top_crypto_markets, get_crypto_quote

router = APIRouter(prefix="/api/crypto", tags=["Crypto Market Data"])


@router.get("/markets", response_model=list[CryptoMarketQuote])
async def crypto_markets_endpoint(limit: int = Query(15, ge=1, le=50)):
    """Retrieve top cryptocurrency market overview with 24h change and sparkline."""
    return await get_top_crypto_markets(limit=limit)


@router.get("/quote/{coin_id}", response_model=CryptoMarketQuote)
async def crypto_quote_endpoint(coin_id: str):
    """Retrieve single crypto coin spot quote."""
    quote = await get_crypto_quote(coin_id)
    if not quote:
        raise HTTPException(status_code=404, detail=f"Coin {coin_id} not found or provider unconfigured.")
    return quote
