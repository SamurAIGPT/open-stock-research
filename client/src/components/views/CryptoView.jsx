'use client';

import React, { useState, useEffect } from 'react';
import { Coins, Search, ArrowUpRight, ArrowDownRight, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';

export default function CryptoView() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadMarkets() {
      setLoading(true);
      const data = await api.getCryptoMarkets(25);
      setMarkets(data);
      setLoading(false);
    }
    loadMarkets();
  }, []);

  const filtered = markets.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Boundary Notice */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Digital Asset & Crypto Market Monitor</h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
              CoinGecko via Muapi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Read-only crypto spot pricing, market capitalization rankings, and historical sparklines.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coin (e.g. BTC, ETH)..."
            className="w-48 sm:w-60 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 shadow-xs"
          />
        </div>
      </div>

      {/* Scope Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800">Strict Read-Only Research Scope:</strong> In accordance with the financial data API specification, this monitor provides public market observation and price feeds only. Wallet integrations, private exchange execution, trading bots, and portfolio accounting are strictly out of scope.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center glass-panel rounded-2xl border border-slate-200 shadow-xs">
          <div className="animate-spin text-2xl mb-2">⚡</div>
          <p className="text-xs text-slate-500 font-medium">Fetching live CoinGecko market rates via Muapi...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center glass-panel rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <Coins className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No Crypto Feeds Available</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Configure live MUAPI_API_KEY in Settings to load live cryptocurrency spot feeds.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 font-semibold text-slate-700">Asset</th>
                <th className="py-2.5 font-semibold text-slate-700 text-right">Price (USD)</th>
                <th className="py-2.5 font-semibold text-slate-700 text-right">24h Change</th>
                <th className="py-2.5 font-semibold text-slate-700 text-right">Market Cap</th>
                <th className="py-2.5 font-semibold text-slate-700 text-right">24h Volume</th>
                <th className="py-2.5 font-semibold text-slate-700 text-right">7d Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((coin, idx) => {
                const isPositive = coin.price_change_percentage_24h >= 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition text-slate-700">
                    <td className="py-3 flex items-center gap-2.5 font-medium text-slate-900">
                      <span className="font-mono font-bold text-blue-600 w-12">{coin.symbol}</span>
                      <span>{coin.name}</span>
                    </td>
                    <td className="py-3 font-mono font-bold text-right text-slate-900">
                      ${coin.current_price_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>
                    <td className="py-3 font-mono font-semibold text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPositive ? '+' : ''}
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 font-mono text-right text-slate-600">
                      {coin.market_cap_usd ? `$${(coin.market_cap_usd / 1e9).toFixed(2)}B` : '—'}
                    </td>
                    <td className="py-3 font-mono text-right text-slate-600">
                      {coin.total_volume_usd ? `$${(coin.total_volume_usd / 1e6).toFixed(1)}M` : '—'}
                    </td>
                    <td className="py-3 text-right">
                      {coin.sparkline_7d && coin.sparkline_7d.length > 0 ? (
                        <div className="flex items-center justify-end">
                          <svg className="w-20 h-5 overflow-visible">
                            {(() => {
                              const min = Math.min(...coin.sparkline_7d);
                              const max = Math.max(...coin.sparkline_7d);
                              const pts = coin.sparkline_7d.map((p, i) => {
                                const x = (i / (coin.sparkline_7d.length - 1)) * 80;
                                const y = 20 - ((p - min) / Math.max(0.01, max - min)) * 18;
                                return `${x},${y}`;
                              }).join(' ');
                              return (
                                <polyline
                                  fill="none"
                                  stroke={isPositive ? '#10b981' : '#ef4444'}
                                  strokeWidth="1.5"
                                  points={pts}
                                />
                              );
                            })()}
                          </svg>
                        </div>
                      ) : (
                        <span className="text-slate-400">Flat</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
