import { Check, X } from "lucide-react";
import { Reveal } from "./Reveal";

const features = [
  "Pickup & Delivery",
  "Real-Time Tracking",
  "Digital Payments",
  "Express Service",
  "Quality Control",
  "Subscription Plans",
];

export function WhyMyret() {
  return (
    <section className="bg-[color:var(--brand-ice)] px-5 py-24">
      <div className="mx-auto max-w-4xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[color:var(--brand-red)]">
            Why MyRet
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">
            MyRet vs traditional laundry
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <div className="grid grid-cols-3 border-b border-border bg-muted/50">
              <div className="p-5 text-sm font-semibold text-muted-foreground">Feature</div>
              <div className="p-5 text-center font-display font-bold text-gradient-brand">MyRet</div>
              <div className="p-5 text-center text-sm font-semibold text-muted-foreground">
                Traditional
              </div>
            </div>
            {features.map((f, i) => (
              <div
                key={f}
                className={`grid grid-cols-3 items-center ${
                  i !== features.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="p-5 text-sm font-medium">{f}</div>
                <div className="flex justify-center p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-white">
                    <Check size={16} />
                  </span>
                </div>
                <div className="flex justify-center p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <X size={16} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
