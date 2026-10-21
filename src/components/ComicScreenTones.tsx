import React from 'react';
import { ScreenToneType } from '../types/comic';

interface ComicScreenTonesProps {
  type?: ScreenToneType;
  className?: string;
}

export const ComicScreenTones: React.FC<ComicScreenTonesProps> = ({
  type = 'none',
  className = 'w-full h-full',
}) => {
  if (type === 'none') return null;

  switch (type) {
    case 'gloom-lines':
      return (
        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`absolute inset-0 pointer-events-none z-20 ${className}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gloomGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16192E" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#16192E" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#16192E" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Top dark gradient banner */}
          <rect width="400" height="220" fill="url(#gloomGrad)" />

          {/* Vertical gloom lines of varying lengths & thicknesses */}
          {Array.from({ length: 32 }).map((_, i) => {
            const x = 12 + i * 12.2;
            const length = 110 + ((i * 37) % 130);
            const width = i % 3 === 0 ? 3 : 1.5;
            return (
              <line
                key={i}
                x1={x}
                y1="0"
                x2={x}
                y2={length}
                stroke="#16192E"
                strokeWidth={width}
                strokeLinecap="round"
                opacity={0.8 + ((i % 5) * 0.04)}
              />
            );
          })}
        </svg>
      );

    case 'focus-speedlines':
      return (
        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`absolute inset-0 pointer-events-none z-20 ${className}`}
        >
          {/* Radial action lines converging on center */}
          {Array.from({ length: 48 }).map((_, i) => {
            const angle = (i * 360) / 48;
            const rad = (angle * Math.PI) / 180;
            const x1 = 200 + Math.cos(rad) * 260;
            const y1 = 200 + Math.sin(rad) * 260;
            const x2 = 200 + Math.cos(rad) * (70 + (i % 4) * 20);
            const y2 = 200 + Math.sin(rad) * (70 + (i % 4) * 20);
            const width = (i % 2 === 0 ? 3.5 : 1.5) * (1 + (i % 3) * 0.5);

            return (
              <polygon
                key={i}
                points={`${x1},${y1} ${x2},${y2} ${x1 + width},${y1 + width}`}
                fill="#16192E"
                opacity={0.75}
              />
            );
          })}
        </svg>
      );

    case 'halftone-dots':
      return (
        <svg
          viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg"
          className={`absolute inset-0 pointer-events-none z-20 opacity-30 ${className}`}
        >
          <pattern id="halftone" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="8" cy="8" r="3" fill="#16192E" />
          </pattern>
          <rect width="400" height="400" fill="url(#halftone)" />
        </svg>
      );

    case 'vignette-dark':
      return (
        <div
          className={`absolute inset-0 pointer-events-none z-20 ${className}`}
          style={{
            background: 'radial-gradient(circle at center, transparent 35%, rgba(22, 25, 46, 0.7) 100%)',
          }}
        />
      );

    default:
      return null;
  }
};
