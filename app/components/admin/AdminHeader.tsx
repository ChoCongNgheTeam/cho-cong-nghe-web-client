"use client";
import { Search, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import UserAvatar from "../ui/UserAvatar";
import { useRef } from "react";
import NotificationBell from "@/components/ui/NotificationBell";

interface AdminHeaderProps {
   title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
   const { user } = useAuth();
   const { isDark, toggleTheme, mounted } = useTheme();
   const toggleBtnRef = useRef<HTMLButtonElement>(null);

   const handleThemeToggle = () => {
      if (
         !document.startViewTransition ||
         window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
         toggleTheme();
         return;
      }

      const btn = toggleBtnRef.current;
      const rect = btn?.getBoundingClientRect();
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

      // Bán kính đủ lớn để phủ toàn viewport từ vị trí nút
      const endRadius = Math.hypot(
         Math.max(x, window.innerWidth - x),
         Math.max(y, window.innerHeight - y),
      );

      const clipPath = [
         `circle(0px at ${x}px ${y}px)`,
         `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      const transition = document.startViewTransition(() => {
         toggleTheme();
      });

      transition.ready.then(() => {
         document.documentElement.animate(
            { clipPath },
            {
               duration: 500,
               easing: "ease-in-out",
               pseudoElement: "::view-transition-new(root)",
            },
         );
      });
   };

   return (
      <>
         <style>{`
            ::view-transition-old(root),
            ::view-transition-new(root) {
               animation: none;
               mix-blend-mode: normal;
            }
         `}</style>

         <div className="bg-neutral-light border-b border-neutral px-6 py-3 flex items-center justify-between sticky top-0 z-30">
            {/* Page title */}
            <h1 className="text-2xl font-bold text-primary tracking-tight">
               {title}
            </h1>

            {/* Right side */}
            <div className="flex items-center gap-2">
               {/* Search bar */}
               <div className="relative">
                  <input
                     type="text"
                     placeholder="Tìm kiếm sản phẩm, đơn hàng, tố cáo,..."
                     className="w-72 pl-4 pr-10 py-2 text-[13px] border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-neutral-light-active text-primary placeholder:text-neutral-dark transition-all duration-150"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-accent transition-colors">
                     <Search size={15} />
                  </button>
               </div>

               {/* Divider */}
               <div className="w-px h-6 bg-neutral mx-1" />

               {/* Notification bell */}
               <NotificationBell footerHref="/admin/notifications" />

               {/* Theme toggle với ripple effect */}
               {mounted && (
                  <button
                     ref={toggleBtnRef}
                     onClick={handleThemeToggle}
                     title={isDark ? "Chuyển sang Light" : "Chuyển sang Dark"}
                     className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-dark hover:text-primary hover:bg-neutral-light-active transition-all duration-150 cursor-pointer"
                  >
                     {isDark ? (
                        <Sun
                           size={17}
                           className="transition-transform duration-300 hover:rotate-45"
                        />
                     ) : (
                        <Moon
                           size={17}
                           className="transition-transform duration-300 hover:-rotate-12"
                        />
                     )}
                  </button>
               )}

               {/* Avatar */}
               {user && (
                  <button className="ring-2 ring-neutral hover:ring-accent transition-all duration-150 rounded-full">
                     <UserAvatar
                        avatarImage={user.avatarImage}
                        fullName={user.fullName}
                        size={32}
                     />
                  </button>
               )}
            </div>
         </div>
      </>
   );
}
