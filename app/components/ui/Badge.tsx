"use client";

import clsx from "clsx";

type BadgeProps = {
  label?: string;
  discountPercent?: number;
  className?: string;
};

const Badge = ({ label, discountPercent, className }: BadgeProps) => {
  const content = discountPercent ? `Giảm ${discountPercent}%` : (label ?? "");

  return (
    <div className="absolute -top-1.5 -left-1.5 z-20">
      {/* Badge chính */}
      <div
        className="relative px-4 py-1.5 text-white font-bold text-[13px]
      rounded-r-xl
      bg-[linear-gradient(180deg,#ff5060_0%,#e81829_50%,#c0101f_100%)]
      shadow-[3px_4px_14px_rgba(190,10,30,0.45)]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-tr-xl
        bg-[linear-gradient(to_bottom,rgba(255,255,255,0.1),transparent)]"
        />
        <span className="relative z-10">{content}</span>
      </div>
      {/* Fold tách riêng — dễ kiểm soát màu và kích thước */}
      <div
        className="w-0 h-0 border-r-[16px] border-r-[#840a18] border-b-[9px] border-b-transparent
      drop-shadow-[1px_2px_2px_rgba(0,0,0,0.3)]"
      />
    </div>
  );
};

export default Badge;
