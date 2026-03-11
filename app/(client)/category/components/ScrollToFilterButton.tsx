"use client";

import { ListFilter } from "lucide-react";

export default function ScrollToFilterButton() {
   const handleClick = () => {
      const el = document.getElementById("product-filter");
      if (el) {
         el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
   };

   return (
      <button
         type="button"
         onClick={handleClick}
         className="text-sm text-primary font-medium flex items-center border border-neutral rounded-full py-1.5 px-3 cursor-pointer gap-2 hover:bg-neutral-light-active transition-colors"
      >
         <ListFilter width={17} height={17} />
         Dùng bộ lọc ngay
      </button>
   );
}
