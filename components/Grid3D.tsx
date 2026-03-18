'use client';

import { useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Color } from 'three';
import type { Grid, GridCell } from '@/lib/types';
import { GridCell3D } from './GridCell3D';
import { useSceneColors } from '@/hooks/useSceneColors';

type Props = {
  grid: Grid | null;
  onHoverNote?: (cell: GridCell) => void;
};

export function GridScene({ grid, onHoverNote }: Props) {
  const sceneColors = useSceneColors();

  const size = useMemo(() => {
    const cols = grid?.cols ?? 0;
    const rows = grid?.rows ?? 0;
    return {
      w: cols * 0.9,
      h: rows * 0.9,
      cx: ((cols - 1) * 0.9) / 2,
      cz: ((rows - 1) * 0.9) / 2,
    };
  }, [grid]);

  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [size.w * 0.6, 12, size.h * 1.1], fov: 50 }}
      shadows
      onCreated={({ gl }) => {
        if (typeof window !== 'undefined') {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
      }}
    >
      <SceneColorController color={sceneColors.background} />
      <VisibilityController />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} castShadow />
      <group position={[-size.cx, 0, -size.cz]}>
        <mesh position={[size.cx, -0.01, size.cz]} rotation-x={-Math.PI/2} receiveShadow>
          <planeGeometry args={[Math.max(8, size.w+2), Math.max(8, size.h+2)]} />
          <meshStandardMaterial color={sceneColors.plane} />
        </mesh>
        {grid?.cells.map((c, i) => (
          <GridCell3D key={i} cell={c} onHoverNote={onHoverNote} />
        ))}
      </group>
      <OrbitControls enablePan={false} minPolarAngle={Math.PI/4} maxPolarAngle={Math.PI/3} />
    </Canvas>
  );
}

function VisibilityController() {
  const setFrameloop = useThree((state) => state.setFrameloop);

  useEffect(() => {
    const handle = () => {
      setFrameloop(document.hidden ? 'never' : 'always');
    };
    handle();
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, [setFrameloop]);

  return null;
}

function SceneColorController({ color }: { color: string }) {
  const { gl, scene } = useThree();

  useEffect(() => {
    const resolved = new Color(color);
    gl.setClearColor(resolved);
    scene.background = resolved;
  }, [color, gl, scene]);

  return null;
}
