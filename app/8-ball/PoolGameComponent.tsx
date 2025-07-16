'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

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

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export default function PoolGameComponent() {
  const [gameScreen, setGameScreen] = useState<'angle' | 'speed' | 'playing'>('angle');
  const [selectedAngle, setSelectedAngle] = useState(0);
  const [selectedSpeed, setSelectedSpeed] = useState(50);
  const [balls, setBalls] = useState<Ball[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const [scale, setScale] = useState(1);
  const [sunkBallsCount, setSunkBallsCount] = useState(0);
  const [cameraView, setCameraView] = useState<'top' | 'front' | 'angle' | 'side'>('top');
  
  // Constants for the original game size
  const ORIGINAL_WIDTH = 800;
  const ORIGINAL_HEIGHT = 400;
  
  // Calculate responsive canvas size
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('game-container');
      if (!container) return;
      
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Calculate scale to fit the container while maintaining aspect ratio
      const scaleX = containerWidth / ORIGINAL_WIDTH;
      const scaleY = containerHeight / ORIGINAL_HEIGHT;
      const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond original size
      
      setScale(newScale);
      setCanvasSize({
        width: ORIGINAL_WIDTH * newScale,
        height: ORIGINAL_HEIGHT * newScale
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Force landscape on mobile
    if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
      alert('Please rotate your device to landscape mode for the best experience');
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize balls in standard 8-ball formation
  useEffect(() => {
    const railWidth = 40 * scale;
    const ballRadius = 12 * scale;
    const spacing = ballRadius * 2.2;
    // Ensure all balls start within the play area
    const startX = 500 * scale;
    const startY = 200 * scale; // Center of table
    
    const initialBalls: Ball[] = [
      // Cue ball - ensure it's well within the play area
      { id: 0, x: 200 * scale, y: 200 * scale, vx: 0, vy: 0, color: 'white', number: 0, isPocketed: false, scale: 1 },
      
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
  }, [scale]);

  // Handle mouse/touch movement for angle selection
  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (gameScreen !== 'angle') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
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
    
    const speed = (selectedSpeed / 100) * 50 * scale; // Scale speed based on canvas size
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
        const ballRadius = 12 * scale;
        const pocketRadius = 20 * scale;
        const tableWidth = ORIGINAL_WIDTH * scale;
        const tableHeight = ORIGINAL_HEIGHT * scale;
        const railWidth = 40 * scale; // Define railWidth here for the physics loop
        
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
          
          // Calculate next position
          const nextX = ball.x + ball.vx;
          const nextY = ball.y + ball.vy;
          
          // Define play area boundaries (green felt area only)
          const minX = railWidth + ballRadius;
          const maxX = tableWidth - railWidth - ballRadius;
          const minY = railWidth + ballRadius;
          const maxY = tableHeight - railWidth - ballRadius;
          
          // Check if next position would be in the wall
          if (nextX < minX || nextX > maxX) {
            ball.vx = -ball.vx * 0.8;
            // Keep ball at boundary
            ball.x = nextX < minX ? minX : maxX;
          } else {
            ball.x = nextX;
          }
          
          if (nextY < minY || nextY > maxY) {
            ball.vy = -ball.vy * 0.8;
            // Keep ball at boundary
            ball.y = nextY < minY ? minY : maxY;
          } else {
            ball.y = nextY;
          }
          
          // Pocket positions - at corners and midpoints of play area
          const pockets = [
            { x: railWidth, y: railWidth },  // Top-left corner
            { x: tableWidth / 2, y: railWidth },  // Top-middle
            { x: tableWidth - railWidth, y: railWidth },  // Top-right corner
            { x: railWidth, y: tableHeight - railWidth },  // Bottom-left corner
            { x: tableWidth / 2, y: tableHeight - railWidth },  // Bottom-middle
            { x: tableWidth - railWidth, y: tableHeight - railWidth }  // Bottom-right corner
          ];
          
          // Check pocket collisions
          for (const pocket of pockets) {
            const dx = ball.x - pocket.x;
            const dy = ball.y - pocket.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Ball disappears when 30% or more overlaps with pocket
            // This means when the distance is less than (pocketRadius + ballRadius * 0.7)
            if (distance < pocketRadius + ballRadius * 0.7) {
              if (ball.id === 0) {
                // White ball - place back at start position
                ball.x = 200 * scale;
                ball.y = 200 * scale;
                ball.vx = 0;
                ball.vy = 0;
              } else {
                // Regular ball - mark as pocketed and count it
                ball.isPocketed = true;
                ball.pocketedTime = currentTime;
                ball.pocketPosition = { x: pocket.x, y: pocket.y };
                ball.x = pocket.x;
                ball.y = pocket.y;
                ball.vx = 0;
                ball.vy = 0;
                setSunkBallsCount(prev => prev + 1);
              }
              break;
            }
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
        
        // Check if all balls have stopped moving
        const allBallsStopped = newBalls.every(ball => 
          ball.vx === 0 && ball.vy === 0
        );
        
        // If all balls stopped and we're in playing mode, go back to angle selection
        if (allBallsStopped && gameScreen === 'playing') {
          setGameScreen('angle');
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
  }, [gameScreen, scale, ORIGINAL_WIDTH, ORIGINAL_HEIGHT]);

  // Apply camera transformations to the canvas
  const applyCameraTransform = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    
    switch (cameraView) {
      case 'top':
        // Standard top-down view - no transformation needed
        break;
        
      case 'front':
        // Front view - looking at the table from the side
        ctx.translate(canvasSize.width / 2, canvasSize.height * 0.7);
        ctx.scale(1, 0.5);
        ctx.translate(-canvasSize.width / 2, -canvasSize.height);
        break;
        
      case 'angle':
        // Angled 3D-like view
        ctx.translate(canvasSize.width / 2, canvasSize.height * 0.3);
        ctx.scale(1, 0.6);
        ctx.rotate(-0.1);
        ctx.translate(-canvasSize.width / 2, 0);
        break;
        
      case 'side':
        // Side view with perspective
        ctx.translate(0, canvasSize.height * 0.4);
        ctx.scale(1.2, 0.4);
        ctx.translate(0, -canvasSize.height * 0.2);
        break;
    }
  };

  // Draw the game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Apply camera transformation
    applyCameraTransform(ctx);
    
    // Draw outer wood frame first (rails/cushions)
    const railWidth = 40 * scale;
    
    // Wood frame with realistic texture
    const woodPattern = ctx.createLinearGradient(0, 0, canvasSize.width, canvasSize.height);
    woodPattern.addColorStop(0, '#3E2723');
    woodPattern.addColorStop(0.2, '#5D4037');
    woodPattern.addColorStop(0.4, '#4E342E');
    woodPattern.addColorStop(0.6, '#5D4037');
    woodPattern.addColorStop(0.8, '#4E342E');
    woodPattern.addColorStop(1, '#3E2723');
    
    // Draw outer frame
    ctx.fillStyle = woodPattern;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Add wood grain texture
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvasSize.width; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i + Math.sin(i * 0.02) * 2, 0);
      ctx.lineTo(i + Math.sin(i * 0.02 + 0.5) * 2, canvasSize.height);
      ctx.stroke();
    }
    
    // Draw inner playing area (green felt)
    const playAreaX = railWidth;
    const playAreaY = railWidth;
    const playAreaWidth = canvasSize.width - (railWidth * 2);
    const playAreaHeight = canvasSize.height - (railWidth * 2);
    
    // Table felt with better gradient
    const tableGradient = ctx.createRadialGradient(400, 200, 100, 400, 200, 400);
    tableGradient.addColorStop(0, '#0f7020');
    tableGradient.addColorStop(0.5, '#0d5518');
    tableGradient.addColorStop(1, '#0a4012');
    ctx.fillStyle = tableGradient;
    ctx.fillRect(playAreaX, playAreaY, playAreaWidth, playAreaHeight);
    
    // Add felt texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let i = playAreaX; i < playAreaX + playAreaWidth; i += 3) {
      for (let j = playAreaY; j < playAreaY + playAreaHeight; j += 3) {
        if ((i + j) % 6 === 0) {
          ctx.fillRect(i, j, 1, 1);
        }
      }
    }
    
    // Rail shadows on felt
    const shadowGrad = ctx.createLinearGradient(playAreaX, playAreaY, playAreaX + 20, playAreaY);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(playAreaX, playAreaY, 20, playAreaHeight);
    
    const shadowGradRight = ctx.createLinearGradient(playAreaX + playAreaWidth - 20, playAreaY, playAreaX + playAreaWidth, playAreaY);
    shadowGradRight.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shadowGradRight.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = shadowGradRight;
    ctx.fillRect(playAreaX + playAreaWidth - 20, playAreaY, 20, playAreaHeight);
    
    const shadowGradTop = ctx.createLinearGradient(playAreaX, playAreaY, playAreaX, playAreaY + 20);
    shadowGradTop.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    shadowGradTop.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGradTop;
    ctx.fillRect(playAreaX, playAreaY, playAreaWidth, 20);
    
    const shadowGradBottom = ctx.createLinearGradient(playAreaX, playAreaY + playAreaHeight - 20, playAreaX, playAreaY + playAreaHeight);
    shadowGradBottom.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shadowGradBottom.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = shadowGradBottom;
    ctx.fillRect(playAreaX, playAreaY + playAreaHeight - 20, playAreaWidth, 20);
    
    // Rail highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(railWidth - 1, railWidth - 1, playAreaWidth + 2, playAreaHeight + 2);
    
    // Draw pockets with improved 3D effect
    const pocketPositions = [
      { x: railWidth, y: railWidth },  // Top-left corner
      { x: 400, y: railWidth },  // Top-middle
      { x: 800 - railWidth, y: railWidth },  // Top-right corner
      { x: railWidth, y: 400 - railWidth },  // Bottom-left corner
      { x: 400, y: 400 - railWidth },  // Bottom-middle
      { x: 800 - railWidth, y: 400 - railWidth }  // Bottom-right corner
    ];
    
    pocketPositions.forEach(pos => {
      // Pocket cut-out in wood
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Pocket leather/net backing
      const netGradient = ctx.createRadialGradient(pos.x, pos.y, 10, pos.x, pos.y, 28);
      netGradient.addColorStop(0, '#000000');
      netGradient.addColorStop(0.3, '#1a0f0a');
      netGradient.addColorStop(0.7, '#2d1810');
      netGradient.addColorStop(1, '#3d2418');
      ctx.fillStyle = netGradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 28 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner pocket depth
      const depthGradient = ctx.createRadialGradient(pos.x - 3 * scale, pos.y - 3 * scale, 0, pos.x, pos.y, 22 * scale);
      depthGradient.addColorStop(0, '#000000');
      depthGradient.addColorStop(0.5, '#000000');
      depthGradient.addColorStop(0.8, '#0a0503');
      depthGradient.addColorStop(1, '#1a0a05');
      ctx.fillStyle = depthGradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 22 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // Pocket rim highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 27 * scale, -Math.PI/4, Math.PI/4);
      ctx.stroke();
    });
    
    // Draw balls
    balls.forEach(ball => {
      // Skip balls that have fully disappeared
      if (ball.scale <= 0) return;
      
      const displayRadius = 12 * ball.scale;
      
      // Enhanced ball shadow with blur effect
      ctx.save();
      ctx.shadowColor = `rgba(0, 0, 0, ${0.5 * ball.scale})`;
      ctx.shadowBlur = 8 * ball.scale;
      ctx.shadowOffsetX = 3 * ball.scale;
      ctx.shadowOffsetY = 3 * ball.scale;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, displayRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Ball with gradient
      const ballGradient = ctx.createRadialGradient(
        ball.x - displayRadius * 0.3, ball.y - displayRadius * 0.3, 0,
        ball.x, ball.y, displayRadius
      );
      
      // Enhanced gradients for more realistic lighting
      if (ball.number === 0) {
        ballGradient.addColorStop(0, '#ffffff');
        ballGradient.addColorStop(0.3, '#fafafa');
        ballGradient.addColorStop(0.7, '#e8e8e8');
        ballGradient.addColorStop(1, '#cccccc');
      } else if (ball.number === 8) {
        ballGradient.addColorStop(0, '#4a4a4a');
        ballGradient.addColorStop(0.3, '#2a2a2a');
        ballGradient.addColorStop(0.7, '#000000');
        ballGradient.addColorStop(1, '#000000');
      } else {
        // Create lighter and darker versions of the ball color
        const rgb = hexToRgb(ball.color);
        if (rgb) {
          const lighter = `rgb(${Math.min(255, rgb.r + 60)}, ${Math.min(255, rgb.g + 60)}, ${Math.min(255, rgb.b + 60)})`;
          const darker = `rgb(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)})`;
          ballGradient.addColorStop(0, lighter);
          ballGradient.addColorStop(0.3, ball.color);
          ballGradient.addColorStop(0.7, ball.color);
          ballGradient.addColorStop(1, darker);
        } else {
          ballGradient.addColorStop(0, ball.color);
          ballGradient.addColorStop(1, ball.color);
        }
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
      
      // Enhanced reflection with multiple highlights
      // Primary highlight
      const reflectionGradient = ctx.createRadialGradient(
        ball.x - displayRadius * 0.3, ball.y - displayRadius * 0.3, 0,
        ball.x - displayRadius * 0.3, ball.y - displayRadius * 0.3, displayRadius * 0.6
      );
      reflectionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      reflectionGradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.6)');
      reflectionGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
      reflectionGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = reflectionGradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, displayRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Secondary small highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(ball.x - displayRadius * 0.4, ball.y - displayRadius * 0.4, displayRadius * 0.15, 0, Math.PI * 2);
      ctx.fill();
      
      // Ball edge definition
      const edgeGradient = ctx.createRadialGradient(
        ball.x, ball.y, displayRadius * 0.8,
        ball.x, ball.y, displayRadius
      );
      edgeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      edgeGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.1)');
      edgeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = edgeGradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, displayRadius, 0, Math.PI * 2);
      ctx.fill();
      
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
        ctx.font = `bold ${8 * scale * ball.scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ball.number.toString(), ball.x, ball.y);
      }
    });
    
    // Draw cue stick when aiming
    if (gameScreen === 'angle') {
      const cueBall = balls.find(b => b.id === 0);
      if (cueBall) {
        const cueLength = 180 * scale;
        const cueOffset = 35 * scale;
        const startX = cueBall.x - Math.cos(selectedAngle) * cueOffset;
        const startY = cueBall.y - Math.sin(selectedAngle) * cueOffset;
        const endX = startX - Math.cos(selectedAngle) * cueLength;
        const endY = startY - Math.sin(selectedAngle) * cueLength;
        
        // Draw cue shadow first
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Cue stick shaft with taper effect
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        
        // Create tapered effect
        const taper = ctx.createLinearGradient(startX, startY, endX, endY);
        taper.addColorStop(0, '#D4A574');
        taper.addColorStop(0.2, '#A67C52');
        taper.addColorStop(0.5, '#8B5A3C');
        taper.addColorStop(0.8, '#654321');
        taper.addColorStop(1, '#4A2C17');
        
        ctx.strokeStyle = taper;
        ctx.lineWidth = 12 * scale;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Wood grain detail
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 5; i++) {
          const offset = (i - 2) * 2;
          const grainX1 = startX + Math.cos(selectedAngle + Math.PI/2) * offset;
          const grainY1 = startY + Math.sin(selectedAngle + Math.PI/2) * offset;
          const grainX2 = endX + Math.cos(selectedAngle + Math.PI/2) * offset;
          const grainY2 = endY + Math.sin(selectedAngle + Math.PI/2) * offset;
          ctx.beginPath();
          ctx.moveTo(grainX1, grainY1);
          ctx.lineTo(grainX2, grainY2);
          ctx.stroke();
        }
        
        // Ferrule (ivory/plastic connector)
        const ferruleX = startX - Math.cos(selectedAngle) * 12;
        const ferruleY = startY - Math.sin(selectedAngle) * 12;
        const ferruleGrad = ctx.createRadialGradient(ferruleX, ferruleY, 0, ferruleX, ferruleY, 6);
        ferruleGrad.addColorStop(0, '#FFFFF0');
        ferruleGrad.addColorStop(0.7, '#F0E68C');
        ferruleGrad.addColorStop(1, '#D3D3D3');
        ctx.fillStyle = ferruleGrad;
        ctx.beginPath();
        ctx.arc(ferruleX, ferruleY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Cue tip (leather)
        const tipGrad = ctx.createRadialGradient(startX, startY, 0, startX, startY, 5 * scale);
        tipGrad.addColorStop(0, '#87CEEB');
        tipGrad.addColorStop(0.5, '#4682B4');
        tipGrad.addColorStop(1, '#1E5A8E');
        ctx.fillStyle = tipGrad;
        ctx.beginPath();
        ctx.arc(startX, startY, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Tip chalk dust effect
        ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
        ctx.beginPath();
        ctx.arc(startX, startY, 7 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Enhanced aiming guide
        const aimGradient = ctx.createLinearGradient(
          cueBall.x, cueBall.y,
          cueBall.x + Math.cos(selectedAngle) * 250 * scale, 
          cueBall.y + Math.sin(selectedAngle) * 250 * scale
        );
        aimGradient.addColorStop(0, 'rgba(255, 255, 100, 0.8)');
        aimGradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.4)');
        aimGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.strokeStyle = aimGradient;
        ctx.lineWidth = 3 * scale;
        ctx.setLineDash([8 * scale, 4 * scale]);
        ctx.lineDashOffset = Date.now() / 50 % 12; // Animated dashes
        ctx.beginPath();
        ctx.moveTo(cueBall.x, cueBall.y);
        ctx.lineTo(cueBall.x + Math.cos(selectedAngle) * 250 * scale, cueBall.y + Math.sin(selectedAngle) * 250 * scale);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    
    // Restore canvas state after camera transformation
    ctx.restore();
  }, [balls, selectedAngle, gameScreen, scale, canvasSize, cameraView, applyCameraTransform]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-2 md:p-4">
      <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-8"><a href="https://www.AussieSoft.com.au">Onni</a> 8-Ball Pool</h1>
      
      <div className="mb-4">
        <Link href="/" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-colors">
          Back to Games →
        </Link>
      </div>
      
      <div id="game-container" className="relative bg-gray-800 p-2 md:p-4 rounded-lg shadow-2xl w-full max-w-4xl">
        <div className="flex justify-between items-center mb-2 md:mb-4">
          <div className="text-white text-lg md:text-xl font-semibold">
            Balls Sunk: {sunkBallsCount}
          </div>
          <div className="flex gap-2">
            <select
              value={cameraView}
              onChange={(e) => setCameraView(e.target.value as 'top' | 'front' | 'angle' | 'side')}
              className="bg-gray-700 text-white px-2 py-1 rounded text-sm md:text-base"
            >
              <option value="top">Top View</option>
              <option value="front">Front View</option>
              <option value="angle">Angled View</option>
              <option value="side">Side View</option>
            </select>
            {gameScreen === 'playing' && (
              <button
                onClick={() => {
                  setGameScreen('angle');
                  setSunkBallsCount(0);
                  setBalls(prevBalls => prevBalls.map(ball => ({
                    ...ball,
                    isPocketed: false,
                    scale: 1,
                    pocketedTime: undefined,
                    pocketPosition: undefined,
                    x: ball.id === 0 ? 200 * scale : ball.x,
                    y: ball.id === 0 ? 200 * scale : ball.y,
                    vx: 0,
                    vy: 0
                  })));
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 md:py-2 md:px-4 rounded text-sm md:text-base"
              >
                New Game
              </button>
            )}
          </div>
        </div>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border-2 md:border-4 border-gray-700 rounded cursor-crosshair w-full h-auto"
          onMouseMove={handlePointerMove}
          onTouchMove={handlePointerMove}
          onClick={handleAngleClick}
          onTouchEnd={handleAngleClick}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {gameScreen === 'speed' && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded">
            <div className="bg-gray-800 p-4 md:p-8 rounded-lg mx-4 w-full max-w-sm">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Select Power</h2>
              <div className="w-full">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedSpeed}
                  onChange={(e) => setSelectedSpeed(Number(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-white mt-2 text-sm md:text-base">
                  <span>Soft</span>
                  <span>{selectedSpeed}%</span>
                  <span>Hard</span>
                </div>
              </div>
              <button
                onClick={shoot}
                className="mt-4 md:mt-6 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-2 px-4 md:px-6 rounded w-full"
              >
                Shoot!
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-2 md:mt-4 text-white text-sm md:text-base text-center">
        {gameScreen === 'angle' && <p>Tap and drag to aim, then tap to confirm angle</p>}
        {gameScreen === 'playing' && <p>Game in progress...</p>}
      </div>
      
      {gameScreen === 'playing' && (
        <button
          onClick={() => window.location.reload()}
          className="mt-2 md:mt-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-4 rounded"
        >
          New Game
        </button>
      )}
    </div>
  );
}