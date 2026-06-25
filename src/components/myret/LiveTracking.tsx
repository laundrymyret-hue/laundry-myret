import { motion } from "motion/react";
import { MapPin, Navigation, Clock, CreditCard, CheckCircle2 } from "lucide-react";
import { Reveal } from "./Reveal";

const timeline = [
  { label: "Order placed", done: true },
  { label: "Picked up", done: true },
  { label: "Cleaning in progress", done: true },
  { label: "Out for delivery", done: false },
  { label: "Delivered", done: false },
];

export function LiveTracking() {
  return (
    <section className="px-5 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-[color:var(--brand-red)]">
            Live Order Tracking
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">
            Watch every step in real time
          </h2>
          <p className="mt-4 text-muted-foreground">
            A Stripe-grade dashboard for your laundry. Follow your driver on the map,
            see live ETAs, payment status, and a transparent delivery timeline — no calls,
            no guessing.
          </p>

          <div className="mt-8 space-y-3">
            {timeline.map((t, i) => (
              <div key={t.label} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${
                    t.done ? "bg-gradient-brand" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <CheckCircle2 size={14} />
                </span>
                <span className={t.done ? "font-medium" : "text-muted-foreground"}>
                  {t.label}
                </span>
                {i === 3 && (
                  <span className="ml-1 rounded-full bg-[color:var(--brand-red)]/10 px-2 py-0.5 text-xs font-semibold text-[color:var(--brand-red)]">
                    Now
                  </span>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="font-display font-bold">#MR-20481</p>
              </div>
              <span className="rounded-full bg-[color:var(--brand-blue)] px-3 py-1 text-xs font-semibold text-white">
                Out for delivery
              </span>
            </div>

            {/* map */}
            <div className="relative h-52 overflow-hidden mesh-bg">
              <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 400 200">
                <path d="M0 120 Q120 40 220 110 T400 80" stroke="white" strokeWidth="2" fill="none" strokeDasharray="6 6" />
              </svg>
              <motion.div
                className="absolute"
                initial={{ left: "12%", top: "58%" }}
                animate={{ left: ["12%", "55%", "78%"], top: ["58%", "40%", "44%"] }}
                transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand-red)] text-white shadow-glow-red">
                  <Navigation size={18} />
                </div>
              </motion.div>
              <div className="absolute right-6 top-8 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[color:var(--brand-blue)] shadow-card">
                <MapPin size={16} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-5">
              <div className="rounded-2xl bg-muted p-3">
                <Clock size={16} className="text-[color:var(--brand-blue)]" />
                <p className="mt-2 text-xs text-muted-foreground">ETA</p>
                <p className="font-bold">18 min</p>
              </div>
              <div className="rounded-2xl bg-muted p-3">
                <Navigation size={16} className="text-[color:var(--brand-red)]" />
                <p className="mt-2 text-xs text-muted-foreground">Distance</p>
                <p className="font-bold">1.2 km</p>
              </div>
              <div className="rounded-2xl bg-muted p-3">
                <CreditCard size={16} className="text-emerald-500" />
                <p className="mt-2 text-xs text-muted-foreground">Payment</p>
                <p className="font-bold">Paid</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
