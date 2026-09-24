"""Stock price history service — Daily OHLCV bars.
Consumes Muapi's code-complete `market-stock-history` route (Marketstack EOD)
with automatic fallback to Treg direct provider pass-through.
"""

import logging
import httpx
from typing import Optional
from ..config import settings
from ..models import StockBar, StockHistoryResponse

logger = logging.getLogger(__name__)


def _resolve_tokens(api_key: Optional[str] = None, treg_token: Optional[str] = None) -> tuple[str, str]:
    muapi = (api_key or settings.muapi_api_key or "").strip()
    treg = (treg_token or settings.treg_api_token or "").strip()
    if muapi.startswith("treg_") and not treg:
        treg = muapi
    return muapi, treg


async def get_stock_price_history(
    ticker: str,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    limit: int = 60,
    api_key: Optional[str] = None,
    treg_token: Optional[str] = None,
) -> StockHistoryResponse:
    """Retrieve historical daily price bars for technical charting and trend analysis."""
    t_clean = ticker.strip().upper()
    if not t_clean:
        return StockHistoryResponse(ticker=t_clean, total_count=0, bars=[])

    muapi_key, treg_tok = _resolve_tokens(api_key, treg_token)

    # 1. Try Muapi endpoint
    if muapi_key and not muapi_key.startswith("treg_"):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"x-api-key": muapi_key, "Content-Type": "application/json"}
                url = f"{settings.muapi_base_url.rstrip('/')}/api/v1/market-stock-history"
                payload = {
                    "ticker": t_clean,
                    "date_from": date_from,
                    "date_to": date_to,
                    "limit": limit,
                }
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    items = data.get("bars") or data.get("data") or data.get("result") or []
                    bars = []
                    for b in items:
                        if isinstance(b, dict):
                            bars.append(
                                StockBar(
                                    date=str(b.get("date") or b.get("time") or "")[:10],
                                    open=float(b.get("open") or 0.0),
                                    high=float(b.get("high") or 0.0),
                                    low=float(b.get("low") or 0.0),
                                    close=float(b.get("close") or 0.0),
                                    volume=int(b.get("volume") or 0),
                                    adj_close=float(b["adj_close"]) if b.get("adj_close") else None,
                                )
                            )
                    bars.sort(key=lambda x: x.date)
                    return StockHistoryResponse(
                        ticker=t_clean,
                        date_from=date_from or (bars[0].date if bars else None),
                        date_to=date_to or (bars[-1].date if bars else None),
                        total_count=len(bars),
                        bars=bars,
                    )
                else:
                    logger.warning(f"Muapi stock history returned HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as exc:
            logger.error(f"Error calling Muapi stock history: {exc}")

    # 2. Try Treg direct pass-through (marketstack.eod)
    if treg_tok:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"X-Treg-Token": treg_tok}
                url = f"{settings.treg_base_url.rstrip('/')}/call/marketstack.eod"
                params = {"symbols": t_clean, "limit": limit}
                if date_from:
                    params["date_from"] = date_from
                if date_to:
                    params["date_to"] = date_to
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    items = data.get("data") or data.get("bars") or data.get("result") or []
                    bars = []
                    for b in items:
                        if isinstance(b, dict):
                            bars.append(
                                StockBar(
                                    date=str(b.get("date") or "")[:10],
                                    open=float(b.get("open") or 0.0),
                                    high=float(b.get("high") or 0.0),
                                    low=float(b.get("low") or 0.0),
                                    close=float(b.get("close") or 0.0),
                                    volume=int(b.get("volume") or 0),
                                    adj_close=float(b["adj_close"]) if b.get("adj_close") else None,
                                )
                            )
                    bars.sort(key=lambda x: x.date)
                    return StockHistoryResponse(
                        ticker=t_clean,
                        date_from=date_from or (bars[0].date if bars else None),
                        date_to=date_to or (bars[-1].date if bars else None),
                        total_count=len(bars),
                        bars=bars,
                    )
                else:
                    logger.warning(f"Treg marketstack.eod returned HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as exc:
            logger.error(f"Error calling Treg marketstack.eod: {exc}")

    return StockHistoryResponse(ticker=t_clean, total_count=0, bars=[])
