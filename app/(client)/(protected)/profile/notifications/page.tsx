"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { CheckCheck, Package, Tag, Megaphone, RefreshCw } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";

import { formatRelativeDate } from "@/helpers/formatRelativeDate";
import { NotificationItem } from "@/hooks/useNotificationStore";

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; bgClass: string; textClass: string; label: string }> = {
  order: {
    icon: <Package className="w-4 h-4" />,
    bgClass: "bg-accent-light",
    textClass: "text-accent",
    label: "Đơn hàng",
  },
  promotion: {
    icon: <Tag className="w-4 h-4" />,
    bgClass: "bg-accent-light-active",
    textClass: "text-accent-dark",
    label: "Khuyến mãi",
  },
  system: {
    icon: <Megaphone className="w-4 h-4" />,
    bgClass: "bg-accent-light",
    textClass: "text-accent",
    label: "Hệ thống",
  },
};

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 sm:py-16 px-4 sm:px-6">
      <img
        src="https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/estore-v2/img/empty_state.png"
        alt="Không có thông báo"
        className="w-36 h-36 sm:w-52 sm:h-52 object-contain mb-1 opacity-90"
      />
      <h3 className="text-sm sm:text-base font-semibold text-primary mt-2 mb-1">Bạn chưa có thông báo nào</h3>
      <p className="text-xs sm:text-sm text-neutral-darker/60 text-center mb-6 max-w-xs leading-relaxed">Cùng khám các dịch vụ tại ChoCongNghe Shop nhé!</p>
      <Link href="/" className="bg-accent hover:bg-accent-hover active:scale-[0.98] text-neutral-light text-sm font-semibold px-7 py-2.5 rounded-full transition-all duration-150 shadow-sm hover:shadow-md">
        Khám phá ngay
      </Link>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex gap-3 sm:gap-3.5 px-4 sm:px-5 py-3.5 sm:py-4 animate-pulse">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-neutral-dark/10 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-neutral-dark/10 rounded-full w-2/5" />
        <div className="h-3.5 bg-neutral-dark/[0.08] rounded-full w-3/4" />
        <div className="h-3 bg-neutral-dark/[0.06] rounded-full w-1/2" />
      </div>
    </div>
  );
}

// ─── Notification Row ──────────────────────────────────────────────────────────
function NotificationRow({ item, onRead }: { item: NotificationItem; onRead: (id: string) => void }) {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.system;

  return (
    // NotificationRow
<div
  onClick={() => !item.isRead && onRead(item.id)}
  className={`
    group flex gap-3 sm:gap-3.5 px-4 sm:px-5 py-2 sm:py-2.5
    transition-all duration-150
    border-b border-neutral last:border-b-0
    ${!item.isRead
      ? "bg-accent-light hover:bg-accent-light-hover cursor-pointer"
      : "bg-neutral-light hover:bg-neutral-light-active cursor-default"
    }
  `}
>
  {/* Icon bubble */}
  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.bgClass} ${cfg.textClass}`}>
    {cfg.icon}
  </div>

  {/* Content */}
  <div className="flex-1 min-w-0">
    <div className="flex items-start justify-between gap-2 sm:gap-3">
      <p className={`text-[13px] sm:text-[13.5px] leading-snug flex-1 ${!item.isRead ? "font-semibold text-primary" : "font-normal text-neutral-darker"}`}>
        {item.title}
      </p>
      {!item.isRead && (
        <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0 ring-2 ring-accent-light-active" />
      )}
    </div>

    <p className="text-[12px] sm:text-[13px] text-neutral-dark mt-0.5 line-clamp-2 leading-relaxed">
      {item.body}
    </p>

    <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
      <span className="text-[10px] sm:text-[11px] text-neutral-dark tabular-nums">
        Khoảng {formatRelativeDate(item.createdAt)}
      </span>
    </div>
  </div>
</div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, hasMore, fetchNextPage, markAsRead, markAllAsRead, refresh } = useNotifications();

  const listRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || isLoading || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
      fetchNextPage();
    }
  }, [fetchNextPage, isLoading, hasMore]);

  return (
    <div className="flex flex-col">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <h1 className="text-lg sm:text-[22px] font-semibold tracking-tight text-primary">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-bold bg-accent text-neutral-light rounded-full leading-none">
              {unreadCount}
            </span>

          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Mobile: chỉ icon, desktop: icon + text */}
          <button
            onClick={refresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-darker/70 hover:text-primary p-1.5 sm:px-3 sm:py-1.5 rounded-lg hover:bg-neutral/60 transition-all duration-150 cursor-pointer disabled:opacity-40"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary border border-neutral hover:border-neutral-dark/30 bg-neutral-light hover:bg-neutral/40 p-1.5 sm:px-3 sm:py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
              title="Đọc tất cả"
            >
              <CheckCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Đọc tất cả</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Stats bar ── */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 sm:mb-4 text-[11.5px] sm:text-[12.5px] text-neutral-dark">
          <span>{notifications.length} thông báo</span>
          {unreadCount > 0 && (
            <>
              <span>·</span>
              <span className="text-accent font-medium">{unreadCount} chưa đọc</span>
            </>
          )}
        </div>
      )}

        {/* ── List Card ── */}
<div className="rounded-xl sm:rounded-2xl border border-neutral overflow-hidden shadow-sm bg-neutral-light">
        {isLoading && notifications.length === 0 ? (
          <div className="divide-y divide-neutral/40">
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <div ref={listRef} onScroll={handleScroll} className="overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-260px)] min-h-[200px] divide-y divide-neutral/90 scrollbar-thin">
            {notifications.map((item) => (
              <NotificationRow key={item.id} item={item} onRead={markAsRead} />
            ))}

            {/* Load more spinner */}
            {isLoading && notifications.length > 0 && (
              <div className="flex justify-center py-4 sm:py-5">
                <div className="w-4 h-4 border-[1.5px] border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            )}

            {/* End of list */}
            {!hasMore && notifications.length > 0 && (
              <div className="flex items-center justify-center gap-3 py-4 sm:py-5">
                <div className="h-px flex-1 max-w-[40px] sm:max-w-[48px] bg-neutral" />
                <span className="text-[10px] sm:text-[11px] text-neutral-dark tracking-wide">Đã hiển thị tất cả</span>
                <div className="h-px flex-1 max-w-[40px] sm:max-w-[48px] bg-neutral" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
