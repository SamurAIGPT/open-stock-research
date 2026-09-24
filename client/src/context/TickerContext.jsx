'use client';

import React, { createContext, useContext, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { api } from '../lib/api';

const TickerContext = createContext(null);

function TickerProviderContent({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlTicker = searchParams.get('ticker');
  const [ticker, setTickerState] = useState(urlTicker ? urlTicker.toUpperCase() : 'AAPL');
  const [profile, setProfile] = useState(null);
  const [quote, setQuote] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Sync state if URL search param changes
  useEffect(() => {
    if (urlTicker && urlTicker.toUpperCase() !== ticker) {
      setTickerState(urlTicker.toUpperCase());
    }
  }, [urlTicker]);

  // Load watchlist on mount
  useEffect(() => {
    async function loadWatchlist() {
      const data = await api.getWatchlist();
      setWatchlist(data);
    }
    loadWatchlist();
  }, []);

  // Load profile, quote, metrics when ticker changes
  useEffect(() => {
    async function loadData() {
      if (!ticker) return;
      setLoadingOverview(true);
      const [p, q, m] = await Promise.all([
        api.getProfile(ticker),
        api.getQuote(ticker),
        api.getMetrics(ticker),
      ]);
      setProfile(p);
      setQuote(q);
      setMetrics(m);
      setLoadingOverview(false);
    }
    loadData();
  }, [ticker]);

  const setTicker = (newTicker) => {
    const clean = newTicker.trim().toUpperCase();
    setTickerState(clean);
    // Preserve query parameter on ticker-aware routes
    if (!['/screener', '/crypto', '/settings'].includes(pathname)) {
      router.push(`${pathname}?ticker=${encodeURIComponent(clean)}`);
    }
  };

  const addToWatchlist = async (t) => {
    const item = await api.addToWatchlist(t, profile?.name || t, 'Saved equity');
    if (item) {
      setWatchlist((prev) => [...prev.filter((it) => it.ticker !== t), item]);
    }
  };

  const removeFromWatchlist = async (t) => {
    await api.removeFromWatchlist(t);
    setWatchlist((prev) => prev.filter((it) => it.ticker !== t));
  };

  return (
    <TickerContext.Provider
      value={{
        ticker,
        setTicker,
        profile,
        quote,
        metrics,
        watchlist,
        loadingOverview,
        addToWatchlist,
        removeFromWatchlist,
      }}
    >
      {children}
    </TickerContext.Provider>
  );
}

export function TickerProvider({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <TickerProviderContent>{children}</TickerProviderContent>
    </Suspense>
  );
}

export function useTicker() {
  const context = useContext(TickerContext);
  if (!context) {
    throw new Error('useTicker must be used within a TickerProvider');
  }
  return context;
}
