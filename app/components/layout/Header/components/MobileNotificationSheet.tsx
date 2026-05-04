"use client";

import { useEffect, useRef, useCallback } from "react";
import {
   X,
   Bell,
   CheckCheck,
   Loader2,
   Gift,
   Clock,
   Package,
   Megaphone,
   Tag,
   UserX,
   MessageSquare,
   Star,
   Inbox,
   ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeDate } from "@/helpers/formatRelativeDate";
import { useRoleNavigation } from "@/hooks/useRoleNavigation";

const TYPE_CONFIG: Record<
   string,
   { icon: React.ElementType; color: string; bg: string }
> = {
   WELCOME_VOUCHER: { icon: Gift, color: "text-accent", bg: "bg-accent/10" },
   VOUCHER_EXPIRING: {
      icon: Clock,
      color: "text-star",
      bg: "bg-neutral-light-active",
   },
   VOUCHER_ASSIGNED: {
      icon: Tag,
      color: "text-accent-dark",
      bg: "bg-accent/10",
   },
   CAMPAIGN_PROMOTION: {
      icon: Megaphone,
      color: "text-promotion",
      bg: "bg-promotion/10",
   },
   ORDER_STATUS: { icon: Package, color: "text-accent", bg: "bg-accent/10" },
   USER_INACTIVE: {
      icon: UserX,
      color: "text-neutral-dark",
      bg: "bg-neutral-light-active",
   },
   COMMENT_NEW: {
      icon: MessageSquare,
      color: "text-accent",
      bg: "bg-accent/10",
   },
   REVIEW_NEW: {
      icon: Star,
      color: "text-star",
      bg: "bg-neutral-light-active",
   },
};
const DEFAULT_CFG = {
   icon: Bell,
   color: "text-neutral-dark",
   bg: "bg-neutral-light-active",
};

interface MobileNotificationSheetProps {
   isOpen: boolean;
   onClose: () => void;
}

