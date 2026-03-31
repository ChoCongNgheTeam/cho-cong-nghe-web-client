"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
   Bell,
   CheckCheck,
   Loader2,
   Gift,
   Clock,
   Package,
   Megaphone,
   Tag,
   UserX,
   ChevronRight,
   Inbox,
} from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeDate } from "@/helpers/formatRelativeDate";

const TYPE_CONFIG: Record<
   string,
   { icon: React.ElementType; color: string; bg: string; ring: string }
> = {
   WELCOME_VOUCHER: {
      icon: Gift,
      color: "text-accent",
      bg: "bg-accent-light",
      ring: "ring-accent-light-active",
   },
   VOUCHER_EXPIRING: {
      icon: Clock,
      color: "text-star",
      bg: "bg-neutral-light-active",
      ring: "ring-neutral",
   },
   VOUCHER_ASSIGNED: {
      icon: Tag,
      color: "text-accent-dark",
      bg: "bg-accent-light",
      ring: "ring-accent-light-active",
   },
   CAMPAIGN_PROMOTION: {
      icon: Megaphone,
      color: "text-promotion",
      bg: "bg-promotion-light",
      ring: "ring-promotion-light-active",
   },
   ORDER_STATUS: {
      icon: Package,
      color: "text-accent",
      bg: "bg-accent-light",
      ring: "ring-accent-light-active",
   },
   USER_INACTIVE: {
      icon: UserX,
      color: "text-neutral-dark",
      bg: "bg-neutral-light-active",
      ring: "ring-neutral",
   },
};

