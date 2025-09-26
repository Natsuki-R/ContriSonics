"use client";

import Link from "next/link";
import { HeatmapTooltip } from "@/components/HeatmapTooltip";
import { PointerTracker } from "../PointerTracker";
import { InstrumentSelect } from "@/components/InstrumentSelect";
import { ContributionControls } from "@/components/experience/ContributionControls";
import Transport from "@/components/Transport";
import { Grid2D } from "@/components/Grid2D";
import { useContributionExperience } from "@/components/experience/useContributionExperience";

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
  } = useContributionExperience();

  return (
    <>
      <PointerTracker />
      <HeatmapTooltip />
      <main className="min-h-screen bg-neutral-950 text-white">
        <div className="max-w-6xl mx-auto p-4 flex flex-col gap-6">
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">GitHub 2D Heatmap</h1>
              <p className="opacity-70 text-sm">
                Explore a flat contribution grid with the same musical controls and data sources as the 3D view.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <InstrumentSelect value={instrument} onChange={changeInstrument} />
              <Link
                href="/"
                className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
              >
                ← Back to 3D experience
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

          <section className="rounded-md border border-neutral-800 bg-neutral-900/40">
            <Grid2D grid={grid} onHoverNote={previewCell} />
            <div className="flex items-center gap-2 px-4 pb-4 text-xs text-neutral-400">
              <span>Less</span>
              {GITHUB_PALETTE.map((color) => (
                <span
                  key={color}
                  className="h-3 w-3 rounded-sm border border-neutral-800"
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

          <footer className="opacity-60 text-xs">
            Built with Next.js, Tailwind CSS, and the Web Audio API. © Natsuki.
          </footer>
        </div>
      </main>
    </>
  );
}
