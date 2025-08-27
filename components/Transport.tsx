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
    <div className="flex flex-col gap-2 p-2 bg-neutral-900/60 rounded-md">
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700" onClick={onBack}>⏪ 15s</button>
        <button className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-500" onClick={onPlayPause}>
          {playing ? '⏸ Pause' : '▶️ Play'}
        </button>
        <button className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700" onClick={onForward}>15s ⏩</button>

        <div className="ml-4 flex items-center gap-2">
          <label className="text-sm opacity-80">BPM</label>
          <input type="range" min={60} max={140} value={bpm} onChange={e => onBpmChange(parseInt(e.target.value))} />
          <span className="w-10 text-right">{bpm}</span>
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
          className="w-full"
        />
        <span className="text-xs tabular-nums">{position.toFixed(1)} / {duration.toFixed(1)}s</span>
      </div>
    </div>
  );
}
