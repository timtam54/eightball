'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const BOARD_WIDTH = 27;
const BOARD_HEIGHT = 30;
const BLOCK_SIZE = 20;
const BLOCK_DEPTH = 12;

// Type definitions
interface Position {
  x: number;
  y: number;
}

interface Piece {
  type: string;
  shape: number[][];
}

interface FragmentType {
  id: string;
  x: number;
  y: number;
  delay: number;
}

// Terracotta/clay color palette with dark undersides
const COLORS = {
  top: '#F5B299',      // Brightest - directly lit from above
  front: '#D97A5A',    // Medium bright
  right: '#B85542',    // Darker side
  bottom: '#2A1815',   // Almost black underside
  left: '#8A4436',     // Dark side
  shadow: 'rgba(0, 0, 0, 0.7)'
};

const TETROMINOS = {
  I: { shape: [[1,1,1,1]] },
  O: { shape: [[1,1],[1,1]] },
  T: { shape: [[0,1,0],[1,1,1]] },
  S: { shape: [[0,1,1],[1,1,0]] },
  Z: { shape: [[1,1,0],[0,1,1]] },
  J: { shape: [[1,0,0],[1,1,1]] },
  L: { shape: [[0,0,1],[1,1,1]] }
};

const Block3D = ({ x, y, isGhost = false, isCrumbling = false }: { x: number; y: number; isGhost?: boolean; isCrumbling?: boolean }) => {
  const perspective = -5; // Slight upward viewing angle
  const baseX = x * BLOCK_SIZE;
  const baseY = y * BLOCK_SIZE;
  
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: baseX,
    top: baseY,
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    transformStyle: 'preserve-3d',
    transform: `${isCrumbling ? 'scale(0.9) rotate(5deg)' : ''}`,
    transition: isCrumbling ? 'all 0.3s ease-out' : 'none',
    opacity: isGhost ? 0.3 : 1
  };

  // Calculate 3D vertices for the block
  const topLeft = { x: 0, y: perspective };
  const topRight = { x: BLOCK_SIZE, y: perspective };
  const bottomLeft = { x: 0, y: BLOCK_SIZE };
  const bottomRight = { x: BLOCK_SIZE, y: BLOCK_SIZE };
  
  const depthOffset = BLOCK_DEPTH;
  const backTopLeft = { x: topLeft.x + depthOffset * 0.3, y: topLeft.y - depthOffset };
  const backTopRight = { x: topRight.x + depthOffset * 0.3, y: topRight.y - depthOffset };

  return (
    <div style={baseStyle}>
      {/* Shadow underneath */}
      <div style={{
        position: 'absolute',
        left: '2px',
        top: BLOCK_SIZE + 'px',
        width: BLOCK_SIZE,
        height: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        filter: 'blur(6px)',
        transform: 'skewX(-20deg)',
        opacity: isGhost ? 0.1 : 0.7
      }} />

      {/* Front face */}
      <div style={{
        position: 'absolute',
        width: BLOCK_SIZE,
        height: BLOCK_SIZE,
        background: `linear-gradient(180deg, ${COLORS.front} 0%, ${COLORS.bottom} 100%)`,
        border: '1px solid rgba(0,0,0,0.2)',
        boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2)'
      }} />

      {/* Top face - using clip-path for perspective */}
      <div style={{
        position: 'absolute',
        width: BLOCK_SIZE + depthOffset * 0.3,
        height: depthOffset,
        background: `linear-gradient(135deg, ${COLORS.top} 0%, ${COLORS.front} 100%)`,
        transformOrigin: 'bottom left',
        transform: `translateY(${perspective}px)`,
        clipPath: `polygon(0 100%, ${BLOCK_SIZE}px 100%, ${BLOCK_SIZE + depthOffset * 0.3}px 0, ${depthOffset * 0.3}px 0)`,
        border: '1px solid rgba(0,0,0,0.1)',
        boxShadow: 'inset 2px 2px 3px rgba(255,255,255,0.3)'
      }} />

      {/* Right side face */}
      <div style={{
        position: 'absolute',
        left: BLOCK_SIZE + 'px',
        width: depthOffset * 0.3,
        height: BLOCK_SIZE,
        background: `linear-gradient(180deg, ${COLORS.right} 0%, ${COLORS.bottom} 100%)`,
        transformOrigin: 'left top',
        transform: `skewY(-45deg) translateY(${perspective}px)`,
        border: '1px solid rgba(0,0,0,0.2)',
        boxShadow: 'inset -1px 1px 2px rgba(0,0,0,0.3)'
      }} />

      {/* Bottom face (visible from below angle) */}
      <div style={{
        position: 'absolute',
        top: BLOCK_SIZE + 'px',
        width: BLOCK_SIZE,
        height: depthOffset * 0.15,
        background: `linear-gradient(180deg, ${COLORS.bottom} 0%, #1A0D0A 100%)`,
        transform: 'skewX(-20deg)',
        opacity: 1,
        boxShadow: 'none'
      }} />

      {/* Left side face (partially visible) */}
      <div style={{
        position: 'absolute',
        left: '-3px',
        top: perspective + 'px',
        width: '3px',
        height: BLOCK_SIZE - perspective,
        background: `linear-gradient(180deg, ${COLORS.left} 0%, ${COLORS.bottom} 100%)`,
        opacity: 0.9
      }} />

      {/* Highlight edge */}
      <div style={{
        position: 'absolute',
        top: perspective + 'px',
        left: 0,
        width: BLOCK_SIZE,
        height: '1px',
        background: 'rgba(255,255,255,0.4)'
      }} />
    </div>
  );
};

