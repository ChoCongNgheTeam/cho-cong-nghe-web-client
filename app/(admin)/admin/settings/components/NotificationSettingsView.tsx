"use client";

import { Bell, Mail, MessageSquare, Inbox, CheckCheck, Package, UserX, Star } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatRelativeDate } from "@/helpers/formatRelativeDate";

const SYSTEM_TYPES = ["ORDER_STATUS", "USER_INACTIVE", "USER_FEEDBACK"];

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  ORDER_STATUS: { label: "Đơn hàng", icon: Package, color: "bg-accent/10 text-accent" },
  USER_INACTIVE: { label: "Người dùng", icon: UserX, color: "bg-amber-500/10 text-amber-600" },
  USER_FEEDBACK: { label: "Đánh giá", icon: Star, color: "bg-green-500/10 text-green-600" },
};

const CHANNEL_ROWS = [
  {
    key: "email",
    label: "Nhận thông báo qua Email",
    desc: "Gửi mail khi có đơn hàng mới hoặc sự kiện quan trọng",
    icon: Mail,
    defaultChecked: true,
  },
  {
    key: "push",
    label: "Nhận thông báo Push",
    desc: "Thông báo trình duyệt theo thời gian thực",
    icon: Bell,
    defaultChecked: true,
  },
  {
    key: "report",
    label: "Nhận báo cáo tuần",
    desc: "Tóm tắt doanh thu và hoạt động mỗi thứ Hai",
    icon: MessageSquare,
    defaultChecked: false,
  },
];

function SectionCard({
  icon: Icon,
  title,
  desc,
  children,
  action,
}: {
  icon: React.ElementType;
  title: string;
  desc?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm overflow-hidden">
      <div className="border-b border-neutral px-5 py-4 bg-neutral-light-active/40 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <Icon className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-primary">{title}</h2>
            {desc && <p className="text-xs text-neutral-dark mt-0.5">{desc}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

export default function NotificationSettingsView() {
  const {
    notifications,
    isLoading,
    hasMore,
    fetchNextPage,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const systemNotifications = notifications.filter((item) =>
    SYSTEM_TYPES.includes(item.type),
  );
  const systemUnreadCount = systemNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* ── Channel config ── */}
      <SectionCard icon={Bell} title="Kênh nhận thông báo" desc="Chọn cách bạn muốn được thông báo">
        <div className="space-y-3">
          {CHANNEL_ROWS.map((row) => {
            const Icon = row.icon;
            return (
              <label
                key={row.key}
                className="flex items-center justify-between rounded-xl border border-neutral bg-neutral-light-active px-4 py-3 cursor-pointer hover:bg-neutral-light transition-colors"
              >
                <span className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium text-primary">{row.label}</span>
                    <span className="block text-xs text-neutral-dark mt-0.5">{row.desc}</span>
                  </span>
                </span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-accent ml-4 shrink-0"
                  defaultChecked={row.defaultChecked}
                />
              </label>
            );
          })}
        </div>
      </SectionCard>

      {/* ── Per-type toggles ── */}
      <SectionCard icon={Bell} title="Loại thông báo" desc="Bật/tắt từng loại sự kiện">
        <div className="space-y-3">
          {Object.entries(TYPE_META).map(([type, meta]) => {
            const Icon = meta.icon;
            return (
              <label
                key={type}
                className="flex items-center justify-between rounded-xl border border-neutral bg-neutral-light-active px-4 py-3 cursor-pointer hover:bg-neutral-light transition-colors"
              >
                <span className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center h-7 w-7 rounded-lg ${meta.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-medium text-primary">{meta.label}</span>
                </span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-accent"
                  defaultChecked
                />
              </label>
            );
          })}
        </div>
      </SectionCard>

      {/* ── Notification board ── */}
      <SectionCard
        icon={Bell}
        title="Bảng thông báo"
        desc="Lịch sử các sự kiện hệ thống"
        action={
          systemUnreadCount > 0 ? (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-dark hover:text-accent transition-colors cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Đọc tất cả
              {systemUnreadCount > 0 && (
                <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                  {systemUnreadCount} mới
                </span>
              )}
            </button>
          ) : null
        }
      >
        <div className="rounded-xl border border-neutral overflow-hidden">
          {systemNotifications.length === 0 && !isLoading ? (
            <div className="py-12 text-center px-6 bg-neutral-light">
              <div className="w-12 h-12 rounded-2xl bg-neutral-light-active flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-5 h-5 text-neutral-dark" />
              </div>
              <p className="text-[13px] font-medium text-primary mb-1">Chưa có thông báo</p>
              <p className="text-[12px] text-neutral-dark">
                Hệ thống sẽ hiển thị khi có phát sinh mới.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral">
              {systemNotifications.map((item) => {
                const meta = TYPE_META[item.type];
                const Icon = meta?.icon ?? Bell;
                return (
                  <button
                    key={item.id}
                    onClick={() => { if (!item.isRead) markAsRead(item.id); }}
                    className={[
                      "w-full text-left px-4 py-3.5 flex gap-3 items-start transition-colors",
                      item.isRead
                        ? "bg-neutral-light hover:bg-neutral-light-active"
                        : "bg-accent/5 hover:bg-accent/10",
                    ].join(" ")}
                  >
                    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-lg shrink-0 mt-0.5 ${meta?.color ?? "bg-neutral text-neutral-dark"}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral text-neutral-dark">
                          {meta?.label ?? item.type}
                        </span>
                        {!item.isRead && (
                          <span className="text-[10px] font-semibold text-accent">Mới</span>
                        )}
                      </div>
                      <p className={`mt-1 text-[13px] leading-snug ${item.isRead ? "font-medium" : "font-semibold"}`}>
                        {item.title}
                      </p>
                      <p className="text-[12px] text-neutral-dark mt-0.5 line-clamp-2">{item.body}</p>
                    </div>
                    <div className="text-[11px] text-neutral-dark whitespace-nowrap shrink-0">
                      {formatRelativeDate(item.createdAt)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={fetchNextPage}
            disabled={isLoading}
            className="mx-auto mt-4 flex items-center gap-2 rounded-xl border border-neutral px-4 py-2 text-[12px] font-semibold text-primary hover:bg-neutral-light-active transition disabled:opacity-60"
          >
            {isLoading ? "Đang tải..." : "Tải thêm"}
          </button>
        )}
      </SectionCard>
    </div>
  );
}