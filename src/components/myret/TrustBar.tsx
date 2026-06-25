import { Counter } from "./Counter";
import { Reveal } from "./Reveal";

const stats = [
  { value: 10000, suffix: "+", label: "Garments Cleaned" },
  { value: 98, suffix: "%", label: "Customer Satisfaction" },
  { value: 24, suffix: " Hr", label: "Express Service" },
  { value: 100, suffix: "%", label: "Quality Checked" },
];

export function TrustBar() {
  return (
    <section className="relative z-10 -mt-10 px-5">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-white p-8 shadow-card md:p-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="text-center">
              <p className="font-display text-4xl font-black text-gradient-brand md:text-5xl">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
