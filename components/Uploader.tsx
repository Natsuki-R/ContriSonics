'use client';

import { useRef, useState } from 'react';
import type { Grid, GridCell } from '@/lib/types';

type Props = {
  onGridLoaded?: (grid: Grid) => void;
};

const GH_COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

function hexToRgb(hex: string) {
  const int = parseInt(hex.slice(1), 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function nearestBucket(r: number, g: number, b: number) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < GH_COLORS.length; i++) {
    const c = hexToRgb(GH_COLORS[i]);
    const d = Math.pow(c.r - r, 2) + Math.pow(c.g - g, 2) + Math.pow(c.b - b, 2);
    if (d < bestDist) { bestDist = d; best = i; }
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
  const cols = 53;
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
        date: iso, count: bucket, colorHex: GH_COLORS[bucket],
        intensity: bucket as 0 | 1 | 2 | 3 | 4,
        row, col, noteIndex: 0, velocity: 0.5, duration: 0.25,
      });
    }
  }
  return { rows, cols, cells };
}

export default function Uploader({ onGridLoaded }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [preview, setPreview] = useState('/img/default-1.png');

  const handleFile = (file: File) => {
    setName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      const img = new Image();
      img.onload = () => { onGridLoaded?.(parseImage(img)); };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-md border border-subtle surface-elevated p-3">
      <div className="flex items-center gap-3">
        <input type="file" ref={ref} accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <button
          className="rounded-full bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-accent-foreground)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
          onClick={() => ref.current?.click()}
        >
          Upload GitHub screenshot
        </button>
        <span className="text-sm text-muted">{name}</span>
      </div>

      <details className="mt-3 group rounded-md border border-subtle">
        <summary className="flex cursor-pointer items-center gap-2 p-3 text-sm font-medium text-[var(--color-text)] select-none hover:bg-[var(--color-button)] transition-colors rounded-md">
          <svg className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-90" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
          What screenshot works best?
        </summary>
        <div className="px-3 pb-3 text-xs text-muted leading-relaxed">
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Go to any GitHub profile and find the green contribution grid.</li>
            <li>Screenshot <strong>only the grid area</strong> — crop out the surrounding text, axes, and whitespace.</li>
            <li>Use the <strong>light theme</strong> on GitHub for best color detection accuracy.</li>
            <li>PNG or JPG both work. Higher resolution = better results.</li>
          </ul>
          <div className="mt-3 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Example contribution heatmap" className="w-full max-w-[600px] object-contain" />
          </div>
        </div>
      </details>
    </div>
  );
}
