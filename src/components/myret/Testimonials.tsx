import { Star } from "lucide-react";
import { Reveal } from "./Reveal";

const reviews = [
  { name: "Wanjiru K.", role: "Kilimani", text: "My designer dresses came back flawless. The tracking made it feel like ordering luxury, not laundry." },
  { name: "Otieno O.", role: "Lavington", text: "Pickup, clean, delivered — never left my apartment. This is how laundry should work." },
  { name: "Amina H.", role: "Urban Oasis", text: "Express service saved me before a conference. Spotless and same-day. Unreal." },
  { name: "Kibet C.", role: "Junction Mall", text: "Hotel-grade linens every single time. My ratings went up because of MyRet." },
];

function Card({ r }: { r: (typeof reviews)[number] }) {
  return (
    <div className="w-80 shrink-0 rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="flex gap-0.5 text-[color:var(--brand-red)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={16} fill="currentColor" />
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-foreground/80">“{r.text}”</p>
      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand font-display font-bold text-white">
          {r.name[0]}
        </div>
        <div>
          <p className="text-sm font-bold">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.role}</p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const loop = [...reviews, ...reviews];
  return (
    <section className="overflow-hidden bg-[color:var(--brand-ice)] py-24">
      <Reveal className="mx-auto mb-12 max-w-2xl px-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[color:var(--brand-red)]">
          Testimonials
        </p>
        <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">
          Loved by thousands of customers
        </h2>
      </Reveal>

      <div className="relative">
        <div className="flex w-max marquee pause-on-hover gap-5">
          {loop.map((r, i) => (
            <Card key={i} r={r} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[color:var(--brand-ice)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[color:var(--brand-ice)] to-transparent" />
      </div>
    </section>
  );
}
