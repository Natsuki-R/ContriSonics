"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { GridScene } from "@/components/Grid3D";
import Transport from "@/components/Transport";
import Uploader from "@/components/Uploader";
import { fetchContributionGrid } from "@/lib/contrib";
import { mapGridToMusic } from "@/lib/mapping";
import type { Grid, GridCell } from "@/lib/types";
import { AudioEngine } from "@/lib/audio";
import { format, subDays } from "date-fns";

type Tab = "github" | "upload";

export default function Page() {
  const [tab, setTab] = useState<Tab>("github");
  const [username, setUsername] = useState<string>("octocat");
  const [from, setFrom] = useState<string>(
    format(subDays(new Date(), 365), "yyyy-MM-dd")
  );
  const [to, setTo] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [grid, setGrid] = useState<Grid | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const engineRef = useRef<AudioEngine | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [bpm, setBpm] = useState(90);

  // init audio engine
  useEffect(() => {
    engineRef.current = new AudioEngine();
    const id = setInterval(() => {
      const e = engineRef.current!;
      setPos(e.getPositionSec());
    }, 100);
    return () => clearInterval(id);
  }, []);

  // load data
  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const g = await fetchContributionGrid({
        username,
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString(),
      });
      const mapped = mapGridToMusic(g, { bpm });
      setGrid(mapped);
      const e = engineRef.current!;
      e.setBpm(bpm);
      e.attachGrid(mapped);
      e.prepareScheduleFromGrid();
      setPos(0);
      setPlaying(false);
    } catch (e: any) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* initial */
  }, []);

  // keep BPM in engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setBpm(bpm);
      if (grid) {
        engineRef.current.attachGrid(grid);
        engineRef.current.prepareScheduleFromGrid();
      }
    }
  }, [bpm]);

  const duration = useMemo(
    () => engineRef.current?.getTotalDurationSec() ?? 0,
    [grid, bpm]
  );

  const togglePlay = () => {
    const e = engineRef.current!;
    if (!playing) {
      e.play();
      setPlaying(true);
    } else {
      e.pause();
      setPlaying(false);
    }
  };

  const onHoverNote = (cell: GridCell) => {
    const e = engineRef.current!;
    // map semitone to freq (baseHz is in engine)
    const base = e.baseHz;
    const freq = base * Math.pow(2, cell.noteIndex / 12);
    e.preview(freq, cell.velocity, Math.max(0.12, cell.duration));
  };

  return (
    <main className="max-w-6xl mx-auto p-4 flex flex-col gap-4">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">ContriSonics</h1>
          <p className="opacity-70 text-sm">3D GitHub contributions → music.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded ${
              tab === "github"
                ? "bg-blue-600"
                : "bg-neutral-800 hover:bg-neutral-700"
            }`}
            onClick={() => setTab("github")}
          >
            GitHub
          </button>
          <button
            className={`px-3 py-1 rounded ${
              tab === "upload"
                ? "bg-blue-600"
                : "bg-neutral-800 hover:bg-neutral-700"
            }`}
            onClick={() => setTab("upload")}
          >
            Upload
          </button>
        </div>
      </header>

      {tab === "github" && (
        <section className="flex flex-col gap-3 p-3 border border-neutral-800 rounded-md">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="text-xs opacity-70">GitHub username</label>
              <input
                className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="octocat"
              />
            </div>
            <div>
              <label className="text-xs opacity-70">From</label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs opacity-70">To</label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
              onClick={load}
              disabled={loading}
            >
              {loading ? "Loading…" : "Load contributions"}
            </button>
            {err && <span className="text-red-400 text-sm">{err}</span>}
          </div>
        </section>
      )}

      {tab === "upload" && (
        <section className="flex flex-col gap-3">
          <Uploader
            onGridLoaded={(g) => {
              const mapped = mapGridToMusic(g, { bpm });
              setGrid(mapped);
              const e = engineRef.current!;
              e.setBpm(bpm);
              e.attachGrid(mapped);
              e.prepareScheduleFromGrid();
              setPos(0);
              setPlaying(false);
            }}
          />
        </section>
      )}

      <section className="h-[520px] rounded-md overflow-hidden border border-neutral-800">
        {grid ? (
          <GridScene grid={grid} onHoverNote={onHoverNote} />
        ) : (
          <div className="p-6 opacity-70">No grid loaded yet.</div>
        )}
      </section>

      <Transport
        playing={playing}
        onPlayPause={togglePlay}
        onBack={() => engineRef.current?.skip(-15)}
        onForward={() => engineRef.current?.skip(15)}
        position={Math.min(pos, duration)}
        duration={duration}
        onSeek={(s) => engineRef.current?.seekTo(s)}
        bpm={bpm}
        onBpmChange={setBpm}
      />

      <footer className="opacity-60 text-xs">
        Built with Next.js, react-three-fiber, and the Web Audio API. © Natsuki.
      </footer>
    </main>
  );
}
