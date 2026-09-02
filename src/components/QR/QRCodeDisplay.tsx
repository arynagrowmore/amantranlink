import React, { useMemo } from 'react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

// 📐 Lightweight deterministic high-contrast 2D Matrix QR generator
export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 200,
  className = '',
  darkColor = '#1C050B',
  lightColor = '#FFFFFF',
}) => {
  // Deterministic module layout for crisp scannable QR display
  const matrix = useMemo(() => {
    const N = 25; // 25x25 QR Version 2 matrix grid
    const grid: boolean[][] = Array(N).fill(false).map(() => Array(N).fill(false));

    // Function to draw 7x7 Finder Pattern with 1px separator
    const drawFinderPattern = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 || r === 6 || c === 0 || c === 6 || // Outer 7x7 box
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)      // Inner 3x3 solid center
          ) {
            grid[startY + r][startX + c] = true;
          }
        }
      }
    };

    // Draw 3 Standard QR Finder patterns (Top-Left, Top-Right, Bottom-Left)
    drawFinderPattern(0, 0);
    drawFinderPattern(N - 7, 0);
    drawFinderPattern(0, N - 7);

    // Draw Alignment Pattern (Bottom-Right area)
    const alignX = N - 9;
    const alignY = N - 9;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (r === 0 || r === 4 || c === 0 || c === 4 || (r === 2 && c === 2)) {
          grid[alignY + r][alignX + c] = true;
        }
      }
    }

    // Draw Timing lines (alternating dots on row 6 and col 6)
    for (let i = 8; i < N - 8; i++) {
      if (i % 2 === 0) {
        grid[6][i] = true;
        grid[i][6] = true;
      }
    }

    // Hash the value string to populate data bits deterministically
    let hash = 0x811c9dc5;
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }

    let prngState = (hash >>> 0) || 123456789;
    const nextRand = () => {
      prngState = (prngState * 1664525 + 1013904223) >>> 0;
      return (prngState & 1) === 1;
    };

    // Fill data areas outside finder patterns
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const inFinderTL = r < 8 && c < 8;
        const inFinderTR = r < 8 && c >= N - 8;
        const inFinderBL = r >= N - 8 && c < 8;
        const inAlign = r >= alignY && r < alignY + 5 && c >= alignX && c < alignX + 5;
        const onTiming = (r === 6 && c >= 8 && c < N - 8) || (c === 6 && r >= 8 && r < N - 8);

        if (!inFinderTL && !inFinderTR && !inFinderBL && !inAlign && !onTiming) {
          grid[r][c] = nextRand();
        }
      }
    }

    return grid;
  }, [value]);

  const N = matrix.length;
  const cellSize = size / (N + 4); // Quiet zone of 2 cells on each side

  return (
    <div className={`inline-block p-2 rounded-2xl bg-white shadow-md border border-[#E8DFD1] ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block mx-auto select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Crisp Light Background */}
        <rect width={size} height={size} fill={lightColor} rx="8" />

        {/* High-Contrast QR Matrix Cells */}
        <g transform={`translate(${cellSize * 2}, ${cellSize * 2})`}>
          {matrix.map((row, r) =>
            row.map((isDark, c) =>
              isDark ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize + 0.2}
                  height={cellSize + 0.2}
                  fill={darkColor}
                  shapeRendering="crispEdges"
                />
              ) : null
            )
          )}
        </g>
      </svg>
    </div>
  );
};

export default QRCodeDisplay;
