import { Bell, Mail, MessageSquare, Inbox, CheckCheck } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatRelativeDate } from "@/helpers/formatRelativeDate";

const SYSTEM_TYPES = ["ORDER_STATUS", "USER_INACTIVE", "USER_FEEDBACK"];

export default function NotificationSettingsView() {
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchNextPage,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const systemNotifications = notifications.filter((item) =>
    SYSTEM_TYPES.includes(item.type),
  );
  const systemUnreadCount = systemNotifications.reduce(
    (total, item) => total + (item.isRead ? 0 : 1),
    0,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm">
        <div className="border-b border-neutral px-5 py-4">
          <div className="flex items-center gap-2 text-accent">
            <Bell className="h-5 w-5" />
            <h2 className="text-base font-semibold text-primary">
              Thông báo hệ thống
            </h2>
          </div>
          <p className="text-sm text-neutral-dark mt-1">
            Quản lý kênh nhận thông báo và báo cáo
          </p>
        </div>
        <div className="px-6 py-5 space-y-3 text-sm">
          {[
            { label: "Nhận thông báo qua Email", icon: Mail },
            { label: "Nhận thông báo qua Push", icon: Bell },
            { label: "Nhận báo cáo tuần", icon: MessageSquare },
          ].map((row) => {
            const Icon = row.icon;
            return (
              <label
                key={row.label}
                className="flex items-center justify-between rounded-xl border border-neutral bg-neutral-light-active px-4 py-3"
              >
                <span className="flex items-center gap-2 text-primary">
                  <Icon className="h-4 w-4 text-accent" />
                  {row.label}
                </span>
                <input type="checkbox" className="h-4 w-4 accent-accent" defaultChecked />
              </label>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm">
        <div className="border-b border-neutral px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-accent">
            <Bell className="h-5 w-5" />
            <h2 className="text-base font-semibold text-primary">
              Bảng thông báo hệ thống
            </h2>
            {systemUnreadCount > 0 && (
              <span className="text-[11px] font-semibold text-accent bg-accent-light px-2 py-0.5 rounded-full leading-none">
                {systemUnreadCount} mới
              </span>
            )}
          </div>
          {systemUnreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-dark hover:text-accent transition-colors duration-150 cursor-pointer"
            >
              <CheckCheck size={13} />
              Đọc tất cả
            </button>
          )}
        </div>
        <div className="px-5 py-4">
          <div className="rounded-2xl border border-neutral overflow-hidden">
            {systemNotifications.length === 0 && !isLoading ? (
              <div className="py-12 text-center px-6 bg-neutral-light">
                <div className="w-12 h-12 rounded-2xl bg-neutral-light-active flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-5 h-5 text-neutral-dark" />
                </div>
                <p className="text-[13px] font-medium text-primary mb-1">
                  Chưa có thông báo
                </p>
                <p className="text-[12px] text-neutral-dark">
                  Hệ thống sẽ hiển thị khi có phát sinh mới từ người dùng hoặc hệ thống.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral">
                {systemNotifications.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!item.isRead) markAsRead(item.id);
                    }}
                    className={`w-full text-left px-4 py-3.5 flex flex-wrap sm:flex-nowrap gap-3 items-start transition-colors ${
                      item.isRead
                        ? "bg-neutral-light hover:bg-neutral-light-hover"
                        : "bg-accent-light hover:bg-accent-light"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                          {item.type}
                        </span>
                        {!item.isRead && (
                          <span className="text-[10px] font-semibold text-accent">Mới</span>
                        )}
                      </div>
                      <p className={`mt-1 text-[13px] leading-snug ${item.isRead ? "font-medium" : "font-semibold"}`}>
                        {item.title}
                      </p>
                      <p className="text-[12px] text-neutral-dark mt-0.5 line-clamp-2">
                        {item.body}
                      </p>
                    </div>
                    <div className="text-[11px] text-neutral-dark whitespace-nowrap">
                      {formatRelativeDate(item.createdAt)}
                    </div>
                  </button>
                ))}
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
        </div>
      </section>
    </div>
  );
}
