import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Truck, CheckCircle2, CreditCard, Sparkles, Package } from "lucide-react";
import { MagneticButton } from "./MagneticButton";

const rotating = [
  "Your Clothes. Perfected.",
  "Premium Laundry Without Leaving Home.",
  "Clean Beyond Expectations.",
  "Laundry Reimagined.",
  "The Future of Garment Care.",
];

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: (i * 53) % 100,
  top: (i * 37) % 100,
  size: 4 + (i % 4) * 3,
  delay: (i % 6) * 0.8,
  duration: 7 + (i % 5),
}));

export function Hero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((v) => (v + 1) % rotating.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="top" className="relative overflow-hidden mesh-bg mesh-animate">
      {/* light rays + depth blur */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-[28rem] w-[28rem] rounded-full bg-[var(--glow-red)] blur-2xl" />
        <div className="absolute right-0 top-0 h-[34rem] w-[34rem] rounded-full bg-[var(--glow-blue)] blur-2xl" />
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-white/40"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -28, 0], opacity: [0.15, 0.6, 0.15] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-14 px-5 pb-24 pt-36 md:pt-44 lg:grid-cols-2 lg:items-center lg:pb-32">
        {/* Left */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-white/90"
          >
            <Sparkles size={15} className="text-[color:var(--brand-red)]" />
            Luxury Garment Care. Delivered.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-[clamp(2.6rem,7vw,5rem)] font-black leading-[0.98] text-white"
          >
            Luxury Garment Care,
            <br />
            <span className="text-gradient-brand bg-[linear-gradient(135deg,#ff5a5a,#9fb3ff)]">
              Picked Up & Delivered.
            </span>
          </motion.h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            From everyday wear to delicate designer pieces, MyRet Laundry provides
            premium cleaning, expert garment care, and seamless pickup and delivery
            services across the city.
          </p>

          <div className="mt-6 h-6 overflow-hidden text-sm font-medium text-white/60">
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              ✦ {rotating[idx]}
            </motion.div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <MagneticButton href="#cta" size="lg">
              Schedule Pickup <ArrowRight size={18} />
            </MagneticButton>
            <MagneticButton href="#services" variant="ghost" size="lg">
              View Services
            </MagneticButton>
          </div>
        </div>

        {/* Right — floating dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: 12 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md"
          style={{ perspective: 1200 }}
        >
          <div className="float-slow relative rounded-[1.8rem] glass p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Active Order</p>
                <p className="font-display text-lg font-bold text-white">#MR-20481</p>
              </div>
              <span className="rounded-full bg-[color:var(--brand-red)] px-3 py-1 text-xs font-semibold text-white">
                In Transit
              </span>
            </div>

            <div className="mt-5 rounded-2xl bg-white/10 p-4">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Pickup</span>
                <span>Cleaning</span>
                <span>Delivery</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/15">
                <motion.div
                  className="h-2 rounded-full bg-gradient-brand"
                  initial={{ width: "0%" }}
                  animate={{ width: "66%" }}
                  transition={{ duration: 1.4, delay: 0.8 }}
                />
              </div>
              <p className="mt-3 text-sm text-white/80">
                <Truck size={14} className="mr-1 inline text-[color:var(--brand-red)]" />
                Driver 1.2 km away · ETA 18 min
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <CheckCircle2 size={18} className="text-emerald-300" />
                <p className="mt-2 text-xs text-white/60">Quality Check</p>
                <p className="text-sm font-semibold text-white">Passed</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <CreditCard size={18} className="text-[color:var(--brand-red)]" />
                <p className="mt-2 text-xs text-white/60">Payment</p>
                <p className="text-sm font-semibold text-white">Paid · ₦8,500</p>
              </div>
            </div>
          </div>

          {/* floating mini cards */}
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-8 top-10 hidden rounded-2xl glass px-4 py-3 shadow-card sm:block"
          >
            <Package size={18} className="text-[color:var(--brand-red)]" />
            <p className="mt-1 text-xs text-white/60">Garments</p>
            <p className="text-sm font-bold text-white">12 items</p>
          </motion.div>
          <motion.div
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-6 bottom-12 hidden rounded-2xl glass px-4 py-3 shadow-card sm:block"
          >
            <p className="text-xs text-white/60">Satisfaction</p>
            <p className="text-lg font-black text-white">98%</p>
          </motion.div>
        </motion.div>
      </div>

      {/* bottom fade into next section */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white" />
    </section>
  );
}
