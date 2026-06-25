import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Search } from "lucide-react";
import { Reveal } from "./Reveal";

const faqs = [
  { q: "How does pickup and delivery work?", a: "Schedule a slot in the app or on the web. A vetted MyRet driver collects your items from your doorstep and returns them cleaned, pressed, and tracked end to end." },
  { q: "How fast is the express service?", a: "Express orders are turned around within 24 hours, and same-day service is available for Elite members and select areas." },
  { q: "Do you handle delicate and designer garments?", a: "Yes. Our specialists apply fabric-specific care for delicates, silk, wool, and designer pieces, with an AI-assisted quality inspection on every garment." },
  { q: "What payment methods are accepted?", a: "All major cards and digital wallets are supported, with secure in-app payments and transparent receipts." },
  { q: "Can I pause or cancel my subscription?", a: "Absolutely. Plans are flexible — pause, upgrade, downgrade, or cancel anytime from your dashboard." },
  { q: "Do you offer services for businesses?", a: "Yes. We provide enterprise laundry and linen care for hotels, restaurants, salons, offices, and more with dedicated account management." },
];

export function FaqSection() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(0);

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(query.toLowerCase()) ||
      f.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section id="faq" className="px-5 py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[color:var(--brand-red)]">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">
            Questions, answered
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-soft">
            <Search size={18} className="text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </Reveal>

        <div className="mt-6 space-y-3">
          {filtered.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 0.05}>
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="font-display font-semibold">{f.q}</span>
                    <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="text-[color:var(--brand-red)]">
                      <Plus size={20} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">No matching questions.</p>
          )}
        </div>
      </div>
    </section>
  );
}
