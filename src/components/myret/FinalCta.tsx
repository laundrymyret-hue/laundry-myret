import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { MagneticButton } from "./MagneticButton";

export function FinalCta() {
  return (
    <section id="cta" className="px-5 py-24">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] mesh-bg mesh-animate px-8 py-20 text-center shadow-card md:px-16">
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-[var(--glow-red)] blur-2xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[var(--glow-blue)] blur-2xl" />
        <Reveal className="relative">
          <h2 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-black leading-tight text-white">
            Your Clothes Deserve Better.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/75">
            Schedule your first pickup today and experience garment care without
            compromise.
          </p>
          <div className="mt-9 flex justify-center">
            <MagneticButton href="#top" size="lg">
              Schedule Pickup <ArrowRight size={18} />
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
