'use client';

import { useEffect, useRef } from 'react';
import { createNoise2D } from 'simplex-noise';

const NoiseBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const noise2D = createNoise2D();
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }
      
      const elapsed = (currentTime - startTimeRef.current) * 0.00008; // Very slow time progression
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Create gradient based on noise
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      
      // Sample noise at different points for organic color variations
      const noiseScale = 0.003; // Very low scale for smooth transitions
      const timeScale = elapsed;
      
      // Generate multiple noise-based color stops
      for (let i = 0; i <= 10; i++) {
        const position = i / 10;
        const x = position * width * noiseScale;
        const y = position * height * noiseScale;
        
        // Sample noise for color variations
        const noiseValue = noise2D(x, y + timeScale);
        const noiseValue2 = noise2D(x + 100, y + timeScale + 50);
        
        // Map noise to subtle gray variations
        const baseGray = 248 + noiseValue * 8; // Range: 240-256
        const baseGray2 = 249 + noiseValue2 * 6; // Range: 243-255
        
        const r = Math.floor(Math.max(240, Math.min(255, baseGray)));
        const g = Math.floor(Math.max(240, Math.min(255, baseGray2)));
        const b = Math.floor(Math.max(245, Math.min(255, baseGray + 2)));
        
        gradient.addColorStop(position, `rgb(${r}, ${g}, ${b})`);
      }
      
      // Fill canvas with noise-generated gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Add subtle overlay patterns
      const overlayGradient = ctx.createRadialGradient(
        width * 0.3 + noise2D(timeScale * 0.5, 0) * 100,
        height * 0.4 + noise2D(0, timeScale * 0.7) * 80,
        0,
        width * 0.6,
        height * 0.6,
        Math.max(width, height) * 0.8
      );
      
      const overlayOpacity = 0.03 + (noise2D(timeScale * 0.3, timeScale * 0.4) + 1) * 0.02;
      overlayGradient.addColorStop(0, `rgba(250, 251, 252, ${overlayOpacity})`);
      overlayGradient.addColorStop(0.5, `rgba(248, 249, 250, ${overlayOpacity * 0.7})`);
      overlayGradient.addColorStop(1, 'rgba(246, 247, 248, 0)');
      
      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, width, height);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full"
      style={{ background: 'rgb(248, 249, 250)' }}
    />
  );
};

export default NoiseBackground;