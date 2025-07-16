"use client"

import { useNativeFeatures } from "../hooks/useNativeFeatures"

export default function HighScores() {
  const { highScores } = useNativeFeatures()

  const formatScore = (score: number) => {
    return score.toLocaleString()
  }

  const gameNames: Record<string, string> = {
    'tetris': 'Tetris',
    '8-ball': '8-Ball Pool',
    'terracotta': 'Terracotta Breaker'
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        High Scores
      </h2>
      <div className="space-y-3">
        {Object.entries(highScores).map(([game, score]) => (
          <div key={game} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
            <span className="text-gray-300 font-medium">{gameNames[game] || game}</span>
            <span className="text-yellow-400 font-bold text-lg">{formatScore(score)}</span>
          </div>
        ))}
        {Object.keys(highScores).length === 0 && (
          <p className="text-gray-500 text-center py-4">No high scores yet. Start playing!</p>
        )}
      </div>
    </div>
  )
}