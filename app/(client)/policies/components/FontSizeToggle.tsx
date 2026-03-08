"use client";
import { useFontSize } from "./FontSizeContext";

export default function FontSizeToggle() {
   const { fontSize, setFontSize } = useFontSize();

   return (
      <div className="flex mb-5">
         <button
            onClick={() => setFontSize("small")}
            className={[
               "px-4 py-1.5 text-[12px] border rounded-l-md font-medium transition-colors cursor-pointer",
               fontSize === "small"
                  ? "bg-primary text-neutral-light border-primary"
                  : "bg-neutral-light text-primary border-neutral hover:bg-neutral-light-active",
            ].join(" ")}
         >
            Cỡ chữ nhỏ
         </button>
         <button
            onClick={() => setFontSize("large")}
            className={[
               "px-4 py-1.5 text-[12px] border border-l-0 rounded-r-md font-medium transition-colors cursor-pointer",
               fontSize === "large"
                  ? "bg-primary text-neutral-light border-primary"
                  : "bg-neutral-light text-primary border-neutral hover:bg-neutral-light-active",
            ].join(" ")}
         >
            Cỡ chữ lớn
         </button>
      </div>
   );
}
