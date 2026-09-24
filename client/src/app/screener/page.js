'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ScreenerView from '../../components/views/ScreenerView';
import { useTicker } from '../../context/TickerContext';

export default function ScreenerPage() {
  const router = useRouter();
  const { setTicker } = useTicker();

  const handleSelectTicker = (selectedTicker) => {
    setTicker(selectedTicker);
    router.push(`/?ticker=${encodeURIComponent(selectedTicker)}`);
  };

  return <ScreenerView onSelectTicker={handleSelectTicker} />;
}
