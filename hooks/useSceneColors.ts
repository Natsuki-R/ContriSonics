const SCENE_COLORS = {
  background: "#f7f9fb",
  plane: "#d9e2f1",
} as const;

export function useSceneColors() {
  return SCENE_COLORS;
}