const Fragment = ({ x, y, delay }: { x: number; y: number; delay: number }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0, opacity: 1, rotate: 0 });
  
  useEffect(() => {
    setTimeout(() => {
      setOffset({
        x: (Math.random() - 0.5) * 150,
        y: Math.random() * -150 - 50,
        opacity: 0,
        rotate: Math.random() * 720 - 360
      });
    }, delay);
  }, [delay]);

  const size = 8 + Math.random() * 8;

  return (
    <div
      style={{
        position: 'absolute',
        left: x * BLOCK_SIZE + BLOCK_SIZE / 2,
        top: y * BLOCK_SIZE + BLOCK_SIZE / 2,
        width: size,
        height: size,
        background: COLORS.front,
        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${offset.rotate}deg)`,
        opacity: offset.opacity,
        transition: 'all 1.5s ease-out',
        pointerEvents: 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}
    />
  );
};

export default function Tetris3D() {
  const [board, setBoard] = useState<boolean[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(false))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [position, setPosition] = useState<Position>({ x: 12, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [fragments, setFragments] = useState<FragmentType[]>([]);
  const [clearedLines, setClearedLines] = useState<number[]>([]);

  const getRandomPiece = useCallback((): Piece => {
    const pieces = Object.keys(TETROMINOS) as Array<keyof typeof TETROMINOS>;
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    return { type, ...TETROMINOS[type] };
  }, []);

  const rotate = useCallback((piece: Piece) => {
    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
    );
    return { ...piece, shape: rotated };
  }, []);

  const isValidMove = useCallback((piece: Piece, pos: Position) => {
    return piece.shape.every((row, dy) =>
      row.every((cell, dx) => {
        if (!cell) return true;
        const newX = pos.x + dx;
        const newY = pos.y + dy;
        return (
          newX >= 0 &&
          newX < BOARD_WIDTH &&
          newY < BOARD_HEIGHT &&
          (newY < 0 || !board[newY][newX])
        );
      })
    );
  }, [board]);

  const mergePiece = useCallback(() => {
    if (!currentPiece) return;
    
    const newBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell && position.y + dy >= 0) {
          newBoard[position.y + dy][position.x + dx] = true;
        }
      });
    });

    // Check for complete lines
    let linesCleared = 0;
    const linesToClear: number[] = [];
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell)) {
        linesToClear.push(y);
        linesCleared++;
      }
    }

    if (linesToClear.length > 0) {
      // Create fragments for cleared lines
      const newFragments: FragmentType[] = [];
      linesToClear.forEach(y => {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          for (let i = 0; i < 3; i++) {
            newFragments.push({
              id: `${Date.now()}-${x}-${y}-${i}`,
              x: x + Math.random() * 0.5 - 0.25,
              y: y + Math.random() * 0.5 - 0.25,
              delay: Math.random() * 200
            });
          }
        }
      });
      setFragments(prev => [...prev, ...newFragments]);
      setClearedLines(linesToClear);

      // Remove cleared lines after animation
      setTimeout(() => {
        linesToClear.forEach(y => {
          newBoard.splice(y, 1);
          newBoard.unshift(Array(BOARD_WIDTH).fill(false));
        });
        setBoard(newBoard);
        setClearedLines([]);
      }, 300);
    } else {
      setBoard(newBoard);
    }

    setScore(prev => prev + linesCleared * 100);
    
    const newPiece = getRandomPiece();
    const startPos = { x: 12, y: 0 };
    
    if (!isValidMove(newPiece, startPos)) {
      setGameOver(true);
    } else {
      setCurrentPiece(newPiece);
      setPosition(startPos);
    }
  }, [board, currentPiece, position, getRandomPiece, isValidMove]);

  const move = useCallback((dx: number, dy: number) => {
    if (!currentPiece || gameOver) return;
    
    const newPos = { x: position.x + dx, y: position.y + dy };
    if (isValidMove(currentPiece, newPos)) {
      setPosition(newPos);
    } else if (dy > 0) {
      mergePiece();
    }
  }, [currentPiece, position, gameOver, isValidMove, mergePiece]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver) return;
    
    const rotated = rotate(currentPiece);
    if (isValidMove(rotated, position)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, position, gameOver, isValidMove, rotate]);

  const drop = useCallback(() => {
    if (!currentPiece || gameOver) return;
    
    let newY = position.y;
    while (isValidMove(currentPiece, { x: position.x, y: newY + 1 })) {
      newY++;
    }
    setPosition({ x: position.x, y: newY });
    setTimeout(mergePiece, 100);
  }, [currentPiece, position, gameOver, isValidMove, mergePiece]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': move(-1, 0); break;
        case 'ArrowRight': move(1, 0); break;
        case 'ArrowDown': move(0, 1); break;
        case 'ArrowUp': rotatePiece(); break;
        case ' ': drop(); break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [move, rotatePiece, drop]);

  useEffect(() => {
    if (!currentPiece) {
      setCurrentPiece(getRandomPiece());
    }
  }, [currentPiece, getRandomPiece]);

  useEffect(() => {
    const interval = setInterval(() => move(0, 1), 1000);
    return () => clearInterval(interval);
  }, [move]);

  // Clean up old fragments
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFragments(prev => prev.filter(p => Date.now() - parseInt(p.id.split('-')[0]) < 2000));
    }, 2000);
    return () => clearTimeout(timeout);
  }, [fragments]);

  const getGhostPosition = (): Position | null => {
    if (!currentPiece) return null;
    
    let ghostY = position.y;
    while (isValidMove(currentPiece, { x: position.x, y: ghostY + 1 })) {
      ghostY++;
    }
    return { x: position.x, y: ghostY };
  };

  const ghostPos = getGhostPosition();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-300 p-4">
      <div className="mb-4 text-gray-800 text-center">
        <h1 className="text-3xl font-bold mb-2">3D Clay Tetris</h1>
        <div className="mb-3">
          <Link href="/" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            ← Back to Games
          </Link>
        </div>
        <p className="text-xl">Score: {score}</p>
        {gameOver && <p className="text-red-600 text-xl mt-2">Game Over!</p>}
      </div>
      
      <div 
        className="relative shadow-2xl"
        style={{
          width: BOARD_WIDTH * BLOCK_SIZE + 40,
          height: BOARD_HEIGHT * BLOCK_SIZE + 20,
          padding: '10px 20px 10px 20px',
          background: 'linear-gradient(180deg, #d0d0d0 0%, #b0b0b0 100%)',
          border: '2px solid #999',
          perspective: '800px',
          transformStyle: 'preserve-3d'
        }}
      >
        <div style={{
          position: 'relative',
          width: BOARD_WIDTH * BLOCK_SIZE,
          height: BOARD_HEIGHT * BLOCK_SIZE,
          background: 'rgba(0,0,0,0.05)'
        }}>
          {/* Board blocks */}
          {board.map((row, y) =>
            row.map((filled, x) =>
              filled && (
                <Block3D 
                  key={`${x}-${y}`} 
                  x={x} 
                  y={y}
                  isCrumbling={clearedLines.includes(y)}
                />
              )
            )
          )}
          
          {/* Ghost piece */}
          {currentPiece && ghostPos && (
            currentPiece.shape.map((row, dy) =>
              row.map((cell, dx) =>
                cell && (
                  <Block3D
                    key={`ghost-${dx}-${dy}`}
                    x={ghostPos.x + dx}
                    y={ghostPos.y + dy}
                    isGhost={true}
                  />
                )
              )
            )
          )}
          
          {/* Current piece */}
          {currentPiece && (
            currentPiece.shape.map((row, dy) =>
              row.map((cell, dx) =>
                cell && (
                  <Block3D
                    key={`current-${dx}-${dy}`}
                    x={position.x + dx}
                    y={position.y + dy}
                  />
                )
              )
            )
          )}

          {/* Fragments */}
          {fragments.map(fragment => (
            <Fragment key={fragment.id} {...fragment} />
          ))}
        </div>
      </div>
      
      <div className="mt-4 text-gray-600 text-sm">
        <p>Use arrow keys to move, up to rotate, space to drop</p>
      </div>
    </div>
  );
}