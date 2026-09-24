'use client';

import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import CustomDropdown from '../CustomDropdown';

const TIMEFRAME_OPTIONS = [
  { value: '1W', label: '1 Week (7 Days)', sublabel: 'Short-term momentum' },
  { value: '1M', label: '1 Month (30 Days)', sublabel: 'Monthly volatility' },
  { value: '3M', label: '3 Months (90 Days)', sublabel: 'Quarterly trend' },
  { value: '6M', label: '6 Months (180 Days)', sublabel: 'Half-year performance' },
  { value: '1Y', label: '1 Year (365 Days)', sublabel: 'Annual historical range' },
];

export default function ChartHistoryView({ ticker, history, loading, timeframe, setTimeframe }) {
  const [chartMode, setChartMode] = useState('area'); // 'area' or 'candles'
  const [hoveredBar, setHoveredBar] = useState(null);

  const bars = history?.bars || [];

  // Compute stats
  const stats = useMemo(() => {
    if (!bars || bars.length === 0) return null;
    const closes = bars.map((b) => b.close);
    const highs = bars.map((b) => b.high);
    const lows = bars.map((b) => b.low);
    const firstClose = closes[0];
    const lastClose = closes[closes.length - 1];
    const change = lastClose - firstClose;
    const changePct = (change / firstClose) * 100;
    return {
      firstClose,
      lastClose,
      change,
      changePct,
      periodHigh: Math.max(...highs),
      periodLow: Math.min(...lows),
      avgVolume: Math.round(bars.reduce((sum, b) => sum + b.volume, 0) / bars.length),
    };
  }, [bars]);

  // SVG Chart Dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };

  const { points, candleData, volumeBars, minPrice, maxPrice } = useMemo(() => {
    if (!bars || bars.length === 0) return { points: '', candleData: [], volumeBars: [], minPrice: 0, maxPrice: 100 };
    const prices = bars.flatMap((b) => [b.low, b.high]);
    const minP = Math.min(...prices) * 0.98;
    const maxP = Math.max(...prices) * 1.02;
    const maxVol = Math.max(...bars.map((b) => b.volume || 1), 1);

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const pts = bars.map((b, i) => {
      const x = padding.left + (i / Math.max(1, bars.length - 1)) * chartW;
      const y = padding.top + chartH - ((b.close - minP) / Math.max(0.01, maxP - minP)) * chartH;
      return `${x},${y}`;
    }).join(' ');

    const candles = bars.map((b, i) => {
      const x = padding.left + (i / Math.max(1, bars.length - 1)) * chartW;
      const yOpen = padding.top + chartH - ((b.open - minP) / Math.max(0.01, maxP - minP)) * chartH;
      const yClose = padding.top + chartH - ((b.close - minP) / Math.max(0.01, maxP - minP)) * chartH;
      const yHigh = padding.top + chartH - ((b.high - minP) / Math.max(0.01, maxP - minP)) * chartH;
      const yLow = padding.top + chartH - ((b.low - minP) / Math.max(0.01, maxP - minP)) * chartH;
      const isUp = b.close >= b.open;
      return {
        bar: b,
        x,
        yOpen,
        yClose,
        yHigh,
        yLow,
        top: Math.min(yOpen, yClose),
        height: Math.max(2, Math.abs(yClose - yOpen)),
        isUp,
      };
    });

    const volBars = bars.map((b, i) => {
      const x = padding.left + (i / Math.max(1, bars.length - 1)) * chartW;
      const barH = (b.volume / maxVol) * 45;
      const y = height - padding.bottom - barH;
      return { x, y, height: barH, isUp: b.close >= b.open, volume: b.volume };
    });

    return { points: pts, candleData: candles, volumeBars: volBars, minPrice: minP, maxPrice: maxP };
  }, [bars]);

  return (
    <div className="space-y-6">
      {/* Chart Controls & Summary Bar */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{ticker} Daily Price History</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                Marketstack EOD
              </span>
            </div>
            {stats && (
              <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
                <span className="text-lg font-bold text-slate-900">${stats.lastClose.toFixed(2)}</span>
                <span
                  className={`font-semibold flex items-center gap-0.5 ${
                    stats.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {stats.change >= 0 ? '+' : ''}
                  ${stats.change.toFixed(2)} ({stats.change >= 0 ? '+' : ''}
                  {stats.changePct.toFixed(2)}%)
                </span>
                <span className="text-slate-400 font-sans">over selected timeframe</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Timeframe Dropdown */}
            <CustomDropdown
              value={timeframe}
              onChange={(val) => setTimeframe(val)}
              options={TIMEFRAME_OPTIONS}
              icon={Calendar}
              className="w-44"
            />

            {/* Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setChartMode('area')}
                className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                  chartMode === 'area'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Line / Area
              </button>
              <button
                type="button"
                onClick={() => setChartMode('candles')}
                className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                  chartMode === 'candles'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Candlesticks
              </button>
            </div>
          </div>
        </div>

        {/* Hovered Bar Inspection Pill */}
        {hoveredBar && (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono text-slate-700 flex-wrap gap-2">
            <span>Date: <strong className="text-slate-900">{hoveredBar.date}</strong></span>
            <span>Open: <strong>${hoveredBar.open.toFixed(2)}</strong></span>
            <span>High: <strong className="text-emerald-600">${hoveredBar.high.toFixed(2)}</strong></span>
            <span>Low: <strong className="text-rose-600">${hoveredBar.low.toFixed(2)}</strong></span>
            <span>Close: <strong className="text-blue-600">${hoveredBar.close.toFixed(2)}</strong></span>
            <span>Vol: <strong>{hoveredBar.volume.toLocaleString()}</strong></span>
          </div>
        )}

        {/* Chart Viewport */}
        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <div className="animate-spin text-2xl mr-2">⚡</div>
            <span className="text-xs text-slate-500 font-medium">Fetching EOD bars via Muapi market-stock-history...</span>
          </div>
        ) : bars.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
            <BarChart3 className="w-10 h-10 text-slate-300 mb-2" />
            <span className="text-sm font-semibold text-slate-700">No Historical Bars Available</span>
            <p className="text-xs text-slate-400 mt-1">
              Add MUAPI_API_KEY in Settings to load live daily OHLCV bars for {ticker}.
            </p>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto max-h-80 select-none overflow-visible"
            >
              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = padding.top + (height - padding.top - padding.bottom) * ratio;
                const p = maxPrice - (maxPrice - minPrice) * ratio;
                return (
                  <g key={idx}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94a3b8"
                      fontFamily="monospace"
                    >
                      ${p.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Volume Bars */}
              {volumeBars.map((vb, idx) => (
                <rect
                  key={`vol-${idx}`}
                  x={vb.x - 2}
                  y={vb.y}
                  width="4"
                  height={vb.height}
                  fill={vb.isUp ? '#d1fae5' : '#fee2e2'}
                  rx="1"
                />
              ))}

              {/* Area Chart Mode */}
              {chartMode === 'area' && (
                <>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={`${padding.left},${height - padding.bottom} ${points} ${
                      width - padding.right
                    },${height - padding.bottom}`}
                    fill="url(#areaGradient)"
                  />
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                </>
              )}

              {/* Candlestick Mode */}
              {chartMode === 'candles' &&
                candleData.map((cd, idx) => (
                  <g
                    key={`candle-${idx}`}
                    onMouseEnter={() => setHoveredBar(cd.bar)}
                    onMouseLeave={() => setHoveredBar(null)}
                    className="cursor-pointer"
                  >
                    {/* Wick */}
                    <line
                      x1={cd.x}
                      y1={cd.yHigh}
                      x2={cd.x}
                      y2={cd.yLow}
                      stroke={cd.isUp ? '#10b981' : '#ef4444'}
                      strokeWidth="1"
                    />
                    {/* Body */}
                    <rect
                      x={cd.x - 3}
                      y={cd.top}
                      width="6"
                      height={cd.height}
                      fill={cd.isUp ? '#10b981' : '#ef4444'}
                      rx="1"
                    />
                  </g>
                ))}

              {/* Interactive Hover Area for Line Mode */}
              {chartMode === 'area' &&
                candleData.map((cd, idx) => (
                  <circle
                    key={`dot-${idx}`}
                    cx={cd.x}
                    cy={cd.yClose}
                    r="4"
                    fill="#2563eb"
                    opacity={hoveredBar === cd.bar ? 1 : 0}
                    onMouseEnter={() => setHoveredBar(cd.bar)}
                    onMouseLeave={() => setHoveredBar(null)}
                    className="cursor-pointer transition-opacity"
                  />
                ))}
            </svg>
          </div>
        )}

        {/* Period Highlights Table */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Period Low</span>
              <span className="text-xs font-bold text-rose-600 font-mono mt-0.5 block">
                ${stats.periodLow.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Period High</span>
              <span className="text-xs font-bold text-emerald-600 font-mono mt-0.5 block">
                ${stats.periodHigh.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Average Volume</span>
              <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">
                {stats.avgVolume.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Total EOD Bars</span>
              <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">
                {bars.length} observations
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
