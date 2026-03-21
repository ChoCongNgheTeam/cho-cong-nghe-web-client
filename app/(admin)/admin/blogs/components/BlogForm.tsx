"use client";

import { useState, useRef } from "react";
import { Loader2, AlertCircle, Upload, X, ImageIcon } from "lucide-react";
import type { BlogDetail, BlogStatus } from "../blog.types";
import { CKEditorWrapper } from "./CKEditorWrapper";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BlogFormData {
  title: string;
  content: string;
  status: BlogStatus;
  publishedAt: string;
  thumbnailFile: File | null;
  thumbnailPreview: string; // URL preview (existing hoặc objectURL)
}

export const DEFAULT_FORM: BlogFormData = {
  title: "",
  content: "",
  status: "DRAFT",
  publishedAt: "",
  thumbnailFile: null,
  thumbnailPreview: "",
};

export function blogToForm(blog: BlogDetail): BlogFormData {
  return {
    title: blog.title,
    content: blog.content,
    status: blog.status,
    publishedAt: blog.publishedAt ? new Date(blog.publishedAt).toISOString().slice(0, 16) : "",
    thumbnailFile: null,
    thumbnailPreview: blog.thumbnail ?? "",
  };
}

/**
 * Chuyển BlogFormData → FormData để gửi multipart
 */
export function formToFormData(form: BlogFormData): FormData {
  const fd = new FormData();

  // Gửi các field dạng JSON trong field "data" — khớp với parseMultipartData ở BE
  const jsonData: Record<string, any> = {
    title: form.title.trim(),
    content: form.content,
    status: form.status,
  };
  if (form.publishedAt) jsonData.publishedAt = form.publishedAt;

  fd.append("data", JSON.stringify(jsonData));

  if (form.thumbnailFile) {
    fd.append("imageUrl", form.thumbnailFile);
  }

  return fd;
}

// ── Sub components ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-neutral-dark/50";

function FormRow({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">
        {label}
        {required && <span className="text-promotion normal-case font-normal ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-neutral-dark/70">{hint}</p>}
    </div>
  );
}

// ── ThumbnailUpload ────────────────────────────────────────────────────────────

function ThumbnailUpload({ preview, onFileChange, onRemove }: { preview: string; onFileChange: (file: File, previewUrl: string) => void; onRemove: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onFileChange(file, url);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Ảnh thumbnail</label>
      {preview ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-neutral group">
          <img src={preview} alt="Thumbnail" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-primary text-[12px] font-medium rounded-lg hover:bg-neutral-light-active cursor-pointer"
            >
              Đổi ảnh
            </button>
            <button type="button" onClick={onRemove} className="px-3 py-1.5 bg-promotion text-white text-[12px] font-medium rounded-lg cursor-pointer">
              Xoá
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-video border-2 border-dashed border-neutral rounded-xl flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-light-active flex items-center justify-center group-hover:bg-accent/10 transition-colors">
            <ImageIcon size={18} className="text-neutral-dark group-hover:text-accent transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-medium text-primary">Chọn ảnh thumbnail</p>
            <p className="text-[11px] text-neutral-dark mt-0.5">PNG, JPG, WebP — tối đa 5MB</p>
          </div>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}

// ── BlogForm ───────────────────────────────────────────────────────────────────

interface BlogFormProps {
  initialData: BlogFormData;
  onSubmit: (formData: FormData, form: BlogFormData) => Promise<void>;
  saving: boolean;
  error: string | null;
  submitLabel?: string;
  onCancel?: () => void;
  /** Layout mode: page = full width (new page), panel = compact (edit panel) */
  layout?: "page" | "panel";
}

export function BlogForm({ initialData, onSubmit, saving, error, submitLabel = "Lưu", onCancel, layout = "page" }: BlogFormProps) {
  const [form, setForm] = useState<BlogFormData>(initialData);

  const set = (key: keyof BlogFormData, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleThumbnailChange = (file: File, previewUrl: string) => {
    setForm((prev) => ({ ...prev, thumbnailFile: file, thumbnailPreview: previewUrl }));
  };

  const handleThumbnailRemove = () => {
    setForm((prev) => ({ ...prev, thumbnailFile: null, thumbnailPreview: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = formToFormData(form);
    await onSubmit(fd, form);
  };

  // Panel layout = compact sidebar, Page layout = full với sidebar info
  const isPanel = layout === "panel";

  return (
    <form onSubmit={handleSubmit} className={isPanel ? "space-y-4" : "space-y-6"}>
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {isPanel ? (
        // ── Panel layout: compact, dùng ở [id]/page.tsx ──────────────────────
        <div className="space-y-4">
          {/* Tiêu đề */}
          <FormRow label="Tiêu đề" required>
            <textarea value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Tiêu đề bài viết..." rows={2} className={`${inputCls} resize-none`} required />
          </FormRow>

          {/* Nội dung */}
          <FormRow label="Nội dung" required>
            <CKEditorWrapper value={form.content} onChange={(val) => set("content", val)} placeholder="Nhập nội dung bài viết..." minHeight={350} />
          </FormRow>

          {/* Thumbnail */}
          <ThumbnailUpload preview={form.thumbnailPreview} onFileChange={handleThumbnailChange} onRemove={handleThumbnailRemove} />

          {/* Status + publishedAt */}
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Trạng thái">
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={`${inputCls} cursor-pointer`}>
                <option value="DRAFT">Nháp</option>
                <option value="PUBLISHED">Đăng ngay</option>
                <option value="ARCHIVED">Lưu trữ</option>
              </select>
            </FormRow>
            <FormRow label="Ngày đăng" hint="Để trống = tự động">
              <input type="datetime-local" value={form.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} className={inputCls} />
            </FormRow>
          </div>
        </div>
      ) : (
        // ── Page layout: 2 cột, dùng ở new/page.tsx ──────────────────────────
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: content chính */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
              <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Nội dung bài viết</p>

              <FormRow label="Tiêu đề" required>
                <textarea value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Tiêu đề bài viết hấp dẫn..." rows={2} className={`${inputCls} resize-none`} required />
              </FormRow>

              <FormRow label="Nội dung" required>
                <CKEditorWrapper value={form.content} onChange={(val) => set("content", val)} placeholder="Nhập nội dung bài viết..." minHeight={500} />
              </FormRow>
            </div>
          </div>

          {/* Right: sidebar settings */}
          <div className="space-y-4">
            {/* Publish settings */}
            <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
              <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Cài đặt đăng</p>

              <FormRow label="Trạng thái">
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className={`${inputCls} cursor-pointer`}>
                  <option value="DRAFT">Nháp</option>
                  <option value="PUBLISHED">Đăng ngay</option>
                  <option value="ARCHIVED">Lưu trữ</option>
                </select>
              </FormRow>

              <FormRow label="Ngày đăng" hint="Để trống = tự động khi đăng">
                <input type="datetime-local" value={form.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} className={inputCls} />
              </FormRow>
            </div>

            {/* Thumbnail */}
            <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-3">
              <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Thumbnail</p>
              <ThumbnailUpload preview={form.thumbnailPreview} onFileChange={handleThumbnailChange} onRemove={handleThumbnailRemove} />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl cursor-pointer transition-colors"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Đang lưu..." : submitLabel}
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={saving}
                  className="px-5 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
                >
                  Huỷ
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Panel layout actions */}
      {isPanel && (
        <div className="flex items-center gap-3 pt-1">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-5 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
            >
              Huỷ
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl cursor-pointer"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Đang lưu..." : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}
