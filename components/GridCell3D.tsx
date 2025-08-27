'use client';

import { useRef } from 'react';
import { Mesh, Vector3 } from 'three';
import * as THREE from 'three';
import { ThreeEvent, useThree } from '@react-three/fiber';
import { useHoverStore } from '@/lib/hoverStore';
import type { GridCell } from '@/lib/types';

type Props = {
  cell: GridCell;
  onHoverNote?: (cell: GridCell) => void;
};

export function GridCell3D({ cell, onHoverNote }: Props) {
  const ref = useRef<Mesh>(null!);
  const setHovered = useHoverStore((s) => s.setHovered);
  const setCursor = useHoverStore((s) => s.setCursor);
  const { camera, size } = useThree();

  const height = 0.2 + cell.intensity * 0.35;
  const color = new THREE.Color(cell.colorHex || '#2ea043');
  const emissive = color.clone().multiplyScalar(0.25 + cell.intensity * 0.15);
  const posX = cell.col * 0.9;
  const posZ = cell.row * 0.9;

  const valid = cell.count > 0;

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (valid) setHovered(cell);
    onHoverNote?.(cell);
  };

  const handlePointerOut = () => setHovered(null);

  const handleFocus = () => {
    if (!valid) return;
    setHovered(cell);
    const v = new Vector3();
    ref.current.getWorldPosition(v);
    v.project(camera);
    const x = (v.x * 0.5 + 0.5) * size.width;
    const y = (-v.y * 0.5 + 0.5) * size.height;
    setCursor({ x, y });
  };

  const handleBlur = () => setHovered(null);

  return (
    <mesh
      ref={ref}
      position={[posX, height / 2, posZ]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
      userData={{ cell }}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.8, height, 0.8]} />
      <meshStandardMaterial color={color} emissive={emissive} />
    </mesh>
  );
}
