"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import MobileHelpDialog from "./MobileHelpDialog"
import { useNativeFeatures } from "../hooks/useNativeFeatures"

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
  blockStyle: "classic" | "modern" | "neon" | "brick" | "glossy" | "shiny3d" | "retro" | "beveled"
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
    gridLineWidth: 0, // No grid lines for seamless look
    blockStyle: "beveled",
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
    gridLineWidth: 0, // No grid lines for seamless look
    blockStyle: "beveled",
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
    gridColor: "rgba(255, 255, 255, 0.05)", // Very subtle grid
    gridLineWidth: 0, // No grid lines for seamless look
    blockStyle: "beveled",
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
    gridLineWidth: 0, // No grid lines for seamless look
    blockStyle: "beveled",
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
    gridLineWidth: 0, // No grid lines for seamless look
    blockStyle: "beveled",
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
    gridColor: "rgba(255, 255, 255, 0.02)", // Very subtle grid
    gridLineWidth: 0, // No grid lines for seamless look
    blockStyle: "beveled",
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
    gridColor: "rgba(255, 255, 255, 0.05)", // Very subtle grid
    gridLineWidth: 0, // No grid lines for seamless look
    blockStyle: "beveled",
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
    gridLineWidth: 0, // No grid lines for seamless look
    blockStyle: "beveled",
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

const BOARD_HEIGHT = 28 // Changed from 20 to make the box 8 bricks higher
const BASE_CELL_SIZE = 28

// Calculate cell size based on board width
const getCellSize = (boardWidth: number) => {
  switch (boardWidth) {
    case 8:
      return BASE_CELL_SIZE * 1.5  // 50% wider = 42px
    case 10:
      return BASE_CELL_SIZE * 1.4  // 40% wider = 39.2px
    case 12:
      return BASE_CELL_SIZE * 1.3  // 30% wider = 36.4px
    case 16:
    default:
      return BASE_CELL_SIZE        // Normal size = 28px
  }
}

// Color schemes for Block Blast progression
const BLOCK_BLAST_COLOR_SCHEMES = [
  // Gold/Brown (original)
  ["#D4AF37", "#DAA520", "#B8860B", "#CD853F", "#DEB887", "#F4A460"],
  // Blue
  ["#1E90FF", "#4169E1", "#0000CD", "#191970", "#6495ED", "#87CEEB"],
  // Green
  ["#32CD32", "#228B22", "#008000", "#006400", "#90EE90", "#98FB98"],
  // Purple
  ["#9370DB", "#8B008B", "#4B0082", "#6A0DAD", "#DA70D6", "#DDA0DD"],
  // Red/Pink
  ["#FF1493", "#DC143C", "#8B0000", "#FF69B4", "#FF6347", "#FFA07A"],
  // Cyan/Teal
  ["#00CED1", "#008B8B", "#20B2AA", "#48D1CC", "#40E0D0", "#00FFFF"],
  // Orange
  ["#FF8C00", "#FF6347", "#FF4500", "#FFA500", "#FFB347", "#FFCC99"],
  // Rainbow (cycles through multiple bright colors)
  ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#9400D3"],
]

