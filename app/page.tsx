"use client";

import Link from "next/link";

import { GridScene } from "@/components/Grid3D";
import Transport from "@/components/Transport";
import { InstrumentSelect } from "@/components/InstrumentSelect";
import { HeatmapTooltip } from "@/components/HeatmapTooltip";
import { PointerTracker } from "./PointerTracker";
import { useContributionExperience } from "@/components/experience/useContributionExperience";
import { ContributionControls } from "@/components/experience/ContributionControls";
import { LiteApp } from "@/components/LiteApp";
import { MobileFallback } from "@/components/MobileFallback";
import { useMedia } from "@/hooks/useMedia";
import { ThemeToggle } from "@/components/ThemeToggle";

function DesktopApp() {
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
      <main className="mx-auto flex max-w-6xl flex-col gap-4 p-4 text-[var(--color-text)]">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">ContriSonics</h1>
            <p className="text-sm text-muted">3D GitHub contributions → music.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <InstrumentSelect value={instrument} onChange={changeInstrument} />
            <Link
              href="/heatmap"
              className="rounded-full bg-[var(--color-button)] px-3 py-1 text-sm font-medium transition hover:bg-[var(--color-button-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
            >
              2D Heatmap
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

        <section className="overflow-hidden rounded-md border border-subtle surface-elevated">
          {grid ? (
            <div className="mx-auto w-[min(1200px,95vw)] aspect-[16/9]">
              <GridScene grid={grid} onHoverNote={previewCell} />
            </div>
          ) : (
            <div className="p-6 text-muted">No grid loaded yet.</div>
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

  if (media.isTablet) {
    return <LiteApp />;
  }

  return <DesktopApp />;
}
