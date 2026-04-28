"use client";

import { useState, useEffect, useRef } from "react";
import { Building2, Globe, Phone, Mail, FileImage, Loader2, Save, ShieldAlert, Image as ImageIcon, X, Upload } from "lucide-react";
import { useToasty } from "@/components/Toast";
import { getSettings, updateSettingsFormData, parseSettings } from "../_libs/settings";
import type { GeneralSettings } from "../_libs/settings";

const inputCls =
  "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors";
const textareaCls =
  "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors resize-none";

const DEFAULTS: GeneralSettings = {
  site_name: "",
  site_email: "",
  site_phone: "",
  logo_url: "",
  favicon_url: "",
  maintenance_mode: false,
  maintenance_message: "Hệ thống đang bảo trì, vui lòng quay lại sau.",
};

function SectionCard({
  icon: Icon,
  title,
  desc,
  children,
  onSave,
  saving,
}: {
  icon: React.ElementType;
  title: string;
  desc?: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving?: boolean;
}) {
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
          <div className="flex justify-end pt-2 border-t border-neutral">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-neutral-light hover:bg-primary/90 shadow-sm active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="block text-xs font-semibold text-neutral-dark uppercase tracking-wide mb-1.5">
      {children}
      {hint && <span className="ml-1.5 normal-case font-normal text-neutral-dark/60">{hint}</span>}
    </span>
  );
}

function ImageUploadBox({ label, preview, onFile, onClear, hint }: { label: string; preview: string; onFile: (f: File) => void; onClear: () => void; hint?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="flex items-center gap-3">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-neutral bg-neutral-light-active overflow-hidden">
          {preview ? <img src={preview} alt={label} className="h-full w-full object-contain" /> : <ImageIcon className="h-6 w-6 text-neutral-dark/40" />}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral bg-neutral-light-active px-3 py-1.5 text-xs font-medium text-primary hover:bg-neutral transition-colors cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            Tải lên
          </button>
          {preview && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral bg-neutral-light-active px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              Xóa
            </button>
          )}
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

export default function GeneralSettingsView() {
  const { success, error } = useToasty();
  const [form, setForm] = useState<GeneralSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [savingBrand, setSavingBrand] = useState(false);
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  // File objects for upload
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  // Preview URLs (either from DB or local blob)
  const [logoPreview, setLogoPreview] = useState("");
  const [faviconPreview, setFaviconPreview] = useState("");

  useEffect(() => {
    getSettings("general")
      .then((res) => {
        const parsed = parseSettings(res.data, DEFAULTS);
        setForm(parsed);
        setLogoPreview(parsed.logo_url);
        setFaviconPreview(parsed.favicon_url);
      })
      .catch(() => error("Không thể tải cài đặt"))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleLogoFile = (f: File) => {
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  };
  const handleFaviconFile = (f: File) => {
    setFaviconFile(f);
    setFaviconPreview(URL.createObjectURL(f));
  };

  const saveBrand = async () => {
    setSavingBrand(true);
    try {
      await updateSettingsFormData(
        "general",
        {
          site_name: form.site_name,
          site_email: form.site_email,
          site_phone: form.site_phone,
        },
        { logo: logoFile ?? undefined, favicon: faviconFile ?? undefined },
      );
      setLogoFile(null);
      setFaviconFile(null);
      success("Lưu nhận diện thương hiệu thành công");
    } catch {
      error("Lưu thất bại, thử lại sau");
    } finally {
      setSavingBrand(false);
    }
  };

  const saveMaintenance = async () => {
    setSavingMaintenance(true);
    try {
      await updateSettingsFormData("general", {
        maintenance_mode: form.maintenance_mode,
        maintenance_message: form.maintenance_message,
      });
      success("Lưu cài đặt bảo trì thành công");
    } catch {
      error("Lưu thất bại, thử lại sau");
    } finally {
      setSavingMaintenance(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Brand Identity ── */}
      <SectionCard icon={Building2} title="Nhận diện thương hiệu" desc="Tên shop, logo, favicon và thông tin liên hệ" onSave={saveBrand} saving={savingBrand}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel>Tên website</FieldLabel>
            <input className={inputCls} value={form.site_name} onChange={(e) => set("site_name", e.target.value)} placeholder="VD: My Shop" />
          </div>
          <div>
            <FieldLabel>Email liên hệ</FieldLabel>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-dark pointer-events-none" />
              <input className={inputCls + " pl-9"} type="email" value={form.site_email} onChange={(e) => set("site_email", e.target.value)} placeholder="contact@myshop.vn" />
            </div>
          </div>
          <div>
            <FieldLabel>Số điện thoại hotline</FieldLabel>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-dark pointer-events-none" />
              <input className={inputCls + " pl-9"} value={form.site_phone} onChange={(e) => set("site_phone", e.target.value)} placeholder="0909 000 000" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 pt-2 border-t border-neutral">
          <ImageUploadBox
            label="Logo"
            hint="PNG, SVG — tối đa 2MB"
            preview={logoPreview}
            onFile={handleLogoFile}
            onClear={() => {
              setLogoFile(null);
              setLogoPreview("");
              set("logo_url", "");
            }}
          />
          <ImageUploadBox
            label="Favicon"
            hint=".ico, PNG 32×32"
            preview={faviconPreview}
            onFile={handleFaviconFile}
            onClear={() => {
              setFaviconFile(null);
              setFaviconPreview("");
              set("favicon_url", "");
            }}
          />
        </div>
      </SectionCard>

      {/* ── Maintenance ── */}
      <SectionCard icon={ShieldAlert} title="Chế độ bảo trì" desc="Tắt tạm thời trang client — admin vẫn truy cập bình thường" onSave={saveMaintenance} saving={savingMaintenance}>
        <label className="flex items-center justify-between rounded-xl border border-neutral bg-neutral-light-active px-4 py-3 cursor-pointer hover:bg-neutral-light transition-colors">
          <span>
            <span className="block text-sm font-medium text-primary">Bật chế độ bảo trì</span>
            <span className="block text-xs text-neutral-dark mt-0.5">Khách hàng sẽ thấy trang thông báo thay vì trang chính</span>
          </span>
          <input type="checkbox" checked={form.maintenance_mode} onChange={(e) => set("maintenance_mode", e.target.checked)} className="h-4 w-4 accent-accent ml-4 shrink-0" />
        </label>

        {form.maintenance_mode && (
          <div className="space-y-1.5">
            <FieldLabel>Nội dung hiển thị cho khách</FieldLabel>
            <textarea rows={3} className={textareaCls} value={form.maintenance_message} onChange={(e) => set("maintenance_message", e.target.value)} placeholder="Hệ thống đang bảo trì..." />
          </div>
        )}

        {form.maintenance_mode && (
          <div className="flex gap-2 rounded-xl border border-amber-300/60 bg-amber-50 dark:bg-amber-950/20 px-4 py-3">
            <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Trang client đang <strong>tắt</strong> — khách hàng không thể mua hàng.
            </p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
