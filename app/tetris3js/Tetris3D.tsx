"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import * as THREE from "three"

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const BLOCK_SIZE = 1
const DROP_TIME = 1000

const COLORS = {
  I: 0x00ffff,
  O: 0xffff00,
  T: 0xff00ff,
  S: 0x00ff00,
  Z: 0xff0000,
  J: 0x0000ff,
  L: 0xff8800,
}

const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
}

interface Piece {
  type: keyof typeof SHAPES
  shape: number[][]
  x: number
  y: number
  color: number
}

export default function Tetris3D() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const frameRef = useRef<number>(0)

  // Game state
  const [board, setBoard] = useState<number[][]>(() =>
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(0)),
  )
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [lastDropTime, setLastDropTime] = useState(0)

  // Three.js objects
  const blocksRef = useRef<(THREE.Mesh | null)[][]>([])
  const currentPieceBlocksRef = useRef<THREE.Mesh[]>([])

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    sceneRef.current = scene

    // Camera - Calculate proper distance to show entire board
    const camera = new THREE.PerspectiveCamera(
      45, // Reduced field of view for better perspective
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )

    // Calculate camera distance to fit the entire board with padding
    const boardHeight = BOARD_HEIGHT * BLOCK_SIZE
    const boardWidth = BOARD_WIDTH * BLOCK_SIZE
    const padding = 2 // Add padding around the board

    // Calculate distance based on the larger dimension
    const fov = camera.fov * (Math.PI / 180) // Convert to radians
    const maxDimension = Math.max(boardHeight + padding, (boardWidth + padding) / camera.aspect)
    const distance = maxDimension / (2 * Math.tan(fov / 2))

    // Position camera to see the entire board with some extra distance
    camera.position.set(0, 0, Math.max(distance * 1.2, 25))
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    scene.add(directionalLight)

    // Create game board with centered coordinates
    const boardGroup = new THREE.Group()

    // Board background - centered at origin
    const boardGeometry = new THREE.BoxGeometry(BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE, 0.1)
    const boardMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.3,
      roughness: 0.7,
    })
    const boardMesh = new THREE.Mesh(boardGeometry, boardMaterial)
    boardMesh.position.z = -0.5
    boardGroup.add(boardMesh)

    // Board frame
    const frameGeometry = new THREE.BoxGeometry(BOARD_WIDTH * BLOCK_SIZE + 1, BOARD_HEIGHT * BLOCK_SIZE + 1, 1)
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.6,
      roughness: 0.3,
    })
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial)
    frameMesh.position.z = -1
    boardGroup.add(frameMesh)

    // Add grid lines
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x333333 })

    // Vertical lines
    for (let i = 0; i <= BOARD_WIDTH; i++) {
      const points = []
      const x = (i - BOARD_WIDTH / 2) * BLOCK_SIZE
      points.push(new THREE.Vector3(x, (-BOARD_HEIGHT / 2) * BLOCK_SIZE, 0))
      points.push(new THREE.Vector3(x, (BOARD_HEIGHT / 2) * BLOCK_SIZE, 0))
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const line = new THREE.Line(geometry, gridMaterial)
      boardGroup.add(line)
    }

    // Horizontal lines
    for (let i = 0; i <= BOARD_HEIGHT; i++) {
      const points = []
      const y = (i - BOARD_HEIGHT / 2) * BLOCK_SIZE
      points.push(new THREE.Vector3((-BOARD_WIDTH / 2) * BLOCK_SIZE, y, 0))
      points.push(new THREE.Vector3((BOARD_WIDTH / 2) * BLOCK_SIZE, y, 0))
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const line = new THREE.Line(geometry, gridMaterial)
      boardGroup.add(line)
    }

    scene.add(boardGroup)

    // Initialize blocks array
    blocksRef.current = Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null))

    // Handle resize
    const handleResize = () => {
      const newAspect = window.innerWidth / window.innerHeight
      camera.aspect = newAspect

      // Recalculate camera distance for new aspect ratio
      const maxDimension = Math.max(boardHeight + padding, (boardWidth + padding) / newAspect)
      const newDistance = maxDimension / (2 * Math.tan(fov / 2))
      camera.position.z = Math.max(newDistance * 1.2, 25)

      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  // Create a block mesh with centered coordinates
  const createBlock = useCallback((color: number, x: number, y: number) => {
    const geometry = new THREE.BoxGeometry(BLOCK_SIZE * 0.9, BLOCK_SIZE * 0.9, BLOCK_SIZE * 0.9)
    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.3,
      roughness: 0.4,
      emissive: color,
      emissiveIntensity: 0.1,
    })
    const mesh = new THREE.Mesh(geometry, material)

    // Convert grid coordinates to world coordinates
    // Grid (0,0) is top-left, world (0,0) is center
    const worldX = (x - BOARD_WIDTH / 2 + 0.5) * BLOCK_SIZE
    const worldY = (BOARD_HEIGHT / 2 - y - 0.5) * BLOCK_SIZE
    mesh.position.set(worldX, worldY, 0.5)

    return mesh
  }, [])

  // Spawn new piece
  const spawnPiece = useCallback(() => {
    const types = Object.keys(SHAPES) as (keyof typeof SHAPES)[]
    const type = types[Math.floor(Math.random() * types.length)]
    const shape = SHAPES[type]

    const newPiece: Piece = {
      type,
      shape: shape.map((row) => [...row]),
      x: Math.floor((BOARD_WIDTH - shape[0].length) / 2),
      y: 0,
      color: COLORS[type],
    }

    // Check if can spawn
    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px] && board[py]?.[newPiece.x + px]) {
          setGameOver(true)
          return
        }
      }
    }

    setCurrentPiece(newPiece)
  }, [board])

  // Check collision
  const checkCollision = useCallback(
    (piece: Piece, dx: number, dy: number): boolean => {
      for (let py = 0; py < piece.shape.length; py++) {
        for (let px = 0; px < piece.shape[py].length; px++) {
          if (piece.shape[py][px]) {
            const newX = piece.x + px + dx
            const newY = piece.y + py + dy

            if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
              return true
            }
            if (newY >= 0 && board[newY]?.[newX]) {
              return true
            }
          }
        }
      }
      return false
    },
    [board],
  )

  // Lock piece to board
  const lockPiece = useCallback(
    (piece: Piece) => {
      const newBoard = board.map((row) => [...row])

      for (let py = 0; py < piece.shape.length; py++) {
        for (let px = 0; px < piece.shape[py].length; px++) {
          if (piece.shape[py][px]) {
            const boardY = piece.y + py
            const boardX = piece.x + px
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              newBoard[boardY][boardX] = piece.color
            }
          }
        }
      }

      // Check for completed lines
      let linesCleared = 0
      for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (newBoard[y].every((cell) => cell !== 0)) {
          newBoard.splice(y, 1)
          newBoard.unshift(Array(BOARD_WIDTH).fill(0))
          linesCleared++
          y++ // Check same line again
        }
      }

      if (linesCleared > 0) {
        setScore((prev) => prev + linesCleared * 100)
      }

      setBoard(newBoard)
      setCurrentPiece(null)
    },
    [board],
  )

  // Move piece
  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (!currentPiece || gameOver) return

      if (!checkCollision(currentPiece, dx, dy)) {
        setCurrentPiece({
          ...currentPiece,
          x: currentPiece.x + dx,
          y: currentPiece.y + dy,
        })
      } else if (dy > 0) {
        // Lock piece if moving down and colliding
        lockPiece(currentPiece)
      }
    },
    [currentPiece, gameOver, checkCollision, lockPiece],
  )

  // Rotate piece
  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver) return

    const rotated = currentPiece.shape[0].map((_, i) => currentPiece.shape.map((row) => row[i]).reverse())
    const rotatedPiece = { ...currentPiece, shape: rotated }

    if (!checkCollision(rotatedPiece, 0, 0)) {
      setCurrentPiece(rotatedPiece)
    }
  }, [currentPiece, gameOver, checkCollision])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver && e.key === "r") {
        setBoard(
          Array(BOARD_HEIGHT)
            .fill(null)
            .map(() => Array(BOARD_WIDTH).fill(0)),
        )
        setScore(0)
        setGameOver(false)
        setCurrentPiece(null)
        return
      }

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
          rotatePiece()
          break
        case " ":
          // Hard drop
          if (currentPiece && !gameOver) {
            let dropDistance = 0
            while (!checkCollision(currentPiece, 0, dropDistance + 1)) {
              dropDistance++
            }
            movePiece(0, dropDistance)
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [movePiece, rotatePiece, currentPiece, gameOver, checkCollision])

  // Spawn piece when needed
  useEffect(() => {
    if (!currentPiece && !gameOver) {
      spawnPiece()
    }
  }, [currentPiece, gameOver, spawnPiece])

  // Update Three.js scene
  useEffect(() => {
    if (!sceneRef.current) return
    const scene = sceneRef.current

    // Clear current piece blocks
    currentPieceBlocksRef.current.forEach((block) => {
      scene.remove(block)
      block.geometry.dispose()
      ;(block.material as THREE.Material).dispose()
    })
    currentPieceBlocksRef.current = []

    // Clear board blocks
    blocksRef.current.forEach((row) => {
      row.forEach((block) => {
        if (block) {
          scene.remove(block)
          block.geometry.dispose()
          ;(block.material as THREE.Material).dispose()
        }
      })
    })

    // Render board
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const block = createBlock(cell, x, y)
          scene.add(block)
          blocksRef.current[y][x] = block
        } else {
          blocksRef.current[y][x] = null
        }
      })
    })

    // Render current piece
    if (currentPiece) {
      currentPiece.shape.forEach((row, py) => {
        row.forEach((cell, px) => {
          if (cell) {
            const block = createBlock(currentPiece.color, currentPiece.x + px, currentPiece.y + py)
            scene.add(block)
            currentPieceBlocksRef.current.push(block)
          }
        })
      })
    }
  }, [board, currentPiece, createBlock])

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (!gameOver && currentPiece) {
        if (timestamp - lastDropTime > DROP_TIME) {
          movePiece(0, 1)
          setLastDropTime(timestamp)
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }

      frameRef.current = requestAnimationFrame(gameLoop)
    }

    frameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [currentPiece, gameOver, lastDropTime, movePiece])

  // Inline styles for this component only
  const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    backgroundColor: "#000000",
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  const uiStyle: React.CSSProperties = {
    position: "absolute",
    top: "1rem",
    left: "1rem",
    color: "white",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: "1rem",
    borderRadius: "0.5rem",
    backdropFilter: "blur(4px)",
  }

  const controlsStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "1rem",
    left: "1rem",
    color: "white",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: "1rem",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    backdropFilter: "blur(4px)",
  }

  const scoreStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  }

  const gameOverStyle: React.CSSProperties = {
    color: "#ef4444",
    marginTop: "0.5rem",
  }

  const instructionStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    marginTop: "0.25rem",
  }

  const controlLineStyle: React.CSSProperties = {
    marginBottom: "0.25rem",
  }

  return (
    <div style={containerStyle}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      <div style={uiStyle}>
        <div style={scoreStyle}>Score: {score}</div>
        {gameOver && (
          <div style={gameOverStyle}>
            <div>Game Over!</div>
            <div style={instructionStyle}>Press R to restart</div>
          </div>
        )}
      </div>

      <div style={controlsStyle}>
        <div style={controlLineStyle}>← → Move</div>
        <div style={controlLineStyle}>↓ Soft Drop</div>
        <div style={controlLineStyle}>↑ Rotate</div>
        <div style={controlLineStyle}>Space: Hard Drop</div>
      </div>
    </div>
  )
}
