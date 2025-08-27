'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Grid, GridCell } from '@/lib/types';

type Props = {
  grid: Grid | null;
  onHoverNote?: (cell: GridCell) => void;
};

function CellBox({ cell, onHoverNote }: { cell: GridCell, onHoverNote?: (c: GridCell)=>void }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const height = 0.2 + (cell.intensity * 0.35);
  const color = new THREE.Color(cell.color || '#2ea043');
  const emissive = color.clone().multiplyScalar(0.25 + cell.intensity * 0.15);
  const posX = cell.col * 0.9;
  const posZ = cell.row * 0.9;

  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHoverNote?.(cell);
  };

  return (
    <mesh
      ref={meshRef}
      position={[posX, height/2, posZ]}
      onPointerOver={onPointerOver}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.8, height, 0.8]} />
      <meshStandardMaterial color={color} emissive={emissive} />
    </mesh>
  );
}

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
          <CellBox key={i} cell={c} onHoverNote={onHoverNote} />
        ))}
      </group>
      <OrbitControls enablePan={false} minPolarAngle={Math.PI/4} maxPolarAngle={Math.PI/3} />
    </Canvas>
  );
}
