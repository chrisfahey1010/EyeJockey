import { create } from 'zustand';

type ControlsState = {
  bpm: number;
  playing: boolean;
  setBpm: (bpm: number) => void;
  togglePlaying: () => void;
};

export const useControls = create<ControlsState>((set) => ({
  bpm: 120,
  playing: false,
  setBpm: (bpm) => set({ bpm }),
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
}));
