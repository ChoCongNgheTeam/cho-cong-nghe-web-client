import { ReactNode } from "react";

export function StatsCard({
  label,
  value,
  sub,
  icon,
  valueClassName = "text-accent",
  iconClassName = "text-neutral-dark",
}: {
  label: string;
  value: string | number;
  sub: string;
  icon?: ReactNode;
  valueClassName?: string;
  iconClassName?: string;
}) {
  return (
    <div className="bg-neutral-light border border-neutral rounded-xl px-3 py-3 sm:px-4 sm:py-3.5 relative min-w-0">
      {/* Icon */}
      {icon && <div className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 opacity-70 ${iconClassName}`}>{icon}</div>}

      <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-dark uppercase tracking-wider pr-6 truncate">{label}</p>

      <p className={`text-lg sm:text-[22px] font-bold mt-0.5 sm:mt-1 ${valueClassName}`}>{value}</p>

      <p className="text-[10px] sm:text-[11px] text-neutral-dark truncate">{sub}</p>
    </div>
  );
}
