"""Data persistence store for Open Stock Research.
Stores user watchlists and saved briefs locally.
"""

from typing import Optional
from .models import WatchlistItem, ResearchBrief, now_utc_iso


class StockDataStore:
    def __init__(self):
        self.watchlist: dict[str, WatchlistItem] = {}
        self.saved_briefs: dict[str, ResearchBrief] = {}
        self._seed_default_watchlist()

    def _seed_default_watchlist(self):
        defaults = [
            ("AAPL", "Apple Inc.", "Mega-cap consumer electronics & services cash generator"),
            ("MSFT", "Microsoft Corporation", "Enterprise cloud, AI copilot & software platform"),
            ("NVDA", "NVIDIA Corporation", "Accelerated computing & data center GPU architecture"),
            ("AMZN", "Amazon.com Inc.", "E-commerce infrastructure, AWS cloud & marketplace ads"),
        ]
        for ticker, name, notes in defaults:
            self.watchlist[ticker] = WatchlistItem(
                ticker=ticker,
                company_name=name,
                added_at=now_utc_iso(),
                notes=notes,
            )

    def add_to_watchlist(self, ticker: str, name: str, notes: Optional[str] = None) -> WatchlistItem:
        t_clean = ticker.strip().upper()
        item = WatchlistItem(
            ticker=t_clean,
            company_name=name or t_clean,
            added_at=now_utc_iso(),
            notes=notes,
        )
        self.watchlist[t_clean] = item
        return item

    def remove_from_watchlist(self, ticker: str) -> bool:
        t_clean = ticker.strip().upper()
        if t_clean in self.watchlist:
            del self.watchlist[t_clean]
            return True
        return False

    def get_watchlist(self) -> list[WatchlistItem]:
        return list(self.watchlist.values())


store = StockDataStore()
