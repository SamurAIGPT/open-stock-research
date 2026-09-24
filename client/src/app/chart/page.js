'use client';

import React, { useState, useEffect } from 'react';
import ChartHistoryView from '../../components/views/ChartHistoryView';
import { useTicker } from '../../context/TickerContext';
import { api } from '../../lib/api';

export default function ChartPage() {
  const { ticker } = useTicker();
  const [timeframe, setTimeframe] = useState('3M');
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      if (!ticker) return;
      setLoading(true);
      const limitMap = { '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };
      const data = await api.getHistory(ticker, limitMap[timeframe] || 90);
      setHistory(data);
      setLoading(false);
    }
    loadHistory();
  }, [ticker, timeframe]);

  return (
    <ChartHistoryView
      ticker={ticker}
      history={history}
      loading={loading}
      timeframe={timeframe}
      setTimeframe={setTimeframe}
    />
  );
}