// Helper function to create pre-filled board with worm holes
const createPrefilledBoard = (width: number, colorSchemeIndex = 0) => {
  const newBoard = Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(width).fill(null))

  // Use the appropriate color scheme
  const colors = BLOCK_BLAST_COLOR_SCHEMES[colorSchemeIndex]

  // Fill bottom half (rows 14-27) with blocks, leaving strategic gaps
  for (let y = 14; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < width; x++) {
      // Create worm hole patterns - strategic empty spaces (adjusted for different widths)
      const midPoint = Math.floor(width / 2)
      const shouldBeEmpty =
        // Vertical channels (scaled to board width)
        (x === midPoint - 1 && y >= 16 && y <= 20) ||
        (x === midPoint && y >= 16 && y <= 20) ||
        (x === Math.floor(width * 0.25) && y >= 18 && y <= 21) ||
        (x === Math.floor(width * 0.75) && y >= 17 && y <= 22) ||
        // Horizontal gaps (scaled to board width)
        (y === 19 && x >= Math.floor(width * 0.125) && x <= Math.floor(width * 0.3125)) ||
        (y === 21 && x >= Math.floor(width * 0.5625) && x <= Math.floor(width * 0.6875)) ||
        (y === 17 && x >= Math.floor(width * 0.8125) && x <= Math.max(width - 1, Math.floor(width * 0.9375))) ||
        // Random scattered holes for variety (scaled positions)
        (x === Math.floor(width * 0.0625) && y === 20) ||
        (x === Math.floor(width * 0.375) && y === 22) ||
        (x === Math.floor(width * 0.625) && y === 18) ||
        (x === Math.min(width - 2, Math.floor(width * 0.875)) && y === 20) ||
        (x === Math.floor(width * 0.1875) && y === 16) ||
        (x === Math.floor(width * 0.6875) && y === 23) ||
        (x === Math.min(width - 1, Math.floor(width * 0.9375)) && y === 15)

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
  const [boardWidth, setBoardWidth] = useState<number | null>(null)
  const [showWidthDialog, setShowWidthDialog] = useState(true)
  const [board, setBoard] = useState<(string | null)[][]>([])
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [nextPieces, setNextPieces] = useState<Piece[]>([])
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [explosions, setExplosions] = useState<Explosion[]>([])
  const [currentSkin, setCurrentSkin] = useState<string>("classic")
  const [showMobileHelp, setShowMobileHelp] = useState(false)
  const [touchFeedback, setTouchFeedback] = useState<{ x: number; y: number; time: number } | null>(null)
  const [blockBlastColorIndex, setBlockBlastColorIndex] = useState(0)

  const gameLoopRef = useRef<number | undefined>(undefined)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  
  // Audio refs
  const explosionSoundRef = useRef<HTMLAudioElement | null>(null)
  const explosion2SoundRef = useRef<HTMLAudioElement | null>(null)
  const explosion3SoundRef = useRef<HTMLAudioElement | null>(null)
  const bangSoundRef = useRef<HTMLAudioElement | null>(null)
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null)
  const clickedSoundRef = useRef<HTMLAudioElement | null>(null)

  const skin = SKINS[currentSkin]
  const { vibrate, saveHighScore, getHighScore, share, incrementGamesPlayed } = useNativeFeatures()
  
  // Calculate cell size based on board width
  const cellSize = boardWidth ? getCellSize(boardWidth) : BASE_CELL_SIZE

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements
    explosionSoundRef.current = new Audio('/sounds/explosion.mp3')
    explosion2SoundRef.current = new Audio('/sounds/explosion2.mp3')
    explosion3SoundRef.current = new Audio('/sounds/explosion3.mp3')
    bangSoundRef.current = new Audio('/sounds/bang.mp3')
    gameOverSoundRef.current = new Audio('/sounds/gameover.mp3')
    clickedSoundRef.current = new Audio('/sounds/clicked.mp3')//Audio('/sounds/clicked.mp3')
    
    // Set volumes
    if (explosionSoundRef.current) explosionSoundRef.current.volume = 0.5
    if (explosion2SoundRef.current) explosion2SoundRef.current.volume = 0.6
    if (explosion3SoundRef.current) explosion3SoundRef.current.volume = 0.7
    if (bangSoundRef.current) bangSoundRef.current.volume = 0.3
    if (gameOverSoundRef.current) gameOverSoundRef.current.volume = 0.6
    if (clickedSoundRef.current) clickedSoundRef.current.volume = 1
    
    // Preload sounds
    explosionSoundRef.current?.load()
    explosion2SoundRef.current?.load()
    explosion3SoundRef.current?.load()
    bangSoundRef.current?.load()
    gameOverSoundRef.current?.load()
    clickedSoundRef.current?.load()
    
  }, [])

  // Sound helper functions
  const playSound = useCallback((soundRef: React.RefObject<HTMLAudioElement | null>) => {
    if (soundRef.current) {
      soundRef.current.currentTime = 0 // Reset to start
      soundRef.current.play().catch(e => {
        // Ignore errors if autoplay is blocked
        console.log('Sound play blocked:', e)
      })
    }
  }, [])

  const createNewPiece = useCallback(() => {
    if (!boardWidth) return null
    const pieceData = skin.pieces[Math.floor(Math.random() * skin.pieces.length)]
    // For Block Blast skin, use colors from the current color scheme
    let pieceColor = pieceData.color
    if (currentSkin === "blockblast") {
      const currentColorScheme = BLOCK_BLAST_COLOR_SCHEMES[blockBlastColorIndex]
      pieceColor = currentColorScheme[Math.floor(Math.random() * currentColorScheme.length)]
    }

    return {
      shape: pieceData.shape,
      color: pieceColor,
      position: {
        x: Math.floor((boardWidth - pieceData.shape[0].length) / 2),
        y: 0,
      },
    }
  }, [skin, currentSkin, blockBlastColorIndex, boardWidth])

  const checkCollision = useCallback((piece: Piece, board: (string | null)[][], offsetX = 0, offsetY = 0) => {
    if (!boardWidth) return true
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          // Round positions for collision detection
          const newX = Math.round(piece.position.x + x + offsetX)
          const newY = Math.round(piece.position.y + y + offsetY)

          if (newX < 0 || newX >= boardWidth || newY >= BOARD_HEIGHT) {
            return true
          }
          if (newY >= 0 && board[newY][newX]) {
            return true
          }
        }
      }
    }
    return false
  }, [boardWidth])

  const rotatePiece = useCallback((piece: Piece): number[][] => {
    const rotated = piece.shape[0].map((_, index) => piece.shape.map((row) => row[index]).reverse())
    return rotated
  }, [])

  const mergePiece = useCallback((piece: Piece, board: (string | null)[][]) => {
    const newBoard = board.map((row) => [...row])
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          // Round positions when merging to board
          const boardY = Math.round(piece.position.y + y)
          const boardX = Math.round(piece.position.x + x)
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color
          }
        }
      }
    }
    return newBoard
  }, [])

  const createExplosion = useCallback((row: number, colors: string[]) => {
    if (!boardWidth) return { row, particles: [], startTime: Date.now() }
    const particles: Particle[] = []
    for (let x = 0; x < boardWidth; x++) {
      const color = colors[x] || "#ffffff"
      const cellX = x * cellSize
      const cellY = row * cellSize

      // Create shattered brick pieces - divide each brick into fragments
      const fragmentsPerBrick = 6 // Create 6 fragments per brick for realistic shattering
      const centerX = cellX + cellSize / 2
      const centerY = cellY + cellSize / 2
      
      for (let i = 0; i < fragmentsPerBrick; i++) {
        const angle = (Math.PI * 2 * i) / fragmentsPerBrick + Math.random() * 0.5
        const speed = Math.random() * 8 + 4
        
        // Large brick fragments with realistic physics
        particles.push({
          x: centerX + Math.cos(angle) * (cellSize / 4),
          y: centerY + Math.sin(angle) * (cellSize / 4),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 4, // Slight upward bias
          life: 1,
          color: color,
          size: cellSize / 3 + Math.random() * (cellSize / 6), // Larger fragments
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.4,
          type: "brick",
        })
      }

      // Create smaller debris pieces
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: cellX + Math.random() * cellSize,
          y: cellY + Math.random() * cellSize,
          vx: (Math.random() - 0.5) * 12,
          vy: -Math.random() * 8 - 2,
          life: 1,
          color: color,
          size: Math.random() * 6 + 3,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.6,
          type: "fragment",
        })
      }

      // Dust particles removed to prevent screen coverage
    }

    return {
      row,
      particles,
      startTime: Date.now(),
    }
  }, [boardWidth, cellSize])

  const clearLines = useCallback(
    (board: (string | null)[][]) => {
      if (!boardWidth) return { newBoard: board, linesCleared: 0 }
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
        newBoard.unshift(Array(boardWidth).fill(null))
      }

      // Create explosions for cleared lines
      if (clearedRows.length > 0) {
        setExplosions((prev) => [...prev, ...clearedRows.map(({ row, colors }) => createExplosion(row, colors))])
        // Play explosion sound based on lines cleared
        if (linesCleared === 1) {
          playSound(explosionSoundRef)
          vibrate('medium')
        } else if (linesCleared === 2) {
          playSound(explosion2SoundRef)
          vibrate('heavy')
        } else if (linesCleared >= 3) {
          playSound(explosion3SoundRef)
          vibrate('success')
        }
      }

      return { newBoard, linesCleared }
    },
    [createExplosion, vibrate, boardWidth, playSound, explosionSoundRef, explosion2SoundRef, explosion3SoundRef],
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
        // Play clicked sound when piece moves in any direction
        
        //alert('play clicked')
      } else if (dy > 0) {
        // Piece has landed
        playSound(bangSoundRef) // Play bang sound when piece lands
        const mergedBoard = mergePiece(currentPiece, board)
        const { newBoard, linesCleared } = clearLines(mergedBoard)

        // For Block Blast skin, change colors when lines are cleared
        let finalBoard = newBoard
        if (currentSkin === "blockblast" && linesCleared > 0) {
          setBlockBlastColorIndex((prev) => (prev + 1) % BLOCK_BLAST_COLOR_SCHEMES.length)
          // Update all existing blocks with new color scheme
          const newColorScheme =
            BLOCK_BLAST_COLOR_SCHEMES[(blockBlastColorIndex + 1) % BLOCK_BLAST_COLOR_SCHEMES.length]
          finalBoard = newBoard.map((row) =>
            row.map((cell) => {
              if (cell) {
                // Assign a random color from the new scheme
                return newColorScheme[Math.floor(Math.random() * newColorScheme.length)]
              }
              return cell
            }),
          )
        }

        setBoard(finalBoard)
        setLines((prev) => prev + linesCleared)
        setScore((prev) => prev + linesCleared * 100 * level)

        // Get next piece from queue
        if (nextPieces.length > 0) {
          const newPiece = nextPieces[0]
          if (checkCollision(newPiece, newBoard)) {
            setGameOver(true)
            playSound(gameOverSoundRef) // Play game over sound
            vibrate('error')
            saveHighScore('quadrix', score)
            incrementGamesPlayed()
          } else {
            setCurrentPiece(newPiece)
            // Remove first piece and add new one to end
            const nextPiece = createNewPiece()
            if (nextPiece) {
              setNextPieces((prev) => [...prev.slice(1), nextPiece])
            }
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
      currentSkin,
      blockBlastColorIndex,
      vibrate,
      saveHighScore,
      score,
      incrementGamesPlayed,
      playSound,
      bangSoundRef,
      gameOverSoundRef,
      clickedSoundRef,
    ],
  )

  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    const rotated = rotatePiece(currentPiece)
    const rotatedPiece = { ...currentPiece, shape: rotated }

    if (!checkCollision(rotatedPiece, board)) {
      setCurrentPiece(rotatedPiece)
      playSound(clickedSoundRef)
      vibrate('light')
    }
  }, [currentPiece, board, gameOver, isPaused, checkCollision, rotatePiece, vibrate, playSound, clickedSoundRef])

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    let dropDistance = 0
    while (!checkCollision(currentPiece, board, 0, dropDistance + 1)) {
      dropDistance++
    }

    // Drop only half the distance for more continuous appearance
    const halfDropDistance = Math.floor(dropDistance /1)
    
    setCurrentPiece({
      ...currentPiece,
      position: {
        x: currentPiece.position.x,
        y: currentPiece.position.y + halfDropDistance,
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
      playSound(clickedSoundRef)
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [movePiece, rotate, hardDrop, gameOver])

  // Handle touch input for mobile with swipe gestures
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !currentPiece) return

    let touchStartX = 0
    let touchStartY = 0
    let touchStartTime = 0
    let isSwiping = false
    const SWIPE_THRESHOLD = 30 // pixels - minimum distance for a swipe
    const TAP_THRESHOLD = 10 // pixels - maximum movement for a tap
    const SWIPE_TIME_THRESHOLD = 300 // milliseconds - maximum time for a swipe

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      if (gameOver || isPaused) return

      const touch = e.touches[0]
      touchStartX = touch.clientX
      touchStartY = touch.clientY
      touchStartTime = Date.now()
      isSwiping = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault() // Prevent scrolling while playing
      if (gameOver || isPaused || isSwiping) return

      const touch = e.touches[0]
      const currentX = touch.clientX
      const currentY = touch.clientY
      
      const deltaX = currentX - touchStartX
      const deltaY = currentY - touchStartY
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      // Check if we've moved enough to trigger a swipe
      if (absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD) {
        isSwiping = true
        
        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > SWIPE_THRESHOLD) {
            // Swipe right
            movePiece(1, 0)
            touchStartX = currentX // Reset for continuous swiping
            vibrate('light')
          } else if (deltaX < -SWIPE_THRESHOLD) {
            // Swipe left
            movePiece(-1, 0)
            touchStartX = currentX // Reset for continuous swiping
            vibrate('light')
          }
        } else {
          // Vertical swipe
          if (deltaY > SWIPE_THRESHOLD) {
            // Swipe down - soft drop
            movePiece(0, 1)
            touchStartY = currentY // Reset for continuous swiping
            vibrate('light')
          }
        }
        playSound(clickedSoundRef)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      if (gameOver || isPaused) return

      const touch = e.changedTouches[0]
      const touchEndX = touch.clientX
      const touchEndY = touch.clientY
      const touchEndTime = Date.now()

      const deltaX = touchEndX - touchStartX
      const deltaY = touchEndY - touchStartY
      const deltaTime = touchEndTime - touchStartTime
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      // If we haven't swiped and it's a quick tap
      if (!isSwiping && absX < TAP_THRESHOLD && absY < TAP_THRESHOLD && deltaTime < SWIPE_TIME_THRESHOLD) {
        // It's a tap - rotate the piece
        rotate()
        vibrate('light')
        playSound(clickedSoundRef)
      } else if (!isSwiping && deltaTime < SWIPE_TIME_THRESHOLD) {
        // Check for swipe up (wasn't handled in move)
        if (deltaY < -SWIPE_THRESHOLD && absY > absX) {
          // Swipe up - hard drop
          hardDrop()
          vibrate('medium')
          playSound(clickedSoundRef)
        }
      }
      
      // Show touch feedback at the end position
      const rect = canvas.getBoundingClientRect()
      const x = ((touchEndX - rect.left) / rect.width) * (boardWidth || 16)
      const y = ((touchEndY - rect.top) / rect.height) * BOARD_HEIGHT
      setTouchFeedback({ x, y, time: Date.now() })
      setTimeout(() => setTouchFeedback(null), 200)
    }

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false })
    
    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [currentPiece, gameOver, isPaused, movePiece, rotate, hardDrop, vibrate, playSound, clickedSoundRef, boardWidth])

  // Game loop
  useEffect(() => {
    // Halved the interval for more continuous movement
    const baseInterval = 1000 - (level - 1) * 100
    const dropInterval = Math.max(32, baseInterval * 0.10) // Halved from 0.64 to 0.32

    gameLoopRef.current = window.setInterval(() => {
      if (!isPaused && !gameOver) {
        movePiece(0, 0.5)
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


  // Initialize game when board width is selected
  useEffect(() => {
    if (boardWidth) {
      setBoard(createPrefilledBoard(boardWidth, 0))
      const initialPieces = [createNewPiece(), createNewPiece(), createNewPiece()].filter(Boolean) as Piece[]
      setNextPieces(initialPieces)
      const firstPiece = createNewPiece()
      if (firstPiece) setCurrentPiece(firstPiece)
      
    }
  }, [boardWidth, createNewPiece])

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
    if (!boardWidth) return
    setBlockBlastColorIndex(0) // Reset color scheme to gold
    setBoard(createPrefilledBoard(boardWidth, 0)) // Start with gold color scheme
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    setIsPaused(false)
    setExplosions([])
    // Initialize with 3 pieces in queue
    const initialPieces = [createNewPiece(), createNewPiece(), createNewPiece()].filter(Boolean) as Piece[]
    setNextPieces(initialPieces)
    const firstPiece = createNewPiece()
    if (firstPiece) setCurrentPiece(firstPiece)
    
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
      // Simple flat blocks that touch each other
      ctx.fillStyle = color
      ctx.fillRect(x, y, width, height)

      // Add subtle inner highlight and shadow for depth
      ctx.fillStyle = adjustBrightness(color, 40)
      ctx.fillRect(x, y, width, 2)
      ctx.fillRect(x, y, 2, height)

      ctx.fillStyle = adjustBrightness(color, -40)
      ctx.fillRect(x + width - 2, y + 2, 2, height - 2)
      ctx.fillRect(x + 2, y + height - 2, width - 2, 2)
    } else if (skin.blockStyle === "beveled") {
      // Beveled tiles like in the reference image
      const bevelSize = 4//6  // Increased from 4 to 6 for thicker bevel
      
      // Main block color
      ctx.fillStyle = color
      ctx.fillRect(x, y, width, height)
      
      // Top and left edges - bright highlight
      ctx.fillStyle = adjustBrightness(color, 60)
      // Top edge
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + width, y)
      ctx.lineTo(x + width - bevelSize, y + bevelSize)
      ctx.lineTo(x + bevelSize, y + bevelSize)
      ctx.closePath()
      ctx.fill()
      
      // Left edge
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + height)
      ctx.lineTo(x + bevelSize, y + height - bevelSize)
      ctx.lineTo(x + bevelSize, y + bevelSize)
      ctx.closePath()
      ctx.fill()
      
      // Bottom and right edges - dark shadow
      ctx.fillStyle = adjustBrightness(color, -50)
      // Bottom edge
      ctx.beginPath()
      ctx.moveTo(x, y + height)
      ctx.lineTo(x + width, y + height)
      ctx.lineTo(x + width - bevelSize, y + height - bevelSize)
      ctx.lineTo(x + bevelSize, y + height - bevelSize)
      ctx.closePath()
      ctx.fill()
      
      // Right edge
      ctx.beginPath()
      ctx.moveTo(x + width, y)
      ctx.lineTo(x + width, y + height)
      ctx.lineTo(x + width - bevelSize, y + height - bevelSize)
      ctx.lineTo(x + width - bevelSize, y + bevelSize)
      ctx.closePath()
      ctx.fill()
      
      // Inner face with slight gradient for depth
      const innerGradient = ctx.createLinearGradient(x + bevelSize, y + bevelSize, x + width - bevelSize, y + height - bevelSize)
      innerGradient.addColorStop(0, adjustBrightness(color, 10))
      innerGradient.addColorStop(1, adjustBrightness(color, -10))
      ctx.fillStyle = innerGradient
      ctx.fillRect(x + bevelSize, y + bevelSize, width - bevelSize * 2, height - bevelSize * 2)
    } else if (skin.blockStyle === "modern") {
      const depth = 2
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
      ctx.shadowBlur = 8
      ctx.fillStyle = color
      ctx.fillRect(x, y, width, height)

      // Inner bright core
      ctx.shadowBlur = 0
      ctx.fillStyle = adjustBrightness(color, 50)
      ctx.fillRect(x + 2, y + 2, width - 4, height - 4)
    } else if (skin.blockStyle === "brick") {
      // Brick texture effect - seamless
      ctx.fillStyle = color
      ctx.fillRect(x, y, width, height)

      // Add subtle texture lines
      ctx.strokeStyle = adjustBrightness(color, -20)
      ctx.lineWidth = 1
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
      ctx.fillStyle = adjustBrightness(color, 15)
      ctx.fillRect(x + 1, y + 1, width - 2, 2)
    } else if (skin.blockStyle === "glossy") {
      // Glossy blocks that touch seamlessly
      ctx.fillStyle = color
      ctx.fillRect(x, y, width, height)

      // Create gradient for glossy effect
      const gradient = ctx.createLinearGradient(x, y, x, y + height)
      gradient.addColorStop(0, adjustBrightness(color, 40))
      gradient.addColorStop(0.5, color)
      gradient.addColorStop(1, adjustBrightness(color, -20))
      ctx.fillStyle = gradient
      ctx.fillRect(x, y, width, height)

      // Add highlight shine
      const shineGradient = ctx.createLinearGradient(x, y, x, y + height / 2)
      shineGradient.addColorStop(0, "rgba(255, 255, 255, 0.4)")
      shineGradient.addColorStop(1, "rgba(255, 255, 255, 0.1)")
      ctx.fillStyle = shineGradient
      ctx.fillRect(x, y, width, height / 3)
    } else if (skin.blockStyle === "shiny3d") {
      // Ultra shiny chrome-like 3D effect - seamless
      ctx.fillStyle = color
      ctx.fillRect(x, y, width, height)

      // Main chrome gradient
      const chromeGradient = ctx.createLinearGradient(x, y, x, y + height)
      chromeGradient.addColorStop(0, adjustBrightness(color, 60))
      chromeGradient.addColorStop(0.1, adjustBrightness(color, 80))
      chromeGradient.addColorStop(0.3, color)
      chromeGradient.addColorStop(0.7, adjustBrightness(color, -20))
      chromeGradient.addColorStop(0.9, adjustBrightness(color, -40))
      chromeGradient.addColorStop(1, adjustBrightness(color, -60))
      ctx.fillStyle = chromeGradient
      ctx.fillRect(x, y, width, height)

      // Top highlight shine
      const topShine = ctx.createLinearGradient(x, y, x, y + height * 0.5)
      topShine.addColorStop(0, "rgba(255, 255, 255, 0.8)")
      topShine.addColorStop(0.5, "rgba(255, 255, 255, 0.3)")
      topShine.addColorStop(1, "rgba(255, 255, 255, 0.1)")
      ctx.fillStyle = topShine
      ctx.fillRect(x, y, width, height * 0.4)

      // Bottom reflection
      const bottomReflection = ctx.createLinearGradient(x, y + height * 0.6, x, y + height)
      bottomReflection.addColorStop(0, "rgba(255, 255, 255, 0.1)")
      bottomReflection.addColorStop(0.5, "rgba(255, 255, 255, 0.2)")
      bottomReflection.addColorStop(1, "rgba(255, 255, 255, 0.4)")
      ctx.fillStyle = bottomReflection
      ctx.fillRect(x, y + height * 0.6, width, height * 0.4)
    } else if (skin.blockStyle === "retro") {
      // Classic 3D beveled blocks - seamless
      const bevelSize = 4//2
      // Main block color
      ctx.fillStyle = color
      ctx.fillRect(x, y, width, height)

      // Top highlight (bright)
      ctx.fillStyle = adjustBrightness(color, 40)
      ctx.fillRect(x, y, width, bevelSize) // Top edge
      ctx.fillRect(x, y, bevelSize, height) // Left edge

      // Bottom shadow (dark)
      ctx.fillStyle = adjustBrightness(color, -40)
      ctx.fillRect(x, y + height - bevelSize, width, bevelSize) // Bottom edge
      ctx.fillRect(x + width - bevelSize, y, bevelSize, height) // Right edge
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
                  let bounce = 0

                  // Different physics for different particle types
                  if (particle.type === "brick") {
                    gravity = 1.2 // Heavier pieces fall faster
                    drag = 0.98
                    // Add slight bounce when hitting bottom
                    if (particle.y > BOARD_HEIGHT * cellSize - 20 && particle.vy > 0) {
                      bounce = -particle.vy * 0.3
                    }
                  } else if (particle.type === "fragment") {
                    gravity = 0.9
                    drag = 0.97
                  }

                  return {
                    ...particle,
                    x: particle.x + particle.vx,
                    y: particle.y + particle.vy,
                    vx: particle.vx * drag,
                    vy: (particle.vy * drag + gravity) + bounce,
                    rotation: particle.rotation + particle.rotationSpeed,
                    life: Math.max(0, 1 - lifeFade),
                    size:
                      particle.type === "brick"
                        ? particle.size * (1 - progress * 0.2) // Bricks shrink less
                        : particle.size * (1 - progress * 0.4), // Fragments shrink more
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
    if (!canvas || !boardWidth || board.length === 0) return
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

    // Draw board grid (only if gridLineWidth > 0)
    if (skin.gridLineWidth > 0) {
      ctx.strokeStyle = skin.gridColor
      ctx.lineWidth = skin.gridLineWidth
      for (let y = 0; y <= BOARD_HEIGHT; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * cellSize)
        ctx.lineTo(boardWidth * cellSize, y * cellSize)
        ctx.stroke()
      }
      for (let x = 0; x <= boardWidth; x++) {
        ctx.beginPath()
        ctx.moveTo(x * cellSize, 0)
        ctx.lineTo(x * cellSize, BOARD_HEIGHT * cellSize)
        ctx.stroke()
      }
    }

    // Draw board cells as 3D bricks - now touching each other
    for (let y = 0; y < BOARD_HEIGHT && y < board.length; y++) {
      for (let x = 0; x < boardWidth && board[y] && x < board[y].length; x++) {
        const cell = board[y][x]
        if (cell) {
          draw3DBrick(ctx, x * cellSize, y * cellSize, cellSize, cellSize, cell)
        }
      }
    }

    // Draw current piece as 3D bricks - using floating-point positions for smooth movement
    if (currentPiece && !gameOver) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            draw3DBrick(
              ctx,
              (currentPiece.position.x + x) * cellSize,
              (currentPiece.position.y + y) * cellSize,
              cellSize,
              cellSize,
              currentPiece.color,
            )
          }
        }
      }

      // Draw ghost piece
      let ghostY = Math.round(currentPiece.position.y)
      while (!checkCollision(currentPiece, board, 0, ghostY - currentPiece.position.y + 1)) {
        ghostY++
      }

      ctx.globalAlpha = 0.2
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            ctx.strokeStyle = currentPiece.color
            ctx.lineWidth = 2
            ctx.strokeRect((Math.round(currentPiece.position.x) + x) * cellSize, (ghostY + y) * cellSize, cellSize, cellSize)
          }
        }
      }
      ctx.globalAlpha = 1
    }

    // Draw explosions
    explosions.forEach((explosion) => {

      explosion.particles.forEach((particle) => {
        ctx.save()
        ctx.globalAlpha = particle.life

        if (particle.type === "brick") {
          // Draw realistic brick fragments with 3D effect and motion blur
          ctx.translate(particle.x, particle.y)
          ctx.rotate(particle.rotation)
          
          // Add motion blur effect for fast-moving pieces
          const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
          if (speed > 5) {
            ctx.globalAlpha = particle.life * 0.7
            const blurScale = 1 + speed / 20
            ctx.scale(blurScale, 1)
          }
          
          // Draw the brick fragment with proper shading
          const fragmentSize = particle.size
          const depth = fragmentSize / 8
          
          // Main face
          ctx.fillStyle = particle.color
          ctx.fillRect(-fragmentSize / 2, -fragmentSize / 2, fragmentSize, fragmentSize)
          
          // Top edge (lighter)
          ctx.fillStyle = adjustBrightness(particle.color, 40)
          ctx.fillRect(-fragmentSize / 2, -fragmentSize / 2, fragmentSize, depth)
          
          // Right edge (darker)
          ctx.fillStyle = adjustBrightness(particle.color, -30)
          ctx.fillRect(fragmentSize / 2 - depth, -fragmentSize / 2, depth, fragmentSize)
          
          // Add crack/damage effect
          ctx.strokeStyle = adjustBrightness(particle.color, -50)
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(-fragmentSize / 4, -fragmentSize / 3)
          ctx.lineTo(fragmentSize / 4, fragmentSize / 3)
          ctx.stroke()
          
          ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform
        } else {
          // Draw smaller debris fragments
          ctx.translate(particle.x, particle.y)
          ctx.rotate(particle.rotation)
          
          const halfSize = particle.size / 2
          
          // Main fragment
          ctx.fillStyle = particle.color
          ctx.fillRect(-halfSize, -halfSize, particle.size, particle.size)
          
          // Add dimension with shadow
          ctx.fillStyle = adjustBrightness(particle.color, -40)
          ctx.fillRect(-halfSize + particle.size * 0.7, -halfSize + particle.size * 0.7, particle.size * 0.3, particle.size * 0.3)
          
          // Small highlight
          ctx.fillStyle = adjustBrightness(particle.color, 30)
          ctx.fillRect(-halfSize, -halfSize, particle.size * 0.2, particle.size * 0.2)
          
          ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform
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
      ctx.arc(touchFeedback.x * cellSize, touchFeedback.y * cellSize, 20, 0, Math.PI * 2)
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
  }, [board, currentPiece, gameOver, isPaused, checkCollision, explosions, skin, touchFeedback, boardWidth, cellSize])

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
              (offsetX + x) * cellSize + 2,
              (offsetY + y) * cellSize + 2,
              cellSize - 2,
              cellSize - 2,
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

  // Width selection dialog
  if (showWidthDialog && !boardWidth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
        <div className={`${skin.uiBackground} ${skin.uiBorder} p-8 max-w-md w-full rounded-lg shadow-2xl`}>
          <h2 className={`text-3xl font-bold mb-6 text-center ${skin.uiAccent}`}>
            Select Board Width
          </h2>
          <p className={`${skin.uiText} mb-6 text-center`}>
            Choose how many blocks wide you want the game board to be:
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[8, 10, 12, 16].map((width) => (
              <button
                key={width}
                onClick={() => {
                  setBoardWidth(width)
                  setShowWidthDialog(false)
                }}
                className={`${skin.buttonStyle} text-2xl py-6`}
                style={{ fontFamily: skin.fontFamily }}
              >
                {width}
              </button>
            ))}
          </div>
          <p className={`${skin.uiText} mt-6 text-sm text-center opacity-70`}>
            Smaller widths are more challenging!
          </p>
        </div>
      </div>
    )
  }

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
        QUADRIX
      </h1>

      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto max-w-md">
        <div className="flex justify-between item-center">
        <Link href="/" className={`${skin.buttonStyle} w-full`} style={{ fontFamily: skin.fontFamily }}>
          ← BACK TO GAMES
        </Link>
        <button
          onClick={() => setShowMobileHelp(true)}
          className={`${skin.buttonStyle} lg:hidden`}
          style={{ fontFamily: skin.fontFamily }}
          aria-label="Help for mobile controls"
        >
          ?
        </button>
        </div>
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
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        <div>
          {/* Next pieces preview above the board */}
          <div
            className={`${skin.uiBackground} px-3 sm:px-6 py-3 ${skin.uiBorder} mb-2 flex flex-col sm:flex-row items-center sm:justify-between gap-2`}
          >
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
            <div
              className="relative w-full mx-auto"
              style={{ 
                aspectRatio: `${boardWidth}/${BOARD_HEIGHT}`,
                maxWidth: `${(boardWidth || 16) * cellSize}px`
              }}
            >
              <canvas
                ref={canvasRef}
                width={(boardWidth || 16) * cellSize}
                height={BOARD_HEIGHT * cellSize}
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
              <>
                <button onClick={resetGame} className={`${skin.buttonStyle} w-full mb-2`}>
                  {skin.name === "Modern" ? "New Game" : "NEW GAME"}
                </button>Quadrix
                <button onClick={() => share('Tetris', score)} className={`${skin.buttonStyle} w-full mb-2`}>
                  {skin.name === "Modern" ? "Share Score" : "SHARE SCORE"}
                </button>
              </>
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
      <MobileHelpDialog isOpen={showMobileHelp} onClose={() => setShowMobileHelp(false)} skin={skin} />
    </div>
  )
}
