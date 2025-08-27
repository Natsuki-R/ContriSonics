import { create } from 'zustand';
import type { GridCell } from './types';

type HoverState = {
  hovered: GridCell | null;
  cursor: { x: number; y: number } | null;
  setHovered: (c: GridCell | null) => void;
  setCursor: (p: { x: number; y: number }) => void;
};

export const useHoverStore = create<HoverState>((set) => ({
  hovered: null,
  cursor: null,
  setHovered: (hovered) => set({ hovered }),
  setCursor: (cursor) => set({ cursor }),
}));
