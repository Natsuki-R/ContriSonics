# ContriSonics (MVP)

Turn your GitHub contributions heatmap into a 3D, playable music score.

## Quick start

```bash
npm i
cp .env.local.example .env.local  # add a GitHub token (no repo scopes needed)
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

- Import this repo in Vercel.
- Add an environment variable `GITHUB_TOKEN` (no scopes necessary; used for GraphQL rate limits).

## Features

- Fetch contributions by GitHub username & date range (GraphQL).
- 3D heatmap with react-three-fiber.
- Web Audio engine (oscillator-based) with Play/Pause/Seek and hover preview.
- ±15s skip, BPM control, Scale/Key selection.
- Screenshot upload parses GitHub heatmap screenshots into a 7×53 contribution grid.

## Folders

- `app/` Next.js App Router pages and API routes.
- `components/` UI & 3D components.
- `lib/` audio engine, mapping, and contributions fetch helpers.

## Theme system

- Light/Dark/System themes are managed by a lightweight `next-themes`-compatible provider (`lib/theme/next-themes.tsx`) which persists the user's choice to `localStorage` and defaults to the OS preference. A tiny inline script ensures the correct class is applied before hydration to avoid flashes.
- Color tokens are defined once in `app/globals.css` via CSS custom properties (e.g. `--color-bg`, `--scene-bg`). Components reference these variables directly or through helper utility classes to stay in sync with the current theme.
- The global `<ThemeToggle />` component (top-right on every layout, tablet, and mobile fallback view) lets users pick Light, Dark, or System modes and is fully keyboard accessible.
- Three.js canvases consume the same variables through the `useSceneColors` hook so the 3D clear color and ground plane update instantly with the selected theme.
- Key UI surfaces were refreshed for contrast in both themes, including `InstrumentSelect`, `ContributionControls`, `Transport`, `Grid2D`, `HeatmapTooltip`, `LiteApp`, `MobileFallback`, and `Uploader`.
- To add new themed components, prefer the existing CSS variables or the helper classes defined in `globals.css`. Access the current theme in React via `useTheme()` and the resolved scene colors via `useSceneColors()` when working with WebGL content.
