"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, MessageSquare, Inbox, CheckCheck, Package, UserX, Star, Loader2, Save } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatRelativeDate } from "@/helpers/formatRelativeDate";
import { getMyNotifPreferences, updateMyNotifPreferences, type NotifPreferences } from "../_libs/settings";
import { useToasty } from "@/components/Toast";

// ─── Config ───────────────────────────────────────────────────────────────────

const SYSTEM_TYPES = ["ORDER_STATUS", "USER_INACTIVE", "REVIEW_NEW"];

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string; prefKey: keyof NotifPreferences }> = {
  ORDER_STATUS: {
    label: "Đơn hàng",
    icon: Package,
    color: "bg-accent/10 text-accent",
    prefKey: "notifOrderStatus",
  },
  USER_INACTIVE: {
    label: "Người dùng",
    icon: UserX,
    color: "bg-amber-500/10 text-amber-600",
    prefKey: "notifUserInactive",
  },
  REVIEW_NEW: {
    label: "Đánh giá",
    icon: Star,
    color: "bg-green-500/10 text-green-600",
    prefKey: "notifReviewNew",
  },
};

const CHANNEL_ROWS: {
  key: keyof NotifPreferences;
  label: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  {
    key: "notifEmail",
    label: "Nhận thông báo qua Email",
    desc: "Gửi mail khi có đơn hàng mới hoặc sự kiện quan trọng",
    icon: Mail,
  },
  {
    key: "notifPush",
    label: "Nhận thông báo Push",
    desc: "Thông báo trình duyệt theo thời gian thực",
    icon: Bell,
  },
  {
    key: "notifWeeklyReport",
    label: "Nhận báo cáo tuần",
    desc: "Tóm tắt doanh thu và hoạt động mỗi thứ Hai",
    icon: MessageSquare,
  },
];

const PREF_DEFAULTS: NotifPreferences = {
  notifEmail: true,
  notifPush: true,
  notifWeeklyReport: false,
  notifOrderStatus: true,
  notifUserInactive: true,
  notifReviewNew: true,
};

// ─── Shared UI ─────────────────────────────────────────────────────────────────

function SectionCard({ icon: Icon, title, desc, children, action }: { icon: React.ElementType; title: string; desc?: string; children: React.ReactNode; action?: React.ReactNode }) {
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

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function NotificationSettingsView() {
  const { success, error } = useToasty();
  const { notifications, isLoading: notifsLoading, hasMore, fetchNextPage, markAsRead, markAllAsRead } = useNotifications();

  const [prefs, setPrefs] = useState<NotifPreferences>(PREF_DEFAULTS);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    getMyNotifPreferences()
      .then((res) => setPrefs(res.data))
      .catch(() => {
        // API chưa có hoặc lỗi → giữ defaults, không hiện error toast
      })
      .finally(() => setLoadingPrefs(false));
  }, []);

  const setP = (key: keyof NotifPreferences, value: boolean) => setPrefs((p) => ({ ...p, [key]: value }));

  const savePrefs = async () => {
    setSavingPrefs(true);
    try {
      await updateMyNotifPreferences(prefs);
      success("Lưu tùy chọn thông báo thành công");
    } catch {
      error("Lưu thất bại, thử lại sau");
    } finally {
      setSavingPrefs(false);
    }
  };

  const systemNotifications = notifications.filter((item) => SYSTEM_TYPES.includes(item.type));
  const systemUnreadCount = systemNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* ── Channel config ── */}
      <SectionCard
        icon={Bell}
        title="Kênh nhận thông báo"
        desc="Chọn cách bạn muốn được thông báo"
        action={
          <button
            type="button"
            onClick={savePrefs}
            disabled={savingPrefs || loadingPrefs}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-neutral-light hover:bg-primary/90 disabled:opacity-60 transition cursor-pointer"
          >
            {savingPrefs ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Lưu
              </>
            )}
          </button>
        }
      >
        {loadingPrefs ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          </div>
        ) : (
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
                  <input type="checkbox" className="h-4 w-4 accent-accent ml-4 shrink-0" checked={prefs[row.key] as boolean} onChange={(e) => setP(row.key, e.target.checked)} />
                </label>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ── Per-type toggles ── */}
      <SectionCard icon={Bell} title="Loại thông báo" desc="Bật/tắt từng loại sự kiện">
        {loadingPrefs ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          </div>
        ) : (
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
                  <input type="checkbox" className="h-4 w-4 accent-accent" checked={prefs[meta.prefKey] as boolean} onChange={(e) => setP(meta.prefKey, e.target.checked)} />
                </label>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ── Notification board ── */}
      <SectionCard
        icon={Bell}
        title="Bảng thông báo"
        desc="Lịch sử các sự kiện hệ thống"
        action={
          systemUnreadCount > 0 ? (
            <button onClick={markAllAsRead} className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-dark hover:text-accent transition-colors cursor-pointer">
              <CheckCheck className="h-3.5 w-3.5" />
              Đọc tất cả
              <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">{systemUnreadCount} mới</span>
            </button>
          ) : null
        }
      >
        <div className="rounded-xl border border-neutral overflow-hidden">
          {systemNotifications.length === 0 && !notifsLoading ? (
            <div className="py-12 text-center px-6 bg-neutral-light">
              <div className="w-12 h-12 rounded-2xl bg-neutral-light-active flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-5 h-5 text-neutral-dark" />
              </div>
              <p className="text-[13px] font-medium text-primary mb-1">Chưa có thông báo</p>
              <p className="text-[12px] text-neutral-dark">Hệ thống sẽ hiển thị khi có phát sinh mới.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral">
              {systemNotifications.map((item) => {
                const meta = TYPE_META[item.type];
                const Icon = meta?.icon ?? Bell;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!item.isRead) markAsRead(item.id);
                    }}
                    className={[
                      "w-full text-left px-4 py-3.5 flex gap-3 items-start transition-colors",
                      item.isRead ? "bg-neutral-light hover:bg-neutral-light-active" : "bg-accent/5 hover:bg-accent/10",
                    ].join(" ")}
                  >
                    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-lg shrink-0 mt-0.5 ${meta?.color ?? "bg-neutral text-neutral-dark"}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral text-neutral-dark">{meta?.label ?? item.type}</span>
                        {!item.isRead && <span className="text-[10px] font-semibold text-accent">Mới</span>}
                      </div>
                      <p className={`mt-1 text-[13px] leading-snug ${item.isRead ? "font-medium" : "font-semibold"}`}>{item.title}</p>
                      <p className="text-[12px] text-neutral-dark mt-0.5 line-clamp-2">{item.body}</p>
                    </div>
                    <div className="text-[11px] text-neutral-dark whitespace-nowrap shrink-0">{formatRelativeDate(item.createdAt)}</div>
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
            disabled={notifsLoading}
            className="mx-auto mt-4 flex items-center gap-2 rounded-xl border border-neutral px-4 py-2 text-[12px] font-semibold text-primary hover:bg-neutral-light-active transition disabled:opacity-60"
          >
            {notifsLoading ? "Đang tải..." : "Tải thêm"}
          </button>
        )}
      </SectionCard>
    </div>
  );
}
