import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 py-6 bg-white text-xs text-slate-500 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">Open Stock Research</span>
          <span>•</span>
          <span>Self-hostable fundamental equity research and market screener</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>FastAPI Port 8000</span>
          <span>•</span>
          <span>Next.js Port 3000</span>
          <span>•</span>
          <span>Apache-2.0 License</span>
        </div>
      </div>
    </footer>
  );
}
