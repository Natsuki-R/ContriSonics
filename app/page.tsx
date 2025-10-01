"use client";

import Link from "next/link";
import { GridScene } from "@/components/Grid3D";
import Transport from "@/components/Transport";
import { InstrumentSelect } from "@/components/InstrumentSelect";
import { HeatmapTooltip } from "@/components/HeatmapTooltip";
import { PointerTracker } from "./PointerTracker";
import { useContributionExperience } from "@/components/experience/useContributionExperience";
import { ContributionControls } from "@/components/experience/ContributionControls";

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
      <main className="max-w-6xl mx-auto p-4 flex flex-col gap-4">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">ContriSonics</h1>
            <p className="opacity-70 text-sm">3D GitHub contributions → music.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <InstrumentSelect value={instrument} onChange={changeInstrument} />
            <Link
              href="/heatmap"
              className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
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

        <section className="h-[520px] rounded-md overflow-hidden border border-neutral-800">
          {grid ? (
            <GridScene grid={grid} onHoverNote={previewCell} />
          ) : (
            <div className="p-6 opacity-70">No grid loaded yet.</div>
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

        <footer className="opacity-60 text-xs">
          Built with Next.js, react-three-fiber, and the Web Audio API. © Natsuki.
        </footer>
      </main>
    </>
  );
}
