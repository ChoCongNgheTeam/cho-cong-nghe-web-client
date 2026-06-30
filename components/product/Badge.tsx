"use client";

type BadgeProps = {
  label?: string;
  discountPercent?: number;
  className?: string;
};

const Badge = ({ label, discountPercent, className }: BadgeProps) => {
  const content = discountPercent ? `-${discountPercent}%` : (label ?? "");

  return (
    <div className={`absolute top-2 left-0 z-20 ${className ?? ""}`}>
      <div className="px-2 py-2 text-white font-bold text-[11px] leading-none rounded-r-md" style={{ background: "rgb(var(--promotion))" }}>
        {content}
      </div>
    </div>
  );
};

export default Badge;