export default function MobileNotificationSheet({
   isOpen,
   onClose,
}: MobileNotificationSheetProps) {
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
   const { navigateToComment, navigateToOrders, navigateToReview } =
      useRoleNavigation();

   const sentinelRef = useRef<HTMLDivElement>(null);
   const observerRef = useRef<IntersectionObserver | null>(null);
   const touchStartY = useRef<number | null>(null);

   // Lock scroll + dispatch event cho ChatButton ẩn/hiện
   useEffect(() => {
      document.body.style.overflow = isOpen ? "hidden" : "";
      window.dispatchEvent(
         new CustomEvent("sheet:toggle", { detail: { open: isOpen } }),
      );
      return () => {
         document.body.style.overflow = "";
      };
   }, [isOpen]);

   // Infinite scroll sentinel
   useEffect(() => {
      if (!isOpen || !sentinelRef.current) return;
      observerRef.current = new IntersectionObserver(
         (entries) => {
            if (entries[0].isIntersecting && hasMore && !isLoading)
               fetchNextPage();
         },
         { threshold: 0.1 },
      );
      observerRef.current.observe(sentinelRef.current);
      return () => observerRef.current?.disconnect();
   }, [isOpen, hasMore, isLoading, fetchNextPage]);

   // ── Điều hướng giống desktop ──────────────────────────────────────────────
   const handleItemClick = useCallback(
      async (n: (typeof notifications)[number]) => {
         if (!n.isRead) await markAsRead(n.id);

         if (n.type === "ORDER_STATUS") {
            const data = n.data as { orderCode?: string };
            onClose();
            navigateToOrders(data?.orderCode);
            return;
         }

         if (n.type === "COMMENT_NEW") {
            const data = n.data as { productSlug?: string; commentId?: string };
            onClose();
            navigateToComment(data?.commentId, data?.productSlug);
            return;
         }

         if (n.type === "REVIEW_NEW") {
            const data = n.data as { productSlug?: string; reviewId?: string };
            onClose();
            navigateToReview(data?.reviewId, data?.productSlug);
            return;
         }
      },
      [
         markAsRead,
         navigateToOrders,
         navigateToComment,
         navigateToReview,
         onClose,
      ],
   );

   // Swipe down to close
   const handleTouchStart = (e: React.TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
   };
   const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStartY.current === null) return;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      if (dy > 60) onClose();
      touchStartY.current = null;
   };

   if (!isAuthenticated) return null;

   return (
      <>
         {/* Backdrop */}
         <div
            className={[
               "md:hidden fixed inset-0 z-[100] bg-black/40 transition-opacity duration-300",
               isOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none",
            ].join(" ")}
            onClick={onClose}
            aria-hidden="true"
         />

         {/* Bottom sheet */}
         <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={[
               "md:hidden fixed bottom-0 left-0 right-0 z-[110]",
               "bg-neutral-light rounded-t-2xl flex flex-col overflow-hidden",
               "transition-transform duration-300 ease-out",
               isOpen ? "translate-y-0" : "translate-y-full",
            ].join(" ")}
            style={{
               maxHeight: "82vh",
               paddingBottom: "env(safe-area-inset-bottom)",
            }}
         >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
               <div className="w-10 h-1 rounded-full bg-neutral-dark/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral shrink-0">
               <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-primary">
                     Thông báo
                  </span>
                  {unreadCount > 0 && (
                     <span className="text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                        {unreadCount} mới
                     </span>
                  )}
               </div>
               <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                     <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-1 text-xs font-medium text-neutral-dark hover:text-accent transition-colors cursor-pointer"
                     >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Đọc tất cả
                     </button>
                  )}
                  <button
                     onClick={onClose}
                     className="p-1.5 rounded-lg hover:bg-neutral transition-colors text-primary"
                     aria-label="Đóng"
                  >
                     <X className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
               {notifications.length === 0 && !isLoading ? (
                  <div className="py-16 text-center px-6">
                     <div className="w-14 h-14 rounded-2xl bg-neutral-light-active flex items-center justify-center mx-auto mb-3">
                        <Inbox className="w-6 h-6 text-neutral-dark" />
                     </div>
                     <p className="text-sm font-medium text-primary mb-1">
                        Chưa có thông báo
                     </p>
                     <p className="text-xs text-neutral-dark">
                        Chúng tôi sẽ thông báo khi có gì mới
                     </p>
                  </div>
               ) : (
                  <>
                     {notifications.map((n) => {
                        const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_CFG;
                        const IconComp = cfg.icon;
                        return (
                           <div
                              key={n.id}
                              onClick={() => handleItemClick(n)}
                              className={[
                                 "relative flex gap-3 px-4 py-3.5 border-b border-neutral/60 last:border-0 cursor-pointer",
                                 "transition-colors duration-150 active:bg-neutral",
                                 !n.isRead ? "bg-accent/5" : "bg-neutral-light",
                              ].join(" ")}
                           >
                              {!n.isRead && (
                                 <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-accent" />
                              )}
                              <div
                                 className={`shrink-0 w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center`}
                              >
                                 <IconComp
                                    className={`w-4 h-4 ${cfg.color}`}
                                    strokeWidth={1.8}
                                 />
                              </div>
                              <div className="flex-1 min-w-0 pr-1">
                                 <p
                                    className={`text-[13px] leading-snug line-clamp-2 ${!n.isRead ? "font-semibold" : "font-medium"} text-primary`}
                                 >
                                    {n.title}
                                 </p>
                                 <p className="text-xs text-neutral-dark mt-0.5 line-clamp-2 leading-relaxed">
                                    {n.body}
                                 </p>
                                 <p className="text-[11px] text-neutral-darker mt-1">
                                    {formatRelativeDate(n.createdAt)}
                                 </p>
                              </div>
                              {!n.isRead && (
                                 <div className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-accent" />
                              )}
                           </div>
                        );
                     })}
                     <div
                        ref={sentinelRef}
                        className="py-3 flex justify-center"
                     >
                        {isLoading && (
                           <Loader2 className="w-4 h-4 animate-spin text-neutral-dark" />
                        )}
                     </div>
                  </>
               )}
            </div>

            {/* Footer */}
            <div className="border-t border-neutral bg-neutral-light-active shrink-0">
               <Link
                  href="/profile/notifications"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 py-3.5 text-[13px] font-medium text-neutral-dark hover:text-accent transition-colors"
               >
                  Xem tất cả thông báo
                  <ChevronRight className="w-3.5 h-3.5" />
               </Link>
            </div>
         </div>
      </>
   );
}
