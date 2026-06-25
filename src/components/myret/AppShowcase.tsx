import { motion } from "motion/react";
import { Reveal } from "./Reveal";
import { MagneticButton } from "./MagneticButton";

const screens = [
  { title: "Dashboard", accent: "var(--brand-blue)" },
  { title: "Schedule Pickup", accent: "var(--brand-red)" },
  { title: "Order Tracking", accent: "var(--brand-blue)" },
];

function Phone({ title, accent, i }: { title: string; accent: string; i: number }) {
  return (
    <motion.div
      animate={{ y: [0, i % 2 === 0 ? -14 : 14, 0] }}
      transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
      className="relative h-[26rem] w-[13rem] shrink-0 rounded-[2.2rem] border-[6px] border-[color:var(--brand-midnight)] bg-card shadow-card"
      style={{ marginTop: i === 1 ? 0 : "2rem" }}
    >
      <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-[color:var(--brand-midnight)]" />
      <div className="flex h-full flex-col overflow-hidden rounded-[1.7rem] p-4">
        <div className="mt-3 h-20 rounded-2xl" style={{ background: accent, opacity: 0.9 }} />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-3/4 rounded-full bg-muted" />
          <div className="h-3 w-1/2 rounded-full bg-muted" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
        </div>
        <div className="mt-auto rounded-xl py-2.5 text-center text-xs font-bold text-white" style={{ background: "var(--gradient-brand)" }}>
          {title}
        </div>
      </div>
    </motion.div>
  );
}

export function AppShowcase() {
  return (
    <section className="overflow-hidden bg-gradient-hero px-5 py-24 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-[color:#ff8a8a]">
            Mobile App
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">
            Your garment care, in your pocket
          </h2>
          <p className="mt-4 text-white/75">
            Schedule pickups, track orders in real time, manage payments, and grow your
            rewards — all from a beautifully simple app.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <MagneticButton href="#cta" variant="secondary" size="lg">App Store</MagneticButton>
            <MagneticButton href="#cta" variant="ghost" size="lg">Google Play</MagneticButton>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="flex justify-center gap-4">
            {screens.map((s, i) => (
              <Phone key={s.title} title={s.title} accent={s.accent} i={i} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
