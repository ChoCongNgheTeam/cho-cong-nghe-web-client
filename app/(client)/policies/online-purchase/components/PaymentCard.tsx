type Props = {
  method: any;
};

export default function PaymentCard({ method }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{method.icon}</span>
          <h3 className="font-semibold text-stone-800 text-sm leading-tight">
            {method.name}
          </h3>
        </div>

        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ml-2 ${method.badgeColor}`}
        >
          {method.badge}
        </span>
      </div>

      <p className="text-stone-500 text-sm leading-relaxed mb-4">
        {method.desc}
      </p>

      <ul className="space-y-1.5 mb-3">
        {method.pros.map((pro: string, i: number) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm text-stone-600"
          >
            <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs shrink-0">
              ✓
            </span>
            {pro}
          </li>
        ))}
      </ul>

      {method.note && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
          <span className="text-amber-500 text-xs mt-0.5 shrink-0">⚠</span>
          <p className="text-amber-700 text-xs">{method.note}</p>
        </div>
      )}
    </div>
  );
}
