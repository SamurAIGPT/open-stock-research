"""Read-only crypto market data service (CoinGecko via Muapi or Treg).
Provides quotes, market capitalization rankings, and search for major digital assets.
Strictly research-oriented: zero wallet/exchange execution or trading features.
"""

import logging
import httpx
from typing import Optional
from ..config import settings
from ..models import CryptoMarketQuote

logger = logging.getLogger(__name__)


def _resolve_tokens(api_key: Optional[str] = None, treg_token: Optional[str] = None) -> tuple[str, str]:
    muapi = (api_key or settings.muapi_api_key or "").strip()
    treg = (treg_token or settings.treg_api_token or "").strip()
    if muapi.startswith("treg_") and not treg:
        treg = muapi
    return muapi, treg


async def get_top_crypto_markets(
    limit: int = 15,
    api_key: Optional[str] = None,
    treg_token: Optional[str] = None,
) -> list[CryptoMarketQuote]:
    """Retrieve top cryptocurrency market overview with 24h change and 7d sparkline."""
    muapi_key, treg_tok = _resolve_tokens(api_key, treg_token)

    # 1. Try Muapi endpoint
    if muapi_key and not muapi_key.startswith("treg_"):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"x-api-key": muapi_key, "Content-Type": "application/json"}
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
                else:
                    logger.warning(f"Muapi crypto markets returned HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as exc:
            logger.error(f"Error calling Muapi crypto markets: {exc}")

    # 2. Try Treg direct pass-through (coingecko.coins.markets)
    if treg_tok:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"X-Treg-Token": treg_tok}
                url = f"{settings.treg_base_url.rstrip('/')}/call/coingecko.coins.markets"
                params = {"vs_currency": "usd", "per_page": limit, "page": 1, "sparkline": "true"}
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    items = resp.json()
                    quotes = []
                    if isinstance(items, list):
                        for c in items:
                            if isinstance(c, dict):
                                spark = c.get("sparkline_in_7d")
                                spark_prices = spark.get("price") if isinstance(spark, dict) else []
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
                                        sparkline_7d=[float(p) for p in (spark_prices or [])],
                                    )
                                )
                        if quotes:
                            return quotes
                else:
                    logger.warning(f"Treg coingecko.coins.markets returned HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as exc:
            logger.error(f"Error calling Treg crypto markets: {exc}")

    return []


async def get_crypto_quote(
    coin_id: str,
    api_key: Optional[str] = None,
    treg_token: Optional[str] = None,
) -> Optional[CryptoMarketQuote]:
    """Retrieve single crypto coin spot quote via Muapi or Treg."""
    c_clean = coin_id.strip().lower()
    if not c_clean:
        return None

    muapi_key, treg_tok = _resolve_tokens(api_key, treg_token)

    # 1. Try Muapi endpoint
    if muapi_key and not muapi_key.startswith("treg_"):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"x-api-key": muapi_key, "Content-Type": "application/json"}
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
                else:
                    logger.warning(f"Muapi crypto quote returned HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as exc:
            logger.error(f"Error calling Muapi crypto quote: {exc}")

    # 2. Try Treg direct pass-through (coingecko.simple.price)
    if treg_tok:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"X-Treg-Token": treg_tok}
                url = f"{settings.treg_base_url.rstrip('/')}/call/coingecko.simple.price"
                params = {"ids": c_clean, "vs_currencies": "usd", "include_24hr_change": "true"}
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    coin_data = data.get(c_clean) or {}
                    price = float(coin_data.get("usd") or 0.0)
                    chg = float(coin_data.get("usd_24h_change") or 0.0)
                    return CryptoMarketQuote(
                        coin_id=c_clean,
                        symbol=c_clean.upper(),
                        name=c_clean.capitalize(),
                        current_price_usd=price,
                        price_change_percentage_24h=round(chg, 2),
                    )
                else:
                    logger.warning(f"Treg coingecko.simple.price returned HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as exc:
            logger.error(f"Error calling Treg crypto quote: {exc}")

    return None
