"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/hooks/useAuth";

// Icon map theo type
const TYPE_CONFIG: Record<string, { icon: string; bg: string }> = {
  WELCOME_VOUCHER: { icon: "🎉", bg: "bg-emerald-50" },
  VOUCHER_EXPIRING: { icon: "⏰", bg: "bg-amber-50" },
  VOUCHER_ASSIGNED: { icon: "🎁", bg: "bg-purple-50" },
  CAMPAIGN_PROMOTION: { icon: "🔥", bg: "bg-red-50" },
  ORDER_STATUS: { icon: "📦", bg: "bg-blue-50" },
  USER_INACTIVE: { icon: "👀", bg: "bg-gray-50" },
};

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, isLoading, hasMore, fetchNextPage, markAsRead, markAllAsRead } = useNotifications();

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Click outside → đóng
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Infinite scroll — IntersectionObserver sentinel
  useEffect(() => {
    if (!open || !sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchNextPage();
        }
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
      {/* Bell button */}
      <button onClick={() => setOpen((v) => !v)} className="relative p-2 hover:bg-neutral-light-active rounded-lg transition-colors cursor-pointer" aria-label="Thông báo">
        <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <div
        className={`absolute right-0 mt-2 w-80 bg-neutral-light border border-neutral rounded-xl shadow-xl z-50 overflow-hidden
          transition-all duration-200 origin-top-right
          ${open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral">
          <span className="font-semibold text-[14px] text-primary">
            Thông báo
            {unreadCount > 0 && <span className="ml-2 text-[11px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">{unreadCount} mới</span>}
          </span>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="flex items-center gap-1 text-[12px] text-accent hover:text-accent-hover transition-colors cursor-pointer">
              <CheckCheck size={13} />
              Đọc tất cả
            </button>
          )}
        </div>

        {/* List */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto">
          {notifications.length === 0 && !isLoading ? (
            <div className="py-10 text-center">
              <Bell className="w-8 h-8 text-neutral-dark mx-auto mb-2 opacity-40" />
              <p className="text-[13px] text-neutral-dark">Không có thông báo</p>
            </div>
          ) : (
            <>
              {notifications.map((n, idx) => {
                const config = TYPE_CONFIG[n.type] ?? { icon: "🔔", bg: "bg-gray-50" };
                // const timeAgo = formatDistanceToNow(new Date(n.createdAt), {
                //   addSuffix: true,
                //   locale: vi,
                // });
                const ago = timeAgo(n.createdAt);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n.id, n.isRead)}
                    className={`flex gap-3 px-4 py-3 border-b border-neutral cursor-pointer
                      hover:bg-neutral-light-active transition-colors
                      ${!n.isRead ? "bg-accent/5" : ""}
                      animate-in fade-in slide-in-from-top-1 duration-200`}
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    {/* Icon */}
                    <div className={`shrink-0 w-9 h-9 rounded-full ${config.bg} flex items-center justify-center text-base`}>{config.icon}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] leading-snug ${!n.isRead ? "font-semibold text-primary" : "font-medium text-primary"}`}>{n.title}</p>
                      <p className="text-[12px] text-neutral-dark mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                      <p className="text-[11px] text-neutral-dark/60 mt-1">{ago}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.isRead && <div className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-accent" />}
                  </div>
                );
              })}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="py-2 flex justify-center">
                {isLoading && <Loader2 size={16} className="animate-spin text-neutral-dark" />}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral">
          <Link href="/profile/notifications" onClick={() => setOpen(false)} className="block py-2.5 text-center text-[13px] font-medium text-accent hover:bg-neutral-light-active transition-colors">
            Xem tất cả thông báo
          </Link>
        </div>
      </div>
    </div>
  );
}
