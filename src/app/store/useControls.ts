import { create } from 'zustand';

type ControlsState = {
  // transport
  bpm: number;
  playing: boolean;

  // visual params
  speed: number; // 0..2
  distortion: number; // 0..1
  colorShift: number; // 0..1
  audioGain: number; // 0..4

  // actions
  setBpm: (bpm: number) => void;
  togglePlaying: () => void;
  setSpeed: (v: number) => void;
  setDistortion: (v: number) => void;
  setColorShift: (v: number) => void;
  setAudioGain: (v: number) => void;
};

export const useControls = create<ControlsState>((set) => ({
  bpm: 120,
  playing: false,

  speed: 1.0,
  distortion: 0.35,
  colorShift: 0.5,
  audioGain: 1.0,

  setBpm: (bpm) => set({ bpm }),
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
  setSpeed: (v) => set({ speed: v }),
  setDistortion: (v) => set({ distortion: v }),
  setColorShift: (v) => set({ colorShift: v }),
  setAudioGain: (v) => set({ audioGain: v }),
}));
