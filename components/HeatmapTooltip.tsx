'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useHoverStore } from '@/lib/hoverStore';
import { formatContribution, formatDateLong } from '@/lib/format';

export function HeatmapTooltip() {
  const hovered = useHoverStore((s) => s.hovered);
  const cursor = useHoverStore((s) => s.cursor);
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: -9999, top: -9999 });

  useEffect(() => {
    if (!hovered || !cursor) return;
    const PADDING = 12;
    const OFFSET = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = cursor.x + OFFSET;
    let top = cursor.y + OFFSET;
    const boxW = 260;
    const boxH = 56;
    if (left + boxW + PADDING > vw) left = cursor.x - boxW - OFFSET;
    if (top + boxH + PADDING > vh) top = cursor.y - boxH - OFFSET;
    left = Math.max(PADDING, Math.min(vw - boxW - PADDING, left));
    top = Math.max(PADDING, Math.min(vh - boxH - PADDING, top));
    setPos({ left, top });
  }, [hovered, cursor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useHoverStore.getState().setHovered(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!hovered || !cursor) return null;

  const text = `${formatContribution(hovered.count)} on ${formatDateLong(hovered.date)}`;

  return createPortal(
    <div
      role="tooltip"
      aria-hidden={false}
      style={{ position: 'fixed', left: pos.left, top: pos.top, pointerEvents: 'none', zIndex: 50 }}
      className="rounded-md border border-neutral-700 bg-neutral-900/95 px-3 py-2 text-sm text-neutral-100 shadow-xl backdrop-blur"
    >
      {text}
    </div>,
    document.body
  );
}
