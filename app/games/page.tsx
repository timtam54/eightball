'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import InstallPrompt from '../components/InstallPrompt';
import HighScores from '../components/HighScores';

export default function GamesPage() {
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
        <h1 className="text-6xl md:text-8xl font-extrabold text-center mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient">
            Game Center
          </span>
        </h1>
        
        <p className="text-gray-300 text-xl md:text-2xl text-center mb-16 max-w-2xl">
          Choose your adventure and compete for the highest scores!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
          {/* 8-Ball Card */}
          <Link href="/8-ball" className="group relative transform transition-all duration-300 hover:scale-105">
            <div className="relative bg-gradient-to-br from-green-900/80 to-green-600/80 backdrop-blur-md rounded-2xl p-8 overflow-hidden border border-green-400/30 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-green-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center shadow-xl">
                      <span className="text-white text-4xl font-bold">8</span>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-3">8-Ball Pool</h2>
                <p className="text-gray-200 text-lg mb-6">
                  Classic billiards game. Pot your balls and sink the 8-ball to win!
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-green-300 font-semibold">Single Player</span>
                  <span className="text-white bg-green-600/50 px-3 py-1 rounded-full text-sm">
                    Play Now →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Tetris Card */}
          <Link href="/tetris" className="group relative transform transition-all duration-300 hover:scale-105">
            <div className="relative bg-gradient-to-br from-purple-900/80 to-pink-600/80 backdrop-blur-md rounded-2xl p-8 overflow-hidden border border-purple-400/30 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 grid grid-cols-2 grid-rows-2 gap-1">
                      <div className="bg-yellow-400 rounded"></div>
                      <div className="bg-red-500 rounded"></div>
                      <div className="bg-blue-500 rounded"></div>
                      <div className="bg-green-500 rounded"></div>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-600 rounded blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-3">Tetris</h2>
                <p className="text-gray-200 text-lg mb-6">
                  Stack falling blocks perfectly. Clear lines and chase high scores!
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 font-semibold">Puzzle Game</span>
                  <span className="text-white bg-purple-600/50 px-3 py-1 rounded-full text-sm">
                    Play Now →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Terracotta Card */}
          <Link href="/terracotta" className="group relative transform transition-all duration-300 hover:scale-105">
            <div className="relative bg-gradient-to-br from-orange-900/80 to-orange-600/80 backdrop-blur-md rounded-2xl p-8 overflow-hidden border border-orange-400/30 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-orange-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 grid grid-cols-3 grid-rows-3 gap-0.5">
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
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-600 rounded blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-3">Terracotta Breaker</h2>
                <p className="text-gray-200 text-lg mb-6">
                  Break 3D terracotta blocks in this unique Tetris variant!
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-orange-300 font-semibold">3D Puzzle</span>
                  <span className="text-white bg-orange-600/50 px-3 py-1 rounded-full text-sm">
                    Play Now →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* High Scores Section */}
        <div className="mt-12 w-full max-w-md">
          <HighScores />
        </div>

        <footer className="mt-16 text-center">
          <p className="text-gray-400 text-sm">
            Built with Next.js • Select a game to start playing
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