'use client';

import React, { useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Grid, GridCell } from '@/lib/types';
import { GridCell3D } from './GridCell3D';
import { useTheme } from 'next-themes';
import { Color } from 'three';

type Props = {
  grid: Grid | null;
  onHoverNote?: (cell: GridCell) => void;
};

export function GridScene({ grid, onHoverNote }: Props) {
  const size = useMemo(() => ({
    w: (grid?.cols ?? 0) * 0.9,
    h: (grid?.rows ?? 0) * 0.9
  }), [grid]);
  const colors = useSceneColors();

  return (
    <Canvas camera={{ position: [size.w * 0.6, 12, size.h * 1.1], fov: 50 }} shadows>
      <SceneBackground color={colors.background} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} castShadow />
      <group position={[-size.w/2, 0, -size.h/2]}>
        <mesh rotation-x={-Math.PI/2} receiveShadow>
          <planeGeometry args={[Math.max(8, size.w+2), Math.max(8, size.h+2)]} />
          <meshStandardMaterial color={colors.floor} />
        </mesh>
        {grid?.cells.map((c, i) => (
          <GridCell3D key={i} cell={c} onHoverNote={onHoverNote} />
        ))}
      </group>
      <OrbitControls enablePan={false} minPolarAngle={Math.PI/4} maxPolarAngle={Math.PI/3} />
    </Canvas>
  );
}

const DEFAULT_SCENE_COLORS = {
  background: '#0b0f15',
  floor: '#111214',
};

function useSceneColors() {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = React.useState(DEFAULT_SCENE_COLORS);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const styles = getComputedStyle(document.documentElement);
    const background = styles.getPropertyValue('--scene-bg').trim() || DEFAULT_SCENE_COLORS.background;
    const floor = styles.getPropertyValue('--scene-floor').trim() || DEFAULT_SCENE_COLORS.floor;
    setColors({ background, floor });
  }, [resolvedTheme]);

  return colors;
}

function SceneBackground({ color }: { color: string }) {
  const { gl, scene } = useThree();

  React.useEffect(() => {
    const next = new Color(color || DEFAULT_SCENE_COLORS.background);
    gl.setClearColor(next);
    scene.background = next;
  }, [color, gl, scene]);

  return null;
}
