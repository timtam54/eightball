'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const PoolGameComponent = dynamic(() => import('./PoolGameComponent'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Loading 8-ball game...</div>
});

export default function EightBallPage() {
  return <PoolGameComponent />;
}