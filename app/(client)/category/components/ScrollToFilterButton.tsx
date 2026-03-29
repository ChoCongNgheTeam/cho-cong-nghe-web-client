"use client";

import { ListFilter } from "lucide-react";

interface ScrollToFilterButtonProps {
   /** Callback để mở mobile drawer — chỉ dùng trên mobile */
   onOpenMobileFilter?: () => void;
}

export default function ScrollToFilterButton({
   onOpenMobileFilter,
}: ScrollToFilterButtonProps) {
   const handleClick = () => {
      // Trên mobile (lg:hidden): mở drawer
      if (onOpenMobileFilter && window.innerWidth < 1024) {
         onOpenMobileFilter();
         return;
      }
      // Trên desktop: scroll đến sidebar filter
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
