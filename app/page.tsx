'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import InstallPrompt from './components/InstallPrompt';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Hero Section - Quadrix */}
        <section className="w-full max-w-6xl mb-20">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-8xl font-extrabold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400 animate-gradient">
                QUADRIX
              </span>
            </h1>
            <p className="text-gray-300 text-xl md:text-2xl mb-8">
              The Classic Block-Stacking Puzzle Game
            </p>
          </div>

          {/* Large Quadrix Card */}
          <Link href="/tetris" className="group relative block transform transition-all duration-300 hover:scale-[1.02] mx-auto max-w-2xl">
            <div className="relative bg-gradient-to-br from-purple-900/90 to-pink-600/90 backdrop-blur-md rounded-3xl p-12 overflow-hidden border border-purple-400/40 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 grid grid-cols-4 grid-rows-4 gap-1">
                    <div className="bg-yellow-400 rounded col-span-2"></div>
                    <div className="bg-yellow-400 rounded col-span-2"></div>
                    <div className="bg-red-500 rounded"></div>
                    <div className="bg-red-500 rounded"></div>
                    <div className="bg-red-500 rounded col-span-2"></div>
                    <div className="bg-blue-500 rounded col-span-2"></div>
                    <div className="bg-blue-500 rounded"></div>
                    <div className="bg-green-500 rounded"></div>
                    <div className="bg-green-500 rounded col-span-2"></div>
                    <div className="bg-purple-500 rounded"></div>
                    <div className="bg-orange-500 rounded"></div>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-pink-600 rounded blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-4xl font-bold text-white mb-4">Play Now</h2>
                  <p className="text-gray-200 text-lg mb-6">
                    Stack falling blocks perfectly. Clear lines, score points, and see how long you can last as the speed increases!
                  </p>
                  <div className="inline-flex items-center gap-3 text-white bg-purple-600/50 px-6 py-3 rounded-full text-lg font-semibold group-hover:bg-purple-600/70 transition-colors">
                    <span>Start Game</span>
                    <span className="text-2xl">→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* Demo Section */}
        <section className="w-full max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
              More Games
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 8-Ball Card - Smaller */}
            <Link href="/8-ball" className="group relative transform transition-all duration-300 hover:scale-105">
              <div className="relative bg-gradient-to-br from-green-900/70 to-green-600/70 backdrop-blur-md rounded-xl p-6 overflow-hidden border border-green-400/20 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-green-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl font-bold">8</span>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-1">8-Ball Pool</h3>
                    <p className="text-gray-300 text-sm">
                      Classic billiards game
                    </p>
                  </div>
                  
                  <span className="text-green-300 text-xl">→</span>
                </div>
              </div>
            </Link>

            {/* Terracotta Card - Smaller */}
            <Link href="/terracotta" className="group relative transform transition-all duration-300 hover:scale-105">
              <div className="relative bg-gradient-to-br from-orange-900/70 to-orange-600/70 backdrop-blur-md rounded-xl p-6 overflow-hidden border border-orange-400/20 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-orange-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 grid grid-cols-3 grid-rows-3 gap-0.5">
                      <div className="bg-orange-700 rounded-sm"></div>
                      <div className="bg-orange-600 rounded-sm"></div>
                      <div className="bg-orange-700 rounded-sm"></div>
                      <div className="bg-orange-600 rounded-sm"></div>
                      <div className="bg-transparent"></div>
                      <div className="bg-orange-600 rounded-sm"></div>
                      <div className="bg-orange-700 rounded-sm"></div>
                      <div className="bg-transparent"></div>
                      <div className="bg-orange-700 rounded-sm"></div>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-600 rounded blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-1">Terracotta Brick</h3>
                    <p className="text-gray-300 text-sm">
                      3D block breaker variant
                    </p>
                  </div>
                  
                  <span className="text-orange-300 text-xl">→</span>
                </div>
              </div>
            </Link>

            {/* Tetris 3D Card */}
            <Link href="/tetris3js" className="group relative transform transition-all duration-300 hover:scale-105">
              <div className="relative bg-gradient-to-br from-purple-900/70 to-cyan-600/70 backdrop-blur-md rounded-xl p-6 overflow-hidden border border-cyan-400/20 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 grid grid-cols-4 grid-rows-4 gap-0.5">
                      <div className="bg-cyan-500 rounded-sm col-span-4"></div>
                      <div className="bg-transparent col-span-4"></div>
                      <div className="bg-purple-500 rounded-sm"></div>
                      <div className="bg-purple-500 rounded-sm"></div>
                      <div className="bg-purple-500 rounded-sm"></div>
                      <div className="bg-transparent"></div>
                      <div className="bg-transparent"></div>
                      <div className="bg-purple-500 rounded-sm"></div>
                      <div className="bg-transparent"></div>
                      <div className="bg-transparent"></div>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-cyan-400 rounded blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-1">Tetris 3D</h3>
                    <p className="text-gray-300 text-sm">
                      Three.js powered Tetris
                    </p>
                  </div>
                  
                  <span className="text-cyan-300 text-xl">→</span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <footer className="mt-16 text-center">
          <p className="text-gray-400 text-sm">
            Built with Next.js • Click to start playing
          </p>
        </footer>
      </div>

      {/* Install Prompt */}
      {isClient && <InstallPrompt />}

      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient {
          animation: gradient 4s ease infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}