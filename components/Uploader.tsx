'use client';

import React, { useRef, useState } from 'react';
import type { Grid, GridCell } from '@/lib/types';

type Props = {
  /**
   * Fired once the screenshot is parsed into a contribution grid.
   */
  onGridLoaded?: (grid: Grid) => void;
};

// GitHub contribution colors (light to dark)
const GH_COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

function hexToRgb(hex: string) {
  const int = parseInt(hex.slice(1), 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function nearestBucket(r: number, g: number, b: number) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < GH_COLORS.length; i++) {
    const c = hexToRgb(GH_COLORS[i]);
    const d = Math.pow(c.r - r, 2) + Math.pow(c.g - g, 2) + Math.pow(c.b - b, 2);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

function parseImage(img: HTMLImageElement): Grid {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const rows = 7;
  const cols = 53; // GitHub heatmap always 53 weeks
  const cellW = img.width / cols;
  const cellH = img.height / rows;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells: GridCell[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = Math.floor(col * cellW + cellW / 2);
      const y = Math.floor(row * cellH + cellH / 2);
      const data = ctx.getImageData(x, y, 1, 1).data;
      const bucket = nearestBucket(data[0], data[1], data[2]);
      const daysAgo = (cols - 1 - col) * 7 + row;
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      const iso = d.toISOString().slice(0, 10);
      cells.push({
        date: iso,
        count: bucket,
        colorHex: GH_COLORS[bucket],
        intensity: bucket as 0 | 1 | 2 | 3 | 4,
        row,
        col,
        noteIndex: 0,
        velocity: 0.5,
        duration: 0.25,
      });
    }
  }

  return { rows, cols, cells };
}

export default function Uploader({ onGridLoaded }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string>('');

  const handleFile = (file: File) => {
    setName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const grid = parseImage(img);
        onGridLoaded?.(grid);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-3 border border-neutral-800 rounded-md">
      <div className="flex items-center gap-3">
        <input
          type="file"
          ref={ref}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFile(file);
            }
          }}
        />
        <button
          className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
          onClick={() => ref.current?.click()}
        >
          Upload GitHub screenshot
        </button>
        <span className="opacity-70 text-sm">{name}</span>
      </div>
      <p className="text-xs opacity-70 mt-2">
        Parsing is naive and expects a raw GitHub contribution grid screenshot.
      </p>
    </div>
  );
}

