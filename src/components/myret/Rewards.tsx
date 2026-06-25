import { motion } from "motion/react";
import { Gift, Crown, Award } from "lucide-react";
import { Reveal } from "./Reveal";

const levels = [
  { name: "Silver", icon: Award, points: 60, color: "#94a3b8" },
  { name: "Gold", icon: Gift, points: 85, color: "#d4af37" },
  { name: "Platinum", icon: Crown, points: 40, color: "#9fb3ff" },
];

function Ring({ value, color }: { value: number; color: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
      <motion.circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        whileInView={{ strokeDashoffset: c - (c * value) / 100 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

export function Rewards() {
  return (
    <section className="bg-[color:var(--brand-ice)] px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[color:var(--brand-red)]">
            Rewards Program
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">
            Earn with every wash
          </h2>
          <p className="mt-4 text-muted-foreground">
            Collect points on every order and unlock premium perks as you climb tiers.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {levels.map((l, i) => (
            <Reveal key={l.name} delay={i * 0.1}>
              <div className="flex flex-col items-center rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
                <div className="relative flex items-center justify-center">
                  <Ring value={l.points} color={l.color} />
                  <div className="absolute flex flex-col items-center">
                    <l.icon size={26} style={{ color: l.color }} />
                    <span className="mt-1 font-display text-lg font-black">{l.points}%</span>
                  </div>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{l.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {l.name === "Silver" && "Welcome tier — 1 point / ₦100 spent."}
                  {l.name === "Gold" && "Free express upgrades & priority pickup."}
                  {l.name === "Platinum" && "Concierge care & exclusive member rates."}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
