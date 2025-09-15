"use client";

import dynamic from 'next/dynamic';

const Tetris3D = dynamic(() => import('./Tetris3D'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>
});

export default function Tetris3jsPage() {
  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
      <Tetris3D />
    </div>
  );
}