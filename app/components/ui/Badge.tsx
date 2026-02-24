"use client";

import clsx from "clsx";

type BadgeProps = {
   label?: string;
   discountPercent?: number;
   className?: string;
};

const Badge = ({ label, discountPercent, className }: BadgeProps) => {
   const content =
      typeof discountPercent === "number"
         ? `-${discountPercent}%`
         : (label ?? "Sale");

   return (
      <div className={clsx("absolute top-1 left-1 z-20", className)}>
         <div
            className="
          w-10 h-10
          bg-red-400
          flex items-center justify-center
          text-white font-bold text-[14px]
          rotate-[-15deg]
          select-none
        "
            style={{
               clipPath: `polygon(
            50% 0%, 60% 12%, 75% 5%, 80% 20%, 95% 25%, 88% 40%,
            100% 50%, 88% 60%, 95% 75%, 80% 80%, 75% 95%, 60% 88%,
            50% 100%, 40% 88%, 25% 95%, 20% 80%, 5% 75%, 12% 60%,
            0% 50%, 12% 40%, 5% 25%, 20% 20%, 25% 5%, 40% 12%
          )`,
            }}
         >
            {content}
         </div>
      </div>
   );
};

export default Badge;
