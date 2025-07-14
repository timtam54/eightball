'use client';

import dynamic from 'next/dynamic';

const TetrisComponent = dynamic(() => import('./TetrisComponent'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading Tetris...</div>
});

export default function TetrisPage() {
  return <TetrisComponent />;
}