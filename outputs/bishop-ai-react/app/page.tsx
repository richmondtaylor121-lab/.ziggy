import { RadialOrbitalTimelineDemo } from "@/components/radial-orbital-timeline-demo";

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#000D1A] text-[#EDE9E2]">

      {/* ── Page Header ─────────────────────────────── */}
      <section className="pt-24 pb-12 text-center px-6">
        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#E8B84B] mb-4">
          02 — The System
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight max-w-3xl mx-auto">
          The Bishop AI <span className="text-[#E8B84B]">Project Lifecycle</span>
        </h1>
        <p className="mt-5 text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Every engagement runs through five hardened stages — from initial audit 
          to production launch. Click any node in the orbit to explore each phase.
        </p>
      </section>

      {/* ── Radial Orbital Timeline ──────────────────── */}
      <section className="pb-24 px-4">
        <RadialOrbitalTimelineDemo />
      </section>

    </main>
  );
}
