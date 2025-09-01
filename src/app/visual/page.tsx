'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { VisualEngine } from '@/visuals/engine/engine';
import tunnelPack from '@/visuals/packs/tunnel';
import { useAudioFeatures } from '@/hooks/useAudioFeatures';
import { useControls } from '@/app/store/useControls';
import { useShallow } from 'zustand/react/shallow';
import ControlPanel from '@/app/components/ControlPanel';

function FpsHud() {
  const last = useRef(performance.now());
  const fpsRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const loop = useMemo(() => {
    return () => {
      const now = performance.now();
      const dt = now - last.current;
      last.current = now;
      const fps = 1000 / Math.max(1, dt);
      if (fpsRef.current) fpsRef.current.textContent = `${fps.toFixed(0)} FPS`;
      rafRef.current = requestAnimationFrame(loop);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [loop]);

  return (
    <div
      ref={fpsRef}
      className="fixed right-3 top-3 rounded bg-black/70 px-2 py-1 text-xs text-white"
    >
      0 FPS
    </div>
  );
}

function DemoScene() {
  return null;
}

export default function VisualPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<VisualEngine | null>(null);
  const [started, setStarted] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const { features, start: startAudio } = useAudioFeatures();
  const { speed, distortion, colorShift, audioGain } = useControls(
    useShallow((s) => ({
      speed: s.speed,
      distortion: s.distortion,
      colorShift: s.colorShift,
      audioGain: s.audioGain,
    })),
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const engine = new VisualEngine({ container: el, pack: tunnelPack });
    engineRef.current = engine;
    engine.start();
    setStarted(true);
    startAudio().catch(() => {});
    return () => engine.dispose();
  }, []);

  // push params into engine when they change
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setParams({ speed, distortion, colorShift, audioGain });
  }, [speed, distortion, colorShift, audioGain]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setAudio({ level: features.level, peak: features.peak });
  }, [features]);

  return (
    <main className="h-dvh w-dvw bg-black">
      <div ref={containerRef} className="h-full w-full" />
      {started && <FpsHud />}
      {panelOpen ? (
        <div className="fixed left-4 top-4 z-50 w-80">
          <div className="relative">
            <button
              onClick={() => setPanelOpen(false)}
              aria-label="Hide controls"
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white"
            >
              ×
            </button>
            <ControlPanel />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setPanelOpen(true)}
          className="fixed left-4 top-4 z-50 rounded bg-black/60 px-3 py-2 text-sm text-white hover:bg-black/70"
        >
          Show Controls
        </button>
      )}
    </main>
  );
}


