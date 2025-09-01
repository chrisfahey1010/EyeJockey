'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type AudioFeatures = {
  level: number;
  peak: number;
  centroid?: number;
  bands?: { low: number; mid: number; high: number };
};

export function useAudioFeatures() {
  const [features, setFeatures] = useState<AudioFeatures>({ level: 0, peak: 0 });
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // init worker
    if (typeof window === 'undefined') return;
    const worker = new Worker(new URL('../workers/audio.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<AudioFeatures>) => {
      setFeatures(e.data);
    };
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  const start = useCallback(async () => {
    if (ctxRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AC();
    ctxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;
    src.connect(analyser);

    // inform worker
    workerRef.current?.postMessage({ type: 'init', sampleRate: ctx.sampleRate, fftSize: analyser.fftSize });

    const buffer = new Float32Array(analyser.fftSize);
    const tick = () => {
      analyser.getFloatTimeDomainData(buffer);
      // clone to avoid transferring the same backing buffer used by analyser
      const copy = new Float32Array(buffer.length);
      copy.set(buffer);
      workerRef.current?.postMessage({ type: 'audio', time: ctx.currentTime, pcm: copy });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    ctxRef.current?.close();
    ctxRef.current = null;
  }, []);

  return { features, start, stop } as const;
}


