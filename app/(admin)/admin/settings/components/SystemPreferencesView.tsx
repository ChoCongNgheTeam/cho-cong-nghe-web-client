"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Upload, AlertTriangle, FileImage, Loader2, Save, X, ShieldAlert, ChevronDown } from "lucide-react";
import { useToasty } from "@/components/Toast";
import { getSettings, updateSettingsFormData, parseSettings, type GeneralSettings } from "../_libs/settings";

/* ─── Defaults ─── */
const GENERAL_DEFAULTS: GeneralSettings = {
  site_name: "",
  site_email: "",
  site_phone: "",
  logo_url: "",
  favicon_url: "",
  maintenance_mode: false,
  maintenance_message: "Hệ thống đang được nâng cấp. Chúng tôi sẽ trở lại sớm.",
};

/* ─── Shared sub-components ─── */
const inputCls =
  "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors";
const textareaCls =
  "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors resize-none";

function Card({ icon: Icon, title, desc, children, onSave, saving }: { icon: React.ElementType; title: string; desc?: string; children: React.ReactNode; onSave?: () => void; saving?: boolean }) {
  return (
    <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm overflow-hidden">
      <div className="border-b border-neutral px-6 py-4 bg-neutral-light-active/40 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Icon className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-primary">{title}</h2>
          {desc && <p className="text-xs text-neutral-dark mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="px-6 py-6 space-y-5">
        {children}
        {onSave && (
          <div className="flex justify-end pt-1 border-t border-neutral">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 shadow-sm active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Lưu cấu hình
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="block text-xs font-semibold text-neutral-dark uppercase tracking-wide mb-1.5">
      {children}
      {hint && <span className="ml-1.5 normal-case font-normal text-neutral-dark/60">{hint}</span>}
    </span>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-neutral bg-neutral-light-active px-4 py-3 cursor-pointer hover:bg-neutral-light transition-colors">
      <span>
        <span className="block text-sm font-medium text-primary">{label}</span>
        {desc && <span className="block text-xs text-neutral-dark mt-0.5">{desc}</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-accent ml-4 shrink-0" />
    </label>
  );
}

function AssetUploader({
  label,
  hint,
  preview,
  onFile,
  onRemove,
  accept,
  w,
  h,
}: {
  label: string;
  hint?: string;
  preview: string | null;
  onFile: (f: File) => void;
  onRemove: () => void;
  accept?: string;
  w?: number;
  h?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <Label hint={hint}>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center rounded-xl border border-neutral bg-neutral-light-active overflow-hidden shrink-0" style={{ width: w ?? 80, height: h ?? 80 }}>
          {preview ? (
            <>
              <img src={preview} alt={label} className="w-full h-full object-contain" />
              <button
                type="button"
                onClick={onRemove}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <FileImage className="h-6 w-6 text-neutral-dark/40" />
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral bg-neutral-light-active px-4 py-2.5 text-sm font-medium text-primary hover:bg-neutral-light transition-colors"
          >
            <Upload className="h-4 w-4" />
            Tải lên {label.toLowerCase()}
          </button>
          {w && h && (
            <p className="text-xs text-neutral-dark/60 mt-1.5">
              Khuyến nghị: {w}×{h}px
            </p>
          )}
        </div>
        <input
          ref={ref}
          type="file"
          accept={accept ?? "image/*"}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              onFile(f);
              e.target.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function SystemPreferencesView() {
  const { success, error } = useToasty();

  /* ── State ── */
  const [settings, setSettings] = useState<GeneralSettings>(GENERAL_DEFAULTS);
  const [loadingInit, setLoadingInit] = useState(true);

  /* Logo / favicon as files (new upload) */
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const [savingBrand, setSavingBrand] = useState(false);
  const [savingMaint, setSavingMaint] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  /* ── Load from API ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getSettings("general");
        if (!cancelled) {
          setSettings(parseSettings<GeneralSettings>(res.data, GENERAL_DEFAULTS));
        }
      } catch {
        // silently use defaults — toast only on save failure
      } finally {
        if (!cancelled) setLoadingInit(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Cleanup blob URLs ── */
  useEffect(
    () => () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (faviconPreview) URL.revokeObjectURL(faviconPreview);
    },
    [logoPreview, faviconPreview],
  );

  const set = (patch: Partial<GeneralSettings>) => setSettings((p) => ({ ...p, ...patch }));

  /* ── Save brand ── */
  const saveBrand = async () => {
    setSavingBrand(true);
    try {
      const payload: Record<string, string | boolean | number> = {
        site_name: settings.site_name,
        site_email: settings.site_email,
        site_phone: settings.site_phone,
      };
      const files = {
        logo: logoFile ?? undefined,
        favicon: faviconFile ?? undefined,
      };
      const res = await updateSettingsFormData("general", payload, files);
      const updated = parseSettings<GeneralSettings>(res.data, settings);
      setSettings(updated);
      // reset file states after successful save
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (faviconPreview) URL.revokeObjectURL(faviconPreview);
      setLogoFile(null);
      setLogoPreview(updated.logo_url || null);
      setFaviconFile(null);
      setFaviconPreview(updated.favicon_url || null);
      success("Đã lưu thông tin thương hiệu");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Lưu thất bại";
      error(msg);
    } finally {
      setSavingBrand(false);
    }
  };

  /* ── Save maintenance ── */
  const saveMaintenance = async () => {
    setSavingMaint(true);
    try {
      const payload = {
        maintenance_mode: settings.maintenance_mode,
        maintenance_message: settings.maintenance_message,
      };
      await updateSettingsFormData("general", payload);
      success("Đã lưu cấu hình bảo trì");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Lưu thất bại";
      error(msg);
    } finally {
      setSavingMaint(false);
    }
  };

  const toggleMaintenance = () => {
    if (!settings.maintenance_mode) setConfirmModal(true);
    else {
      set({ maintenance_mode: false });
      success("Đã tắt chế độ bảo trì");
    }
  };

  /* ── Render logo/favicon preview from URL or blob ── */
  const logoDisplay = logoPreview || settings.logo_url || null;
  const faviconDisplay = faviconPreview || settings.favicon_url || null;

  if (loadingInit) {
    return (
      <div className="flex items-center justify-center py-16 text-neutral-dark text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải cài đặt...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Brand identity ── */}
      <Card icon={Building2} title="Nhận diện thương hiệu" desc="Logo, favicon, tên và thông tin liên hệ" onSave={saveBrand} saving={savingBrand}>
        <div className="grid gap-6 sm:grid-cols-2">
          <AssetUploader
            label="Logo"
            hint="(hiển thị trên header)"
            preview={logoDisplay}
            onFile={(f) => {
              if (logoPreview) URL.revokeObjectURL(logoPreview);
              setLogoFile(f);
              setLogoPreview(URL.createObjectURL(f));
            }}
            onRemove={() => {
              if (logoPreview) URL.revokeObjectURL(logoPreview);
              setLogoFile(null);
              setLogoPreview(null);
              set({ logo_url: "" });
            }}
            w={200}
            h={60}
          />
          <AssetUploader
            label="Favicon"
            hint="(icon tab trình duyệt)"
            preview={faviconDisplay}
            onFile={(f) => {
              if (faviconPreview) URL.revokeObjectURL(faviconPreview);
              setFaviconFile(f);
              setFaviconPreview(URL.createObjectURL(f));
            }}
            onRemove={() => {
              if (faviconPreview) URL.revokeObjectURL(faviconPreview);
              setFaviconFile(null);
              setFaviconPreview(null);
              set({ favicon_url: "" });
            }}
            accept=".ico,.png,.svg"
            w={48}
            h={48}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Tên thương hiệu</Label>
            <input value={settings.site_name} onChange={(e) => set({ site_name: e.target.value })} placeholder="VD: My Shop" className={inputCls} />
          </div>
          <div>
            <Label>Email liên hệ</Label>
            <input type="email" value={settings.site_email} onChange={(e) => set({ site_email: e.target.value })} placeholder="support@example.com" className={inputCls} />
          </div>
          <div>
            <Label>Số điện thoại hotline</Label>
            <input value={settings.site_phone} onChange={(e) => set({ site_phone: e.target.value })} placeholder="0900 000 000" className={inputCls} />
          </div>
        </div>
      </Card>

      {/* ── 2. Maintenance kill-switch ── */}
      <Card icon={ShieldAlert} title="Chế độ bảo trì (Kill Switch)" desc="Ẩn toàn bộ trang client ngay lập tức khi cần xử lý sự cố" onSave={saveMaintenance} saving={savingMaint}>
        {settings.maintenance_mode && (
          <div className="flex gap-3 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800/40 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">Chế độ bảo trì đang bật</p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">Trang client đang ẩn. Chỉ Admin mới truy cập được dashboard.</p>
            </div>
          </div>
        )}

        <label className="flex items-center justify-between rounded-xl border border-neutral bg-neutral-light-active px-4 py-3 cursor-pointer hover:bg-neutral-light transition-colors">
          <span>
            <span className="block text-sm font-medium text-primary">Bật chế độ bảo trì</span>
            <span className="block text-xs text-neutral-dark mt-0.5">Người dùng sẽ thấy trang thông báo bảo trì</span>
          </span>
          <button
            type="button"
            onClick={toggleMaintenance}
            className={[
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors",
              settings.maintenance_mode ? "bg-red-500 border-red-500" : "bg-neutral border-neutral",
            ].join(" ")}
          >
            <span className={["inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", settings.maintenance_mode ? "translate-x-5" : "translate-x-0.5"].join(" ")} />
          </button>
        </label>

        <div>
          <Label>Thông điệp bảo trì</Label>
          <textarea value={settings.maintenance_message} onChange={(e) => set({ maintenance_message: e.target.value })} rows={2} className={textareaCls} />
        </div>
      </Card>

      {/* ── Confirm maintenance modal ── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmModal(false)} />
          <div className="relative w-full max-w-md mx-4 rounded-2xl border border-neutral bg-neutral-light shadow-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-primary">Bật chế độ bảo trì?</h2>
                <p className="text-sm text-neutral-dark mt-1.5">Toàn bộ trang client sẽ bị ẩn ngay lập tức. Người dùng sẽ thấy trang bảo trì cho đến khi bạn tắt.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmModal(false)} className="px-4 py-2.5 rounded-xl border border-neutral text-sm font-medium text-primary hover:bg-neutral-light-active transition-colors">
                Hủy
              </button>
              <button
                onClick={() => {
                  setConfirmModal(false);
                  set({ maintenance_mode: true });
                }}
                className="px-4 py-2.5 rounded-xl bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Xác nhận bật bảo trì
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
