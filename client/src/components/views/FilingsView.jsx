'use client';

import React, { useState, useEffect } from 'react';
import { FileCheck2, ExternalLink, Calendar, Hash, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';

export default function FilingsView({ ticker }) {
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadFilings() {
      if (!ticker) return;
      setLoading(true);
      const data = await api.getFilings(ticker, 20);
      setFilings(data);
      setLoading(false);
    }
    loadFilings();
  }, [ticker]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Official SEC EDGAR Filings Archive</h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
              10-K • 10-Q • 8-K Verified Sources
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Access verified regulatory filings with direct links to SEC EDGAR source documentation for {ticker}.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center glass-panel rounded-2xl border border-slate-200 shadow-xs">
          <div className="animate-spin text-2xl mb-2">⚡</div>
          <p className="text-xs text-slate-500 font-medium">Fetching regulatory filings from SEC repository...</p>
        </div>
      ) : filings.length === 0 ? (
        <div className="p-16 text-center glass-panel rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No SEC Filings Found for {ticker}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Configure live MUAPI_API_KEY in Settings to inspect regulatory filings and accession numbers.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 font-semibold text-slate-700">Form Type</th>
                <th className="py-2.5 font-semibold text-slate-700">Filing Date</th>
                <th className="py-2.5 font-semibold text-slate-700">Report Period</th>
                <th className="py-2.5 font-semibold text-slate-700">Accession Number</th>
                <th className="py-2.5 font-semibold text-slate-700 text-right">EDGAR Source Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filings.map((f, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition text-slate-700">
                  <td className="py-3 font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        f.form_type === '10-K'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : f.form_type === '10-Q'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {f.form_type}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-800">{f.filing_date}</td>
                  <td className="py-3 font-mono text-slate-500">{f.report_date || '—'}</td>
                  <td className="py-3 font-mono text-slate-500 truncate max-w-xs">{f.accession_number || '—'}</td>
                  <td className="py-3 text-right">
                    {f.edgar_url ? (
                      <a
                        href={f.edgar_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition text-xs font-semibold shadow-2xs"
                      >
                        <span>View on SEC EDGAR</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">Unavailable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
