"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "./menuItems";

export default function Sidebar() {
   const pathname = usePathname();

   return (
      <aside className="w-60 min-w-70 border-r border-neutral bg-neutral-light flex flex-col sticky top-0 overflow-y-auto scrollbar-thin">
         <div className="px-4 py-3.5 text-[14px] font-bold text-primary bg-neutral-light-active border-b border-neutral">
            Danh mục chính sách
         </div>
         <nav className="flex flex-col">
            {menuItems.map((item) => {
               const isActive = pathname === item.href;
               return (
                  <Link
                     key={item.id}
                     href={item.href}
                     className={[
                        "block px-4 py-2.5 text-[14px] leading-snug border-b border-neutral-light-active",
                        "transition-colors duration-150 hover:bg-accent-light hover:text-accent",
                        isActive
                           ? "bg-accent-light text-accent font-semibold border-l-[3px] border-l-accent pl-3.25!"
                           : "text-primary",
                     ].join(" ")}
                  >
                     {item.label}
                  </Link>
               );
            })}
         </nav>
      </aside>
   );
}
