"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AudioEngine } from "@/lib/audio";
import { fetchContributionGrid } from "@/lib/contrib";
import { mapGridToMusic } from "@/lib/mapping";
import type { Grid, GridCell } from "@/lib/types";
import { format, subDays } from "date-fns";
import type { InstrumentId } from "@/lib/instruments";
import { getInstrumentFromUrl, setInstrumentInUrl } from "@/lib/state/urlParams";

export type ExperienceTab = "github" | "upload";

export function useContributionExperience() {
  const [tab, setTab] = useState<ExperienceTab>("github");
  const [username, setUsername] = useState<string>("octocat");
  const [from, setFrom] = useState<string>(
    format(subDays(new Date(), 365), "yyyy-MM-dd")
  );
  const [to, setTo] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [grid, setGrid] = useState<Grid | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const engineRef = useRef<AudioEngine | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [bpm, setBpm] = useState(90);
  const [instrument, setInstrument] = useState<InstrumentId>("piano");
  const [activeCell, setActiveCell] = useState<GridCell | null>(null);

  useEffect(() => {
    engineRef.current = new AudioEngine();
    const engine = engineRef.current;

    const initialInstrument = (() => {
      if (typeof window === "undefined") return "piano" as InstrumentId;
      const urlInst = getInstrumentFromUrl();
      const stored = localStorage.getItem("instrument") as InstrumentId | null;
      return urlInst || stored || "piano";
    })();

    setInstrument(initialInstrument);
    if (typeof window !== "undefined") {
      setInstrumentInUrl(initialInstrument);
    }
    void engine?.setInstrument(initialInstrument);
    engine?.setActiveCellListener((cell) => {
      setActiveCell(cell);
    });

    const timer = window.setInterval(() => {
      const eng = engineRef.current;
      if (eng) {
        setPosition(eng.getPositionSec());
      }
    }, 100);

    return () => {
      window.clearInterval(timer);
      if (engineRef.current) {
        engineRef.current.setActiveCellListener(null);
        engineRef.current.pause();
      }
    };
  }, []);

  const applyGrid = useCallback(
    (source: Grid) => {
      const mapped = mapGridToMusic(source, { bpm });
      setGrid(mapped);
      const engine = engineRef.current;
      if (engine) {
        engine.setBpm(bpm);
        engine.attachGrid(mapped);
        engine.prepareScheduleFromGrid();
        engine.stop();
      }
      setPosition(0);
      setPlaying(false);
      setActiveCell(null);
    },
    [bpm]
  );

  const loadFromGithub = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchContributionGrid({
        username,
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString(),
      });
      applyGrid(data);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [username, from, to, applyGrid]);

  const handleUploadGrid = useCallback(
    (uploaded: Grid) => {
      applyGrid(uploaded);
    },
    [applyGrid]
  );

  useEffect(() => {
    void loadFromGithub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (engine) {
      engine.setBpm(bpm);
      if (grid) {
        engine.attachGrid(grid);
        engine.prepareScheduleFromGrid();
      }
    }
  }, [bpm, grid]);

  const duration = useMemo(
    () => engineRef.current?.getTotalDurationSec() ?? 0,
    [grid, bpm]
  );

  const togglePlay = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (!playing) {
      engine.play();
      setPlaying(true);
    } else {
      engine.pause();
      setPlaying(false);
    }
  }, [playing]);

  const previewCell = useCallback((cell: GridCell) => {
    const engine = engineRef.current;
    if (!engine) return;
    const base = engine.baseHz;
    const freq = base * Math.pow(2, cell.noteIndex / 12);
    engine.preview(freq, cell.velocity, Math.max(0.12, cell.duration));
  }, []);

  const changeInstrument = useCallback(async (id: InstrumentId) => {
    setInstrument(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("instrument", id);
      setInstrumentInUrl(id);
    }
    await engineRef.current?.setInstrument(id);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.seekTo(seconds);
    setPosition(engine.getPositionSec());
  }, []);

  const skipBy = useCallback((seconds: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.skip(seconds);
    setPosition(engine.getPositionSec());
  }, []);

  return {
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
  } as const;
}
