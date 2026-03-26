import type { StepItem } from "../data";

type Props = {
  step: StepItem;
  index: number;
};

export default function StepCard({ step, index }: Props) {
  return (
    <div
      className="group relative bg-neutral-light rounded-2xl border border-neutral p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top rounded-l-2xl" />

      <div className="flex gap-5">
        <div className="shrink-0">
          <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center text-2xl">
            {step.icon}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-serif text-3xl font-black text-neutral leading-none">
              {step.num}
            </span>
            <h3 className="font-semibold text-primary text-base">
              {step.title}
            </h3>
          </div>

          <p className="text-neutral-dark text-sm leading-relaxed mb-4">
            {step.desc}
          </p>

          <ul className="space-y-1.5">
            {step.tips.map((tip: string, i: number) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-neutral-darker"
              >
                <span className="mt-0.5 text-accent shrink-0">›</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
