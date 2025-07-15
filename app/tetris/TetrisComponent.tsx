"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import MobileHelpDialog from "./MobileHelpDialog"

interface Position {
  x: number
  y: number
}

interface Piece {
  shape: number[][]
  color: string
  position: Position
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
  type: "brick" | "dust" | "fragment"
}

interface Explosion {
  row: number
  particles: Particle[]
  startTime: number
}

interface TetrisSkin {
  name: string
  pieces: { shape: number[][]; color: string }[]
  background: string
  gridColor: string
  gridLineWidth: number
  blockStyle: "classic" | "modern" | "neon" | "brick" | "glossy" | "shiny3d" | "retro"
  uiBackground: string
  uiBorder: string
  uiText: string
  uiAccent: string
  fontFamily: string
  buttonStyle: string
  buttonHoverStyle: string
}

const SKINS: { [key: string]: TetrisSkin } = {
  blockblast: {
    name: "Block Blast",
    pieces: [
      { shape: [[1, 1, 1, 1]], color: "#D4AF37" }, // I - Gold
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "#DAA520",
      }, // O - Goldenrod
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: "#B8860B",
      }, // T - Dark Goldenrod
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: "#CD853F",
      }, // S - Peru
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: "#DEB887",
      }, // Z - Burlywood
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: "#F4A460",
      }, // L - Sandy Brown
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: "#D2B48C",
      }, // J - Tan
    ],
    background: "#2B4A7C", // Deep blue background like in screenshot
    gridColor: "#1E3A5F", // Darker blue for grid lines
    gridLineWidth: 1,
    blockStyle: "retro",
    uiBackground: "bg-slate-800",
    uiBorder: "border-2 border-slate-600",
    uiText: "text-white",
    uiAccent: "text-blue-300",
    fontFamily: "monospace",
    buttonStyle: `
      relative overflow-hidden
      bg-gradient-to-b from-slate-400 via-slate-500 to-slate-700
      hover:from-slate-300 hover:via-slate-400 hover:to-slate-600
      text-white font-bold py-3 px-6
      border-2 border-slate-300
      shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3),inset_-2px_-2px_4px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.2)]
      hover:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.3)]
      transform transition-all duration-150
      hover:scale-[0.98] active:scale-[0.96]
      uppercase tracking-wider text-sm
      font-mono
    `,
    buttonHoverStyle: "hover:scale-[0.98] active:scale-[0.96]",
  },
  classic: {
    name: "Classic",
    pieces: [
      { shape: [[1, 1, 1, 1]], color: "#00F0F0" }, // I - Cyan
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "#F0F000",
      }, // O - Yellow
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: "#A000F0",
      }, // T - Purple
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: "#00F000",
      }, // S - Green
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: "#F00000",
      }, // Z - Red
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: "#F0A000",
      }, // L - Orange
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: "#0000F0",
      }, // J - Blue
    ],
    background: "#000000",
    gridColor: "#222222",
    gridLineWidth: 1,
    blockStyle: "classic",
    uiBackground: "bg-black",
    uiBorder: "border-4 border-gray-700",
    uiText: "text-white",
    uiAccent: "text-gray-400",
    fontFamily: "monospace",
    buttonStyle:
      "bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 border-2 border-gray-600 transition-colors uppercase",
    buttonHoverStyle: "hover:bg-gray-600",
  },
  modern: {
    name: "Modern",
    pieces: [
      { shape: [[1, 1, 1, 1]], color: "#00CED1" }, // I - Dark Turquoise
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "#FFD700",
      }, // O - Gold
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: "#DA70D6",
      }, // T - Orchid
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: "#32CD32",
      }, // S - Lime Green
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: "#FF6347",
      }, // Z - Tomato
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: "#FF8C00",
      }, // L - Dark Orange
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: "#4169E1",
      }, // J - Royal Blue
    ],
    background: "gradient",
    gridColor: "rgba(255, 255, 255, 0.1)",
    gridLineWidth: 0.5,
    blockStyle: "modern",
    uiBackground: "bg-gradient-to-br from-gray-800 to-gray-900",
    uiBorder: "rounded-xl shadow-xl border border-purple-500/30",
    uiText: "text-white",
    uiAccent: "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500",
    fontFamily: "sans-serif",
    buttonStyle:
      "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transform transition-all hover:scale-105",
    buttonHoverStyle: "hover:scale-105",
  },
  neon: {
    name: "Neon",
    pieces: [
      { shape: [[1, 1, 1, 1]], color: "#00FFFF" }, // I - Bright Cyan
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "#FFFF00",
      }, // O - Bright Yellow
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: "#FF00FF",
      }, // T - Magenta
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: "#00FF00",
      }, // S - Bright Green
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: "#FF0080",
      }, // Z - Hot Pink
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: "#FF8800",
      }, // L - Bright Orange
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: "#0080FF",
      }, // Bright Blue
    ],
    background: "#0a0a0a",
    gridColor: "#1a1a1a",
    gridLineWidth: 1,
    blockStyle: "neon",
    uiBackground: "bg-gray-950",
    uiBorder: "border-2 border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.5)]",
    uiText: "text-white",
    uiAccent: "text-pink-400",
    fontFamily: "monospace",
    buttonStyle:
      "bg-gray-900 hover:bg-gray-800 text-pink-400 font-bold py-2 px-4 border-2 border-pink-500/50 transition-all shadow-[0_0_10px_rgba(236,72,153,0.3)] hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]",
    buttonHoverStyle: "hover:bg-gray-800",
  },
  brick: {
    name: "Brick Breaker",
    pieces: [
      { shape: [[1, 1, 1, 1]], color: "#E97451" }, // I - Burnt Sienna
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "#FF7F50",
      }, // O - Coral
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: "#CD5C5C",
      }, // T - Indian Red
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: "#D2691E",
      }, // S - Chocolate
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: "#BC8F8F",
      }, // Z - Rosy Brown
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: "#A0522D",
      }, // L - Sienna
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: "#8B4513",
      }, // J - Saddle Brown
    ],
    background: "#696969",
    gridColor: "#4a4a4a",
    gridLineWidth: 2,
    blockStyle: "brick",
    uiBackground: "bg-stone-800",
    uiBorder: "border-4 border-stone-600 shadow-inner",
    uiText: "text-orange-100",
    uiAccent: "text-orange-400",
    fontFamily: "monospace",
    buttonStyle:
      "bg-orange-700 hover:bg-orange-600 text-white font-bold py-2 px-4 border-2 border-orange-800 transition-colors uppercase shadow-md",
    buttonHoverStyle: "hover:bg-orange-600",
  },
  glossy: {
    name: "Glossy 3D",
    pieces: [
      { shape: [[1, 1, 1, 1]], color: "#87CEEB" }, // I - Sky Blue
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "#FFD700",
      }, // O - Gold
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: "#9370DB",
      }, // T - Medium Purple
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: "#90EE90",
      }, // S - Light Green
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: "#FF6B6B",
      }, // Z - Light Red/Coral
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: "#FFA500",
      }, // L - Orange
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: "#4ECDC4",
      }, // J - Turquoise
    ],
    background: "#2C3E50",
    gridColor: "rgba(255, 255, 255, 0.05)",
    gridLineWidth: 1,
    blockStyle: "glossy",
    uiBackground: "bg-slate-800",
    uiBorder: "rounded-2xl shadow-2xl border border-slate-600",
    uiText: "text-white",
    uiAccent: "text-sky-400",
    fontFamily: "system-ui",
    buttonStyle:
      "bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all hover:scale-105",
    buttonHoverStyle: "hover:scale-105",
  },
  shiny3d: {
    name: "Shiny 3D Chrome",
    pieces: [
      { shape: [[1, 1, 1, 1]], color: "#B8860B" }, // I - Dark Goldenrod
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "#FFD700",
      }, // O - Gold
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: "#C0C0C0",
      }, // T - Silver
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: "#32CD32",
      }, // S - Lime Green
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: "#FF4500",
      }, // Z - Orange Red
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: "#FF6347",
      }, // L - Tomato
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: "#4169E1",
      }, // Royal Blue
    ],
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    gridColor: "rgba(255, 255, 255, 0.15)",
    gridLineWidth: 1,
    blockStyle: "shiny3d",
    uiBackground: "bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900",
    uiBorder: "rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-2 border-gray-500/30",
    uiText: "text-white",
    uiAccent: "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400",
    fontFamily: "system-ui",
    buttonStyle: `
      relative overflow-hidden
      bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600
      hover:from-gray-200 hover:via-gray-300 hover:to-gray-500
      text-gray-800 font-bold py-4 px-8 
      rounded-2xl
      shadow-[inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-1px_0_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.3),0_8px_16px_rgba(0,0,0,0.2)]
      hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.3)]
      border-2 border-gray-400/50
      transform transition-all duration-150
      hover:scale-[0.98] active:scale-[0.96]
      before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/40 before:via-transparent before:to-transparent before:rounded-2xl
      after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/20 after:via-transparent after:to-transparent after:rounded-2xl
      uppercase tracking-wider text-sm
    `,
    buttonHoverStyle: "hover:scale-[0.98] active:scale-[0.96]",
  },
  retro: {
    name: "Retro Arcade",
    pieces: [
      { shape: [[1, 1, 1, 1]], color: "#00BFFF" }, // I - Light Blue
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "#FFD700",
      }, // O - Gold/Yellow
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: "#9370DB",
      }, // T - Purple
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: "#32CD32",
      }, // S - Green
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: "#DC143C",
      }, // Z - Red
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: "#FF8C00",
      }, // L - Orange
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: "#4169E1",
      }, // J - Royal Blue
    ],
    background: "#2B4A7C", // Deep blue background like in screenshot
    gridColor: "#1E3A5F", // Darker blue for grid lines
    gridLineWidth: 1,
    blockStyle: "retro",
    uiBackground: "bg-slate-800",
    uiBorder: "border-2 border-slate-600",
    uiText: "text-white",
    uiAccent: "text-blue-300",
    fontFamily: "monospace",
    buttonStyle: `
      relative overflow-hidden
      bg-gradient-to-b from-slate-400 via-slate-500 to-slate-700
      hover:from-slate-300 hover:via-slate-400 hover:to-slate-600
      text-white font-bold py-3 px-6
      border-2 border-slate-300
      shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3),inset_-2px_-2px_4px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.2)]
      hover:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.3)]
      transform transition-all duration-150
      hover:scale-[0.98] active:scale-[0.96]
      uppercase tracking-wider text-sm
      font-mono
    `,
    buttonHoverStyle: "hover:scale-[0.98] active:scale-[0.96]",
  },
}

