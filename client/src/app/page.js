'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import OverviewView from '../components/views/OverviewView';
import ChartHistoryView from '../components/views/ChartHistoryView';
import StatementsView from '../components/views/StatementsView';
import ScreenerView from '../components/views/ScreenerView';
import FilingsView from '../components/views/FilingsView';
import BriefView from '../components/views/BriefView';
import CryptoView from '../components/views/CryptoView';
import SettingsView from '../components/views/SettingsView';
import { 
  Building2, 
  BarChart2, 
  FileText, 
  Filter, 
  FileCheck2, 
  FileSignature, 
  Coins, 
  Settings,
  Bookmark
} from 'lucide-react';
import { api } from '../lib/api';

const TABS = [
  { id: 'overview', label: 'Company Overview', icon: Building2 },
  { id: 'chart', label: 'Price Chart & EOD', icon: BarChart2 },
  { id: 'statements', label: 'Financial Statements', icon: FileText },
  { id: 'screener', label: 'Stock Screener', icon: Filter },
  { id: 'filings', label: 'SEC Filings', icon: FileCheck2 },
  { id: 'brief', label: 'Research Brief', icon: FileSignature },
  { id: 'crypto', label: 'Crypto Monitor', icon: Coins },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeTicker, setActiveTicker] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('3M');

  // Shared data states
  const [profile, setProfile] = useState(null);
  const [quote, setQuote] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load Watchlist once
  useEffect(() => {
    async function loadWatchlist() {
      const data = await api.getWatchlist();
      setWatchlist(data);
    }
    loadWatchlist();
  }, []);

  // Load Company Overview Data when activeTicker changes
  useEffect(() => {
    async function loadCompanyData() {
      if (!activeTicker) return;
      setLoadingOverview(true);
      const [profData, quoteData, metricsData] = await Promise.all([
        api.getProfile(activeTicker),
        api.getQuote(activeTicker),
        api.getMetrics(activeTicker),
      ]);
      setProfile(profData);
      setQuote(quoteData);
      setMetrics(metricsData);
      setLoadingOverview(false);
    }
    loadCompanyData();
  }, [activeTicker]);

  // Load History when activeTicker or timeframe changes
  useEffect(() => {
    async function loadHistory() {
      if (!activeTicker) return;
      setLoadingHistory(true);
      const limitMap = { '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };
      const histData = await api.getHistory(activeTicker, limitMap[timeframe] || 90);
      setHistory(histData);
      setLoadingHistory(false);
    }
    loadHistory();
  }, [activeTicker, timeframe]);

  // Watchlist Actions
  const handleAddToWatchlist = async (ticker) => {
    const item = await api.addToWatchlist(ticker, profile?.name || ticker, 'Saved equity');
    if (item) {
      setWatchlist((prev) => [...prev.filter((it) => it.ticker !== ticker), item]);
    }
  };

  const handleRemoveFromWatchlist = async (ticker) => {
    await api.removeFromWatchlist(ticker);
    setWatchlist((prev) => prev.filter((it) => it.ticker !== ticker));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Header */}
      <Header
        activeTicker={activeTicker}
        setActiveTicker={(t) => {
          setActiveTicker(t);
          if (activeTab === 'screener' || activeTab === 'crypto') {
            setActiveTab('overview');
          }
        }}
        quote={quote}
        watchlist={watchlist}
        onAddToWatchlist={handleAddToWatchlist}
        onRemoveFromWatchlist={handleRemoveFromWatchlist}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main Workspace Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewView
            ticker={activeTicker}
            profile={profile}
            quote={quote}
            metrics={metrics}
            loading={loadingOverview}
          />
        )}

        {activeTab === 'chart' && (
          <ChartHistoryView
            ticker={activeTicker}
            history={history}
            loading={loadingHistory}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
          />
        )}

        {activeTab === 'statements' && (
          <StatementsView ticker={activeTicker} />
        )}

        {activeTab === 'screener' && (
          <ScreenerView
            onSelectTicker={(t) => {
              setActiveTicker(t);
              setActiveTab('overview');
            }}
          />
        )}

        {activeTab === 'filings' && (
          <FilingsView ticker={activeTicker} />
        )}

        {activeTab === 'brief' && (
          <BriefView ticker={activeTicker} />
        )}

        {activeTab === 'crypto' && (
          <CryptoView />
        )}

        {activeTab === 'settings' && (
          <SettingsView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Open Stock Research</span>
            <span>•</span>
            <span>Self-hostable fundamental equity research and market screener</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>FastAPI Port 8002</span>
            <span>•</span>
            <span>Next.js Port 3002</span>
            <span>•</span>
            <span>Apache-2.0 License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