export default function NotificationBell() {
   const { isAuthenticated } = useAuth();
   const {
      notifications,
      unreadCount,
      isLoading,
      hasMore,
      fetchNextPage,
      markAsRead,
      markAllAsRead,
   } = useNotifications();
   const [open, setOpen] = useState(false);
   const wrapperRef = useRef<HTMLDivElement>(null);
   const observerRef = useRef<IntersectionObserver | null>(null);
   const sentinelRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const id = "notif-keyframes";
      if (document.getElementById(id)) return;
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        @keyframes notifIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-notif {
          animation: notifIn 220ms ease forwards;
          opacity: 0;
        }
      `;
      document.head.appendChild(style);
   }, []);

   useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
         if (
            wrapperRef.current &&
            !wrapperRef.current.contains(e.target as Node)
         ) {
            setOpen(false);
         }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
   }, [open]);

   useEffect(() => {
      if (!open || !sentinelRef.current) return;
      observerRef.current = new IntersectionObserver(
         (entries) => {
            if (entries[0].isIntersecting && hasMore && !isLoading)
               fetchNextPage();
         },
         { threshold: 0.1 },
      );
      observerRef.current.observe(sentinelRef.current);
      return () => observerRef.current?.disconnect();
   }, [open, hasMore, isLoading, fetchNextPage]);

   const handleItemClick = useCallback(
      async (id: string, isRead: boolean) => {
         if (!isRead) await markAsRead(id);
      },
      [markAsRead],
   );

   if (!isAuthenticated) return null;

   return (
      <div ref={wrapperRef} className="relative">
         {/* ── Bell button ── */}
         <button
            onClick={() => setOpen((v) => !v)}
            className={`relative p-2 rounded-xl transition-all duration-200 cursor-pointer
              hover:bg-neutral-light-active
              ${open ? "bg-neutral-light-active" : ""}`}
            aria-label="Thông báo"
         >
            <Bell
               className="w-5 h-5 lg:w-6 lg:h-6 text-primary"
               strokeWidth={2.3}
            />
            {unreadCount > 0 && (
               <span
                  className="absolute -right-0.5 -bottom-0.5 min-w-[18px] h-[18px] px-[3px]
                    flex items-center justify-center rounded-full
                    bg-accent text-[10px] font-bold text-neutral-light
                    shadow-sm ring-2 ring-neutral-light"
               >
                  {unreadCount > 99 ? "99+" : unreadCount}
               </span>
            )}
         </button>

         {/* ── Dropdown ── */}
         <div
            className={`
              /* Mobile: fixed, full-width with equal side margins, pinned below header */
              fixed left-3 right-3 top-[60px]
              /* Desktop (sm+): absolute, anchored to right of bell */
              sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2.5 sm:w-[340px]

              bg-neutral-light border border-neutral
              rounded-2xl shadow-[0_8px_32px_-4px_rgba(0,0,0,0.10),0_2px_8px_-2px_rgba(0,0,0,0.06)]
              z-50 overflow-hidden
              transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right
              ${
                 open
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-3 pointer-events-none"
              }`}
         >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral">
               <div className="flex items-center gap-2">
                  <span className="font-semibold text-[14px] text-primary tracking-tight">
                     Thông báo
                  </span>
                  {unreadCount > 0 && (
                     <span className="text-[11px] font-semibold text-accent bg-accent-light px-2 py-0.5 rounded-full leading-none">
                        {unreadCount} mới
                     </span>
                  )}
               </div>

               {unreadCount > 0 && (
                  <button
                     onClick={markAllAsRead}
                     className="flex items-center gap-1.5 text-[12px] font-medium
                       text-neutral-dark hover:text-accent transition-colors duration-150 cursor-pointer group"
                  >
                     <CheckCheck
                        size={13}
                        className="transition-transform duration-200 group-hover:scale-110"
                     />
                     Đọc tất cả
                  </button>
               )}
            </div>

            {/* List */}
            <div
               className={`
                 overflow-y-auto overscroll-contain scroll-smooth scrollbar-thin
                 max-h-[calc(100vh-140px)]
                 sm:max-h-[380px]
               `}
            >
               {notifications.length === 0 && !isLoading ? (
                  <div className="py-14 text-center px-6">
                     <div className="w-12 h-12 rounded-2xl bg-neutral-light-active flex items-center justify-center mx-auto mb-3">
                        <Inbox className="w-5 h-5 text-neutral-dark" />
                     </div>
                     <p className="text-[13px] font-medium text-primary mb-1">
                        Chưa có thông báo
                     </p>
                     <p className="text-[12px] text-neutral-dark">
                        Chúng tôi sẽ thông báo khi có gì mới
                     </p>
                  </div>
               ) : (
                  <>
                     {notifications.map((n, idx) => {
                        const cfg = TYPE_CONFIG[n.type] ?? {
                           icon: Bell,
                           color: "text-neutral-dark",
                           bg: "bg-neutral-light-active",
                           ring: "ring-neutral",
                        };
                        const IconComp = cfg.icon;
                        const ago = formatRelativeDate(n.createdAt);

                        return (
                           <div
                              key={n.id}
                              onClick={() => handleItemClick(n.id, n.isRead)}
                              className={`relative flex gap-3 px-4 py-3.5 cursor-pointer
                                border-b border-neutral/60 last:border-0
                                transition-colors duration-150 group animate-notif
                                hover:bg-neutral-light-hover
                                ${!n.isRead ? "bg-accent-light" : "bg-neutral-light"}`}
                              style={{ animationDelay: `${idx * 25}ms` }}
                           >
                              {/* Unread bar */}
                              {!n.isRead && (
                                 <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-accent" />
                              )}

                              {/* Icon */}
                              <div
                                 className={`shrink-0 w-9 h-9 rounded-xl ${cfg.bg}
                                   ring-1 ${cfg.ring}
                                   flex items-center justify-center
                                   transition-transform duration-200 group-hover:scale-105`}
                              >
                                 <IconComp
                                    size={16}
                                    className={cfg.color}
                                    strokeWidth={1.8}
                                 />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 pr-1">
                                 <p
                                    className={`text-[13px] leading-snug line-clamp-2
                                      ${!n.isRead ? "font-semibold text-primary" : "font-medium text-primary"}`}
                                 >
                                    {n.title}
                                 </p>
                                 <p className="text-[12px] text-neutral-dark mt-0.5 line-clamp-2 leading-relaxed">
                                    {n.body}
                                 </p>
                                 <p className="text-[11px] text-neutral-dark-hover mt-1 font-medium">
                                    {ago}
                                 </p>
                              </div>

                              {/* Unread dot */}
                              {!n.isRead && (
                                 <div className="shrink-0 mt-[5px] w-2 h-2 rounded-full bg-accent shadow-sm" />
                              )}
                           </div>
                        );
                     })}

                     {/* Sentinel */}
                     <div
                        ref={sentinelRef}
                        className="py-3 flex justify-center"
                     >
                        {isLoading && (
                           <Loader2
                              size={15}
                              className="animate-spin text-neutral-dark"
                           />
                        )}
                     </div>
                  </>
               )}
            </div>

            {/* Footer */}
            <div className="border-t border-neutral bg-neutral-light-hover">
               <Link
                  href="/profile/notifications"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-3 text-[13px] font-medium
                    text-neutral-dark-active hover:text-accent transition-colors duration-150 group"
               >
                  Xem tất cả thông báo
                  <ChevronRight
                     size={14}
                     className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
               </Link>
            </div>
         </div>
      </div>
   );
}