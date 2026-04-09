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
    <div
      className={clsx(
        "absolute -top-3 left-1.5 z-20",
        "px-4 py-1.5 text-white font-bold text-[13px] tracking-tight",
        "bg-[#ef233c] shadow-sm",
        "rounded-br-2xl rounded-tr-md rounded-bl-md",
        "before:content-[''] before:absolute before:top-0 before:-left-2",
        "before:border-t-[12px] before:border-t-[#ef233c]",
        "before:border-l-[8px] before:border-l-transparent",
        "before:-z-10",
        className,
      )}
    >
      {content}
    </div>
  );
};

export default Badge;
