# ContriSonics — Agent Build Plan

> Step-by-step instructions for an AI agent to finish this project.
> Each task is self-contained. Complete one before starting the next.
> Every task includes **test rules** so the agent can self-verify before moving on.

---

## Pre-flight

Before starting any task:

```bash
npm i            # ensure deps are installed
npm run build    # must pass — do NOT break the build at any step
npm run lint     # must pass
```

**Global rules that apply to EVERY task:**

- After completing each task, run `npm run build && npm run lint`. Both must pass.
- Do not delete or rename existing exports — other files may import them.
- Preserve all existing functionality; never regress a working feature.
- Keep changes minimal and focused — one concern per task.
- Use the existing CSS variable / theme system (`globals.css`) for any new UI.
- All new UI must work in both light and dark themes.
- Do not add new npm dependencies unless the task explicitly says to.
- Commit after each task with a descriptive message.

---

## Phase 1 — Audio Engine Completeness

### Task 1: Implement multi-voice unison & detune

**File:** `lib/audio.ts` — `playSynth()` method

**What:** The instrument recipes define `voices` and `detuneCents` but `playSynth()` only creates a single oscillator. Implement unison voices with detuning.

**How:**
1. Read `recipe.voices` (default 1) and `recipe.detuneCents` (default 0).
2. In `playSynth()`, create `voices` oscillators instead of one.
3. Spread detune evenly: oscillator `i` gets `detune = (i - (voices-1)/2) * detuneCents` cents.
4. Each oscillator shares the same gain envelope but divide velocity by `Math.sqrt(voices)` to keep volume consistent.
5. Connect all oscillators through the same gain node.
6. Track all oscillators for cleanup.

**Test rules:**
- `npm run build && npm run lint` passes.
- Open the app, select "Metal" instrument (sawtooth, 6 voices), play a contribution grid. Sound should be noticeably thicker/wider than before.
- Select "Piano" (sampler) — should still work unchanged (sampler path is unaffected).
- Select "Organ" (8 voices, square) — should sound full, organ-like.
- No audio glitches, clicks, or sudden volume spikes.

---

### Task 2: Implement filter support in synth

**File:** `lib/audio.ts` — `playSynth()` method

**What:** Recipes define `filter: { type, cutoffHz, q }` but it's never applied. Add a BiquadFilterNode to the synth signal chain.

**How:**
1. After creating oscillators and the gain node, check if `recipe.filter` exists.
2. If yes, create a `BiquadFilterNode`, set `.type`, `.frequency.value = cutoffHz`, `.Q.value = q ?? 1`.
3. Route: oscillators → filter → gain → instrumentGain + reverbGain.
4. If no filter, keep current routing (oscillators → gain → instrumentGain + reverbGain).

**Test rules:**
- `npm run build && npm run lint` passes.
- Metal (lowpass 3800Hz) should sound less harsh/bright than raw sawtooth.
- Synth Pad (lowpass 2200Hz) should sound muffled/warm.
- Organ (lowpass 5200Hz) should sound slightly smoothed.
- Instruments without filter (none currently, but future-proof) still work.

---

### Task 3: Initialize the reverb ConvolverNode

**File:** `lib/audio.ts` — constructor or a new `initReverb()` method

**What:** `this.reverb` is always `null`. The `reverbGain` connects to `this.reverb ?? this.master` which always falls back to master, making `reverbSend` meaningless.

**How:**
1. Generate a synthetic impulse response in the constructor (no external file needed).
   - Create an `OfflineAudioContext` (2 channels, `sampleRate * 2` frames, sampleRate).
   - Fill with exponentially decaying white noise (~1.5–2s tail).
   - Use the resulting buffer for a `ConvolverNode`.
2. Set `this.reverb = convolverNode`.
3. Connect: `this.reverbGain → this.reverb → this.master`.
4. Keep `this.reverb.normalize = true`.

**Test rules:**
- `npm run build && npm run lint` passes.
- Play any instrument — there should be an audible reverb tail after notes end.
- Synth Pad (`reverbSend: 0.35`) should have the most reverb.
- Metal (`reverbSend: 0.15`) should have subtle reverb.
- Verify no "infinite reverb" or feedback loops — sound should decay to silence.

---

### Task 4: Add free piano samples to the repo

**What:** Piano is the default instrument but samples are missing. The sampler falls back to synth silently.

**How:**
1. Add dependency: `npm i --save-dev @nickvdberg/piano-samples` or similar MIT-licensed piano sample pack. **Alternatively**, generate 3 synthetic piano-like samples using OfflineAudioContext (same technique as reverb IR but with harmonic content + decay) and write them to `public/samples/piano/`.
2. The simplest approach: use the existing synth engine to render C4, E4, G4 as short audio files at build time OR keep the synth fallback but make it sound more piano-like by adjusting the Piano instrument recipe to use `type: "synth"` with a piano-like envelope: fast attack (0.005), moderate decay (0.3), low sustain (0.2), long release (0.8), triangle wave.
3. Update `lib/instruments.ts` if changing the piano definition.

**Recommended approach:** Convert piano from `sampler` to `synth` type with a piano-like recipe. This avoids needing binary sample files in the repo entirely.

