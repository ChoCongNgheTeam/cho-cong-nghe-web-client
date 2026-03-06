type Props = {
  step: any;
  index: number;
};

export default function StepCard({ step, index }: Props) {
  return (
    <div
      className="group relative bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top rounded-l-2xl" />

      <div className="flex gap-5">
        <div className="shrink-0">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl">
            {step.icon}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-serif text-3xl font-black text-stone-200 leading-none">
              {step.num}
            </span>
            <h3 className="font-semibold text-stone-800 text-base">
              {step.title}
            </h3>
          </div>

          <p className="text-stone-500 text-sm leading-relaxed mb-4">
            {step.desc}
          </p>

          <ul className="space-y-1.5">
            {step.tips.map((tip: string, i: number) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-stone-600"
              >
                <span className="mt-0.5 text-amber-500 shrink-0">›</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}