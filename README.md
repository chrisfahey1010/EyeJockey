## EyeJockey – Browser‑based DJ Visualizer

EyeJockey is a performant, browser‑based tool for creating audio‑reactive, procedurally‑generated visuals with live control. It’s designed for DJs, VJs, and streamers who want professional‑looking psychedelic visuals that run smoothly on modern laptops and deploy cleanly to AWS Amplify.

### Highlights
- Audio‑reactive shader scenes ("visual packs")
- Live control overlay (sliders/toggles) on the visualizer page
- Progressive enhancement mindset and performance‑first rendering loop
- Playwright smoke test for FPS
- Ready for Amplify Hosting (amplify.yml included)

## Tech Stack
- Next.js (App Router) + TypeScript
- Styling: Tailwind
- State: Zustand
- Render: Three.js via a lightweight custom engine (MVP)
- Audio: Web Audio API + Worker for feature extraction
- Inputs: Keyboard / mouse, MIDI (Web MIDI in Chrome)

## Local Development
```bash
npm i
npm run dev
# open http://localhost:3000
```

## Using the Visualizer
1) Navigate to `/visual` or click "Launch Visualizer" on the landing page.
2) Grant mic permission when prompted (one click starts audio analysis).
3) Use the overlay control panel (top‑left) to tweak:
   - speed
   - distortion
   - colorShift
   - audioGain
   - bpm
4) Hide/show the panel using the × button or "Show Controls" to re‑open.

Tip: Keep the page focused to capture keyboard input. If FPS dips on heavy scenes, reduce `speed` or `distortion`.

## Audio Features (MVP)
Audio analysis runs in a Web Worker for responsiveness. Features include:
- level (RMS, 0..1)
- peak (0..1)
- optional bands/centroid placeholder (extendable)

These features are fed into the active visual pack (`tunnel`) and modulate shader uniforms.

## MIDI Support (MVP)
EyeJockey includes a minimal MIDI manager to map CC messages to parameters.

Requirements:
- Chrome/Edge desktop (Web MIDI). Safari/Firefox do not support Web MIDI natively.

How it works:
- On initialization, the app requests MIDI access (if available).
- Incoming MIDI CC events are normalized to 0..1 and can be routed to params.

Extending mappings:
- See `src/midi/midi.ts` for the `MidiManager` and its `ccToParam` mapping shape.
- A future iteration can add a “learn mode” UI to bind knobs to params and persist mappings.

## Visual Packs
Visual packs conform to `VisualPack` in `src/visuals/core/types.ts` and provide:
- `init(ctx)` to build scene resources
- `update(dt, t, audio, params)` to animate
- `dispose()` optional cleanup

The sample pack `tunnel` uses a full‑screen shader with audio‑reactive modulation.

## File Structure (selected)
```
src/
  app/
    page.tsx              # Landing page
    visual/page.tsx       # Visualizer + overlay controls
    components/ControlPanel.tsx
  hooks/useAudioFeatures.ts
  midi/midi.ts
  visuals/
    core/types.ts
    engine/engine.ts
    packs/tunnel/index.ts
  workers/audio.worker.ts
amplify.yml
```

## Deployment (AWS Amplify)
- Connect the repo to Amplify Hosting.
- The included `amplify.yml` builds the Next.js app:
  - Installs dependencies via `npm ci`
  - Runs `npm run build`
  - Publishes `.next` as artifacts

If Amplify’s type/lint checks fail, ensure strict TypeScript rules pass locally (`npm run lint`).

## Troubleshooting
- No audio reaction: ensure mic permission is granted; try clicking the page to resume audio.
- No MIDI: verify Chrome and a connected MIDI device; unsupported in Safari/Firefox.
- Performance dips: keep one tab active, close heavy apps, and reduce parameters.

## Roadmap (next steps)
- WebGL2 post‑processing chain and optional WebGPU path
- Pack loader/validation and cross‑fade transitions
- Presets save/load (local first, S3 later)
- MIDI learn mode + JSON mapping persistence
- OBS/browser‑source mode (`?hud=0`) and adaptive quality

## License
MIT
