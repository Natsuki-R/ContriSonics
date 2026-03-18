'use client';

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

function SkipBackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 19 2 12 11 5 11 19" />
      <polygon points="22 19 13 12 22 5 22 19" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function SkipForwardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 19 22 12 13 5 13 19" />
      <polygon points="2 19 11 12 2 5 2 19" />
    </svg>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

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
  const iconSize = isLarge ? "h-5 w-5" : "h-4 w-4";
  const playIconSize = isLarge ? "h-6 w-6" : "h-5 w-5";

  const skipBtn = isLarge
    ? "flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium btn-muted transition hover:bg-[var(--color-button-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
    : "flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium btn-muted transition hover:bg-[var(--color-button-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]";

  const playBtn = isLarge
    ? "flex items-center justify-center rounded-full bg-[var(--color-accent)] w-11 h-11 text-[var(--color-accent-foreground)] shadow-md transition hover:brightness-110 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
    : "flex items-center justify-center rounded-full bg-[var(--color-accent)] w-11 h-11 text-[var(--color-accent-foreground)] shadow-md transition hover:brightness-110 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]";

  const bpmLabel = isLarge ? "text-sm font-medium" : "text-xs text-muted";
  const timeText = isLarge ? "text-sm" : "text-xs";

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border border-subtle surface-elevated shadow-sm ${
        isLarge ? "p-4" : "p-3"
      } ${className ?? ""}`.trim()}
    >
      {/* Seek bar */}
      <div className="flex items-center gap-3">
        <span className={`${timeText} tabular-nums text-muted w-10 text-right`}>
          {formatTime(position)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={Math.min(position, duration)}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className={`w-full accent-[var(--color-accent)] ${isLarge ? "h-2" : ""}`.trim()}
        />
        <span className={`${timeText} tabular-nums text-muted w-10`}>
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button className={skipBtn} onClick={onBack} aria-label="Skip back 15 seconds">
          <SkipBackIcon className={iconSize} />
          <span>15s</span>
        </button>

        <button className={playBtn} onClick={onPlayPause} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <PauseIcon className={playIconSize} /> : <PlayIcon className={playIconSize} />}
        </button>

        <button className={skipBtn} onClick={onForward} aria-label="Skip forward 15 seconds">
          <span>15s</span>
          <SkipForwardIcon className={iconSize} />
        </button>

        <div className={`flex items-center ${isLarge ? "ml-0 sm:ml-4 gap-3" : "ml-4 gap-2"}`}>
          <label className={bpmLabel}>BPM</label>
          <input
            type="range"
            min={60}
            max={140}
            value={bpm}
            onChange={e => onBpmChange(parseInt(e.target.value))}
            className={`accent-[var(--color-accent)] ${isLarge ? "h-2" : ""}`.trim()}
          />
          <span className={`w-8 text-right tabular-nums ${isLarge ? "text-base" : "text-sm"}`}>{bpm}</span>
        </div>
      </div>
    </div>
  );
}
