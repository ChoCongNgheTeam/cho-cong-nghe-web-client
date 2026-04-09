"use client";

import type { Metadata } from "next";
import { useState, useCallback } from "react";
import {
  Database,
  History,
  Sparkles,
  Download,
  Trash2,
  Info,
  AlertTriangle,
  X,
  Check,
} from "lucide-react";

// ─── Confirmation Dialog ────────────────────────────────────────────────────

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="
          bg-white rounded-2xl border border-neutral shadow-lg
          w-full max-w-sm mx-4 p-6
          animate-in fade-in zoom-in-95 duration-150
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          {danger && (
            <div className="p-1.5 rounded-lg bg-red-50 shrink-0 mt-0.5">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
          )}
          <div>
            <h2 className="text-base font-semibold text-primary">{title}</h2>
            <p className="text-sm text-neutral-dark mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="
              px-4 py-2 rounded-xl text-sm font-medium
              border border-neutral text-primary
              hover:bg-neutral-light transition
            "
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className={`
              px-4 py-2 rounded-xl text-sm font-semibold text-white transition
              ${danger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-accent hover:bg-accent-hover"
              }
            `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle Switch ──────────────────────────────────────────────────────────

type ToggleSwitchProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function ToggleSwitch({ id, checked, onChange }: ToggleSwitchProps) {
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
          rounded-full bg-neutral/70
          shadow-inner ring-1 ring-neutral/40
          transition-colors
          peer-checked:bg-accent
          peer-focus-visible:ring-2
          peer-focus-visible:ring-accent/40
          after:content-['']
          after:absolute after:left-1 after:top-1
          after:h-4 after:w-4
          after:rounded-full after:bg-white
          after:shadow-sm after:transition-transform
          peer-checked:after:translate-x-5
        "
      />
    </div>
  );
}

// ─── Toggle Row ─────────────────────────────────────────────────────────────

type RowProps = {
  icon: React.ElementType;
  title: string;
  desc: string;
  id: string;
  checked: boolean;
  hasUnsavedChange: boolean;
  onChange: (checked: boolean) => void;
};

