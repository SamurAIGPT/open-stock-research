'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, Download, Filter } from 'lucide-react';
import { api } from '../../lib/api';
import CustomDropdown from '../CustomDropdown';

const STATEMENT_TYPES = [
  { value: 'income', label: 'Income Statement', sublabel: 'Revenue, Gross Margin, Net Income' },
  { value: 'balance', label: 'Balance Sheet', sublabel: 'Assets, Liabilities, Shareholders Equity' },
  { value: 'cash_flow', label: 'Cash Flow Statement', sublabel: 'Operating, Investing & Free Cash Flow' },
];

const PERIOD_OPTIONS = [
  { value: 'annual', label: 'Annual (FY)', sublabel: '10-K Audited Reports' },
  { value: 'quarterly', label: 'Quarterly (Q1-Q4)', sublabel: '10-Q Seasonal Reports' },
];

export default function StatementsView({ ticker }) {
  const [statementType, setStatementType] = useState('income');
  const [period, setPeriod] = useState('annual');
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadStatements() {
      if (!ticker) return;
      setLoading(true);
      const data = await api.getFinancials(ticker, statementType, period);
      setStatements(data);
      setLoading(false);
    }
    loadStatements();
  }, [ticker, statementType, period]);

  // Extract all unique line items across statements
  const allKeys = Array.from(
    new Set(
      statements.flatMap((s) => Object.keys(s.line_items || {}))
    )
  ).filter((k) => !['fiscal_year', 'fiscal_period', 'currency', 'ticker'].includes(k));

  const formatValue = (val) => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'number') {
      const absVal = Math.abs(val);
      if (absVal >= 1e9) {
        return `${val < 0 ? '-' : ''}$${(absVal / 1e9).toFixed(2)}B`;
      }
      if (absVal >= 1e6) {
        return `${val < 0 ? '-' : ''}$${(absVal / 1e6).toFixed(2)}M`;
      }
      return `${val < 0 ? '-' : ''}$${val.toLocaleString()}`;
    }
    return String(val);
  };

  return (
    <div className="space-y-6">
      {/* Controls & Header */}
      <div className="relative z-20 p-6 rounded-2xl glass-panel border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Standardized Financial Statements</h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
              Financial Datasets Standardized
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Examine multi-year GAAP income statements, balance sheets, and cash flow operations for {ticker}.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <CustomDropdown
            value={statementType}
            onChange={(val) => setStatementType(val)}
            options={STATEMENT_TYPES}
            icon={FileText}
            className="w-56"
          />

          <CustomDropdown
            value={period}
            onChange={(val) => setPeriod(val)}
            options={PERIOD_OPTIONS}
            icon={Calendar}
            align="right"
            className="w-44"
          />
        </div>
      </div>

      {/* Financial Statement Table View */}
      {loading ? (
        <div className="p-16 text-center glass-panel rounded-2xl border border-slate-200 shadow-xs">
          <div className="animate-spin text-2xl mb-2">⚡</div>
          <p className="text-xs text-slate-500 font-medium">Retrieving {statementType} records for {ticker}...</p>
        </div>
      ) : statements.length === 0 ? (
        <div className="p-16 text-center glass-panel rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No Standardized Statements Available</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Provide a live MUAPI_API_KEY in Settings to load SEC-verified financial reports for {ticker}.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 font-semibold text-slate-700 w-1/3">Line Item (USD)</th>
                {statements.map((s, idx) => (
                  <th key={idx} className="py-2.5 font-mono font-bold text-slate-900 text-right">
                    {s.fiscal_period || s.fiscal_year || `Period ${idx + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allKeys.map((key, kIdx) => {
                const label = key
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (char) => char.toUpperCase());
                const isHighlight = [
                  'revenue',
                  'gross profit',
                  'operating income',
                  'net income',
                  'total assets',
                  'total liabilities',
                  'free cash flow',
                ].some((highlight) => label.toLowerCase().includes(highlight));

                return (
                  <tr
                    key={kIdx}
                    className={`hover:bg-slate-50/80 transition ${
                      isHighlight ? 'bg-slate-50/50 font-semibold text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    <td className="py-2.5 pr-4 truncate max-w-xs">{label}</td>
                    {statements.map((s, sIdx) => {
                      const val = s.line_items?.[key];
                      return (
                        <td
                          key={sIdx}
                          className="py-2.5 pl-4 text-right font-mono font-medium text-slate-800"
                        >
                          {formatValue(val)}
                        </td>
                      );
                    })}
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
