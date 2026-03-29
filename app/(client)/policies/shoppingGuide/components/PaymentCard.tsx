import type { PaymentMethod } from "../data";

type Props = {
  method: PaymentMethod;
};

export default function PaymentCard({ method }: Props) {
  return (
    <div className="bg-neutral-light rounded-2xl border border-neutral p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{method.icon}</span>
          <h3 className="font-semibold text-primary text-sm leading-tight">
            {method.name}
          </h3>
        </div>

        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ml-2 ${method.badgeColor}`}
        >
          {method.badge}
        </span>
      </div>

      <p className="text-neutral-dark text-sm leading-relaxed mb-4">
        {method.desc}
      </p>

      <ul className="space-y-1.5 mb-3">
        {method.pros.map((pro: string, i: number) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm text-neutral-darker"
          >
            <span className="w-4 h-4 rounded-full bg-accent-light text-accent flex items-center justify-center text-xs shrink-0">
              ✓
            </span>
            {pro}
          </li>
        ))}
      </ul>

      {method.note && (
        <div className="flex items-start gap-2 bg-accent-light border border-accent-light-active rounded-lg px-3 py-2 mt-3">
          <span className="text-accent text-xs mt-0.5 shrink-0">⚠</span>
          <p className="text-accent-dark text-xs">{method.note}</p>
        </div>
      )}
    </div>
  );
}
