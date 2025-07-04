'use client';

import dynamic from 'next/dynamic';
import './pool-game.css';

// Dynamically import the game component with no SSR
const PoolGameComponent = dynamic(() => import('./PoolGameComponent'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading game...</div>
});

export default function Home() {
  return <PoolGameComponent />;
}