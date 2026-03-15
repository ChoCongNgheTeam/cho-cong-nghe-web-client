"use client";

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  color?: string;
}

export function StatsCard({ label, value, sub, icon, color = "text-accent" }: StatsCardProps) {
  return (
    <div className="bg-neutral-light border border-neutral rounded-xl px-4 py-3.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">{label}</p>
        {icon && <span className={`${color} opacity-70`}>{icon}</span>}
      </div>
      <p className={`text-[22px] font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-neutral-dark">{sub}</p>}
    </div>
  );
}
