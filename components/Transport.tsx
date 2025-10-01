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
  size?: "md" | "lg";
  className?: string;
};

export default function Transport({
  playing,
  onPlayPause,
  onBack,
  onForward,
  position,
  duration,
  onSeek,
  bpm,
  onBpmChange,
  size = "md",
  className,
}: Props) {
  const isLarge = size === "lg";
  const gapClass = isLarge ? "gap-3" : "gap-2";
  const paddingClass = isLarge ? "p-4" : "p-3";
  const containerClasses = `flex flex-col ${gapClass} ${paddingClass} rounded-lg border border-subtle surface-elevated shadow-sm ${
    className ?? ""
  }`;
  const buttonBase = isLarge
    ? "rounded-full px-4 py-2 text-base font-medium btn-muted transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
    : "rounded-full px-3 py-1.5 text-sm font-medium btn-muted transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]";
  const primaryButton = isLarge
    ? "rounded-full bg-[var(--color-accent)] px-5 py-2 text-base font-semibold text-[var(--color-accent-foreground)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
    : "rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-sm font-semibold text-[var(--color-accent-foreground)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]";
  const sliderClass = isLarge ? "h-2" : "";
  const bpmLabel = isLarge ? "text-sm font-medium" : "text-xs text-muted";
  const bpmWrapper = isLarge ? "ml-0 sm:ml-4 gap-3" : "ml-4 gap-2";

  return (
    <div className={containerClasses.trim()}>
      <div className="flex flex-wrap items-center gap-3">
        <button className={buttonBase} onClick={onBack}>
          ⏪ 15s
        </button>
        <button className={primaryButton} onClick={onPlayPause}>
          {playing ? '⏸ Pause' : '▶️ Play'}
        </button>
        <button className={buttonBase} onClick={onForward}>
          15s ⏩
        </button>

        <div className={`flex items-center ${bpmWrapper}`}>
          <label className={bpmLabel}>BPM</label>
          <input
            type="range"
            min={60}
            max={140}
            value={bpm}
            onChange={e => onBpmChange(parseInt(e.target.value))}
            className={isLarge ? "h-2" : undefined}
          />
          <span className={`w-12 text-right ${isLarge ? "text-base" : "text-sm"}`}>{bpm}</span>
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
          className={`w-full ${sliderClass}`.trim()}
        />
        <span className={`${isLarge ? "text-sm" : "text-xs"} tabular-nums`}>
          {position.toFixed(1)} / {duration.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
