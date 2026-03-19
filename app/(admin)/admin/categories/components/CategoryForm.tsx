"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, ImagePlus, AlertCircle } from "lucide-react";
import type { Category } from "../category.types";
import { getAllCategories, createCategory, updateCategory } from "../_libs/categories";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
  position: string;
  isFeatured: boolean;
  isActive: boolean;
}

interface CategoryFormProps {
  /** Nếu có = edit mode */
  initialData?: Category & { parent?: { id: string; name: string } | null };
  /** parentId pre-filled (từ query param khi tạo danh mục con) */
  defaultParentId?: string;
  mode: "create" | "edit";
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider block mb-1.5">
      {children}
      {required && <span className="text-promotion ml-0.5">*</span>}
    </label>
  );
}

function inputCls(hasError?: boolean) {
  return `w-full px-3 py-2 text-[13px] bg-neutral-light border rounded-xl text-primary placeholder:text-neutral-dark/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all ${hasError ? "border-promotion" : "border-neutral"}`;
}

function ToggleSwitch({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 border border-neutral rounded-xl">
      <span className="text-[13px] text-primary">{label}</span>
      <button type="button" onClick={() => onChange(!value)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${value ? "bg-accent" : "bg-neutral"}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-neutral">
        <p className="text-[13px] font-semibold text-primary">{title}</p>
      </div>
      <div className="px-5 pb-5 pt-4 space-y-4">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FORM
// ─────────────────────────────────────────────────────────────────────────────

export default function CategoryForm({ initialData, defaultParentId, mode }: CategoryFormProps) {
  const router = useRouter();

  // ── form state ───────────────────────────────────────────────────────────────
  const [form, setForm] = useState<CategoryFormData>({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    parentId: (initialData as any)?.parent?.id ?? initialData?.parentId ?? defaultParentId ?? "",
    position: String(initialData?.position ?? ""),
    isFeatured: initialData?.isFeatured ?? false,
    isActive: initialData?.isActive ?? true,
  });

  // ── image state ──────────────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl ?? initialData?.imagePath ?? "");
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── categories for parent select ─────────────────────────────────────────────
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  useEffect(() => {
    getAllCategories()
      .then((res) => setAllCategories(res.data ?? []))
      .catch(() => {});
  }, []);

  // ── submit state ─────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── helpers ───────────────────────────────────────────────────────────────────
  const set = <K extends keyof CategoryFormData>(key: K, val: CategoryFormData[K]) => setForm((p) => ({ ...p, [key]: val }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── validate ──────────────────────────────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = "Tên phải có ít nhất 2 ký tự";
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  // ── submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload: Record<string, any> = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        parentId: form.parentId || undefined,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        ...(form.position !== "" && { position: Number(form.position) }),
        ...(mode === "edit" && removeImage && { removeImage: true }),
      };

      const fd = new FormData();
      fd.append("data", JSON.stringify(payload));
      if (imageFile) fd.append("imageUrl", imageFile);

      if (mode === "create") {
        const res: any = await createCategory(fd);
        router.push(`/admin/categories/${res?.data?.id ?? ""}`);
      } else {
        const res: any = await updateCategory(initialData!.id, fd);
        router.push(`/admin/categories/${initialData!.id}`);
      }
    } catch (e: any) {
      setSubmitError(e?.message ?? "Đã xảy ra lỗi, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  // ── parent options — exclude self + descendants ───────────────────────────────
  const parentOptions = allCategories.filter((c) => c.id !== initialData?.id && c.parentId !== initialData?.id);

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Basic info ── */}
      <SectionCard title="Thông tin danh mục">
        <div>
          <Label required>Tên danh mục</Label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="VD: Điện thoại, Laptop, Tivi..." className={inputCls(!!errors.name)} />
          {errors.name && <p className="text-[11px] text-promotion mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label>Mô tả</Label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Mô tả ngắn về danh mục..." rows={3} className={inputCls() + " resize-none"} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Danh mục cha</Label>
            <select value={form.parentId} onChange={(e) => set("parentId", e.target.value)} className={inputCls() + " cursor-pointer"}>
              <option value="">— Không có (danh mục gốc) —</option>
              {parentOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parentId ? `  └ ${cat.name}` : cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Vị trí</Label>
            <input type="number" min={0} value={form.position} onChange={(e) => set("position", e.target.value)} placeholder="Tự động" className={inputCls()} />
            <p className="text-[11px] text-neutral-dark mt-1">Để trống = tự động đặt cuối</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ToggleSwitch value={form.isActive} onChange={(v) => set("isActive", v)} label="Hiển thị" />
          <ToggleSwitch value={form.isFeatured} onChange={(v) => set("isFeatured", v)} label="Nổi bật" />
        </div>
      </SectionCard>

      {/* ── Image ── */}
      <SectionCard title="Hình ảnh">
        {imagePreview ? (
          <div className="space-y-3">
            <div className="relative w-full max-w-xs aspect-video rounded-xl overflow-hidden border border-neutral bg-neutral-light-active group">
              <Image src={imagePreview} alt="Preview" fill className="object-contain" unoptimized />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white text-primary text-[12px] font-medium rounded-lg hover:bg-neutral-light-active cursor-pointer"
                >
                  Đổi ảnh
                </button>
                <button type="button" onClick={handleRemoveImage} className="px-3 py-1.5 bg-promotion text-white text-[12px] font-medium rounded-lg cursor-pointer">
                  Xoá
                </button>
              </div>
            </div>
            {imageFile && (
              <p className="text-[11px] text-neutral-dark">
                {imageFile.name} — {(imageFile.size / 1024).toFixed(0)} KB
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-xs aspect-video border-2 border-dashed border-neutral rounded-xl flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-light-active flex items-center justify-center group-hover:bg-accent/10 transition-colors">
              <ImagePlus size={18} className="text-neutral-dark group-hover:text-accent transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-medium text-primary">Chọn ảnh danh mục</p>
              <p className="text-[11px] text-neutral-dark mt-0.5">PNG, JPG, WebP — tối đa 5MB</p>
            </div>
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </SectionCard>

      {/* ── Error ── */}
      {submitError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
          <AlertCircle size={15} /> {submitError}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 justify-end pb-6">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={submitting}
          className="px-5 py-2.5 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
        >
          Huỷ
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? (mode === "edit" ? "Đang lưu..." : "Đang tạo...") : mode === "edit" ? "Lưu thay đổi" : "Tạo danh mục"}
        </button>
      </div>
    </div>
  );
}