function Row({
  icon: Icon,
  title,
  desc,
  id,
  checked,
  hasUnsavedChange,
  onChange,
}: RowProps) {
  return (
    <div
      className="
        flex flex-col sm:flex-row sm:items-center justify-between
        gap-3 rounded-xl border border-neutral bg-white/70 p-3 sm:p-4
        cursor-pointer hover:bg-white transition
      "
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent-light shrink-0">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="text-sm sm:text-base font-medium text-primary flex items-center gap-2">
            {title}
            {hasUnsavedChange && (
              <span className="inline-flex h-2 w-2 rounded-full bg-amber-400" title="Chưa lưu" />
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

// ─── Action Button ──────────────────────────────────────────────────────────

type ActionButtonProps = {
  icon: React.ElementType;
  label: string;
  variant?: "default" | "danger";
  onClick: () => void;
};

function ActionButton({
  icon: Icon,
  label,
  variant = "default",
  onClick,
}: ActionButtonProps) {
  const isDanger = variant === "danger";
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-2 text-center
        rounded-xl border px-4 py-3 text-sm font-semibold
        transition
        ${isDanger
          ? "border-red-200 bg-red-50/60 text-red-600 hover:bg-red-50"
          : "border-neutral bg-white/70 text-primary hover:bg-neutral-light"
        }
      `}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="leading-snug">{label}</span>
    </button>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

type ToggleState = {
  personalization: boolean;
  viewHistory: boolean;
};

type DialogState = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  danger: boolean;
  onConfirm: () => void;
};

const INITIAL_DIALOG: DialogState = {
  open: false,
  title: "",
  description: "",
  confirmLabel: "",
  danger: false,
  onConfirm: () => {},
};

export default function PrivacySettingsPage() {
  // Saved state (server truth)
  const [saved, setSaved] = useState<ToggleState>({
    personalization: true,
    viewHistory: true,
  });

  // Local (in-progress) state
  const [local, setLocal] = useState<ToggleState>({ ...saved });

  const [dialog, setDialog] = useState<DialogState>(INITIAL_DIALOG);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const hasUnsaved =
    local.personalization !== saved.personalization ||
    local.viewHistory !== saved.viewHistory;

  const handleToggle = (key: keyof ToggleState) => (value: boolean) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    // Simulate async save
    await new Promise((r) => setTimeout(r, 600));
    setSaved({ ...local });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [local]);

  const openDialog = (opts: Omit<DialogState, "open">) => {
    setDialog({ open: true, ...opts });
  };

  const closeDialog = () => setDialog(INITIAL_DIALOG);

  return (
    <>
      <ConfirmDialog
        open={dialog.open}
        title={dialog.title}
        description={dialog.description}
        confirmLabel={dialog.confirmLabel}
        danger={dialog.danger}
        onConfirm={() => {
          dialog.onConfirm();
          closeDialog();
        }}
        onCancel={closeDialog}
      />

      <div className="w-full max-w-2xl mx-auto pb-24">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary">
            Quyền riêng tư
          </h1>
          <p className="text-sm text-neutral-dark mt-2">
            Kiểm soát cách dữ liệu được dùng để cá nhân hóa trải nghiệm của bạn.
          </p>
        </div>

        {/* Personalization */}
        <section className="bg-neutral-light border border-neutral rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="text-sm font-semibold text-primary">
            Cá nhân hóa trải nghiệm
          </div>

          <Row
            icon={Sparkles}
            title="Gợi ý sản phẩm phù hợp"
            desc="Sử dụng hành vi trên website để đề xuất sản phẩm đúng nhu cầu hơn."
            id="personalization"
            checked={local.personalization}
            hasUnsavedChange={local.personalization !== saved.personalization}
            onChange={handleToggle("personalization")}
          />

          <Row
            icon={History}
            title="Lưu lịch sử xem trong tài khoản"
            desc="Cho phép xem lại sản phẩm đã xem trên thiết bị khác. Không ảnh hưởng lịch sử trình duyệt."
            id="view-history"
            checked={local.viewHistory}
            hasUnsavedChange={local.viewHistory !== saved.viewHistory}
            onChange={handleToggle("viewHistory")}
          />
        </section>

        {/* Data Control */}
        <section className="bg-neutral-light border border-neutral rounded-2xl p-4 sm:p-6 space-y-3 mt-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Database className="h-4 w-4 text-accent" />
            Quyền dữ liệu
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ActionButton
              icon={Trash2}
              label="Xóa lịch sử cá nhân hóa"
              onClick={() =>
                openDialog({
                  title: "Xóa lịch sử cá nhân hóa?",
                  description:
                    "Các gợi ý sản phẩm sẽ được đặt lại từ đầu. Hành động này không thể hoàn tác.",
                  confirmLabel: "Xóa",
                  danger: false,
                  onConfirm: () => {
                    // TODO: call API
                  },
                })
              }
            />

            <ActionButton
              icon={Trash2}
              label="Xóa toàn bộ dữ liệu"
              variant="danger"
              onClick={() =>
                openDialog({
                  title: "Xóa toàn bộ dữ liệu?",
                  description:
                    "Toàn bộ dữ liệu cá nhân, lịch sử và cài đặt sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.",
                  confirmLabel: "Xóa vĩnh viễn",
                  danger: true,
                  onConfirm: () => {
                    // TODO: call API
                  },
                })
              }
            />

            <ActionButton
              icon={Download}
              label="Tải dữ liệu của tôi"
              onClick={() => {
                // TODO: trigger download
              }}
            />
          </div>

          <p className="text-xs text-neutral-dark">
            Các thao tác này áp dụng cho dữ liệu lưu trong tài khoản của bạn.
          </p>
        </section>

        {/* Transparency */}
        <section className="mt-6 rounded-2xl border border-neutral bg-white/60 p-4 text-xs text-neutral-dark flex gap-2">
          <Info className="h-4 w-4 mt-0.5 text-accent shrink-0" />
          <p>
            Chúng tôi chỉ sử dụng dữ liệu để cải thiện trải nghiệm mua sắm và
            không bán thông tin cá nhân. Bạn có thể yêu cầu xóa dữ liệu bất cứ
            lúc nào.
          </p>
        </section>

        {/* Save Bar */}
        <div className="sticky bottom-0 mt-8">
          <div className="
            bg-neutral-light/95 backdrop-blur
            border border-neutral rounded-2xl
            p-3 sm:p-4
            flex flex-col sm:flex-row items-center justify-between gap-3
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
                w-full sm:w-auto
                px-6 py-2.5
                rounded-full
                bg-accent text-white text-sm font-semibold
                hover:bg-accent-hover
                transition
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
    </>
  );
}