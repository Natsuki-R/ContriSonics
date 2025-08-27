'use client';

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Grid, GridCell } from '@/lib/types';
import { GridCell3D } from './GridCell3D';

type Props = {
  grid: Grid | null;
  onHoverNote?: (cell: GridCell) => void;
};

export function GridScene({ grid, onHoverNote }: Props) {
  const size = useMemo(() => ({
    w: (grid?.cols ?? 0) * 0.9,
    h: (grid?.rows ?? 0) * 0.9
  }), [grid]);

  return (
    <Canvas camera={{ position: [size.w * 0.6, 12, size.h * 1.1], fov: 50 }} shadows>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} castShadow />
      <group position={[-size.w/2, 0, -size.h/2]}>
        <mesh rotation-x={-Math.PI/2} receiveShadow>
          <planeGeometry args={[Math.max(8, size.w+2), Math.max(8, size.h+2)]} />
          <meshStandardMaterial color={'#111214'} />
        </mesh>
        {grid?.cells.map((c, i) => (
          <GridCell3D key={i} cell={c} onHoverNote={onHoverNote} />
        ))}
      </group>
      <OrbitControls enablePan={false} minPolarAngle={Math.PI/4} maxPolarAngle={Math.PI/3} />
    </Canvas>
  );
}
