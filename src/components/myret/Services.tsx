import { motion } from "motion/react";
import {
  Shirt,
  WashingMachine,
  Wind,
  Truck,
  BedDouble,
  Sofa,
  Footprints,
  Zap,
} from "lucide-react";
import { Reveal } from "./Reveal";

const services = [
  { icon: Shirt, title: "Dry Cleaning", desc: "Luxury garment treatment." },
  { icon: WashingMachine, title: "Wash & Fold", desc: "Everyday clothing care." },
  { icon: Wind, title: "Ironing & Pressing", desc: "Wrinkle-free perfection." },
  { icon: Truck, title: "Pickup & Delivery", desc: "Doorstep convenience." },
  { icon: BedDouble, title: "Bedding & Linens", desc: "Hotel-grade cleaning." },
  { icon: Sofa, title: "Curtains & Upholstery", desc: "Professional fabric care." },
  { icon: Footprints, title: "Shoe Care", desc: "Cleaning and restoration." },
  { icon: Zap, title: "Express Service", desc: "Same-day turnaround." },
];

export function Services() {
  return (
    <section id="services" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[color:var(--brand-red)]">
            Our Services
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">
            Complete care for everything you wear & live with
          </h2>
          <p className="mt-4 text-muted-foreground">
            One platform for every fabric, every fiber, every finish — handled by
            specialists and tracked end to end.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={(i % 4) * 0.08}>
              <motion.div
                whileHover={{ y: -8 }}
                className="group relative h-full overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-shadow duration-300 hover:shadow-card"
              >
                {/* gradient border glow on hover */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(225,25,25,0.08), rgba(24,54,167,0.08))",
                  }}
                />
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow-red transition-transform duration-300 group-hover:scale-110">
                    <s.icon size={26} />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