const BOARD_WIDTH = 16 // Changed from 10
const BOARD_HEIGHT = 20
const CELL_SIZE = 28

// Helper function to create pre-filled board with worm holes
const createPrefilledBoard = () => {
  const newBoard = Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(null))

  // Colors to use for pre-filled blocks - using golden/brown tones like Block Blast
  const colors = ["#D4AF37", "#DAA520", "#B8860B", "#CD853F", "#DEB887", "#F4A460"]

  // Fill bottom half (rows 10-19) with blocks, leaving strategic gaps
  for (let y = 10; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      // Create worm hole patterns - strategic empty spaces
      const shouldBeEmpty =
        // Vertical channels
        (x === 7 && y >= 12 && y <= 16) ||
        (x === 8 && y >= 12 && y <= 16) ||
        (x === 4 && y >= 14 && y <= 17) ||
        (x === 12 && y >= 13 && y <= 18) ||
        // Horizontal gaps
        (y === 15 && x >= 2 && x <= 5) ||
        (y === 17 && x >= 9 && x <= 11) ||
        (y === 13 && x >= 13 && x <= 15) ||
        // Random scattered holes for variety
        (x === 1 && y === 16) ||
        (x === 6 && y === 18) ||
        (x === 10 && y === 14) ||
        (x === 14 && y === 16) ||
        (x === 3 && y === 12) ||
        (x === 11 && y === 19) ||
        (x === 15 && y === 11)

      if (!shouldBeEmpty) {
        // Assign a fixed color that won't change - use a more random distribution
        const colorIndex = Math.floor(Math.random() * colors.length)
        newBoard[y][x] = colors[colorIndex]
      }
    }
  }

  return newBoard
}

