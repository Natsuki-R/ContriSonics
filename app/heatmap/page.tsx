"use client";

import Link from "next/link";
import { HeatmapTooltip } from "@/components/HeatmapTooltip";
import { PointerTracker } from "../PointerTracker";
import { InstrumentSelect } from "@/components/InstrumentSelect";
import { ContributionControls } from "@/components/experience/ContributionControls";
import Transport from "@/components/Transport";
import { Grid2D } from "@/components/Grid2D";
import { useContributionExperience } from "@/components/experience/useContributionExperience";
import { ThemeToggle } from "@/components/ThemeToggle";

const GITHUB_PALETTE = [
  "#161b22",
  "#0e4429",
  "#006d32",
  "#26a641",
  "#39d353",
];

export default function HeatmapPage() {
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
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">GitHub 2D Heatmap</h1>
              <p className="text-sm text-muted">
                Explore a flat contribution grid with the same musical controls and data sources as the 3D view.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <InstrumentSelect value={instrument} onChange={changeInstrument} />
              <Link
                href="/"
                className="rounded-full bg-[var(--color-button)] px-3 py-1 text-sm font-medium transition hover:bg-[var(--color-button-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
              >
                ← Back to 3D experience
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <ContributionControls
            tab={tab}
            onTabChange={setTab}
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

          <section className="rounded-md border border-subtle surface-elevated">
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
            Built with Next.js, Tailwind CSS, and the Web Audio API. © Natsuki.
          </footer>
        </div>
      </main>
    </>
  );
}
