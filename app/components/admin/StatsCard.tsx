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
    <div className="bg-neutral-light border border-neutral rounded-xl px-4 py-3.5 relative">
      {/* Icon */}
      {icon && <div className={`absolute top-3 right-3 opacity-70 ${iconClassName}`}>{icon}</div>}

      <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">{label}</p>

      <p className={`text-[22px] font-bold mt-1 ${valueClassName}`}>{value}</p>

      <p className="text-[11px] text-neutral-dark">{sub}</p>
    </div>
  );
}
