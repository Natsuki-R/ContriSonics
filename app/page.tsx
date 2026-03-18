"use client";

import { useState } from "react";

import { GridScene } from "@/components/Grid3D";
import { Grid2D } from "@/components/Grid2D";
import Transport from "@/components/Transport";
import { InstrumentSelect } from "@/components/InstrumentSelect";
import { HeatmapTooltip } from "@/components/HeatmapTooltip";
import { PointerTracker } from "./PointerTracker";
import { useContributionExperience } from "@/components/experience/useContributionExperience";
import { ContributionControls } from "@/components/experience/ContributionControls";
import { MobileFallback } from "@/components/MobileFallback";
import { useMedia } from "@/hooks/useMedia";
import { ModeBar } from "@/components/ModeBar";
import type { ViewMode } from "@/components/ViewToggle";

const GITHUB_PALETTE = [
  "#161b22",
  "#0e4429",
  "#006d32",
  "#26a641",
  "#39d353",
];

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("2d");
  const {
    tab,
    setTab,
    username,
    setUsername,
    from,
    setFrom,
    to,
    setTo,
    grid,
    loading,
    error,
    loadFromGithub,
    handleUploadGrid,
    playing,
    togglePlay,
    position,
    duration,
    bpm,
    setBpm,
    seekTo,
    skipBy,
    instrument,
    changeInstrument,
    previewCell,
    activeCell,
  } = useContributionExperience();

  return (
    <>
      <PointerTracker />
      <HeatmapTooltip />
      <main className="mx-auto flex max-w-6xl flex-col gap-4 p-4 text-[var(--color-text)]">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">ContriSonics</h1>
            <p className="text-sm text-muted">GitHub contributions → music.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <ModeBar
              sourceTab={tab}
              onSourceTabChange={setTab}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <InstrumentSelect value={instrument} onChange={changeInstrument} />
          </div>
        </header>

        <ContributionControls
          tab={tab}
          username={username}
          onUsernameChange={setUsername}
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          onLoadGithub={loadFromGithub}
          loading={loading}
          error={error}
          onUpload={handleUploadGrid}
        />

        <section className="overflow-hidden rounded-md border border-subtle surface-elevated">
          {viewMode === "3d" ? (
            grid ? (
              <div className="mx-auto w-[min(1200px,95vw)] h-[min(50vh,480px)]">
                <GridScene grid={grid} onHoverNote={previewCell} />
              </div>
            ) : (
              <div className="p-6 text-muted">No grid loaded yet.</div>
            )
          ) : (
            <>
              <Grid2D grid={grid} onHoverNote={previewCell} activeCell={activeCell} />
              <div className="flex items-center gap-2 px-4 pb-4 text-xs text-muted">
                <span>Less</span>
                {GITHUB_PALETTE.map((color) => (
                  <span
                    key={color}
                    className="h-3 w-3 rounded-sm border border-subtle"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                ))}
                <span>More</span>
              </div>
            </>
          )}
        </section>

        <Transport
          playing={playing}
          onPlayPause={togglePlay}
          onBack={() => skipBy(-15)}
          onForward={() => skipBy(15)}
          position={Math.min(position, duration)}
          duration={duration}
          onSeek={seekTo}
          bpm={bpm}
          onBpmChange={setBpm}
        />

        <footer className="text-xs text-muted">
          Built with Next.js, react-three-fiber, and the Web Audio API. © Natsuki.
        </footer>
      </main>
    </>
  );
}

export default function Page() {
  const media = useMedia();

  if (!media.ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-muted">
        Loading experience…
      </main>
    );
  }

  if (media.isMobile) {
    return <MobileFallback />;
  }

  return <App />;
}
