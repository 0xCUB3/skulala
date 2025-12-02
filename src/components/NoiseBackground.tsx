"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { createNoise2D } from "simplex-noise";

const NoiseBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const noise2D = createNoise2D();
    const isDark = resolvedTheme === "dark";

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

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

        let r: number, g: number, b: number;

        if (isDark) {
          // Dark mode: deep purples/blues with subtle variation
          const baseValue = 18 + noiseValue * 6; // Range: 12-24
          const baseValue2 = 18 + noiseValue2 * 4; // Range: 14-22
          r = Math.floor(Math.max(12, Math.min(28, baseValue)));
          g = Math.floor(Math.max(12, Math.min(28, baseValue2)));
          b = Math.floor(
            Math.max(18, Math.min(38, baseValue + 8 + noiseValue2 * 4)),
          ); // Slight blue/purple tint
        } else {
          // Light mode: subtle gray variations (original)
          const baseGray = 248 + noiseValue * 8; // Range: 240-256
          const baseGray2 = 249 + noiseValue2 * 6; // Range: 243-255
          r = Math.floor(Math.max(240, Math.min(255, baseGray)));
          g = Math.floor(Math.max(240, Math.min(255, baseGray2)));
          b = Math.floor(Math.max(245, Math.min(255, baseGray + 2)));
        }

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
        Math.max(width, height) * 0.8,
      );

      const overlayOpacity =
        0.03 + (noise2D(timeScale * 0.3, timeScale * 0.4) + 1) * 0.02;

      if (isDark) {
        // Dark mode overlay: subtle purple glow
        overlayGradient.addColorStop(
          0,
          `rgba(60, 50, 80, ${overlayOpacity * 1.5})`,
        );
        overlayGradient.addColorStop(
          0.5,
          `rgba(40, 35, 60, ${overlayOpacity})`,
        );
        overlayGradient.addColorStop(1, "rgba(20, 20, 30, 0)");
      } else {
        // Light mode overlay (original)
        overlayGradient.addColorStop(
          0,
          `rgba(250, 251, 252, ${overlayOpacity})`,
        );
        overlayGradient.addColorStop(
          0.5,
          `rgba(248, 249, 250, ${overlayOpacity * 0.7})`,
        );
        overlayGradient.addColorStop(1, "rgba(246, 247, 248, 0)");
      }

      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, width, height);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resolvedTheme]);

  const bgColor =
    resolvedTheme === "dark" ? "rgb(18, 18, 22)" : "rgb(248, 249, 250)";

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full transition-colors duration-300"
      style={{ background: bgColor }}
    />
  );
};

export default NoiseBackground;
