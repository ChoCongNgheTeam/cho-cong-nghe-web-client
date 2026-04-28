"use client";

import { useState, useCallback, useEffect } from "react";
import { Bell, BellRing, BadgePercent, Check, Mail, CalendarDays, UserX, Star, Package, Loader2 } from "lucide-react";
import { getMyNotifPreferences, updateMyNotifPreferences, NOTIF_KEYS_BY_ROLE, NOTIF_DEFAULTS, type NotifPreferences, type UserRole } from "../_lib/settings";
import { useAuth } from "@/hooks/useAuth";
import { useToasty } from "@/components/Toast";

// ─── Row config per key ────────────────────────────────────────────────────────

type RowConfig = {
  key: keyof NotifPreferences;
  icon: React.ElementType;
  title: string;
  desc: string;
  section: "system" | "promo";
};

const ALL_ROWS: RowConfig[] = [
  {
    key: "notifEmail",
    icon: Mail,
    title: "Thông báo Email",
    desc: "Đơn hàng, xác nhận tài khoản và cập nhật quan trọng.",
    section: "system",
  },
  {
    key: "notifPush",
    icon: BellRing,
    title: "Thông báo hoạt động",
    desc: "Thông báo tức thì về trạng thái đơn hàng và hoạt động tài khoản.",
    section: "system",
  },
  {
    key: "notifOrderStatus",
    icon: Package,
    title: "Cập nhật đơn hàng",
    desc: "Nhận thông báo khi trạng thái đơn hàng thay đổi.",
    section: "system",
  },
  {
    key: "notifReviewNew",
    icon: Star,
    title: "Đánh giá mới",
    desc: "Thông báo khi có đánh giá sản phẩm mới cần duyệt.",
    section: "system",
  },
  {
    key: "notifUserInactive",
    icon: UserX,
    title: "Người dùng không hoạt động",
    desc: "Cảnh báo khi có tài khoản ngừng hoạt động bất thường.",
    section: "system",
  },
  {
    key: "notifWeeklyReport",
    icon: CalendarDays,
    title: "Báo cáo tuần",
    desc: "Tóm tắt doanh thu và hoạt động hệ thống mỗi thứ Hai.",
    section: "promo",
  },
  // CUSTOMER-only promo row — mapped to notifPush as closest key,
  // kept separate so it renders in the promo section visually
];

// ─── Toggle Switch ─────────────────────────────────────────────────────────────