export default function TetrisComponent() {
  const [board, setBoard] = useState<(string | null)[][]>(() => createPrefilledBoard())
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [nextPieces, setNextPieces] = useState<Piece[]>([])
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [explosions, setExplosions] = useState<Explosion[]>([])
  const [currentSkin, setCurrentSkin] = useState<string>("blockblast")
  const [showMobileHelp, setShowMobileHelp] = useState(false)
  const [touchFeedback, setTouchFeedback] = useState<{ x: number; y: number; time: number } | null>(null)

  const gameLoopRef = useRef<number | undefined>(undefined)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)

  const skin = SKINS[currentSkin]

  const createNewPiece = useCallback(() => {
    const pieceData = skin.pieces[Math.floor(Math.random() * skin.pieces.length)]
    return {
      shape: pieceData.shape,
      color: pieceData.color,
      position: {
        x: Math.floor((BOARD_WIDTH - pieceData.shape[0].length) / 2),
        y: 0,
      },
    }
  }, [skin])

  const checkCollision = useCallback((piece: Piece, board: (string | null)[][], offsetX = 0, offsetY = 0) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.position.x + x + offsetX
          const newY = piece.position.y + y + offsetY

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true
          }
          if (newY >= 0 && board[newY][newX]) {
            return true
          }
        }
      }
    }
    return false
  }, [])

  const rotatePiece = useCallback((piece: Piece): number[][] => {
    const rotated = piece.shape[0].map((_, index) => piece.shape.map((row) => row[index]).reverse())
    return rotated
  }, [])

  const mergePiece = useCallback((piece: Piece, board: (string | null)[][]) => {
    const newBoard = board.map((row) => [...row])
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.position.y + y
          const boardX = piece.position.x + x
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color
          }
        }
      }
    }
    return newBoard
  }, [])

  const createExplosion = useCallback((row: number, colors: string[]) => {
    const particles: Particle[] = []
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const color = colors[x] || "#ffffff"
      const cellX = x * CELL_SIZE
      const cellY = row * CELL_SIZE

      // Create brick fragments (larger pieces)
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: cellX + Math.random() * CELL_SIZE,
          y: cellY + Math.random() * CELL_SIZE,
          vx: (Math.random() - 0.5) * 6,
          vy: -Math.random() * 8 - 2,
          life: 1,
          color: color,
          size: Math.random() * 8 + 6,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.3,
          type: "brick",
        })
      }

      // Create smaller fragments
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: cellX + Math.random() * CELL_SIZE,
          y: cellY + Math.random() * CELL_SIZE,
          vx: (Math.random() - 0.5) * 10,
          vy: -Math.random() * 6 - 1,
          life: 1,
          color: color,
          size: Math.random() * 4 + 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.5,
          type: "fragment",
        })
      }

      // Create dust particles with color tint
      for (let i = 0; i < 12; i++) {
        particles.push({
          x: cellX + Math.random() * CELL_SIZE,
          y: cellY + Math.random() * CELL_SIZE,
          vx: (Math.random() - 0.5) * 4,
          vy: -Math.random() * 3,
          life: 1,
          color: Math.random() > 0.5 ? color : "#FFD700", // Mix of block color and gold
          size: Math.random() * 6 + 4,
          rotation: 0,
          rotationSpeed: 0,
          type: "dust",
        })
      }
    }

    return {
      row,
      particles,
      startTime: Date.now(),
    }
  }, [])

  const clearLines = useCallback(
    (board: (string | null)[][]) => {
      let linesCleared = 0
      const clearedRows: { row: number; colors: string[] }[] = []
      const newBoard = board.filter((row, index) => {
        const isComplete = row.every((cell) => cell !== null)
        if (isComplete) {
          linesCleared++
          clearedRows.push({ row: index, colors: row as string[] })
        }
        return !isComplete
      })

      while (newBoard.length < BOARD_HEIGHT) {
        newBoard.unshift(Array(BOARD_WIDTH).fill(null))
      }

      // Create explosions for cleared lines
      if (clearedRows.length > 0) {
        setExplosions((prev) => [...prev, ...clearedRows.map(({ row, colors }) => createExplosion(row, colors))])
      }

      return { newBoard, linesCleared }
    },
    [createExplosion],
  )

  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (!currentPiece || gameOver || isPaused) return

      if (!checkCollision(currentPiece, board, dx, dy)) {
        setCurrentPiece({
          ...currentPiece,
          position: {
            x: currentPiece.position.x + dx,
            y: currentPiece.position.y + dy,
          },
        })
      } else if (dy > 0) {
        // Piece has landed
        const mergedBoard = mergePiece(currentPiece, board)
        const { newBoard, linesCleared } = clearLines(mergedBoard)

        setBoard(newBoard)
        setLines((prev) => prev + linesCleared)
        setScore((prev) => prev + linesCleared * 100 * level)

        // Get next piece from queue
        if (nextPieces.length > 0) {
          const newPiece = nextPieces[0]
          if (checkCollision(newPiece, newBoard)) {
            setGameOver(true)
          } else {
            setCurrentPiece(newPiece)
            // Remove first piece and add new one to end
            setNextPieces((prev) => [...prev.slice(1), createNewPiece()])
          }
        }
      }
    },
    [
      currentPiece,
      board,
      gameOver,
      isPaused,
      checkCollision,
      mergePiece,
      clearLines,
      level,
      nextPieces,
      createNewPiece,
    ],
  )

  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    const rotated = rotatePiece(currentPiece)
    const rotatedPiece = { ...currentPiece, shape: rotated }

    if (!checkCollision(rotatedPiece, board)) {
      setCurrentPiece(rotatedPiece)
    }
  }, [currentPiece, board, gameOver, isPaused, checkCollision, rotatePiece])

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    let dropDistance = 0
    while (!checkCollision(currentPiece, board, 0, dropDistance + 1)) {
      dropDistance++
    }

    setCurrentPiece({
      ...currentPiece,
      position: {
        x: currentPiece.position.x,
        y: currentPiece.position.y + dropDistance,
      },
    })

    // Immediately lock the piece
    setTimeout(() => movePiece(0, 1), 0)
  }, [currentPiece, board, gameOver, isPaused, checkCollision, movePiece])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return

      switch (e.key) {
        case "ArrowLeft":
          movePiece(-1, 0)
          break
        case "ArrowRight":
          movePiece(1, 0)
          break
        case "ArrowDown":
          movePiece(0, 1)
          break
        case "ArrowUp":
          rotate()
          break
        case " ":
          hardDrop()
          break
        case "p":
        case "P":
          setIsPaused((prev) => !prev)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [movePiece, rotate, hardDrop, gameOver])

  // Handle touch input for mobile
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !currentPiece) return

    let lastTapTime = 0
    const DOUBLE_TAP_DELAY = 300 // milliseconds

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault()
      if (gameOver || isPaused) return

      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      
      // Convert touch coordinates to game board coordinates
      const x = ((touch.clientX - rect.left) / rect.width) * BOARD_WIDTH
      const y = ((touch.clientY - rect.top) / rect.height) * BOARD_HEIGHT

      // Show touch feedback
      setTouchFeedback({ x, y, time: Date.now() })
      setTimeout(() => setTouchFeedback(null), 200) // Hide after 200ms

      // Get piece center position
      const pieceCenterX = currentPiece.position.x + currentPiece.shape[0].length / 2
      const pieceCenterY = currentPiece.position.y + currentPiece.shape.length / 2

      // Check for double tap for hard drop
      const currentTime = Date.now()
      const isDoubleTap = currentTime - lastTapTime < DOUBLE_TAP_DELAY
      
      // Determine action based on tap position relative to piece
      if (y > pieceCenterY + 1) {
        // Tap below piece
        if (isDoubleTap) {
          hardDrop()
        } else {
          movePiece(0, 1)
        }
      } else if (x < pieceCenterX - 1) {
        // Tap to the left of piece
        movePiece(-1, 0)
      } else if (x > pieceCenterX + 1) {
        // Tap to the right of piece
        movePiece(1, 0)
      } else {
        // Tap on or near the piece - rotate
        rotate()
      }

      lastTapTime = currentTime
    }

    canvas.addEventListener("touchstart", handleTouch)
    return () => canvas.removeEventListener("touchstart", handleTouch)
  }, [currentPiece, gameOver, isPaused, movePiece, rotate, hardDrop])

  // Game loop
  useEffect(() => {
    const dropInterval = Math.max(100, 1000 - (level - 1) * 100)

    gameLoopRef.current = window.setInterval(() => {
      if (!isPaused && !gameOver) {
        movePiece(0, 1)
      }
    }, dropInterval)

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [movePiece, isPaused, gameOver, level])

  // Level progression
  useEffect(() => {
    setLevel(Math.floor(lines / 10) + 1)
  }, [lines])

  // Initialize game
  useEffect(() => {
    const initialPieces = [createNewPiece(), createNewPiece(), createNewPiece()]
    setNextPieces(initialPieces)
    setCurrentPiece(createNewPiece())
  }, [createNewPiece])

  // Helper function to adjust color brightness
  const adjustBrightness = (color: string, percent: number) => {
    const num = Number.parseInt(color.replace("#", ""), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = ((num >> 8) & 0x00ff) + amt
    const B = (num & 0x0000ff) + amt
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    )
  }

  // Helper function to draw a 3D brick
  const resetGame = () => {
    setBoard(createPrefilledBoard()) // Changed from empty board
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    setIsPaused(false)
    setExplosions([])
    // Initialize with 3 pieces in queue
    const initialPieces = [createNewPiece(), createNewPiece(), createNewPiece()]
    setNextPieces(initialPieces)
    setCurrentPiece(createNewPiece())
  }

  const draw3DBrick = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
  ) => {
    if (skin.blockStyle === "classic") {
      const blockSize = width - 2
      const borderSize = 2

      // Draw border
      ctx.fillStyle = "#000000"
      ctx.fillRect(x, y, width, height)

      // Draw main block
      ctx.fillStyle = color
      ctx.fillRect(x + borderSize, y + borderSize, blockSize - borderSize, blockSize - borderSize)

      // Draw inner highlight
      ctx.fillStyle = adjustBrightness(color, 40)
      ctx.fillRect(x + borderSize, y + borderSize, blockSize - borderSize - 4, 2)
      ctx.fillRect(x + borderSize, y + borderSize, 2, blockSize - borderSize - 4)

      // Draw inner shadow
      ctx.fillStyle = adjustBrightness(color, -40)
      ctx.fillRect(x + blockSize - 2, y + borderSize + 2, 2, blockSize - borderSize - 2)
      ctx.fillRect(x + borderSize + 2, y + blockSize - 2, blockSize - borderSize - 2, 2)
    } else if (skin.blockStyle === "modern") {
      const depth = 3

      // Main face
      ctx.fillStyle = color
      ctx.fillRect(x, y, width - depth, height - depth)

      // Right side (darker)
      ctx.fillStyle = adjustBrightness(color, -30)
      ctx.beginPath()
      ctx.moveTo(x + width - depth, y)
      ctx.lineTo(x + width, y + depth)
      ctx.lineTo(x + width, y + height)
      ctx.lineTo(x + width - depth, y + height - depth)
      ctx.closePath()
      ctx.fill()

      // Bottom side (darker)
      ctx.fillStyle = adjustBrightness(color, -50)
      ctx.beginPath()
      ctx.moveTo(x, y + height - depth)
      ctx.lineTo(x + depth, y + height)
      ctx.lineTo(x + width, y + height)
      ctx.lineTo(x + width - depth, y + height - depth)
      ctx.closePath()
      ctx.fill()

      // Add highlight
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x + 1, y + height - depth - 1)
      ctx.lineTo(x + 1, y + 1)
      ctx.lineTo(x + width - depth - 1, y + 1)
      ctx.stroke()
    } else if (skin.blockStyle === "neon") {
      // Neon glow effect
      ctx.shadowColor = color
      ctx.shadowBlur = 10
      ctx.fillStyle = color
      ctx.fillRect(x + 2, y + 2, width - 4, height - 4)

      // Inner bright core
      ctx.shadowBlur = 0
      ctx.fillStyle = adjustBrightness(color, 50)
      ctx.fillRect(x + 4, y + 4, width - 8, height - 8)

      // Outline
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.strokeRect(x + 1.5, y + 1.5, width - 3, height - 3)
    } else if (skin.blockStyle === "brick") {
      // Brick texture effect
      ctx.fillStyle = color
      ctx.fillRect(x, y, width, height)

      // Add texture with darker lines for mortar
      ctx.strokeStyle = adjustBrightness(color, -40)
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, width, height)

      // Add brick texture lines
      ctx.beginPath()
      // Horizontal mortar line in middle
      ctx.moveTo(x, y + height / 2)
      ctx.lineTo(x + width, y + height / 2)
      // Vertical mortar lines
      ctx.moveTo(x + width / 3, y)
      ctx.lineTo(x + width / 3, y + height / 2)
      ctx.moveTo(x + (2 * width) / 3, y + height / 2)
      ctx.lineTo(x + (2 * width) / 3, y + height)
      ctx.stroke()

      // Add subtle highlight
      ctx.fillStyle = adjustBrightness(color, 20)
      ctx.fillRect(x + 2, y + 2, width - 4, 3)

      // Add shadow
      ctx.fillStyle = adjustBrightness(color, -20)
      ctx.fillRect(x + 2, y + height - 3, width - 4, 2)
    } else if (skin.blockStyle === "glossy") {
      // Glossy 3D rounded block effect
      const radius = 4

      // Draw rounded rectangle with gradient
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.arcTo(x + width, y, x + width, y + radius, radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
      ctx.lineTo(x + radius, y + height)
      ctx.arcTo(x, y + height, x, y + height - radius, radius)
      ctx.lineTo(x, y + radius)
      ctx.arcTo(x, y, x + radius, y, radius)
      ctx.closePath()

      // Create gradient for glossy effect
      const gradient = ctx.createLinearGradient(x, y, x, y + height)
      gradient.addColorStop(0, adjustBrightness(color, 40))
      gradient.addColorStop(0.5, color)
      gradient.addColorStop(1, adjustBrightness(color, -20))
      ctx.fillStyle = gradient
      ctx.fill()

      // Add highlight shine
      ctx.beginPath()
      ctx.moveTo(x + radius, y + 2)
      ctx.lineTo(x + width - radius, y + 2)
      ctx.arcTo(x + width - 2, y + 2, x + width - 2, y + radius, radius)
      ctx.lineTo(x + width - 2, y + height / 3)
      ctx.quadraticCurveTo(x + width / 2, y + height / 3 + 4, x + 2, y + height / 3)
      ctx.lineTo(x + 2, y + radius)
      ctx.arcTo(x + 2, y + 2, x + radius, y + 2, radius)
      ctx.closePath()

      const shineGradient = ctx.createLinearGradient(x, y, x, y + height / 2)
      shineGradient.addColorStop(0, "rgba(255, 255, 255, 0.5)")
      shineGradient.addColorStop(1, "rgba(255, 255, 255, 0.1)")
      ctx.fillStyle = shineGradient
      ctx.fill()

      // Add subtle inner shadow
      ctx.strokeStyle = adjustBrightness(color, -30)
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.restore()
    } else if (skin.blockStyle === "shiny3d") {
      // Ultra shiny chrome-like 3D effect
      const radius = 6
      const depth = 4

      ctx.save()

      // Create rounded rectangle path
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.arcTo(x + width, y, x + width, y + radius, radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
      ctx.lineTo(x + radius, y + height)
      ctx.arcTo(x, y + height, x, y + height - radius, radius)
      ctx.lineTo(x, y + radius)
      ctx.arcTo(x, y, x + radius, y, radius)
      ctx.closePath()

      // Main chrome gradient
      const chromeGradient = ctx.createLinearGradient(x, y, x, y + height)
      chromeGradient.addColorStop(0, adjustBrightness(color, 60))
      chromeGradient.addColorStop(0.1, adjustBrightness(color, 80))
      chromeGradient.addColorStop(0.3, color)
      chromeGradient.addColorStop(0.7, adjustBrightness(color, -20))
      chromeGradient.addColorStop(0.9, adjustBrightness(color, -40))
      chromeGradient.addColorStop(1, adjustBrightness(color, -60))
      ctx.fillStyle = chromeGradient
      ctx.fill()

      // Top highlight shine
      ctx.beginPath()
      ctx.moveTo(x + radius, y + 2)
      ctx.lineTo(x + width - radius, y + 2)
      ctx.arcTo(x + width - 2, y + 2, x + width - 2, y + radius, radius)
      ctx.lineTo(x + width - 2, y + height * 0.4)
      ctx.quadraticCurveTo(x + width / 2, y + height * 0.5, x + 2, y + height * 0.4)
      ctx.lineTo(x + 2, y + radius)
      ctx.arcTo(x + 2, y + 2, x + radius, y + 2, radius)
      ctx.closePath()

      const topShine = ctx.createLinearGradient(x, y, x, y + height * 0.5)
      topShine.addColorStop(0, "rgba(255, 255, 255, 0.9)")
      topShine.addColorStop(0.5, "rgba(255, 255, 255, 0.4)")
      topShine.addColorStop(1, "rgba(255, 255, 255, 0.1)")
      ctx.fillStyle = topShine
      ctx.fill()

      // Bottom reflection
      ctx.beginPath()
      ctx.moveTo(x + 2, y + height * 0.6)
      ctx.quadraticCurveTo(x + width / 2, y + height * 0.7, x + width - 2, y + height * 0.6)
      ctx.lineTo(x + width - 2, y + height - radius)
      ctx.arcTo(x + width - 2, y + height - 2, x + width - radius, y + height - 2, radius)
      ctx.lineTo(x + radius, y + height - 2)
      ctx.arcTo(x + 2, y + height - 2, x + 2, y + height - radius, radius)
      ctx.closePath()

      const bottomReflection = ctx.createLinearGradient(x, y + height * 0.6, x, y + height)
      bottomReflection.addColorStop(0, "rgba(255, 255, 255, 0.1)")
      bottomReflection.addColorStop(0.5, "rgba(255, 255, 255, 0.3)")
      bottomReflection.addColorStop(1, "rgba(255, 255, 255, 0.6)")
      ctx.fillStyle = bottomReflection
      ctx.fill()

      // Outer glow/shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = adjustBrightness(color, -50)
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.restore()
    } else if (skin.blockStyle === "retro") {
      // Classic 3D beveled blocks like in the screenshot
      const bevelSize = 3

      // Main block color
      ctx.fillStyle = color
      ctx.fillRect(x, y, width, height)

      // Top highlight (bright)
      ctx.fillStyle = adjustBrightness(color, 50)
      ctx.fillRect(x, y, width, bevelSize) // Top edge
      ctx.fillRect(x, y, bevelSize, height) // Left edge

      // Bottom shadow (dark)
      ctx.fillStyle = adjustBrightness(color, -50)
      ctx.fillRect(x, y + height - bevelSize, width, bevelSize) // Bottom edge
      ctx.fillRect(x + width - bevelSize, y, bevelSize, height) // Right edge

      // Inner highlight (subtle)
      ctx.fillStyle = adjustBrightness(color, 25)
      ctx.fillRect(x + bevelSize, y + bevelSize, width - bevelSize * 2, 1) // Inner top
      ctx.fillRect(x + bevelSize, y + bevelSize, 1, height - bevelSize * 2) // Inner left

      // Inner shadow (subtle)
      ctx.fillStyle = adjustBrightness(color, -25)
      ctx.fillRect(x + bevelSize, y + height - bevelSize - 1, width - bevelSize * 2, 1) // Inner bottom
      ctx.fillRect(x + width - bevelSize - 1, y + bevelSize, 1, height - bevelSize * 2) // Inner right
    }
  }

  // Animation loop for explosions and touch feedback
  useEffect(() => {
    const animate = () => {
      // Force redraw when touch feedback is active
      if (touchFeedback && Date.now() - touchFeedback.time < 200) {
        // Touch feedback will be drawn in the main draw effect
      }
      
      setExplosions(
        (prev) =>
          prev
            .map((explosion) => {
              const elapsed = Date.now() - explosion.startTime
              const progress = elapsed / 1500 // 1.5 second duration

              if (progress >= 1) {
                return null
              }

              return {
                ...explosion,
                particles: explosion.particles.map((particle) => {
                  let gravity = 0.5
                  let drag = 0.98
                  let lifeFade = progress

                  // Different physics for different particle types
                  if (particle.type === "dust") {
                    gravity = 0.1
                    drag = 0.95
                    lifeFade = progress * 1.5 // Dust fades faster
                  } else if (particle.type === "brick") {
                    gravity = 0.8
                    drag = 0.99
                  }

                  return {
                    ...particle,
                    x: particle.x + particle.vx,
                    y: particle.y + particle.vy,
                    vx: particle.vx * drag,
                    vy: particle.vy * drag + gravity,
                    rotation: particle.rotation + particle.rotationSpeed,
                    life: Math.max(0, 1 - lifeFade),
                    size:
                      particle.type === "dust"
                        ? particle.size * (1 + progress * 2) // Dust expands
                        : particle.size * (1 - progress * 0.3), // Others shrink slightly
                  }
                }),
              }
            })
            .filter(Boolean) as Explosion[],
      )

      animationRef.current = requestAnimationFrame(animate)
    }

    if (explosions.length > 0 || (touchFeedback && Date.now() - touchFeedback.time < 200)) {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [explosions.length, touchFeedback])

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas with appropriate background
    if (skin.background === "gradient") {
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      bgGradient.addColorStop(0, "#1e3c72")
      bgGradient.addColorStop(0.5, "#2a5298")
      bgGradient.addColorStop(1, "#1e3c72")
      ctx.fillStyle = bgGradient
    } else if (skin.background.startsWith("linear-gradient")) {
      // Handle the shiny3d gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      bgGradient.addColorStop(0, "#667eea")
      bgGradient.addColorStop(1, "#764ba2")
      ctx.fillStyle = bgGradient
    } else if (skin.name === "Retro Arcade" || skin.name === "Block Blast") {
      // Simple solid background like in screenshot
      ctx.fillStyle = skin.background
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
      ctx.fillStyle = skin.background
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw board grid
    ctx.strokeStyle = skin.gridColor
    ctx.lineWidth = skin.gridLineWidth
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * CELL_SIZE)
      ctx.lineTo(BOARD_WIDTH * CELL_SIZE, y * CELL_SIZE)
      ctx.stroke()
    }
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath()
      ctx.moveTo(x * CELL_SIZE, 0)
      ctx.lineTo(x * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE)
      ctx.stroke()
    }

    // Draw board cells as 3D bricks
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = board[y][x]
        if (cell) {
          draw3DBrick(ctx, x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4, cell)
        }
      }
    }

    // Draw current piece as 3D bricks
    if (currentPiece && !gameOver) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            draw3DBrick(
              ctx,
              (currentPiece.position.x + x) * CELL_SIZE + 2,
              (currentPiece.position.y + y) * CELL_SIZE + 2,
              CELL_SIZE - 4,
              CELL_SIZE - 4,
              currentPiece.color,
            )
          }
        }
      }

      // Draw ghost piece
      let ghostY = currentPiece.position.y
      while (!checkCollision(currentPiece, board, 0, ghostY - currentPiece.position.y + 1)) {
        ghostY++
      }

      ctx.globalAlpha = 0.2
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            ctx.strokeStyle = currentPiece.color
            ctx.lineWidth = 2
            ctx.strokeRect(
              (currentPiece.position.x + x) * CELL_SIZE + 2,
              (ghostY + y) * CELL_SIZE + 2,
              CELL_SIZE - 4,
              CELL_SIZE - 4,
            )
          }
        }
      }
      ctx.globalAlpha = 1
    }

    // Draw explosions
    explosions.forEach((explosion) => {
      // Helper function for hex to RGB conversion
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result
          ? {
              r: Number.parseInt(result[1], 16),
              g: Number.parseInt(result[2], 16),
              b: Number.parseInt(result[3], 16),
            }
          : null
      }

      explosion.particles.forEach((particle) => {
        ctx.save()
        ctx.globalAlpha = particle.life

        if (particle.type === "dust") {
          // Draw dust as colorful expanding cloud
          const rgb = hexToRgb(particle.color)
          const dustGradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size,
          )
          if (rgb) {
            dustGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.life * 0.4})`)
            dustGradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.life * 0.2})`)
            dustGradient.addColorStop(1, "transparent")
          }
          ctx.fillStyle = dustGradient
          ctx.fillRect(particle.x - particle.size, particle.y - particle.size, particle.size * 2, particle.size * 2)
        } else if (particle.type === "brick") {
          // Draw brick fragments with rotation
          ctx.translate(particle.x, particle.y)
          ctx.rotate(particle.rotation)

          // Draw a small 3D brick fragment
          const fragmentSize = particle.size
          draw3DBrick(ctx, -fragmentSize / 2, -fragmentSize / 2, fragmentSize, fragmentSize, particle.color)

          ctx.rotate(-particle.rotation)
          ctx.translate(-particle.x, -particle.y)
        } else {
          // Draw small fragments
          ctx.translate(particle.x, particle.y)
          ctx.rotate(particle.rotation)

          // Fragment with some shading
          const halfSize = particle.size / 2
          ctx.fillStyle = particle.color
          ctx.fillRect(-halfSize, -halfSize, particle.size, particle.size)

          // Add slight highlight
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.life * 0.3})`
          ctx.fillRect(-halfSize, -halfSize, particle.size * 0.3, particle.size * 0.3)

          ctx.rotate(-particle.rotation)
          ctx.translate(-particle.x, -particle.y)
        }

        ctx.restore()
      })
    })

    // Draw touch feedback
    if (touchFeedback && Date.now() - touchFeedback.time < 200) {
      const fadeOpacity = 1 - (Date.now() - touchFeedback.time) / 200
      ctx.save()
      ctx.globalAlpha = fadeOpacity * 0.5
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(
        touchFeedback.x * CELL_SIZE,
        touchFeedback.y * CELL_SIZE,
        20,
        0,
        Math.PI * 2
      )
      ctx.fill()
      ctx.restore()
    }

    // Draw game over overlay
    if (gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#fff"
      ctx.font = "30px Arial"
      ctx.textAlign = "center"
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2)
    }

    // Draw pause overlay
    if (isPaused && !gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#fff"
      ctx.font = "30px Arial"
      ctx.textAlign = "center"
      ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2)
    }
  }, [board, currentPiece, gameOver, isPaused, checkCollision, explosions, skin, touchFeedback])

  const drawNextPiece = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas || nextPieces.length === 0) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear with appropriate background
      if (skin.background === "gradient") {
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        bgGradient.addColorStop(0, "#1e3c72")
        bgGradient.addColorStop(1, "#2a5298")
        ctx.fillStyle = bgGradient
      } else if (skin.background.startsWith("linear-gradient")) {
        const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        bgGradient.addColorStop(0, "#667eea")
        bgGradient.addColorStop(1, "#764ba2")
        ctx.fillStyle = bgGradient
      } else {
        ctx.fillStyle = skin.background
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const cellSize = 22
      const nextPiece = nextPieces[0]
      const offsetX = (4 - nextPiece.shape[0].length) / 2
      const offsetY = (4 - nextPiece.shape.length) / 2

      for (let y = 0; y < nextPiece.shape.length; y++) {
        for (let x = 0; x < nextPiece.shape[y].length; x++) {
          if (nextPiece.shape[y][x]) {
            draw3DBrick(
              ctx,
              (offsetX + x) * cellSize + 6,
              (offsetY + y) * cellSize + 6,
              cellSize - 4,
              cellSize - 4,
              nextPiece.color,
            )
          }
        }
      }
    },
    [nextPieces, skin],
  )

  const drawSmallPiece = useCallback(
    (canvas: HTMLCanvasElement | null, piece: Piece) => {
      if (!canvas || !piece) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear with appropriate background
      if (skin.background === "gradient") {
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        bgGradient.addColorStop(0, "#1e3c72")
        bgGradient.addColorStop(1, "#2a5298")
        ctx.fillStyle = bgGradient
      } else if (skin.background.startsWith("linear-gradient")) {
        const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        bgGradient.addColorStop(0, "#667eea")
        bgGradient.addColorStop(1, "#764ba2")
        ctx.fillStyle = bgGradient
      } else {
        ctx.fillStyle = skin.background
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const cellSize = 12
      const offsetX = (canvas.width / cellSize - piece.shape[0].length) / 2
      const offsetY = (canvas.height / cellSize - piece.shape.length) / 2

      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            draw3DBrick(
              ctx,
              (offsetX + x) * cellSize,
              (offsetY + y) * cellSize,
              cellSize - 1,
              cellSize - 1,
              piece.color,
            )
          }
        }
      }
    },
    [skin],
  )

  useEffect(() => {
    const nextCanvas = document.getElementById("next-piece-canvas") as HTMLCanvasElement
    drawNextPiece(nextCanvas)
  }, [nextPieces, drawNextPiece])

  // Draw all preview pieces
  useEffect(() => {
    nextPieces.forEach((piece, index) => {
      const canvas = document.getElementById(`next-piece-${index}`) as HTMLCanvasElement
      drawSmallPiece(canvas, piece)
    })
  }, [nextPieces, drawSmallPiece])

  return (
    <div
      className={`min-h-screen ${
        skin.name === "Modern"
          ? "bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900"
          : skin.name === "Neon"
            ? "bg-gray-950"
            : skin.name === "Brick Breaker"
              ? "bg-stone-700"
              : skin.name === "Glossy 3D"
                ? "bg-slate-900"
                : skin.name === "Shiny 3D Chrome"
                  ? "bg-gradient-to-br from-gray-800 via-purple-900 to-indigo-900"
                  : skin.name === "Retro Arcade" || skin.name === "Block Blast"
                    ? "bg-gradient-to-b from-purple-900 via-blue-900 to-black"
                    : "bg-gray-900"
      } flex flex-col items-center justify-center p-4`}
    >
      <h1
        className={`text-4xl lg:text-6xl font-bold ${
          skin.name === "Modern"
            ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500"
            : skin.name === "Neon"
              ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400"
              : skin.name === "Brick Breaker"
                ? "text-orange-300"
                : skin.name === "Glossy 3D"
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-600"
                  : skin.name === "Shiny 3D Chrome"
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400"
                    : skin.name === "Retro Arcade" || skin.name === "Block Blast"
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-yellow-400 to-magenta-400 animate-pulse"
                      : "text-white"
        } mb-6 tracking-wider`}
        style={{ fontFamily: skin.fontFamily }}
      >
        TETRIS
      </h1>

      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto max-w-md">
        <Link href="/games" className={skin.buttonStyle} style={{ fontFamily: skin.fontFamily }}>
          ← BACK TO GAMES
        </Link>
        <select
          value={currentSkin}
          onChange={(e) => setCurrentSkin(e.target.value)}
          className={`${skin.buttonStyle} cursor-pointer`}
          style={{ fontFamily: skin.fontFamily }}
        >
          {Object.entries(SKINS).map(([key, skinData]) => (
            <option key={key} value={key}>
              {skinData.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowMobileHelp(true)}
          className={`${skin.buttonStyle} lg:hidden`}
          style={{ fontFamily: skin.fontFamily }}
          aria-label="Help for mobile controls"
        >
          ?
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        <div>
          {/* Next pieces preview above the board */}
          <div className={`${skin.uiBackground} px-3 sm:px-6 py-3 ${skin.uiBorder} mb-2 flex flex-col sm:flex-row items-center sm:justify-between gap-2`}>
            <span className={`${skin.uiAccent} text-sm mr-4`} style={{ fontFamily: skin.fontFamily }}>
              {skin.name === "Modern" ? "Upcoming:" : "UPCOMING"}{" "}
              <span className="text-xs opacity-70">(click to swap)</span>
            </span>
            <div className="flex gap-3 items-center">
              {nextPieces.map((piece, index) => (
                <canvas
                  key={index}
                  id={`next-piece-${index}`}
                  width={60}
                  height={50}
                  className={`cursor-pointer transition-transform hover:scale-110 ${
                    skin.name === "Modern"
                      ? "border border-blue-500/30 rounded"
                      : skin.name === "Neon"
                        ? "border border-pink-500/30"
                        : skin.name === "Brick Breaker"
                          ? "border border-stone-600"
                          : skin.name === "Glossy 3D"
                            ? "border border-slate-600 rounded"
                            : skin.name === "Shiny 3D Chrome"
                              ? "border-2 border-yellow-400/50 rounded-lg shadow-[0_0_10px_rgba(255,215,0,0.3)]"
                              : skin.name === "Retro Arcade" || skin.name === "Block Blast"
                                ? "border-2 border-cyan-400/70 shadow-[0_0_8px_rgba(0,255,255,0.3)]"
                                : "border border-gray-600"
                  }`}
                  onClick={() => {
                    if (index > 0) {
                      // Swap clicked piece with first piece
                      setNextPieces((prev) => {
                        const newQueue = [...prev]
                        ;[newQueue[0], newQueue[index]] = [newQueue[index], newQueue[0]]
                        return newQueue
                      })
                    }
                  }}
                />
              ))}
            </div>
          </div>

          <div className={`${skin.uiBackground} p-3 lg:p-6 ${skin.uiBorder} max-w-full overflow-x-auto`}>
            <div className="relative w-full max-w-[448px] mx-auto" style={{ aspectRatio: `${BOARD_WIDTH}/${BOARD_HEIGHT}` }}>
              <canvas
                ref={canvasRef}
                width={BOARD_WIDTH * CELL_SIZE} // This will now be 16 * 28 = 448px
                height={BOARD_HEIGHT * CELL_SIZE}
                className={`w-full h-full ${
                skin.name === "Modern"
                  ? "border-2 border-blue-500/50 rounded-lg"
                  : skin.name === "Neon"
                    ? "border-2 border-pink-500/50"
                    : skin.name === "Brick Breaker"
                      ? "border-4 border-stone-600"
                      : skin.name === "Glossy 3D"
                        ? "border-2 border-slate-600 rounded-lg"
                        : skin.name === "Shiny 3D Chrome"
                          ? "border-3 border-yellow-400/60 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                          : skin.name === "Retro Arcade" || skin.name === "Block Blast"
                            ? "border-4 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                            : "border-2 border-gray-600"
                }`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-row lg:flex-col gap-4 flex-wrap justify-center w-full lg:w-auto">
          <div className={`${skin.uiBackground} p-4 ${skin.uiBorder} hidden lg:block`}>
            <h2
              className={`${skin.name === "Modern" ? skin.uiAccent : skin.uiText} font-bold mb-2 text-center`}
              style={{ fontFamily: skin.fontFamily }}
            >
              {skin.name === "Modern" ? "Next Piece" : "NEXT"}
            </h2>
            <canvas
              id="next-piece-canvas"
              width={120}
              height={80}
              className={
                skin.name === "Modern"
                  ? "border border-blue-500/50 rounded"
                  : skin.name === "Neon"
                    ? "border-2 border-pink-500/50"
                    : skin.name === "Brick Breaker"
                      ? "border-2 border-stone-600"
                      : skin.name === "Glossy 3D"
                        ? "border border-slate-600 rounded"
                        : skin.name === "Shiny 3D Chrome"
                          ? "border-2 border-yellow-400/50 rounded-lg shadow-[0_0_10px_rgba(255,215,0,0.2)]"
                          : skin.name === "Retro Arcade" || skin.name === "Block Blast"
                            ? "border-3 border-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.4)]"
                            : "border-2 border-gray-600 bg-black"
              }
            />
          </div>

          <div
            className={`${skin.uiBackground} p-4 ${skin.uiBorder} ${skin.uiText} flex-1 lg:flex-initial`}
            style={{ fontFamily: skin.fontFamily }}
          >
            <div className="flex flex-row lg:flex-col gap-4 lg:gap-0">
              <div className="flex-1 lg:mb-3">
                <div className={`${skin.uiAccent} text-sm`}>{skin.name === "Modern" ? "Score:" : "SCORE"}</div>
                <div className="text-xl lg:text-2xl font-bold">
                  {skin.name === "Modern" ? score.toLocaleString() : score.toString().padStart(7, "0")}
                </div>
              </div>
              <div className="flex-1 lg:mb-3">
                <div className={`${skin.uiAccent} text-sm`}>{skin.name === "Modern" ? "Lines:" : "LINES"}</div>
                <div className="text-xl lg:text-2xl font-bold">
                  {skin.name === "Modern" ? lines.toString() : lines.toString().padStart(7, "0")}
                </div>
              </div>
              <div className="flex-1 lg:mb-4">
                <div className={`${skin.uiAccent} text-sm`}>{skin.name === "Modern" ? "Level:" : "LEVEL"}</div>
                <div className="text-xl lg:text-2xl font-bold">
                  {skin.name === "Modern" ? level.toString() : level.toString().padStart(7, "0")}
                </div>
              </div>
            </div>

            {gameOver && (
              <button onClick={resetGame} className={`${skin.buttonStyle} w-full mb-2`}>
                {skin.name === "Modern" ? "New Game" : "NEW GAME"}
              </button>
            )}

            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`${skin.buttonStyle} w-full disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={gameOver}
            >
              {skin.name === "Modern" ? (isPaused ? "Resume" : "Pause") : isPaused ? "RESUME" : "PAUSE"}
            </button>
          </div>

          <div
            className={`${skin.uiBackground} p-4 ${skin.uiBorder} ${skin.uiText} text-sm hidden lg:block`}
            style={{ fontFamily: skin.fontFamily }}
          >
            <h3 className={`font-bold mb-2 ${skin.name === "Modern" ? skin.uiAccent : ""} text-center`}>
              {skin.name === "Modern" ? "Controls:" : "CONTROLS"}
            </h3>
            <div className={`${skin.uiAccent} space-y-1`}>
              <div>← → : {skin.name === "Modern" ? "Move" : "MOVE"}</div>
              <div>↓ : {skin.name === "Modern" ? "Soft Drop" : "SOFT DROP"}</div>
              <div>↑ : {skin.name === "Modern" ? "Rotate" : "ROTATE"}</div>
              <div>
                {skin.name === "Modern" ? "Space" : "SPACE"} : {skin.name === "Modern" ? "Hard Drop" : "HARD DROP"}
              </div>
              <div>P : {skin.name === "Modern" ? "Pause" : "PAUSE"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Help Dialog */}
      <MobileHelpDialog 
        isOpen={showMobileHelp}
        onClose={() => setShowMobileHelp(false)}
        skin={skin}
      />
    </div>
  )
}
