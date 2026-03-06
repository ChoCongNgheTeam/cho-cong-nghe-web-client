"use client";

import { useFontSize } from "./FontSizeContext";
export default function PolicyContent({
   children,
}: {
   children: React.ReactNode;
}) {
   const { fontSize } = useFontSize();
   return (
      <div
         className={[
            "leading-relaxed transition-all duration-150",
            fontSize === "large" ? "text-[19px]" : "text-[15px]",
         ].join(" ")}
      >
         {children}
      </div>
   );
}
