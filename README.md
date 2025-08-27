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
