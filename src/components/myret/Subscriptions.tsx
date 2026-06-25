import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Reveal } from "./Reveal";
import { MagneticButton } from "./MagneticButton";

const plans = [
  {
    name: "Essential",
    price: "₦15,000",
    period: "/mo",
    blurb: "Basic household needs.",
    features: ["Up to 20 garments", "Wash & fold", "48hr turnaround", "Free pickup & delivery"],
    popular: false,
  },
  {
    name: "Premium",
    price: "₦35,000",
    period: "/mo",
    blurb: "Families and professionals.",
    features: [
      "Up to 60 garments",
      "Dry cleaning + pressing",
      "24hr express",
      "Priority support",
      "Real-time tracking",
    ],
    popular: true,
  },
  {
    name: "Elite",
    price: "₦75,000",
    period: "/mo",
    blurb: "Luxury concierge service.",
    features: [
      "Unlimited garments",
      "Designer & delicate care",
      "Same-day service",
      "Dedicated concierge",
      "Shoe & leather care",
    ],
    popular: false,
  },
];

export function Subscriptions() {
  return (
    <section id="pricing" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[color:var(--brand-red)]">
            Subscriptions
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">
            Plans that fit your life
          </h2>
          <p className="mt-4 text-muted-foreground">
            Flexible monthly care. Cancel or change anytime.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-center">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -8 }}
                className={`relative h-full overflow-hidden rounded-3xl border p-8 transition-shadow duration-300 ${
                  p.popular
                    ? "bg-gradient-hero border-transparent text-white shadow-glow-blue lg:scale-105"
                    : "border-border bg-card shadow-soft hover:shadow-card"
                }`}
              >
                {p.popular && (
                  <span className="absolute right-6 top-6 rounded-full bg-[color:var(--brand-red)] px-3 py-1 text-xs font-bold text-white shadow-glow-red">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display text-2xl font-extrabold">{p.name}</h3>
                <p className={`mt-1 text-sm ${p.popular ? "text-white/70" : "text-muted-foreground"}`}>
                  {p.blurb}
                </p>
                <div className="mt-6 flex items-end gap-1">
                  <span className="font-display text-4xl font-black">{p.price}</span>
                  <span className={p.popular ? "text-white/70" : "text-muted-foreground"}>
                    {p.period}
                  </span>
                </div>

                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full ${
                          p.popular ? "bg-white/20" : "bg-gradient-brand text-white"
                        }`}
                      >
                        <Check size={12} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <MagneticButton
                    href="#cta"
                    variant={p.popular ? "secondary" : "primary"}
                    className="w-full"
                  >
                    Choose {p.name}
                  </MagneticButton>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
