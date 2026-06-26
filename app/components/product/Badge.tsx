"use client";

type BadgeProps = {
  label?: string;
  discountPercent?: number;
  className?: string;
};

const Badge = ({ label, discountPercent }: BadgeProps) => {
  const content = discountPercent ? `Giảm ${discountPercent}%` : (label ?? "");

  return (
    <div className="absolute -top-1.5 -left-1.5 z-20">
      <div
        className="relative px-4 py-1.5 text-white font-bold text-[13px] rounded-r-xl"
        style={{
          background: "var(--color-orange)",
          boxShadow: "3px 4px 14px rgba(232,135,58,0.45)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-tr-xl
            bg-[linear-gradient(to_bottom,rgba(255,255,255,0.1),transparent)]"
        />
        <span className="relative z-10">{content}</span>
      </div>
      <div className="w-0 h-0 border-b-[9px] border-b-transparent border-r-[16px]" style={{ borderRightColor: "color-mix(in srgb, var(--color-orange) 60%, black)" }} />
    </div>
  );
};

export default Badge;
