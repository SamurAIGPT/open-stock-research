/**
 * Open Stock Research — API Client Library
 * Direct connectivity to FastAPI backend on port 8002.
 * Zero mock/fake fallbacks. Returns null/empty states when unconfigured or not found.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

async function safeFetch(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (res.ok) {
      return await res.json();
    }
    console.warn(`FastAPI backend HTTP ${res.status} on ${path}`);
  } catch (err) {
    console.error(`FastAPI connection error on ${path}:`, err.message);
  }
  return null;
}

export const api = {
  // Company Research
  async getProfile(ticker) {
    if (!ticker) return null;
    return await safeFetch(`/api/company/profile/${encodeURIComponent(ticker.trim().toUpperCase())}`);
  },

  async getQuote(ticker) {
    if (!ticker) return null;
    return await safeFetch(`/api/company/quote/${encodeURIComponent(ticker.trim().toUpperCase())}`);
  },

  async getFinancials(ticker, statementType = 'income', period = 'annual') {
    if (!ticker) return [];
    const data = await safeFetch(
      `/api/company/financials/${encodeURIComponent(ticker.trim().toUpperCase())}?statement_type=${statementType}&period=${period}`
    );
    return Array.isArray(data) ? data : [];
  },

  async getFilings(ticker, limit = 15) {
    if (!ticker) return [];
    const data = await safeFetch(`/api/company/filings/${encodeURIComponent(ticker.trim().toUpperCase())}?limit=${limit}`);
    return Array.isArray(data) ? data : [];
  },

  // EOD Price History
  async getHistory(ticker, limit = 60, dateFrom = null, dateTo = null) {
    if (!ticker) return { ticker, total_count: 0, bars: [] };
    const params = new URLSearchParams({ limit: String(limit) });
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    const data = await safeFetch(`/api/history/${encodeURIComponent(ticker.trim().toUpperCase())}?${params.toString()}`);
    return data || { ticker, total_count: 0, bars: [] };
  },

  // Screener & Metrics
  async getMetrics(ticker, period = 'annual') {
    if (!ticker) return null;
    return await safeFetch(`/api/screener/metrics/${encodeURIComponent(ticker.trim().toUpperCase())}?period=${period}`);
  },

  async runScreener(filters = [], limit = 25) {
    const data = await safeFetch('/api/screener/run', {
      method: 'POST',
      body: JSON.stringify({ filters, limit }),
    });
    return Array.isArray(data) ? data : [];
  },

  // Crypto Market Data (Read-only)
  async getCryptoMarkets(limit = 15) {
    const data = await safeFetch(`/api/crypto/markets?limit=${limit}`);
    return Array.isArray(data) ? data : [];
  },

  async getCryptoQuote(coinId) {
    if (!coinId) return null;
    return await safeFetch(`/api/crypto/quote/${encodeURIComponent(coinId.toLowerCase())}`);
  },

  // Sourced Research Brief
  async getBrief(ticker) {
    if (!ticker) return null;
    return await safeFetch(`/api/brief/${encodeURIComponent(ticker.trim().toUpperCase())}`);
  },

  // Watchlist
  async getWatchlist() {
    const data = await safeFetch('/api/watchlist');
    return Array.isArray(data) ? data : [];
  },

  async addToWatchlist(ticker, companyName = '', notes = '') {
    return await safeFetch('/api/watchlist', {
      method: 'POST',
      body: JSON.stringify({ ticker, company_name: companyName, notes }),
    });
  },

  async removeFromWatchlist(ticker) {
    return await safeFetch(`/api/watchlist/${encodeURIComponent(ticker.trim().toUpperCase())}`, {
      method: 'DELETE',
    });
  },
};
