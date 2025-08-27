'use client';

import { useEffect } from 'react';
import { useHoverStore } from '@/lib/hoverStore';

export function PointerTracker() {
  const setCursor = useHoverStore((s) => s.setCursor);

  useEffect(() => {
    const h = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h, { passive: true });
    return () => window.removeEventListener('mousemove', h);
  }, [setCursor]);

  return null;
}