**Test rules:**
- `npm run build && npm run lint` passes.
- Select Piano and play — sound should be distinct from other instruments and recognizably piano-ish.
- No console warnings about failed sample loading.
- All other instruments still work correctly.

---

## Phase 2 — Missing UI Features

### Task 5: Add Scale & Key selector UI

**Files:** New component `components/ScaleKeySelect.tsx`, update `lib/mapping.ts`, update `components/experience/useContributionExperience.ts`, update `app/page.tsx` and `app/heatmap/page.tsx`

**What:** README mentions "Scale/Key selection" but there's no UI. The mapping code already accepts `scale` and `keyRootHz` options.

**How:**
1. Define available scales in `lib/mapping.ts`:
   ```ts
   export const SCALES = {
     pentatonic: { label: "Pentatonic", intervals: [0, 2, 4, 7, 9] },
     major: { label: "Major", intervals: [0, 2, 4, 5, 7, 9, 11] },
     minor: { label: "Minor", intervals: [0, 2, 3, 5, 7, 8, 10] },
     blues: { label: "Blues", intervals: [0, 3, 5, 6, 7, 10] },
     chromatic: { label: "Chromatic", intervals: [0,1,2,3,4,5,6,7,8,9,10,11] },
   } as const;
   ```
2. Define available keys (C, C#, D, ... B) with their root frequencies.
3. Create `<ScaleKeySelect />` — two `<select>` dropdowns (scale + key).
4. Wire it into `useContributionExperience`: add `scale` and `keyRoot` state, pass to `mapGridToMusic()`.
5. Persist to localStorage + URL params (same pattern as instrument).
6. Place next to `<InstrumentSelect />` in both pages.

**Test rules:**
- `npm run build && npm run lint` passes.
- Changing scale re-maps the grid and audibly changes the melody.
- Changing key shifts pitch up/down.
- Persists across page reload (localStorage) and is reflected in URL.
- Works in both light and dark themes.
- Works on both `/` (3D) and `/heatmap` (2D) pages.

---

### Task 6: Add a volume/master gain slider

**Files:** New component or extend `Transport.tsx`, update `lib/audio.ts`, update `useContributionExperience.ts`

**What:** Users have no way to control volume.

**How:**
1. Add a `setMasterVolume(v: number)` method to `AudioEngine` that sets `this.master.gain.value`.
2. Add `volume` state to `useContributionExperience` (default 0.8).
3. Add a range input (slider) to the Transport bar, styled consistently.
4. Persist volume to localStorage.

**Test rules:**
- `npm run build && npm run lint` passes.
- Dragging the slider audibly changes volume in real-time during playback.
- Volume 0 = silence. Volume 1 = max.
- Persists across page reload.
- Slider looks correct in light and dark themes.

---

## Phase 3 — Testing Infrastructure

### Task 7: Set up Vitest and write core unit tests

**What:** Zero tests exist. Add Vitest and test the pure logic modules.

**How:**
1. `npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom`
2. Add to `package.json` scripts: `"test": "vitest run", "test:watch": "vitest"`
3. Add `vitest.config.ts` at root:
   ```ts
   import { defineConfig } from 'vitest/config';
   import path from 'path';
   export default defineConfig({
     test: { environment: 'jsdom' },
     resolve: { alias: { '@': path.resolve(__dirname) } },
   });
   ```
4. Write tests for these modules:

**`lib/mapping.test.ts`**
- `mapGridToMusic` returns cells with correct `noteIndex` for pentatonic scale.
- Intensity 0 cells retain intensity 0 (they become rests).
- Intensity >= 4 cells get octave bump (+12 semitones).
- `semitoneToFreq(261.63, 0)` returns ~261.63.
- `semitoneToFreq(261.63, 12)` returns ~523.26 (octave up).

**`lib/contrib.test.ts`**
- Test the grid parsing logic (mock the fetch, verify grid shape: 7 rows, correct number of cols).
- Intensity bucketing logic (0 count → intensity 0, quantile boundaries respected).

**`lib/format.test.ts`**
- Date formatting returns expected strings.
- Contribution count formatting (e.g., "1,234 contributions").

**`lib/instruments.test.ts`**
- All instrument IDs have valid definitions.
- Every synth instrument has a recipe.
- Every sampler instrument has a samples object.

**Test rules:**
- `npm run test` passes with 0 failures.
- `npm run build && npm run lint` still passes.
- Tests cover edge cases (empty grid, zero contributions, boundary values).
- No test mocks AudioContext (those are integration tests for Phase 4).

---

### Task 8: Add component smoke tests

**Files:** `components/__tests__/` directory

**What:** Ensure key UI components render without crashing.

**How:**
1. Add render tests for: `Transport`, `InstrumentSelect`, `ThemeToggle`, `Grid2D`.
2. Use `@testing-library/react` with `render()` and basic assertions.
3. Mock Three.js canvas for `Grid3D` (or skip — Three.js is hard to unit test).
4. Test user interactions where simple: clicking play/pause toggles state, changing instrument fires callback.

**Test rules:**
- `npm run test` passes.
- Each test file tests at least: renders without error, displays expected text/elements.
- No flaky tests (no timers, no network calls).

---

## Phase 4 — Polish & Ship

### Task 9: Add loading & empty states

**Files:** `app/page.tsx`, `components/Grid3D.tsx`

**What:** When fetching GitHub data, the 3D area shows "No grid loaded yet" with no animation. When loading fails, error is small and easy to miss.

**How:**
1. While `loading` is true, show a centered spinner or pulsing skeleton in the grid area.
2. On error, show a prominent error card with retry button.
3. Add a subtle entrance animation when the grid first appears (opacity fade-in).

**Test rules:**
- `npm run build && npm run lint` passes.
- Set username to a non-existent user — error state is clear and has a retry button.
- Clear network (offline) — loading state appears, then error.
- Normal load — smooth transition from loading to grid.
- Works in both themes.

---

### Task 10: Add share URL functionality

**Files:** New component `components/ShareButton.tsx`, update pages

**What:** Users should be able to share their musical creation via URL.

**How:**
1. Encode current state into URL params: `username`, `from`, `to`, `instrument`, `scale`, `key`, `bpm`.
2. On page load, read these params and restore state (partially done for instrument already).
3. Add a "Share" button that copies the URL to clipboard with a brief "Copied!" toast.

**Test rules:**
- `npm run build && npm run lint` passes.
- Click Share → URL is copied to clipboard.
- Paste URL in new tab → same username, date range, instrument, scale, key, BPM are loaded.
- Share button works in both themes.
- Toast disappears after ~2 seconds.

---

### Task 11: Add keyboard shortcuts

**Files:** New hook `hooks/useKeyboardShortcuts.ts`, update `app/page.tsx`

**What:** Power users should be able to control playback with keyboard.

**How:**
1. Space → play/pause
2. Left/Right arrows → skip ±15s
3. Up/Down arrows → BPM ±5
4. M → mute toggle
5. Add a small "?" button that shows shortcuts in a tooltip/modal.

**Test rules:**
- `npm run build && npm run lint` passes.
- All shortcuts work when no input field is focused.
- Shortcuts do NOT fire when typing in the username or date input fields.
- "?" shows shortcuts list, Escape dismisses it.

---

### Task 12: SEO, meta tags, and Open Graph

**Files:** `app/layout.tsx`

**What:** Add proper meta tags for social sharing.

**How:**
1. Add `metadata` export to `app/layout.tsx` with title, description, Open Graph tags.
2. Add a simple OG image (can be the existing `preview-light.svg` converted or a static PNG).
3. Add favicon if missing.

**Test rules:**
- `npm run build && npm run lint` passes.
- View page source — `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image` are present.
- Social sharing preview looks reasonable (test with a meta tag validator).

---

### Task 13: Final QA pass

**What:** End-to-end check of the entire app.

**Checklist:**
- [ ] `npm run build` succeeds with zero warnings.
- [ ] `npm run lint` passes.
- [ ] `npm run test` passes with 0 failures.
- [ ] Desktop: Load octocat → 3D renders → play → sound plays → switch instruments → change scale/key → change BPM → seek → skip → pause → change theme → navigate to /heatmap → play there too.
- [ ] Tablet viewport (768–1024px): LiteApp renders, all controls work.
- [ ] Mobile viewport (<768px): MobileFallback shows with preview image.
- [ ] Upload tab: upload a screenshot → grid parses → plays.
- [ ] Share URL: copy → open in new tab → state restores.
- [ ] Keyboard shortcuts all work.
- [ ] Light theme: all UI elements visible, proper contrast.
- [ ] Dark theme: all UI elements visible, proper contrast.
- [ ] No console errors or warnings in any flow.
- [ ] Performance: no jank during 3D rotation or playback.

---

## Task Dependency Graph

```
Phase 1 (Audio):  Task 1 → Task 2 → Task 3 → Task 4
Phase 2 (UI):     Task 5 → Task 6         (can start after Task 4)
Phase 3 (Tests):  Task 7 → Task 8         (can start after Task 6)
Phase 4 (Polish): Task 9 → Task 10 → Task 11 → Task 12 → Task 13
```

Tasks within a phase are sequential. Phase 2 can start once Phase 1 is done.
Phase 3 can start once Phase 2 is done (so tests cover new features).
Phase 4 can start once Phase 3 is done.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server at localhost:3000 |
| `npm run build` | Production build (must pass after every task) |
| `npm run lint` | ESLint check (must pass after every task) |
| `npm run test` | Run Vitest (available after Task 7) |

## Key Files

| File | Purpose |
|------|---------|
| `lib/audio.ts` | Audio engine — synthesis, sampling, scheduling |
| `lib/mapping.ts` | Grid → musical notes mapping |
| `lib/instruments.ts` | Instrument definitions (recipes) |
| `lib/types.ts` | GridCell & Grid types |
| `components/experience/useContributionExperience.ts` | Central state hook |
| `app/page.tsx` | Main page (desktop/tablet/mobile routing) |
| `app/heatmap/page.tsx` | 2D heatmap view |
| `app/globals.css` | Theme CSS variables |
