"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, CheckCheck, Loader2, Gift, Clock, Package, Megaphone, Tag, UserX, MessageSquare, Star, ChevronRight, Inbox } from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAdminNotifications } from "@/contexts/AdminNotificationContext";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeDate } from "@/helpers/formatRelativeDate";

// ── Type config ───────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; ring: string }> = {
  WELCOME_VOUCHER: { icon: Gift, color: "text-accent", bg: "bg-accent-light", ring: "ring-accent-light-active" },
  VOUCHER_EXPIRING: { icon: Clock, color: "text-star", bg: "bg-neutral-light-active", ring: "ring-neutral" },
  VOUCHER_ASSIGNED: { icon: Tag, color: "text-accent-dark", bg: "bg-accent-light", ring: "ring-accent-light-active" },
  CAMPAIGN_PROMOTION: { icon: Megaphone, color: "text-promotion", bg: "bg-promotion-light", ring: "ring-promotion-light-active" },
  ORDER_STATUS: { icon: Package, color: "text-accent", bg: "bg-accent-light", ring: "ring-accent-light-active" },
  USER_INACTIVE: { icon: UserX, color: "text-neutral-dark", bg: "bg-neutral-light-active", ring: "ring-neutral" },
  COMMENT_NEW: { icon: MessageSquare, color: "text-accent", bg: "bg-accent-light", ring: "ring-accent-light-active" },
  REVIEW_NEW: { icon: Star, color: "text-star", bg: "bg-neutral-light-active", ring: "ring-neutral" },
};

const DEFAULT_CONFIG = {
  icon: Bell,
  color: "text-neutral-dark",
  bg: "bg-neutral-light-active",
  ring: "ring-neutral",
};

// ── Component ─────────────────────────────────────────────────────────────────

type NotificationBellProps = {
  /**
   * "user"  → dùng NotificationContext  → GET /notifications
   * "admin" → dùng AdminNotificationContext → GET /notifications/admin
   */
  variant?: "user" | "admin";
  footerHref?: string;
  footerLabel?: string;
  headerLabel?: string;
};

export default function NotificationBell({ variant = "user", footerHref, footerLabel, headerLabel }: NotificationBellProps) {
  const { isAuthenticated } = useAuth();

  const resolvedFooterHref = footerHref ?? (variant === "admin" ? "/admin/notifications" : "/profile/notifications");
  const resolvedFooterLabel = footerLabel ?? "Xem tất cả thông báo";
  const resolvedHeaderLabel = headerLabel ?? (variant === "admin" ? "Thông báo hệ thống" : "Thông báo");

  const userStore = useNotifications();
  const adminStore = useAdminNotifications();
  const { notifications, unreadCount, isLoading, hasMore, fetchNextPage, markAsRead, markAllAsRead } = variant === "admin" ? adminStore : userStore;

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Inject keyframes once
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

  // Click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Infinite scroll sentinel
  useEffect(() => {
    if (!open || !sentinelRef.current) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) fetchNextPage();
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

  // ── Trigger button styles ─────────────────────────────────────────────────
  // variant="admin" → đang ở admin panel, dùng màu tối bình thường
  // variant="user"  → đang ở header navy, dùng màu TRẮNG để đồng bộ
  const triggerClass =
    variant === "admin"
      ? `relative w-8 h-8 flex items-center justify-center rounded-lg
         text-neutral-dark hover:text-primary hover:bg-neutral-light-active
         transition-all duration-150 cursor-pointer
         ${open ? "text-primary bg-neutral-light-active" : ""}`
      : `relative inline-flex items-center p-2 rounded-lg
         text-white hover:bg-white/10 active:bg-white/20
         transition-colors duration-150 cursor-pointer
         ${open ? "bg-white/10" : ""}`;

  return (
    <div ref={wrapperRef} className="relative">
      <button onClick={() => setOpen((v) => !v)} aria-label={resolvedHeaderLabel} className={triggerClass}>
        {variant === "admin" ? <Bell size={17} strokeWidth={2.3} /> : <Bell className="w-5 h-5 lg:w-6 lg:h-6" />}

        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -bottom-0.5 min-w-[18px] h-[18px] px-[3px]
              flex items-center justify-center rounded-full
              text-[10px] font-bold shadow-sm"
            style={
              variant === "user"
                ? {
                    // Badge trên header navy: nền trắng + text navy, ring navy
                    background: "#fff",
                    color: "#0f2050",
                    boxShadow: "0 0 0 2px rgba(15,32,80,0.5)",
                  }
                : {
                    // Badge ở admin panel: accent như cũ
                    background: "rgb(var(--accent))",
                    color: "#fff",
                    boxShadow: "0 0 0 2px rgb(var(--neutral-light))",
                  }
            }
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown — luôn dùng nền sáng (neutral-light) bất kể variant ── */}
      <div
        className={`
          fixed left-3 right-3 top-[60px]
          sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2.5 sm:w-[340px]
          bg-neutral-light border border-neutral
          rounded-2xl shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.06)]
          z-50 overflow-hidden
          transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right
          ${open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-3 pointer-events-none"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[14px] text-primary tracking-tight">{resolvedHeaderLabel}</span>
            {unreadCount > 0 && <span className="text-[11px] font-semibold text-accent bg-accent-light px-2 py-0.5 rounded-full leading-none">{unreadCount} mới</span>}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-dark hover:text-accent transition-colors duration-150 cursor-pointer group">
              <CheckCheck size={13} className="transition-transform duration-200 group-hover:scale-110" />
              Đọc tất cả
            </button>
          )}
        </div>

        {/* List */}
        <div className="overflow-y-auto overscroll-contain scroll-smooth scrollbar-thin max-h-[calc(100vh-140px)] sm:max-h-[380px]">
          {notifications.length === 0 && !isLoading ? (
            <div className="py-14 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-neutral-light-active flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-5 h-5 text-neutral-dark" />
              </div>
              <p className="text-[13px] font-medium text-primary mb-1">Chưa có thông báo</p>
              <p className="text-[12px] text-neutral-dark">Chúng tôi sẽ thông báo khi có gì mới</p>
            </div>
          ) : (
            <>
              {notifications.map((n, idx) => {
                const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_CONFIG;
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
                    {!n.isRead && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-accent" />}
                    <div
                      className={`shrink-0 w-9 h-9 rounded-xl ${cfg.bg} ring-1 ${cfg.ring}
                        flex items-center justify-center
                        transition-transform duration-200 group-hover:scale-105`}
                    >
                      <IconComp size={16} className={cfg.color} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      <p className={`text-[13px] leading-snug line-clamp-2 ${!n.isRead ? "font-semibold" : "font-medium"} text-primary`}>{n.title}</p>
                      <p className="text-[12px] text-neutral-dark mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                      <p className="text-[11px] text-neutral-dark-hover mt-1 font-medium">{ago}</p>
                    </div>
                    {!n.isRead && <div className="shrink-0 mt-[5px] w-2 h-2 rounded-full bg-accent shadow-sm" />}
                  </div>
                );
              })}

              <div ref={sentinelRef} className="py-3 flex justify-center">
                {isLoading && <Loader2 size={15} className="animate-spin text-neutral-dark" />}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral bg-neutral-light-hover">
          <Link
            href={resolvedFooterHref}
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 py-3 text-[13px] font-medium text-neutral-dark-active hover:text-accent transition-colors duration-150 group"
          >
            {resolvedFooterLabel}
            <ChevronRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
