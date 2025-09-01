'use client';

import { useControls } from '@/app/store/useControls';

export default function ControlPanel() {
  const { bpm, setBpm, playing, togglePlaying } = useControls();

  return (
    <div className="mx-auto max-w-md rounded-2xl border p-6 shadow-sm bg-white/80">
      <h2 className="mb-4 text-xl font-semibold">Control Panel</h2>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">BPM: {bpm}</label>
        <input
          type="range"
          min={60}
          max={200}
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value, 10))}
          className="w-full"
        />
      </div>

      <button
        onClick={togglePlaying}
        className="rounded-lg px-4 py-2 text-white bg-gray-900 hover:bg-gray-800"
      >
        {playing ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}