function ToggleSwitch({ id, checked, onChange }: { id: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="relative inline-flex items-center shrink-0">
      <input id={id} type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label
        htmlFor={id}
        className="
          relative inline-flex h-6 w-11 cursor-pointer items-center
          rounded-full bg-neutral/70 shadow-inner ring-1 ring-neutral/40
          transition-colors peer-checked:bg-accent
          peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40
          after:content-[''] after:absolute after:left-1 after:top-1
          after:h-4 after:w-4 after:rounded-full after:bg-white
          after:shadow-sm after:transition-transform
          peer-checked:after:translate-x-5
        "
      />
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function Row({
  icon: Icon,
  title,
  desc,
  id,
  checked,
  hasUnsavedChange,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  id: string;
  checked: boolean;
  hasUnsavedChange: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral bg-white/70 p-3 sm:p-4 transition hover:bg-white cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent-light shrink-0">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="text-sm sm:text-base font-medium text-primary flex items-center gap-2">
            {title}
            {hasUnsavedChange && <span className="inline-flex h-2 w-2 rounded-full bg-amber-400" title="Chưa lưu" />}
          </p>
          <p className="text-xs sm:text-sm text-neutral-dark">{desc}</p>
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <ToggleSwitch id={id} checked={checked} onChange={onChange} />
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function NotificationSettingsPage() {
  const { user } = useAuth(); // { role: UserRole, ... }
  const toast = useToasty();

  const role: UserRole = (user?.role as UserRole) ?? "CUSTOMER";
  const allowedKeys = NOTIF_KEYS_BY_ROLE[role];

  const [saved, setSaved] = useState<NotifPreferences>(NOTIF_DEFAULTS);
  const [local, setLocal] = useState<NotifPreferences>(NOTIF_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Fetch on mount
  useEffect(() => {
    getMyNotifPreferences()
      .then((res) => {
        setSaved(res.data);
        setLocal(res.data);
      })
      .catch(() => {
        // giữ defaults nếu API lỗi
      })
      .finally(() => setLoading(false));
  }, []);

  const hasUnsaved = allowedKeys.some((k) => local[k] !== saved[k]);

  // Filter rows to only those allowed for this role
  const visibleRows = ALL_ROWS.filter((r) => allowedKeys.includes(r.key));
  const systemRows = visibleRows.filter((r) => r.section === "system");
  const promoRows = visibleRows.filter((r) => r.section === "promo");

  // Master toggle — only over system rows visible to this role
  const systemKeys = systemRows.map((r) => r.key);
  const allSystemOn = systemKeys.length > 0 && systemKeys.every((k) => local[k]);

  const handleMasterToggle = () => {
    const next = !allSystemOn;
    setLocal((prev) => {
      const updated = { ...prev };
      systemKeys.forEach((k) => {
        updated[k] = next;
      });
      return updated;
    });
  };

  const handleToggle = (key: keyof NotifPreferences) => (value: boolean) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    try {
      // Chỉ gửi các key được phép của role này
      const payload = allowedKeys.reduce<Partial<NotifPreferences>>((acc, k) => {
        acc[k] = local[k];
        return acc;
      }, {});
      const res = await updateMyNotifPreferences(payload);
      setSaved(res.data);
      setLocal(res.data);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      toast.error("Lưu thất bại, vui lòng thử lại", { title: "Lỗi" });
      setSaveStatus("idle");
    }
  }, [local, allowedKeys]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="w-full pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary">Cài đặt thông báo</h1>
        <p className="text-sm text-neutral-dark mt-2">Bật hoặc tắt các kênh nhận thông báo bạn muốn.</p>
      </div>

      {/* System notifications */}
      {systemRows.length > 0 && (
        <section className="bg-neutral-light border border-neutral rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-primary">Thông báo hệ thống</p>
            <button onClick={handleMasterToggle} className="text-xs font-medium text-accent hover:underline transition">
              {allSystemOn ? "Tắt tất cả" : "Bật tất cả"}
            </button>
          </div>
          {systemRows.map((row) => (
            <Row
              key={row.key}
              icon={row.icon}
              title={row.title}
              desc={row.desc}
              id={`notify-${row.key}`}
              checked={local[row.key]}
              hasUnsavedChange={local[row.key] !== saved[row.key]}
              onChange={handleToggle(row.key)}
            />
          ))}
        </section>
      )}

      {/* Promo / optional notifications — only render if role has any */}
      {promoRows.length > 0 && (
        <section className="bg-neutral-light border border-neutral rounded-2xl p-4 sm:p-6 space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-primary">{role === "CUSTOMER" ? "Khuyến mãi" : "Báo cáo & Theo dõi"}</p>
            <span className="text-xs text-neutral-dark bg-neutral/60 px-2 py-0.5 rounded-full">Tùy chọn</span>
          </div>
          {promoRows.map((row) => (
            <Row
              key={row.key}
              icon={row.icon}
              title={row.title}
              desc={row.desc}
              id={`notify-${row.key}`}
              checked={local[row.key]}
              hasUnsavedChange={local[row.key] !== saved[row.key]}
              onChange={handleToggle(row.key)}
            />
          ))}
          {role === "CUSTOMER" && <p className="text-xs text-neutral-dark">Tần suất tối đa 3 lần/tuần. Bạn có thể tắt bất cứ lúc nào.</p>}
        </section>
      )}

      {/* Save bar */}
      <div className="sticky bottom-0 mt-8">
        <div className="bg-neutral-light/95 backdrop-blur border border-neutral rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className={`text-xs sm:text-sm transition-colors ${hasUnsaved ? "text-amber-600 font-medium" : "text-neutral-dark"}`}>
            {saveStatus === "saved" ? "Đã lưu thành công." : hasUnsaved ? "Có thay đổi chưa được lưu." : "Lưu để áp dụng thay đổi."}
          </p>
          <button
            disabled={!hasUnsaved || saveStatus === "saving"}
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saveStatus === "saving" ? (
              <>
                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="h-4 w-4" />
                Đã lưu
              </>
            ) : (
              "Lưu cài đặt"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
