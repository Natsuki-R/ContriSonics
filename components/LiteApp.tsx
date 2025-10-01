"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import {
  AdaptiveDpr,
  OrbitControls,
  PerformanceMonitor,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls";
import { Color } from "three";

import { ContributionControls } from "@/components/experience/ContributionControls";
import { useContributionExperience } from "@/components/experience/useContributionExperience";
import Transport from "@/components/Transport";
import { InstrumentSelect } from "@/components/InstrumentSelect";
import type { Grid, GridCell } from "@/lib/types";
import { formatContribution, formatDateLong } from "@/lib/format";

export function LiteApp() {
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

  const [quality, setQuality] = useState<"high" | "low">("high");
  const [previewedCell, setPreviewedCell] = useState<GridCell | null>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    setPreviewedCell(null);
  }, [grid]);

  const cameraPosition = useMemo(() => {
    const cols = grid?.cols ?? 28;
    const rows = grid?.rows ?? 7;
    const span = Math.max(cols, rows) * 0.6;
    return [span + 8, Math.max(10, span + 4), span * 1.2 + 6] as [number, number, number];
  }, [grid]);

  const currentCell = previewedCell ?? activeCell;

  const activeSummary = currentCell
    ? `${formatContribution(currentCell.count)} on ${formatDateLong(currentCell.date)}`
    : "Tap a column to preview its sound.";

  const handleSelectCell = (cell: GridCell) => {
    if (cell.count <= 0) return;
    setPreviewedCell(cell);
    previewCell(cell);
  };

  const handleResetView = () => {
    controlsRef.current?.reset();
    controlsRef.current?.update();
  };

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-neutral-950 px-5 py-6 text-neutral-100">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">ContriSonics Lite</h1>
        <p className="text-base text-neutral-400">
          Streamlined tablet mode with adaptive quality controls.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <InstrumentSelect value={instrument} onChange={changeInstrument} size="lg" />
          <Link
            href="/heatmap"
            className="rounded-full bg-blue-600 px-5 py-3 text-base font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
          >
            Open 2D Heatmap
          </Link>
        </div>

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
          variant="touch"
        />

        <div className="space-y-3">
          <div className="mx-auto w-[min(1200px,95vw)] aspect-[16/9] overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/80">
            {grid ? (
              <Canvas
                camera={{ position: cameraPosition, fov: 55 }}
                dpr={[1, 2]}
                onCreated={({ gl }) => {
                  if (typeof window !== "undefined") {
                    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                  }
                }}
              >
                <VisibilityController />
                <AdaptiveDpr pixelated />
                <PerformanceMonitor
                  onDecline={() => setQuality("low")}
                  onIncline={() => setQuality("high")}
                />
                <LiteScene
                  grid={grid}
                  onSelectCell={handleSelectCell}
                  quality={quality}
                  controlsRef={controlsRef}
                />
              </Canvas>
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-neutral-500">
                Load a contribution grid to explore it in 3D.
              </div>
            )}
          </div>

          <div className="text-center text-sm text-neutral-300">{activeSummary}</div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleResetView}
              className="rounded-full bg-neutral-200 px-6 py-3 text-base font-medium text-neutral-900 shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              Reset View
            </button>
          </div>
        </div>

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
          size="lg"
        />
      </div>

      <footer className="pt-6 text-sm text-neutral-500">
        Optimized for tablets. Switch to desktop for shadows and the full 3D treatment.
      </footer>
    </div>
  );
}

function LiteScene({
  grid,
  onSelectCell,
  quality,
  controlsRef,
}: {
  grid: Grid;
  onSelectCell: (cell: GridCell) => void;
  quality: "high" | "low";
  controlsRef: React.RefObject<OrbitControlsImpl>;
}) {
  const spacing = quality === "high" ? 0.82 : 0.95;
  const heightScale = quality === "high" ? 0.32 : 0.24;
  const { cols, rows } = grid;
  const offset = useMemo(
    () => ({
      x: -(cols * spacing) / 2,
      z: -(rows * spacing) / 2,
    }),
    [cols, rows, spacing]
  );

  return (
    <group>
      <color attach="background" args={["#050506"]} />
      <hemisphereLight args={["#f8fafc", "#0f172a", 0.85]} />
      <directionalLight position={[10, 12, 6]} intensity={0.65} />
      <group position={[offset.x, 0, offset.z]}>
        <mesh rotation-x={-Math.PI / 2}>
          <planeGeometry args={[Math.max(12, cols * spacing + 4), Math.max(12, rows * spacing + 4)]} />
          <meshStandardMaterial color="#111217" />
        </mesh>
        {grid.cells.map((cell) => (
          <LiteColumn
            key={`${cell.row}-${cell.col}`}
            cell={cell}
            spacing={spacing}
            heightScale={heightScale}
            onSelect={onSelectCell}
          />
        ))}
      </group>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.3}
      />
    </group>
  );
}

function LiteColumn({
  cell,
  spacing,
  heightScale,
  onSelect,
}: {
  cell: GridCell;
  spacing: number;
  heightScale: number;
  onSelect: (cell: GridCell) => void;
}) {
  const height = 0.18 + cell.intensity * heightScale;
  const color = new Color(cell.colorHex ?? "#2ea043");
  const emissive = color.clone().multiplyScalar(0.18 + cell.intensity * 0.12);

  const handleInteract = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (cell.count <= 0) return;
    onSelect(cell);
  };

  return (
    <mesh
      position={[cell.col * spacing, height / 2, cell.row * spacing]}
      onPointerDown={handleInteract}
      onPointerEnter={handleInteract}
      onFocus={(event) => {
        if (cell.count <= 0) return;
        event.stopPropagation();
        onSelect(cell);
      }}
      tabIndex={cell.count > 0 ? 0 : -1}
    >
      <boxGeometry args={[spacing * 0.7, height, spacing * 0.7]} />
      <meshStandardMaterial color={color} emissive={emissive} flatShading />
    </mesh>
  );
}

function VisibilityController() {
  const setFrameloop = useThree((state) => state.setFrameloop);

  useEffect(() => {
    const handleVisibility = () => {
      setFrameloop(document.hidden ? "never" : "always");
    };
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [setFrameloop]);

  return null;
}
