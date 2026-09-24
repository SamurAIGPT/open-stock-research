# Open Stock Research (OSR)

> **Self-Hostable Fundamental Equity Research & Market Screening Suite**  
> An open-source alternative for retail company research, SEC filing inspection, and multi-factor screening workflows, directly backed by normalized Muapi financial data endpoints.

---

## 1. Overview & Capability Mapping

`open-stock-research` is an open-source, API-backed fundamental equity terminal built to provide transparent, source-linked company research without the bloated fees of proprietary financial terminals.

| Capability / Workflow | Muapi Route | Underlying Provider | Features |
|---|---|---|---|
| **Company Deep-Dive & Profile** | `company.public_financials` | Finnhub / Financial Datasets | Name, exchange, sector, industry, country, CEO, market cap, and live quote. |
| **Standardized Financial Statements** | `company.public_financials` | Financial Datasets | GAAP Income Statement, Balance Sheet, Cash Flow with Annual & Quarterly views. |
| **SEC Regulatory Filings Archive** | `company.public_financials` | SEC EDGAR via Financial Datasets | 10-K, 10-Q, 8-K filing dates, accession numbers, and clickable SEC source links. |
| **Daily EOD Price History & Charts** | `market.stock_history` | Marketstack EOD | Interactive SVG Candlestick / Area charts with OHLCV data across custom date ranges. |
| **Fundamental Equity Screener** | `market.stock_screener` | Financial Datasets | Filter public equity universes with rule expressions (e.g. `market_cap:gt:100000000000`). |
| **Digital Asset Market Monitor** | `crypto.market_data` | CoinGecko | Read-only crypto spot prices, 24h performance, and 7-day sparkline trends. |
| **Sourced Research Briefs** | App-layer synthesis | Muapi API contracts | One-click equity memorandum with transparent data provenance and SEC citations. |

---

## 2. Architectural Boundaries & Strict Scope

In accordance with the financial research specification in `financial_data_api_mapping.md`:
- **Read-Only Research Only**: No wallet/exchange account integration, automated trade execution, or order books.
- **Zero Mock Fallbacks**: No fabricated placeholder data or fake numbers. Live verified data or transparent empty states.
- **Clean Separation**: Keeps e-commerce intelligence (`open-commerce-intelligence`) completely distinct from financial equity research (`open-stock-research`).

---

## 3. Technology Stack

- **Backend**: FastAPI (Python 3.11), Uvicorn, Non-blocking Async HTTPX, Pydantic V2 (Port `8002`).
- **Frontend**: Next.js 15 (App Router), React 19, Vanilla Tailwind CSS, Lucide React (Port `3002`).
- **Design System**: Light Theme, Inter typography (`next/font/google`), Custom Glassmorphism Dropdowns (Zero native `<select>` tags).

---

## 4. Quickstart

### Backend Setup (FastAPI - Port 8002)
```bash
cd server
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8002 --reload
```

### Frontend Setup (Next.js - Port 3002)
```bash
cd client
npm install
npm run dev
```

Visit [http://localhost:3002](http://localhost:3002) in your browser.

---

## 5. License

Apache-2.0 License.
