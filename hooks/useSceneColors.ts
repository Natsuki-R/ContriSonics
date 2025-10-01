"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

type SceneColors = {
  background: string;
  plane: string;
};

const LIGHT_FALLBACK: SceneColors = {
  background: "#f7f9fb",
  plane: "#d9e2f1",
};

const DARK_FALLBACK: SceneColors = {
  background: "#0b0f15",
  plane: "#111214",
};

export function useSceneColors(): SceneColors {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<SceneColors>(
    resolvedTheme === "dark" ? DARK_FALLBACK : LIGHT_FALLBACK
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const styles = getComputedStyle(document.documentElement);
    const background = styles.getPropertyValue("--scene-bg").trim();
    const plane = styles.getPropertyValue("--scene-grid").trim();
    const fallback = resolvedTheme === "dark" ? DARK_FALLBACK : LIGHT_FALLBACK;
    setColors({
      background: background || fallback.background,
      plane: plane || fallback.plane,
    });
  }, [resolvedTheme]);

  return colors;
}
