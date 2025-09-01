import Link from 'next/link';

export default function Page() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-[#07132e] to-[#0b1b4a]">
      {/* Background neon accents */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 -bottom-24 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

      <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center md:py-32">
        <span className="mb-4 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-cyan-200/90 backdrop-blur">
          Realtime Music Visuals
        </span>
        <h1 className="mb-4 bg-gradient-to-r from-cyan-200 via-teal-100 to-violet-200 bg-clip-text text-5xl font-extrabold text-transparent drop-shadow-md md:text-6xl">
          EyeJockey
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-200/90 md:text-lg">
          A browser-based DJ visualization tool for audio-reactive, procedurally-generated, psychedelic scenes.
          Built for performance and live control.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/visual"
            className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-3 font-semibold text-white shadow-[0_0_30px_rgba(56,189,248,0.35)] transition-transform hover:scale-[1.02]"
          >
            <span className="absolute inset-0 -z-10 rounded-xl bg-cyan-400/30 blur-xl transition-opacity group-hover:opacity-60" />
            Launch Visualizer
          </Link>
          <a
            href="#features"
            className="rounded-xl border border-slate-600/50 bg-white/5 px-6 py-3 font-semibold text-slate-200 backdrop-blur transition-colors hover:border-slate-500/70"
          >
            Learn More
          </a>
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-20 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/60 bg-white/5 p-6 text-left text-slate-200 backdrop-blur">
          <h3 className="mb-2 text-cyan-200">Audio‑Reactive</h3>
          <p className="text-sm text-slate-300/90">Mic or file input drives visuals with beat pulses, levels, and bands.</p>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-white/5 p-6 text-left text-slate-200 backdrop-blur">
          <h3 className="mb-2 text-fuchsia-200">Live Control</h3>
          <p className="text-sm text-slate-300/90">On‑screen controls with keyboard/MIDI mapping for fast tweaks.</p>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-white/5 p-6 text-left text-slate-200 backdrop-blur">
          <h3 className="mb-2 text-violet-200">High Performance</h3>
          <p className="text-sm text-slate-300/90">Optimized pipeline with graceful fallbacks to keep frames smooth.</p>
        </div>
      </section>
    </main>
  );
}
