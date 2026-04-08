"use client";

import { useState, useCallback } from "react";
import type { Metadata } from "next";
import { Bell, BellRing, BadgePercent, Check } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type NotifState = {
  email: boolean;
  push: boolean;
  promo: boolean;
};

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="relative inline-flex items-center shrink-0">
      <input
        id={id}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
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

// ─── Row ─────────────────────────────────────────────────────────────────────

function Row({
  icon: Icon,
  title,
  desc,
  id,
  checked,
  hasUnsavedChange,
  onChange,
  disabled,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  id: string;
  checked: boolean;
  hasUnsavedChange: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`
        flex flex-col sm:flex-row sm:items-center justify-between
        gap-3 rounded-xl border border-neutral bg-white/70 p-3 sm:p-4
        transition cursor-pointer
        ${disabled ? "opacity-50 pointer-events-none" : "hover:bg-white"}
      `}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent-light shrink-0">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="text-sm sm:text-base font-medium text-primary flex items-center gap-2">
            {title}
            {hasUnsavedChange && (
              <span
                className="inline-flex h-2 w-2 rounded-full bg-amber-400"
                title="Chưa lưu"
              />
            )}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationSettingsPage() {
  const [saved, setSaved] = useState<NotifState>({
    email: true,
    push: true,
    promo: false,
  });

  const [local, setLocal] = useState<NotifState>({ ...saved });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const hasUnsaved =
    local.email !== saved.email ||
    local.push !== saved.push ||
    local.promo !== saved.promo;

  // Master toggle: all essential channels (email + push)
  const allEssentialOn = local.email && local.push;

  const handleMasterToggle = () => {
    const next = !allEssentialOn;
    setLocal((prev) => ({ ...prev, email: next, push: next }));
  };

  const handleToggle = (key: keyof NotifState) => (value: boolean) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    await new Promise((r) => setTimeout(r, 600));
    setSaved({ ...local });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [local]);

  return (
    <div className="w-full max-w-2xl mx-auto pb-24">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary">
          Cài đặt thông báo
        </h1>
        <p className="text-sm text-neutral-dark mt-2">
          Bật hoặc tắt các kênh nhận thông báo bạn muốn.
        </p>
      </div>

      {/* Essential notifications */}
      <section className="bg-neutral-light border border-neutral rounded-2xl p-4 sm:p-6 space-y-4">
        {/* Section header + master toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-primary">Thông báo hệ thống</p>
          <button
            onClick={handleMasterToggle}
            className="text-xs font-medium text-accent hover:underline transition"
          >
            {allEssentialOn ? "Tắt tất cả" : "Bật tất cả"}
          </button>
        </div>

        <Row
          icon={Bell}
          title="Thông báo Email"
          desc="Đơn hàng, xác nhận tài khoản và cập nhật quan trọng."
          id="notify-email"
          checked={local.email}
          hasUnsavedChange={local.email !== saved.email}
          onChange={handleToggle("email")}
        />

        <Row
          icon={BellRing}
          title="Thông báo Push"
          desc="Thông báo tức thì về trạng thái đơn hàng và hoạt động tài khoản."
          id="notify-push"
          checked={local.push}
          hasUnsavedChange={local.push !== saved.push}
          onChange={handleToggle("push")}
        />
      </section>

      {/* Promotional — separate section, clearly optional */}
      <section className="bg-neutral-light border border-neutral rounded-2xl p-4 sm:p-6 space-y-4 mt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-primary">Khuyến mãi</p>
          <span className="text-xs text-neutral-dark bg-neutral/60 px-2 py-0.5 rounded-full">
            Tùy chọn
          </span>
        </div>

        <Row
          icon={BadgePercent}
          title="Thông báo khuyến mãi"
          desc="Flash sale, voucher và ưu đãi dành riêng cho bạn."
          id="notify-promo"
          checked={local.promo}
          hasUnsavedChange={local.promo !== saved.promo}
          onChange={handleToggle("promo")}
        />

        <p className="text-xs text-neutral-dark">
          Tần suất tối đa 3 lần/tuần. Bạn có thể tắt bất cứ lúc nào.
        </p>
      </section>

      {/* Save bar */}
      <div className="sticky bottom-0 mt-8">
        <div className="
          bg-neutral-light/95 backdrop-blur border border-neutral rounded-2xl
          p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3
        ">
          <p className={`text-xs sm:text-sm transition-colors ${
            hasUnsaved ? "text-amber-600 font-medium" : "text-neutral-dark"
          }`}>
            {saveStatus === "saved"
              ? "Đã lưu thành công."
              : hasUnsaved
              ? "Có thay đổi chưa được lưu."
              : "Lưu để áp dụng thay đổi."}
          </p>

          <button
            disabled={!hasUnsaved || saveStatus === "saving"}
            onClick={handleSave}
            className="
              w-full sm:w-auto px-6 py-2.5 rounded-full
              bg-accent text-white text-sm font-semibold
              hover:bg-accent-hover transition
              disabled:opacity-40 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
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