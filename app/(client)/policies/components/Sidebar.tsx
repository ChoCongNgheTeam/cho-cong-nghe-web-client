"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { menuItems } from "./menuItems";

export default function Sidebar() {
   const pathname = usePathname();
   const [mobileOpen, setMobileOpen] = useState(false);
   const activeItem = menuItems.find((item) => item.href === pathname);

   return (
      <>
         {/* ── Desktop sidebar (giữ nguyên như cũ) ── */}
         <aside className="hidden lg:flex w-60 min-w-[240px] border-r border-neutral bg-neutral-light flex-col sticky top-0 h-screen overflow-y-auto scrollbar-thin">
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
                              ? "bg-accent-light text-accent font-semibold border-l-[3px] border-l-accent !pl-[13px]"
                              : "text-primary",
                        ].join(" ")}
                     >
                        {item.label}
                     </Link>
                  );
               })}
            </nav>
         </aside>

         {/* ── Mobile / Tablet: dropdown ── */}
         <div className="lg:hidden relative">
            <button
               onClick={() => setMobileOpen((prev) => !prev)}
               className="w-full flex items-center justify-between px-4 py-3 bg-neutral-light-active border border-neutral rounded-lg"
            >
               <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[13px] font-bold text-primary shrink-0">Danh mục chính sách</span>
                  {activeItem && (
                     <span className="text-[13px] text-accent font-semibold truncate">
                        · {activeItem.label}
                     </span>
                  )}
               </div>
               {mobileOpen
                  ? <ChevronUp className="h-4 w-4 shrink-0 text-neutral-darker ml-2" />
                  : <ChevronDown className="h-4 w-4 shrink-0 text-neutral-darker ml-2" />
               }
            </button>

            {mobileOpen && (
               <>
                  <div
                     className="fixed inset-0 z-10"
                     onClick={() => setMobileOpen(false)}
                  />
                  <nav className="absolute left-0 right-0 z-20 bg-neutral-light border border-neutral rounded-lg shadow-lg mt-1 max-h-[60vh] overflow-y-auto">
                     {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                           <Link
                              key={item.id}
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className={[
                                 "block px-4 py-3 text-[14px] leading-snug border-b border-neutral-light-active last:border-b-0",
                                 "transition-colors duration-150",
                                 isActive
                                    ? "bg-accent-light text-accent font-semibold border-l-[3px] border-l-accent !pl-[13px]"
                                    : "text-primary hover:bg-accent-light hover:text-accent",
                              ].join(" ")}
                           >
                              {item.label}
                           </Link>
                        );
                     })}
                  </nav>
               </>
            )}
         </div>
      </>
   );
}