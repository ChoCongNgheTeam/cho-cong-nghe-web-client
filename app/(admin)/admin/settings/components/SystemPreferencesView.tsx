"use client";

import { useState, useRef } from "react";
import {
   Building2,
   Upload,
   AlertTriangle,
   Globe,
   Phone,
   Mail,
   FileImage,
   Loader2,
   Save,
   X,
   ShieldAlert,
   Image as ImageIcon,
   ChevronDown,
} from "lucide-react";
import { useToasty } from "@/components/Toast";
import apiRequest from "@/lib/api";

const inputCls =
   "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors";
const textareaCls =
   "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors resize-none";

/* ── shared sub-components ── */
function Card({
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
               {desc && (
                  <p className="text-xs text-neutral-dark mt-0.5">{desc}</p>
               )}
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

function Label({
   children,
   hint,
}: {
   children: React.ReactNode;
   hint?: string;
}) {
   return (
      <span className="block text-xs font-semibold text-neutral-dark uppercase tracking-wide mb-1.5">
         {children}
         {hint && (
            <span className="ml-1.5 normal-case font-normal text-neutral-dark/60">
               {hint}
            </span>
         )}
      </span>
   );
}

function Toggle({
   label,
   desc,
   checked,
   onChange,
}: {
   label: string;
   desc?: string;
   checked: boolean;
   onChange: (v: boolean) => void;
}) {
   return (
      <label className="flex items-center justify-between rounded-xl border border-neutral bg-neutral-light-active px-4 py-3 cursor-pointer hover:bg-neutral-light transition-colors">
         <span>
            <span className="block text-sm font-medium text-primary">
               {label}
            </span>
            {desc && (
               <span className="block text-xs text-neutral-dark mt-0.5">
                  {desc}
               </span>
            )}
         </span>
         <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-accent ml-4 shrink-0"
         />
      </label>
   );
}

function SelectField({
   label,
   value,
   onChange,
   options,
}: {
   label: string;
   value: string;
   onChange: (v: string) => void;
   options: { value: string; label: string }[];
}) {
   return (
      <div>
         <Label>{label}</Label>
         <div className="relative">
            <select
               value={value}
               onChange={(e) => onChange(e.target.value)}
               className="w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors cursor-pointer pr-9"
            >
               {options.map((o) => (
                  <option key={o.value} value={o.value}>
                     {o.label}
                  </option>
               ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-dark" />
         </div>
      </div>
   );
}

/* ── asset uploader ── */
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
            <div
               className="relative flex items-center justify-center rounded-xl border border-neutral bg-neutral-light-active overflow-hidden shrink-0"
               style={{ width: w ?? 80, height: h ?? 80 }}
            >
               {preview ? (
                  <>
                     <img
                        src={preview}
                        alt={label}
                        className="w-full h-full object-contain"
                     />
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

/* ══════════════════════════════════════════════════════ */
export default function SystemView() {
   const { success, error } = useToasty();

   /* ── Brand ── */
   const [brand, setBrand] = useState({
      siteName: "Admin Dashboard",
      tagline: "Hệ thống quản trị thương mại điện tử",
      hotline: "",
      supportEmail: "",
   });
   const [logoPreview, setLogoPreview] = useState<string | null>(null);
   const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
   const [savingBrand, setSavingBrand] = useState(false);

   /* ── Maintenance ── */
   const [maintenance, setMaintenance] = useState({
      enabled: false,
      message: "Hệ thống đang được nâng cấp. Chúng tôi sẽ trở lại sớm.",
      estimatedTime: "",
      allowAdminAccess: true,
   });
   const [savingMaint, setSavingMaint] = useState(false);
   const [confirmModal, setConfirmModal] = useState(false);
   /* ── brand with real API skeleton ── */
   const saveBrand = async () => {
      setSavingBrand(true);
      try {
         // TODO: await apiRequest.patch("/settings/brand", { ...brand });
         await new Promise((r) => setTimeout(r, 900));
         success("Đã lưu thông tin thương hiệu");
      } catch {
         error("Lưu thất bại");
      } finally {
         setSavingBrand(false);
      }
   };

   const saveMaintenance = async () => {
      setSavingMaint(true);
      try {
         // TODO: await apiRequest.patch("/settings/maintenance", maintenance);
         await new Promise((r) => setTimeout(r, 900));
         success("Đã lưu cấu hình bảo trì");
      } catch {
         error("Lưu thất bại");
      } finally {
         setSavingMaint(false);
      }
   };

   const toggleMaintenance = () => {
      if (!maintenance.enabled) setConfirmModal(true);
      else {
         setMaintenance((p) => ({ ...p, enabled: false }));
         success("Đã tắt chế độ bảo trì");
      }
   };

   return (
      <div className="space-y-6">
         {/* ── 1. Brand identity ── */}
         <Card
            icon={Building2}
            title="Nhận diện thương hiệu"
            desc="Logo, favicon, tên và thông tin liên hệ"
            onSave={saveBrand}
            saving={savingBrand}
         >
            <div className="grid gap-6 sm:grid-cols-2">
               <AssetUploader
                  label="Logo"
                  hint="(hiển thị trên header)"
                  preview={logoPreview}
                  onFile={(f) => {
                     if (logoPreview) URL.revokeObjectURL(logoPreview);
                     setLogoPreview(URL.createObjectURL(f));
                  }}
                  onRemove={() => {
                     if (logoPreview) URL.revokeObjectURL(logoPreview);
                     setLogoPreview(null);
                  }}
                  w={200}
                  h={60}
               />
               <AssetUploader
                  label="Favicon"
                  hint="(icon tab trình duyệt)"
                  preview={faviconPreview}
                  onFile={(f) => {
                     if (faviconPreview) URL.revokeObjectURL(faviconPreview);
                     setFaviconPreview(URL.createObjectURL(f));
                  }}
                  onRemove={() => {
                     if (faviconPreview) URL.revokeObjectURL(faviconPreview);
                     setFaviconPreview(null);
                  }}
                  accept=".ico,.png,.svg"
                  w={48}
                  h={48}
               />
            </div>
         </Card>

         {/* ── 2. Maintenance kill-switch ── */}
         <Card
            icon={ShieldAlert}
            title="Chế độ bảo trì (Kill Switch)"
            desc="Ẩn toàn bộ trang client ngay lập tức khi cần xử lý sự cố"
            onSave={saveMaintenance}
            saving={savingMaint}
         >
            {maintenance.enabled && (
               <div className="flex gap-3 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800/40 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                     <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                        Chế độ bảo trì đang bật
                     </p>
                     <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                        Trang client đang ẩn. Chỉ Admin mới truy cập được
                        dashboard.
                     </p>
                  </div>
               </div>
            )}
            <label className="flex items-center justify-between rounded-xl border border-neutral bg-neutral-light-active px-4 py-3 cursor-pointer hover:bg-neutral-light transition-colors">
               <span>
                  <span className="block text-sm font-medium text-primary">
                     Bật chế độ bảo trì
                  </span>
                  <span className="block text-xs text-neutral-dark mt-0.5">
                     Người dùng sẽ thấy trang thông báo bảo trì
                  </span>
               </span>
               <button
                  type="button"
                  onClick={toggleMaintenance}
                  className={[
                     "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors",
                     maintenance.enabled
                        ? "bg-red-500 border-red-500"
                        : "bg-neutral border-neutral",
                  ].join(" ")}
               >
                  <span
                     className={[
                        "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                        maintenance.enabled
                           ? "translate-x-5"
                           : "translate-x-0.5",
                     ].join(" ")}
                  />
               </button>
            </label>
            <div>
               <Label>Thông điệp bảo trì</Label>
               <textarea
                  value={maintenance.message}
                  onChange={(e) =>
                     setMaintenance((p) => ({ ...p, message: e.target.value }))
                  }
                  rows={2}
                  className={textareaCls}
               />
            </div>
            <div>
               <Label hint="(để trống nếu chưa xác định)">
                  Thời gian hoàn thành dự kiến
               </Label>
               <input
                  type="datetime-local"
                  value={maintenance.estimatedTime}
                  onChange={(e) =>
                     setMaintenance((p) => ({
                        ...p,
                        estimatedTime: e.target.value,
                     }))
                  }
                  className={inputCls}
               />
            </div>
            <Toggle
               label="Admin vẫn xem được trang client khi đang bảo trì"
               checked={maintenance.allowAdminAccess}
               onChange={(v) =>
                  setMaintenance((p) => ({ ...p, allowAdminAccess: v }))
               }
            />
         </Card>

         {/* ── Confirm maintenance modal ── */}
         {confirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
               <div
                  className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                  onClick={() => setConfirmModal(false)}
               />
               <div className="relative w-full max-w-md mx-4 rounded-2xl border border-neutral bg-neutral-light shadow-xl p-6">
                  <div className="flex items-start gap-4">
                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                     </div>
                     <div>
                        <h2 className="text-base font-semibold text-primary">
                           Bật chế độ bảo trì?
                        </h2>
                        <p className="text-sm text-neutral-dark mt-1.5">
                           Toàn bộ trang client sẽ bị ẩn ngay lập tức. Người
                           dùng sẽ thấy trang bảo trì cho đến khi bạn tắt.
                        </p>
                     </div>
                  </div>
                  <div className="mt-5 flex justify-end gap-2">
                     <button
                        onClick={() => setConfirmModal(false)}
                        className="px-4 py-2.5 rounded-xl border border-neutral text-sm font-medium text-primary hover:bg-neutral-light-active transition-colors"
                     >
                        Hủy
                     </button>
                     <button
                        onClick={() => {
                           setConfirmModal(false);
                           setMaintenance((p) => ({ ...p, enabled: true }));
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
