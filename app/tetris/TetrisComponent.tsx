'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Position {
  x: number;
  y: number;
}

interface Piece {
  shape: number[][];
  color: string;
  position: Position;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  type: 'brick' | 'dust' | 'fragment';
}

interface Explosion {
  row: number;
  particles: Particle[];
  startTime: number;
}

const TETRIS_PIECES = [
  { shape: [[1, 1, 1, 1]], color: '#00CED1' }, // I - Dark Turquoise
  { shape: [[1, 1], [1, 1]], color: '#FFD700' }, // O - Gold
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#DA70D6' }, // T - Orchid
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#32CD32' }, // S - Lime Green
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#FF6347' }, // Z - Tomato
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#FF8C00' }, // L - Dark Orange
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#4169E1' }, // J - Royal Blue
];

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;

export default function TetrisComponent() {
  const [board, setBoard] = useState<(string | null)[][]>(() =>
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const createNewPiece = useCallback(() => {
    const pieceData = TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)];
    return {
      shape: pieceData.shape,
      color: pieceData.color,
      position: {
        x: Math.floor((BOARD_WIDTH - pieceData.shape[0].length) / 2),
        y: 0
      }
    };
  }, []);

  const checkCollision = useCallback((piece: Piece, board: (string | null)[][], offsetX = 0, offsetY = 0) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.position.x + x + offsetX;
          const newY = piece.position.y + y + offsetY;

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }

          if (newY >= 0 && board[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const rotatePiece = useCallback((piece: Piece): number[][] => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return rotated;
  }, []);

  const mergePiece = useCallback((piece: Piece, board: (string | null)[][]) => {
    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.position.y + y;
          const boardX = piece.position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    return newBoard;
  }, []);

  const createExplosion = useCallback((row: number, colors: string[]) => {
    const particles: Particle[] = [];
    
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const color = colors[x] || '#ffffff';
      const cellX = x * CELL_SIZE;
      const cellY = row * CELL_SIZE;
      
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
          type: 'brick'
        });
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
          type: 'fragment'
        });
      }
      
      // Create dust particles with color tint
      for (let i = 0; i < 12; i++) {
        particles.push({
          x: cellX + Math.random() * CELL_SIZE,
          y: cellY + Math.random() * CELL_SIZE,
          vx: (Math.random() - 0.5) * 4,
          vy: -Math.random() * 3,
          life: 1,
          color: Math.random() > 0.5 ? color : '#FFD700', // Mix of block color and gold
          size: Math.random() * 6 + 4,
          rotation: 0,
          rotationSpeed: 0,
          type: 'dust'
        });
      }
    }
    
    return {
      row,
      particles,
      startTime: Date.now()
    };
  }, []);

  const clearLines = useCallback((board: (string | null)[][]) => {
    let linesCleared = 0;
    const clearedRows: { row: number; colors: string[] }[] = [];
    
    const newBoard = board.filter((row, index) => {
      const isComplete = row.every(cell => cell !== null);
      if (isComplete) {
        linesCleared++;
        clearedRows.push({ row: index, colors: row as string[] });
      }
      return !isComplete;
    });

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    // Create explosions for cleared lines
    if (clearedRows.length > 0) {
      setExplosions(prev => [
        ...prev,
        ...clearedRows.map(({ row, colors }) => createExplosion(row, colors))
      ]);
    }

    return { newBoard, linesCleared };
  }, [createExplosion]);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || gameOver || isPaused) return;

    if (!checkCollision(currentPiece, board, dx, dy)) {
      setCurrentPiece({
        ...currentPiece,
        position: {
          x: currentPiece.position.x + dx,
          y: currentPiece.position.y + dy
        }
      });
    } else if (dy > 0) {
      // Piece has landed
      const mergedBoard = mergePiece(currentPiece, board);
      const { newBoard, linesCleared } = clearLines(mergedBoard);
      
      setBoard(newBoard);
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + linesCleared * 100 * level);
      
      // Create new piece
      const newPiece = nextPiece || createNewPiece();
      if (checkCollision(newPiece, newBoard)) {
        setGameOver(true);
      } else {
        setCurrentPiece(newPiece);
        setNextPiece(createNewPiece());
      }
    }
  }, [currentPiece, board, gameOver, isPaused, checkCollision, mergePiece, clearLines, level, nextPiece, createNewPiece]);

  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    const rotated = rotatePiece(currentPiece);
    const rotatedPiece = { ...currentPiece, shape: rotated };

    if (!checkCollision(rotatedPiece, board)) {
      setCurrentPiece(rotatedPiece);
    }
  }, [currentPiece, board, gameOver, isPaused, checkCollision, rotatePiece]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    let dropDistance = 0;
    while (!checkCollision(currentPiece, board, 0, dropDistance + 1)) {
      dropDistance++;
    }

    setCurrentPiece({
      ...currentPiece,
      position: {
        x: currentPiece.position.x,
        y: currentPiece.position.y + dropDistance
      }
    });

    // Immediately lock the piece
    setTimeout(() => movePiece(0, 1), 0);
  }, [currentPiece, board, gameOver, isPaused, checkCollision, movePiece]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          rotate();
          break;
        case ' ':
          hardDrop();
          break;
        case 'p':
        case 'P':
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotate, hardDrop, gameOver]);

  // Game loop
  useEffect(() => {
    const dropInterval = Math.max(100, 1000 - (level - 1) * 100);

    gameLoopRef.current = window.setInterval(() => {
      if (!isPaused && !gameOver) {
        movePiece(0, 1);
      }
    }, dropInterval);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [movePiece, isPaused, gameOver, level]);

  // Level progression
  useEffect(() => {
    setLevel(Math.floor(lines / 10) + 1);
  }, [lines]);

  // Initialize game
  useEffect(() => {
    setCurrentPiece(createNewPiece());
    setNextPiece(createNewPiece());
  }, [createNewPiece]);

  // Helper function to draw a 3D brick
  const draw3DBrick = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
    const depth = 6;
    const lightness = 1.3;
    const darkness = 0.7;
    
    // Convert hex to RGB for color manipulation
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 255, g: 255, b: 255 };
    };
    
    const rgb = hexToRgb(color);
    
    const baseColor = color;
    const topColor = `rgb(${Math.min(255, rgb.r * lightness)}, ${Math.min(255, rgb.g * lightness)}, ${Math.min(255, rgb.b * lightness)})`;
    const rightColor = `rgb(${rgb.r * darkness}, ${rgb.g * darkness}, ${rgb.b * darkness})`;
    
    // Draw main face with subtle gradient
    const gradient = ctx.createLinearGradient(x, y, x + width - depth, y + height - depth);
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(0.5, `rgba(255, 255, 255, 0.1)`);
    gradient.addColorStop(1, baseColor);
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, width - depth, height - depth);
    
    // Add subtle shine overlay
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width - depth, height - depth);
    
    // Add glossy shine effect
    const shineGradient = ctx.createLinearGradient(x, y, x, y + height/3);
    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    shineGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = shineGradient;
    ctx.fillRect(x, y, width - depth, height/3);
    
    // Draw top face (lighter)
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + depth, y - depth);
    ctx.lineTo(x + width, y - depth);
    ctx.lineTo(x + width - depth, y);
    ctx.closePath();
    ctx.fill();
    
    // Draw right face (darker)
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(x + width - depth, y);
    ctx.lineTo(x + width, y - depth);
    ctx.lineTo(x + width, y + height - depth);
    ctx.lineTo(x + width - depth, y + height - depth);
    ctx.closePath();
    ctx.fill();
    
    // Draw mortar lines for brick texture
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, width - depth, height - depth);
    
    // Add highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 1, y + height - depth - 1);
    ctx.lineTo(x + 1, y + 1);
    ctx.lineTo(x + width - depth - 1, y + 1);
    ctx.stroke();
    
    // Add shadow to make it pop more
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.moveTo(x + width - depth - 1, y + 1);
    ctx.lineTo(x + width - depth - 1, y + height - depth - 1);
    ctx.lineTo(x + 1, y + height - depth - 1);
    ctx.stroke();
  };

  // Animation loop for explosions
  useEffect(() => {
    const animate = () => {
      setExplosions(prev => prev.map(explosion => {
        const elapsed = Date.now() - explosion.startTime;
        const progress = elapsed / 1500; // 1.5 second duration
        
        if (progress >= 1) {
          return null;
        }
        
        return {
          ...explosion,
          particles: explosion.particles.map(particle => {
            let gravity = 0.5;
            let drag = 0.98;
            let lifeFade = progress;
            
            // Different physics for different particle types
            if (particle.type === 'dust') {
              gravity = 0.1;
              drag = 0.95;
              lifeFade = progress * 1.5; // Dust fades faster
            } else if (particle.type === 'brick') {
              gravity = 0.8;
              drag = 0.99;
            }
            
            return {
              ...particle,
              x: particle.x + particle.vx,
              y: particle.y + particle.vy,
              vx: particle.vx * drag,
              vy: particle.vy * drag + gravity,
              rotation: particle.rotation + particle.rotationSpeed,
              life: Math.max(0, 1 - lifeFade),
              size: particle.type === 'dust' 
                ? particle.size * (1 + progress * 2) // Dust expands
                : particle.size * (1 - progress * 0.3) // Others shrink slightly
            };
          })
        };
      }).filter(Boolean) as Explosion[]);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (explosions.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [explosions.length]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with vibrant gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#1e3c72');
    bgGradient.addColorStop(0.5, '#2a5298');
    bgGradient.addColorStop(1, '#1e3c72');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board grid with subtle lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }

    // Draw board cells as 3D bricks
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = board[y][x];
        if (cell) {
          draw3DBrick(ctx, x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4, cell);
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
              currentPiece.color
            );
          }
        }
      }

      // Draw ghost piece
      let ghostY = currentPiece.position.y;
      while (!checkCollision(currentPiece, board, 0, ghostY - currentPiece.position.y + 1)) {
        ghostY++;
      }

      ctx.globalAlpha = 0.2;
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            ctx.strokeStyle = currentPiece.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(
              (currentPiece.position.x + x) * CELL_SIZE + 2,
              (ghostY + y) * CELL_SIZE + 2,
              CELL_SIZE - 4,
              CELL_SIZE - 4
            );
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    // Draw explosions
    explosions.forEach(explosion => {
      // Helper function for hex to RGB conversion
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };
      
      explosion.particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        
        if (particle.type === 'dust') {
          // Draw dust as colorful expanding cloud
          const rgb = hexToRgb(particle.color);
          const dustGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size
          );
          if (rgb) {
            dustGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.life * 0.4})`);
            dustGradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.life * 0.2})`);
            dustGradient.addColorStop(1, 'transparent');
          }
          
          ctx.fillStyle = dustGradient;
          ctx.fillRect(
            particle.x - particle.size,
            particle.y - particle.size,
            particle.size * 2,
            particle.size * 2
          );
        } else if (particle.type === 'brick') {
          // Draw brick fragments with rotation
          ctx.translate(particle.x, particle.y);
          ctx.rotate(particle.rotation);
          
          // Draw a small 3D brick fragment
          const fragmentSize = particle.size;
          draw3DBrick(
            ctx,
            -fragmentSize / 2,
            -fragmentSize / 2,
            fragmentSize,
            fragmentSize,
            particle.color
          );
          
          ctx.rotate(-particle.rotation);
          ctx.translate(-particle.x, -particle.y);
        } else {
          // Draw small fragments
          ctx.translate(particle.x, particle.y);
          ctx.rotate(particle.rotation);
          
          // Fragment with some shading
          const halfSize = particle.size / 2;
          ctx.fillStyle = particle.color;
          ctx.fillRect(-halfSize, -halfSize, particle.size, particle.size);
          
          // Add slight highlight
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.life * 0.3})`;
          ctx.fillRect(-halfSize, -halfSize, particle.size * 0.3, particle.size * 0.3);
          
          ctx.rotate(-particle.rotation);
          ctx.translate(-particle.x, -particle.y);
        }
        
        ctx.restore();
      });
    });

    // Draw game over overlay
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    }

    // Draw pause overlay
    if (isPaused && !gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
  }, [board, currentPiece, gameOver, isPaused, checkCollision, explosions, draw3DBrick]);

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    setExplosions([]);
    setCurrentPiece(createNewPiece());
    setNextPiece(createNewPiece());
  };

  const drawNextPiece = (canvas: HTMLCanvasElement | null) => {
    if (!canvas || !nextPiece) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with matching gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#1e3c72');
    bgGradient.addColorStop(1, '#2a5298');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellSize = 22;
    const offsetX = (4 - nextPiece.shape[0].length) / 2;
    const offsetY = (4 - nextPiece.shape.length) / 2;

    for (let y = 0; y < nextPiece.shape.length; y++) {
      for (let x = 0; x < nextPiece.shape[y].length; x++) {
        if (nextPiece.shape[y][x]) {
          draw3DBrick(
            ctx,
            (offsetX + x) * cellSize + 6,
            (offsetY + y) * cellSize + 6,
            cellSize - 4,
            cellSize - 4,
            nextPiece.color
          );
        }
      }
    }
  };

  useEffect(() => {
    const nextCanvas = document.getElementById('next-piece-canvas') as HTMLCanvasElement;
    drawNextPiece(nextCanvas);
  }, [nextPiece, drawNextPiece]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500 mb-4">TETRIS</h1>
      
      <div className="mb-4">
        <Link href="/games" className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105">
          ← Back to Games
        </Link>
      </div>
      
      <div className="flex gap-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-2xl border border-purple-500/30">
          <canvas
            ref={canvasRef}
            width={BOARD_WIDTH * CELL_SIZE}
            height={BOARD_HEIGHT * CELL_SIZE}
            className="border-2 border-blue-500/50 rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-xl border border-purple-500/30">
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-bold mb-2">Next Piece</h2>
            <canvas
              id="next-piece-canvas"
              width={100}
              height={100}
              className="border border-blue-500/50 rounded"
            />
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-xl text-white border border-purple-500/30">
            <div className="mb-2 text-lg">
              <span className="font-bold text-yellow-400">Score:</span> <span className="text-2xl">{score.toLocaleString()}</span>
            </div>
            <div className="mb-2 text-lg">
              <span className="font-bold text-cyan-400">Lines:</span> <span className="text-2xl">{lines}</span>
            </div>
            <div className="mb-4 text-lg">
              <span className="font-bold text-pink-400">Level:</span> <span className="text-2xl">{level}</span>
            </div>

            {gameOver && (
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg w-full mb-2 shadow-lg transform transition-all hover:scale-105"
              >
                New Game
              </button>
            )}

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg w-full shadow-lg transform transition-all hover:scale-105"
              disabled={gameOver}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-xl text-white text-sm border border-purple-500/30">
            <h3 className="font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Controls:</h3>
            <div className="text-gray-300">← → : Move</div>
            <div className="text-gray-300">↓ : Soft Drop</div>
            <div className="text-gray-300">↑ : Rotate</div>
            <div className="text-gray-300">Space : Hard Drop</div>
            <div className="text-gray-300">P : Pause</div>
          </div>
        </div>
      </div>
    </div>
  );
}