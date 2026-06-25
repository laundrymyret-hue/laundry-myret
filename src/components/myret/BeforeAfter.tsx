import { useRef, useState } from "react";
import { Reveal } from "./Reveal";

const demos = [
  { id: "stain", label: "Stain Removal", before: "#6b6048", after: "#f8fafc" },
  { id: "shoe", label: "Shoe Restoration", before: "#4a4036", after: "#eef2f8" },
  { id: "shirt", label: "White Shirt", before: "#cdcdb8", after: "#ffffff" },
  { id: "bedding", label: "Bedding Refresh", before: "#9a8f86", after: "#f3f8ff" },
];

export function BeforeAfter() {
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(2, Math.min(98, p)));
  };

  const demo = demos[active];

  return (
    <section className="px-5 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[color:var(--brand-red)]">
            Before & After
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">
            See the MyRet difference
          </h2>
        </Reveal>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {demos.map((d, i) => (
            <button
              key={d.id}
              onClick={() => {
                setActive(i);
                setPos(50);
              }}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                i === active
                  ? "bg-gradient-brand text-white shadow-glow-red"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div
          ref={ref}
          className="relative mt-10 aspect-[16/9] w-full cursor-ew-resize select-none overflow-hidden rounded-3xl border border-border shadow-card"
          onMouseMove={(e) => dragging.current && move(e.clientX)}
          onMouseDown={(e) => {
            dragging.current = true;
            move(e.clientX);
          }}
          onMouseUp={() => (dragging.current = false)}
          onMouseLeave={() => (dragging.current = false)}
          onTouchMove={(e) => move(e.touches[0].clientX)}
        >
          {/* after (full) */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${demo.after}, #ffffff)` }}
          >
            <span className="rounded-full bg-[color:var(--brand-blue)] px-4 py-1.5 text-sm font-bold text-white">
              After
            </span>
          </div>
          {/* before (clipped) */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${demo.before}, #5b5345)`,
              clipPath: `inset(0 ${100 - pos}% 0 0)`,
            }}
          >
            <span
              className="rounded-full bg-black/50 px-4 py-1.5 text-sm font-bold text-white"
              style={{ marginRight: "auto", marginLeft: "1.5rem" }}
            >
              Before
            </span>
          </div>
          {/* handle */}
          <div
            className="absolute inset-y-0 z-10 w-1 -translate-x-1/2 bg-white shadow-card"
            style={{ left: `${pos}%` }}
          >
            <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[color:var(--brand-blue)] shadow-card">
              ⇄
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Drag the handle to compare.
        </p>
      </div>
    </section>
  );
}
