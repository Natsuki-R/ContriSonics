'use client';

import React from 'react';

type Props = {
  playing: boolean;
  onPlayPause: () => void;
  onBack: () => void;
  onForward: () => void;
  position: number;           // seconds
  duration: number;           // seconds
  onSeek: (sec: number) => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
};

export default function Transport({
  playing, onPlayPause, onBack, onForward,
  position, duration, onSeek,
  bpm, onBpmChange
}: Props) {
  const pct = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[color:var(--color-border)] bg-[var(--color-panel-bg)] p-3 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2">
        <button
          className="focus-ring rounded-md border border-transparent bg-[var(--color-button-bg)] px-3 py-1.5 text-sm font-medium text-[color:var(--color-button-text)] transition-colors hover:bg-[var(--color-button-hover)]"
          onClick={onBack}
        >
          ⏪ 15s
        </button>
        <button
          className="focus-ring rounded-md border border-transparent bg-[var(--color-primary)] px-4 py-1.5 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)]"
          onClick={onPlayPause}
        >
          {playing ? '⏸ Pause' : '▶️ Play'}
        </button>
        <button
          className="focus-ring rounded-md border border-transparent bg-[var(--color-button-bg)] px-3 py-1.5 text-sm font-medium text-[color:var(--color-button-text)] transition-colors hover:bg-[var(--color-button-hover)]"
          onClick={onForward}
        >
          15s ⏩
        </button>

        <div className="ml-4 flex items-center gap-2">
          <label className="text-sm text-[color:var(--color-muted)]">BPM</label>
          <input
            type="range"
            min={60}
            max={140}
            value={bpm}
            onChange={e => onBpmChange(parseInt(e.target.value))}
            className="accent-[var(--color-primary)]"
          />
          <span className="w-10 text-right text-sm text-[color:var(--color-text)]">{bpm}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={Math.min(position, duration)}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full accent-[var(--color-primary)]"
        />
        <span className="text-xs tabular-nums text-[color:var(--color-muted)]">
          {position.toFixed(1)} / {duration.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
