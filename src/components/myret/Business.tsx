import { motion } from "motion/react";
import { Hotel, Home, UtensilsCrossed, Building2, Scissors, Stethoscope, ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { MagneticButton } from "./MagneticButton";

const segments = [
  { icon: Hotel, label: "Hotels" },
  { icon: Home, label: "Airbnb Hosts" },
  { icon: UtensilsCrossed, label: "Restaurants" },
  { icon: Building2, label: "Corporate Offices" },
  { icon: Scissors, label: "Salons" },
  { icon: Stethoscope, label: "Medical Facilities" },
];

export function Business() {
  return (
    <section id="business" className="px-5 py-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-hero p-10 text-white shadow-glow-blue md:p-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-[color:#ff8a8a]">
              Business Services
            </p>
            <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">
              Enterprise-grade laundry for teams & brands
            </h2>
            <p className="mt-4 text-white/75">
              Scalable garment and linen care with dedicated account management,
              volume pricing, and SLA-backed turnaround. Built for businesses that
              can't compromise on presentation.
            </p>
            <div className="mt-8">
              <MagneticButton href="#cta" variant="secondary" size="lg">
                Request Enterprise Quote <ArrowRight size={18} />
              </MagneticButton>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {segments.map((s) => (
                <motion.div
                  key={s.label}
                  whileHover={{ y: -6 }}
                  className="rounded-2xl glass p-5 text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                    <s.icon size={22} />
                  </div>
                  <p className="mt-3 text-sm font-semibold">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
