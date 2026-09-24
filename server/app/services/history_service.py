"""Stock price history service — Daily OHLCV bars.
Consumes Muapi's code-complete `market-stock-history` route (Marketstack EOD).
"""

import httpx
from typing import Optional
from ..config import settings
from ..models import StockBar, StockHistoryResponse


async def get_stock_price_history(
    ticker: str,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    limit: int = 60,
) -> StockHistoryResponse:
    """Retrieve historical daily price bars for technical charting and trend analysis."""
    t_clean = ticker.strip().upper()
    if not t_clean:
        return StockHistoryResponse(ticker=t_clean, total_count=0, bars=[])

    if settings.muapi_api_key:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"x-api-key": settings.muapi_api_key, "Content-Type": "application/json"}
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
                    # Ensure chronologically sorted
                    bars.sort(key=lambda x: x.date)
                    return StockHistoryResponse(
                        ticker=t_clean,
                        date_from=date_from or (bars[0].date if bars else None),
                        date_to=date_to or (bars[-1].date if bars else None),
                        total_count=len(bars),
                        bars=bars,
                    )
        except Exception:
            pass

    return StockHistoryResponse(ticker=t_clean, total_count=0, bars=[])
