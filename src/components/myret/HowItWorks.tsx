import { CalendarCheck, Truck, WashingMachine, ScanLine, PackageCheck } from "lucide-react";
import { Reveal } from "./Reveal";

const steps = [
  { icon: CalendarCheck, title: "Schedule Pickup", desc: "Book a slot in seconds from the app or web." },
  { icon: Truck, title: "Driver Collects", desc: "A vetted driver collects from your doorstep." },
  { icon: WashingMachine, title: "Professional Cleaning", desc: "Fabric-specific care by trained specialists." },
  { icon: ScanLine, title: "Quality Inspection", desc: "AI-assisted scan checks every garment." },
  { icon: PackageCheck, title: "Delivery", desc: "Fresh, pressed, and back at your door." },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-[color:var(--brand-ice)] px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[color:var(--brand-red)]">
            How It Works
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">
            Five effortless steps
          </h2>
        </Reveal>

        <div className="relative mt-16">
          {/* timeline line */}
          <div className="absolute left-0 top-9 hidden h-0.5 w-full bg-gradient-to-r from-[color:var(--brand-red)] to-[color:var(--brand-blue)] lg:block" />
          <div className="grid gap-8 lg:grid-cols-5">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1} className="relative text-center">
                <div className="relative z-10 mx-auto flex h-18 w-18 items-center justify-center">
                  <div className="flex h-18 w-18 items-center justify-center rounded-full border-4 border-[color:var(--brand-ice)] bg-white p-4 shadow-card">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-brand text-white">
                      <s.icon size={22} />
                    </div>
                  </div>
                </div>
                <span className="mt-4 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-[color:var(--brand-blue)] shadow-soft">
                  Step {i + 1}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
