"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { menuItems } from "./menuItems";

export default function Sidebar() {
   const pathname = usePathname();
   const [mobileOpen, setMobileOpen] = useState(false);
   const buttonRef = useRef<HTMLButtonElement>(null);
   const activeItemRef = useRef<HTMLAnchorElement>(null);
   const [dropdownTop, setDropdownTop] = useState(0);
   const activeItem = menuItems.find((item) => item.href === pathname);

   const openDropdown = () => {
      if (buttonRef.current) {
         const rect = buttonRef.current.getBoundingClientRect();
         setDropdownTop(rect.bottom);
      }
      setMobileOpen(true);
   };

   // Scroll đến active item sau khi panel render xong
   useEffect(() => {
      if (!mobileOpen) return;
      const raf1 = requestAnimationFrame(() => {
         requestAnimationFrame(() => {
            activeItemRef.current?.scrollIntoView({
               block: "center",
               behavior: "instant",
            });
         });
      });
      return () => cancelAnimationFrame(raf1);
   }, [mobileOpen]);

   // Đóng khi resize lên desktop
   useEffect(() => {
      const onResize = () => {
         if (window.innerWidth >= 1024) setMobileOpen(false);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
   }, []);

   // Khoá scroll body khi dropdown mở
   useEffect(() => {
      document.body.style.overflow = mobileOpen ? "hidden" : "";
      return () => { document.body.style.overflow = ""; };
   }, [mobileOpen]);

   return (
      <>
         {/* ── Desktop sidebar ── */}
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

         {/* ── Mobile / Tablet ── */}
         <div className="lg:hidden">
            {/* Trigger button */}
            <button
               ref={buttonRef}
               onClick={openDropdown}
               className="w-full flex items-center justify-between px-4 py-3 bg-neutral-light-active border border-neutral rounded-lg"
            >
               <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[13px] font-bold text-primary shrink-0">
                     Danh mục chính sách
                  </span>
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
                  {/* Full-screen backdrop phủ từ top=0 */}
                  <div
                     className="fixed inset-0 z-40 bg-black/40"
                     onClick={() => setMobileOpen(false)}
                  />

                  {/* Panel cố định từ bottom của button xuống đáy màn hình */}
                  <div
                     className="fixed left-0 right-0 z-50 flex flex-col bg-neutral-light"
                     style={{
                        top: dropdownTop,
                        bottom: 0,
                        boxShadow: "0 -2px 16px rgba(0,0,0,0.12)",
                     }}
                  >
                     {/* Header */}
                     <div className="flex items-center justify-between px-4 py-3 bg-neutral-light-active border-b border-neutral shrink-0">
                        <span className="text-[13px] font-bold text-primary">
                           Danh mục chính sách
                        </span>
                        <button
                           onClick={() => setMobileOpen(false)}
                           className="text-[13px] text-accent font-medium px-2 py-1"
                        >
                           Đóng
                        </button>
                     </div>

                    

                     {/* Danh sách menu — scroll đến active */}
                     <nav className="flex-1 overflow-y-auto overscroll-contain">
                        {menuItems.map((item) => {
                           const isActive = pathname === item.href;
                           return (
                              <Link
                                 key={item.id}
                                 href={item.href}
                                 ref={isActive ? activeItemRef : null}
                                 onClick={() => setMobileOpen(false)}
                                 className={[
                                    "flex items-center px-4 py-3.5 text-[14px] leading-snug border-b border-neutral-light-active",
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
                  </div>
               </>
            )}
         </div>
      </>
   );
}