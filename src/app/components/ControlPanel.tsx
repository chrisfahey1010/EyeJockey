'use client';

import { useControls } from '@/app/store/useControls';

type Props = {
  onStartMic?: () => void;
  onStartSystem?: () => void;
  onStopAudio?: () => void;
  source?: 'none' | 'mic' | 'system';
};

export default function ControlPanel({ onStartMic, onStartSystem, onStopAudio, source = 'none' }: Props) {
  const {
    bpm,
    setBpm,
    playing,
    togglePlaying,
    speed,
    distortion,
    colorShift,
    audioGain,
    setSpeed,
    setDistortion,
    setColorShift,
    setAudioGain,
  } = useControls();

  return (
    <div className="mx-auto max-w-md rounded-2xl border p-6 shadow-sm bg-white/80">
      <h2 className="mb-4 text-xl font-semibold">Control Panel</h2>

      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className="text-gray-700">Audio:</span>
        <button onClick={onStartMic} className={`rounded px-3 py-1 ${source === 'mic' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>Mic</button>
        <button onClick={onStartSystem} className={`rounded px-3 py-1 ${source === 'system' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>System</button>
        <button onClick={onStopAudio} className="rounded px-3 py-1 bg-gray-100">Stop</button>
        <span className="ml-auto text-gray-600">{source === 'none' ? 'Idle' : source === 'mic' ? 'Mic' : 'System'}</span>
      </div>

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

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Speed: {speed.toFixed(2)}</label>
        <input
          type="range"
          min={0}
          max={2}
          step={0.01}
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Distortion: {distortion.toFixed(2)}</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={distortion}
          onChange={(e) => setDistortion(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Color Shift: {colorShift.toFixed(2)}</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={colorShift}
          onChange={(e) => setColorShift(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">Audio Gain: {audioGain.toFixed(2)}</label>
        <input
          type="range"
          min={0}
          max={4}
          step={0.01}
          value={audioGain}
          onChange={(e) => setAudioGain(parseFloat(e.target.value))}
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
