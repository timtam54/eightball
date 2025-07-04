'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  number: number;
  isPocketed: boolean;
  pocketedTime?: number;
  pocketPosition?: { x: number; y: number };
  scale: number;
}

export default function PoolGameComponent() {
  const [gameScreen, setGameScreen] = useState<'angle' | 'speed' | 'playing'>('angle');
  const [selectedAngle, setSelectedAngle] = useState(0);
  const [selectedSpeed, setSelectedSpeed] = useState(50);
  const [balls, setBalls] = useState<Ball[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Initialize balls in standard 8-ball formation
  useEffect(() => {
    const startX = 500;
    const startY = 200; // Adjusted for shorter table
    const ballRadius = 12;
    const spacing = ballRadius * 2.2;
    
    const initialBalls: Ball[] = [
      // Cue ball
      { id: 0, x: 200, y: 200, vx: 0, vy: 0, color: 'white', number: 0, isPocketed: false, scale: 1 },
      
      // Row 1 (1 ball)
      { id: 1, x: startX, y: startY, vx: 0, vy: 0, color: '#FFD700', number: 1, isPocketed: false, scale: 1 },
      
      // Row 2 (2 balls)
      { id: 2, x: startX + spacing, y: startY - ballRadius, vx: 0, vy: 0, color: '#0000FF', number: 2, isPocketed: false, scale: 1 },
      { id: 3, x: startX + spacing, y: startY + ballRadius, vx: 0, vy: 0, color: '#FF0000', number: 3, isPocketed: false, scale: 1 },
      
      // Row 3 (3 balls - 8 ball in middle)
      { id: 4, x: startX + spacing * 2, y: startY - spacing, vx: 0, vy: 0, color: '#800080', number: 4, isPocketed: false, scale: 1 },
      { id: 8, x: startX + spacing * 2, y: startY, vx: 0, vy: 0, color: '#000000', number: 8, isPocketed: false, scale: 1 },
      { id: 5, x: startX + spacing * 2, y: startY + spacing, vx: 0, vy: 0, color: '#FFA500', number: 5, isPocketed: false, scale: 1 },
      
      // Row 4 (4 balls)
      { id: 6, x: startX + spacing * 3, y: startY - spacing * 1.5, vx: 0, vy: 0, color: '#008000', number: 6, isPocketed: false, scale: 1 },
      { id: 7, x: startX + spacing * 3, y: startY - spacing * 0.5, vx: 0, vy: 0, color: '#8B4513', number: 7, isPocketed: false, scale: 1 },
      { id: 9, x: startX + spacing * 3, y: startY + spacing * 0.5, vx: 0, vy: 0, color: '#FFD700', number: 9, isPocketed: false, scale: 1 },
      { id: 10, x: startX + spacing * 3, y: startY + spacing * 1.5, vx: 0, vy: 0, color: '#0000FF', number: 10, isPocketed: false, scale: 1 },
      
      // Row 5 (5 balls)
      { id: 11, x: startX + spacing * 4, y: startY - spacing * 2, vx: 0, vy: 0, color: '#FF0000', number: 11, isPocketed: false, scale: 1 },
      { id: 12, x: startX + spacing * 4, y: startY - spacing, vx: 0, vy: 0, color: '#800080', number: 12, isPocketed: false, scale: 1 },
      { id: 13, x: startX + spacing * 4, y: startY, vx: 0, vy: 0, color: '#FFA500', number: 13, isPocketed: false, scale: 1 },
      { id: 14, x: startX + spacing * 4, y: startY + spacing, vx: 0, vy: 0, color: '#008000', number: 14, isPocketed: false, scale: 1 },
      { id: 15, x: startX + spacing * 4, y: startY + spacing * 2, vx: 0, vy: 0, color: '#8B4513', number: 15, isPocketed: false, scale: 1 },
    ];
    
    setBalls(initialBalls);
  }, []);

  // Handle mouse movement for angle selection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameScreen !== 'angle') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cueBall = balls.find(b => b.id === 0);
    if (!cueBall) return;
    
    const angle = Math.atan2(y - cueBall.y, x - cueBall.x);
    setSelectedAngle(angle);
  };

  // Handle click to confirm angle
  const handleAngleClick = () => {
    if (gameScreen === 'angle') {
      setGameScreen('speed');
    }
  };

  // Handle shooting the cue ball
  const shoot = () => {
    const cueBall = balls.find(b => b.id === 0);
    if (!cueBall) return;
    
    const speed = (selectedSpeed / 100) * 50; // Scale speed - max speed is now 50 pixels per frame
    const newBalls = balls.map(ball => {
      if (ball.id === 0) {
        return {
          ...ball,
          vx: Math.cos(selectedAngle) * speed,
          vy: Math.sin(selectedAngle) * speed
        };
      }
      return ball;
    });
    
    setBalls(newBalls);
    setGameScreen('playing');
  };

  // Physics simulation
  useEffect(() => {
    if (gameScreen !== 'playing') return;
    
    const animate = () => {
      setBalls(prevBalls => {
        const newBalls = [...prevBalls];
        const friction = 0.995; // Reduced friction for more momentum
        const ballRadius = 12;
        const pocketRadius = 20;
        const tableWidth = 800;
        const tableHeight = 400; // Shorter table
        
        const currentTime = Date.now();
        
        // Update positions and check collisions
        for (let i = 0; i < newBalls.length; i++) {
          const ball = newBalls[i];
          
          // Handle pocketed balls - shrink them over 3 seconds
          if (ball.isPocketed && ball.pocketedTime) {
            const elapsedTime = currentTime - ball.pocketedTime;
            if (elapsedTime < 3000) {
              // Calculate scale based on elapsed time (1 to 0 over 3 seconds)
              ball.scale = Math.max(0, 1 - (elapsedTime / 3000));
              // Keep ball at pocket position
              if (ball.pocketPosition) {
                ball.x = ball.pocketPosition.x;
                ball.y = ball.pocketPosition.y;
              }
              continue;
            } else {
              // After 3 seconds, set scale to 0
              ball.scale = 0;
              continue;
            }
          }
          
          if (ball.isPocketed) continue;
          
          // Apply friction
          ball.vx *= friction;
          ball.vy *= friction;
          
          // Update position
          ball.x += ball.vx;
          ball.y += ball.vy;
          
          // Pocket positions
          const pockets = [
            { x: 30, y: 30 },
            { x: tableWidth / 2, y: 20 },
            { x: tableWidth - 30, y: 30 },
            { x: 30, y: tableHeight - 30 },
            { x: tableWidth / 2, y: tableHeight - 20 },
            { x: tableWidth - 30, y: tableHeight - 30 }
          ];
          
          // Check pocket collisions
          for (const pocket of pockets) {
            const dx = ball.x - pocket.x;
            const dy = ball.y - pocket.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Ball disappears when 30% or more overlaps with pocket
            // This means when the distance is less than (pocketRadius + ballRadius * 0.7)
            if (distance < pocketRadius + ballRadius * 0.7) {
              ball.isPocketed = true;
              ball.pocketedTime = currentTime;
              ball.pocketPosition = { x: pocket.x, y: pocket.y };
              ball.x = pocket.x;
              ball.y = pocket.y;
              ball.vx = 0;
              ball.vy = 0;
              break;
            }
          }
          
          // Wall collisions
          if (ball.x - ballRadius < 0 || ball.x + ballRadius > tableWidth) {
            ball.vx = -ball.vx * 0.8;
            ball.x = ball.x - ballRadius < 0 ? ballRadius : tableWidth - ballRadius;
          }
          if (ball.y - ballRadius < 0 || ball.y + ballRadius > tableHeight) {
            ball.vy = -ball.vy * 0.8;
            ball.y = ball.y - ballRadius < 0 ? ballRadius : tableHeight - ballRadius;
          }
          
          // Ball-to-ball collisions
          for (let j = i + 1; j < newBalls.length; j++) {
            const ball2 = newBalls[j];
            if (ball2.isPocketed || ball2.scale < 1) continue;
            
            const dx = ball2.x - ball.x;
            const dy = ball2.y - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < ballRadius * 2) {
              // Collision detected
              const normalX = dx / distance;
              const normalY = dy / distance;
              
              // Relative velocity
              const dvx = ball2.vx - ball.vx;
              const dvy = ball2.vy - ball.vy;
              
              // Relative velocity in collision normal direction
              const dvn = dvx * normalX + dvy * normalY;
              
              // Do not resolve if velocities are separating
              if (dvn > 0) continue;
              
              // Collision impulse
              const impulse = 2 * dvn / 2; // Equal mass assumption
              
              // Update velocities
              ball.vx += impulse * normalX;
              ball.vy += impulse * normalY;
              ball2.vx -= impulse * normalX;
              ball2.vy -= impulse * normalY;
              
              // Separate balls
              const overlap = ballRadius * 2 - distance;
              const separationX = overlap * normalX / 2;
              const separationY = overlap * normalY / 2;
              ball.x -= separationX;
              ball.y -= separationY;
              ball2.x += separationX;
              ball2.y += separationY;
            }
          }
          
          // Stop ball if moving very slowly
          if (Math.abs(ball.vx) < 0.05 && Math.abs(ball.vy) < 0.05) {
            ball.vx = 0;
            ball.vy = 0;
          }
        }
        
        return newBalls;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameScreen]);

  // Draw the game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, 800, 400);
    
    // Draw table background with gradient
    const tableGradient = ctx.createLinearGradient(0, 0, 0, 400);
    tableGradient.addColorStop(0, '#0f6018');
    tableGradient.addColorStop(0.5, '#0d5016');
    tableGradient.addColorStop(1, '#0b4013');
    ctx.fillStyle = tableGradient;
    ctx.fillRect(0, 0, 800, 400);
    
    // Add subtle texture pattern
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let i = 0; i < 800; i += 4) {
      for (let j = 0; j < 400; j += 4) {
        if ((i + j) % 8 === 0) {
          ctx.fillRect(i, j, 2, 2);
        }
      }
    }
    
    // Draw table border with wood texture
    const woodGradient = ctx.createLinearGradient(0, 0, 800, 0);
    woodGradient.addColorStop(0, '#654321');
    woodGradient.addColorStop(0.5, '#8B4513');
    woodGradient.addColorStop(1, '#654321');
    ctx.strokeStyle = woodGradient;
    ctx.lineWidth = 20;
    ctx.strokeRect(10, 10, 780, 380);
    
    // Inner border highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 760, 360);
    
    // Draw pockets with depth effect
    const pocketPositions = [
      { x: 30, y: 30 },
      { x: 400, y: 20 },
      { x: 770, y: 30 },
      { x: 30, y: 370 },
      { x: 400, y: 380 },
      { x: 770, y: 370 }
    ];
    
    pocketPositions.forEach(pos => {
      // Outer ring (metal/leather)
      const pocketGradient = ctx.createRadialGradient(pos.x, pos.y, 15, pos.x, pos.y, 25);
      pocketGradient.addColorStop(0, '#000000');
      pocketGradient.addColorStop(0.7, '#1a1a1a');
      pocketGradient.addColorStop(1, '#333333');
      ctx.fillStyle = pocketGradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner pocket (black hole effect)
      const innerGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 20);
      innerGradient.addColorStop(0, '#000000');
      innerGradient.addColorStop(0.8, '#000000');
      innerGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      ctx.fillStyle = innerGradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw balls
    balls.forEach(ball => {
      // Skip balls that have fully disappeared
      if (ball.scale <= 0) return;
      
      const displayRadius = 12 * ball.scale;
      
      // Ball shadow (more realistic)
      const shadowGradient = ctx.createRadialGradient(
        ball.x + 3, ball.y + 3, 0,
        ball.x + 3, ball.y + 3, displayRadius + 4
      );
      shadowGradient.addColorStop(0, `rgba(0, 0, 0, ${0.4 * ball.scale})`);
      shadowGradient.addColorStop(0.8, `rgba(0, 0, 0, ${0.2 * ball.scale})`);
      shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGradient;
      ctx.beginPath();
      ctx.arc(ball.x + 3, ball.y + 3, displayRadius + 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Ball with gradient
      const ballGradient = ctx.createRadialGradient(
        ball.x - displayRadius * 0.3, ball.y - displayRadius * 0.3, 0,
        ball.x, ball.y, displayRadius
      );
      
      // Special gradient for cue ball
      if (ball.number === 0) {
        ballGradient.addColorStop(0, '#ffffff');
        ballGradient.addColorStop(0.7, '#f0f0f0');
        ballGradient.addColorStop(1, '#d0d0d0');
      } else if (ball.number === 8) {
        ballGradient.addColorStop(0, '#333333');
        ballGradient.addColorStop(0.7, '#000000');
        ballGradient.addColorStop(1, '#000000');
      } else {
        // Adjust color brightness for gradient
        const baseColor = ball.color;
        ballGradient.addColorStop(0, ball.color);
        ballGradient.addColorStop(0.7, ball.color);
        ballGradient.addColorStop(1, ball.color);
      }
      
      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, displayRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Stripe for balls 9-15
      if (ball.number > 8 && ball.number <= 15) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, displayRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = 'white';
        ctx.fillRect(ball.x - displayRadius, ball.y - displayRadius * 0.5, displayRadius * 2, displayRadius);
        ctx.restore();
      }
      
      // Ball reflection (glass effect)
      const reflectionGradient = ctx.createRadialGradient(
        ball.x - displayRadius * 0.3, ball.y - displayRadius * 0.3, 0,
        ball.x - displayRadius * 0.3, ball.y - displayRadius * 0.3, displayRadius * 0.7
      );
      reflectionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      reflectionGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.3)');
      reflectionGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = reflectionGradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, displayRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Ball border (subtle)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, displayRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Number on ball (except cue ball)
      if (ball.number > 0 && ball.scale > 0.3) {
        // White circle background for number
        if (ball.number <= 8 || ball.number > 15) {
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, displayRadius * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.fillStyle = ball.number > 8 ? '#000000' : '#000000';
        ctx.font = `bold ${8 * ball.scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ball.number.toString(), ball.x, ball.y);
      }
    });
    
    // Draw cue stick when aiming
    if (gameScreen === 'angle') {
      const cueBall = balls.find(b => b.id === 0);
      if (cueBall) {
        const cueLength = 150;
        const cueOffset = 30;
        const startX = cueBall.x - Math.cos(selectedAngle) * cueOffset;
        const startY = cueBall.y - Math.sin(selectedAngle) * cueOffset;
        const endX = startX - Math.cos(selectedAngle) * cueLength;
        const endY = startY - Math.sin(selectedAngle) * cueLength;
        
        // Cue stick gradient
        const cueGradient = ctx.createLinearGradient(startX, startY, endX, endY);
        cueGradient.addColorStop(0, '#D2691E');
        cueGradient.addColorStop(0.3, '#8B4513');
        cueGradient.addColorStop(0.7, '#654321');
        cueGradient.addColorStop(1, '#3E2723');
        
        // Draw cue stick with taper
        ctx.save();
        ctx.strokeStyle = cueGradient;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Cue tip (white)
        ctx.fillStyle = '#F5F5DC';
        ctx.beginPath();
        ctx.arc(startX, startY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Ferrule (metallic band)
        ctx.strokeStyle = '#C0C0C0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const ferruleX = startX - Math.cos(selectedAngle) * 10;
        const ferruleY = startY - Math.sin(selectedAngle) * 10;
        ctx.arc(ferruleX, ferruleY, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        
        // Aiming line with gradient
        const aimGradient = ctx.createLinearGradient(
          cueBall.x, cueBall.y,
          cueBall.x + Math.cos(selectedAngle) * 200, 
          cueBall.y + Math.sin(selectedAngle) * 200
        );
        aimGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        aimGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.strokeStyle = aimGradient;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(cueBall.x, cueBall.y);
        ctx.lineTo(cueBall.x + Math.cos(selectedAngle) * 200, cueBall.y + Math.sin(selectedAngle) * 200);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [balls, selectedAngle, gameScreen]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-8"><a href="https://www.AussieSoft.com.au">Stephanie</a> 8-Ball Pool</h1>
      
      <div className="relative bg-gray-800 p-4 rounded-lg shadow-2xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="border-4 border-gray-700 rounded cursor-crosshair"
          onMouseMove={handleMouseMove}
          onClick={handleAngleClick}
        />
        
        {gameScreen === 'speed' && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded">
            <div className="bg-gray-800 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Select Power</h2>
              <div className="w-64">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedSpeed}
                  onChange={(e) => setSelectedSpeed(Number(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-white mt-2">
                  <span>Soft</span>
                  <span>{selectedSpeed}%</span>
                  <span>Hard</span>
                </div>
              </div>
              <button
                onClick={shoot}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
              >
                Shoot!
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-white">
        {gameScreen === 'angle' && <p>Click and move mouse to aim, then click to confirm angle</p>}
        {gameScreen === 'playing' && <p>Game in progress...</p>}
      </div>
      
      {gameScreen === 'playing' && (
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          New Game
        </button>
      )}
    </div>
  );
}