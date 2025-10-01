"use client";

import Link from "next/link";
import { GridScene } from "@/components/Grid3D";
import Transport from "@/components/Transport";
import { InstrumentSelect } from "@/components/InstrumentSelect";
import { HeatmapTooltip } from "@/components/HeatmapTooltip";
import { PointerTracker } from "./PointerTracker";
import { useContributionExperience } from "@/components/experience/useContributionExperience";
import { ContributionControls } from "@/components/experience/ContributionControls";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Page() {
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
  } = useContributionExperience();

  return (
    <>
      <PointerTracker />
      <HeatmapTooltip />
      <main className="max-w-6xl mx-auto flex flex-col gap-5 p-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">ContriSonics</h1>
            <p className="text-sm text-[color:var(--color-muted)]">3D GitHub contributions → music.</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ThemeToggle />
            <InstrumentSelect value={instrument} onChange={changeInstrument} />
            <Link
              href="/heatmap"
              className="focus-ring inline-flex items-center rounded-md border border-[color:var(--color-border)] bg-[var(--color-button-bg)] px-3 py-1.5 text-sm font-medium text-[color:var(--color-button-text)] transition-colors hover:bg-[var(--color-button-hover)]"
            >
              2D Heatmap
            </Link>
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

        <section className="h-[520px] overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[var(--color-card)]">
          {grid ? (
            <GridScene grid={grid} onHoverNote={previewCell} />
          ) : (
            <div className="p-6 text-[color:var(--color-muted)]">No grid loaded yet.</div>
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

        <footer className="text-xs text-[color:var(--color-muted)]">
          Built with Next.js, react-three-fiber, and the Web Audio API. © Natsuki.
        </footer>
      </main>
    </>
  );
}
