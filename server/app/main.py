"""FastAPI application entry point for Open Stock Research.
Connects directly to Muapi's public company financials, market stock history,
stock screener, and crypto market data endpoints.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import (
    company_router,
    history_router,
    screener_router,
    crypto_router,
    brief_router,
    watchlist_router,
    settings_router,
)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Open-Source Fundamental Equity Research & Market Screening Suite",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(company_router.router)
app.include_router(history_router.router)
app.include_router(screener_router.router)
app.include_router(crypto_router.router)
app.include_router(brief_router.router)
app.include_router(watchlist_router.router)
app.include_router(settings_router.router)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "routes": [
            "company.public_financials",
            "market.stock_history",
            "market.stock_screener",
            "crypto.market_data",
        ],
    }
