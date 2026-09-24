"""Read-only crypto market data service (CoinGecko via Muapi).
Provides quotes, market capitalization rankings, and search for major digital assets.
Strictly research-oriented: zero wallet/exchange execution or trading features.
"""

import httpx
from typing import Optional
from ..config import settings
from ..models import CryptoMarketQuote


async def get_top_crypto_markets(limit: int = 15) -> list[CryptoMarketQuote]:
    """Retrieve top cryptocurrency market overview with 24h change and 7d sparkline."""
    if settings.muapi_api_key:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"x-api-key": settings.muapi_api_key, "Content-Type": "application/json"}
                url = f"{settings.muapi_base_url.rstrip('/')}/api/v1/crypto-market-data"
                payload = {
                    "mode": "markets",
                    "vs_currency": "usd",
                    "limit": limit,
                }
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    items = data.get("result") or data.get("markets") or []
                    quotes = []
                    for c in items:
                        if isinstance(c, dict):
                            quotes.append(
                                CryptoMarketQuote(
                                    coin_id=c.get("id") or "",
                                    symbol=str(c.get("symbol") or "").upper(),
                                    name=c.get("name") or "",
                                    current_price_usd=float(c.get("current_price") or 0.0),
                                    price_change_percentage_24h=float(c.get("price_change_percentage_24h") or 0.0),
                                    market_cap_usd=float(c.get("market_cap") or 0.0) if c.get("market_cap") else None,
                                    total_volume_usd=float(c.get("total_volume") or 0.0) if c.get("total_volume") else None,
                                    high_24h=float(c.get("high_24h") or 0.0) if c.get("high_24h") else None,
                                    low_24h=float(c.get("low_24h") or 0.0) if c.get("low_24h") else None,
                                    sparkline_7d=[float(p) for p in (c.get("sparkline_in_7d", {}).get("price") or [])],
                                )
                            )
                    if quotes:
                        return quotes
        except Exception:
            pass

    return []


async def get_crypto_quote(coin_id: str) -> Optional[CryptoMarketQuote]:
    """Retrieve single crypto coin spot quote via Muapi."""
    c_clean = coin_id.strip().lower()
    if not c_clean:
        return None

    if settings.muapi_api_key:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"x-api-key": settings.muapi_api_key, "Content-Type": "application/json"}
                url = f"{settings.muapi_base_url.rstrip('/')}/api/v1/crypto-market-data"
                payload = {
                    "mode": "quote",
                    "coin_id": c_clean,
                    "vs_currency": "usd",
                }
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    raw = data.get("result") or data.get("quote") or data
                    price = float(raw.get("usd") or raw.get("price") or 0.0)
                    chg = float(raw.get("usd_24h_change") or 0.0)
                    return CryptoMarketQuote(
                        coin_id=c_clean,
                        symbol=c_clean.upper(),
                        name=c_clean.capitalize(),
                        current_price_usd=price,
                        price_change_percentage_24h=round(chg, 2),
                    )
        except Exception:
            pass

    return None
