"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, ImageIcon } from "lucide-react";
import type { BlogDetail, BlogStatus, BlogType } from "../blog.types";
import { BLOG_TYPE_LABELS } from "../const";
import { CKEditorWrapper } from "./CKEditorWrapper";
import { AiContentPanel } from "@/(admin)/admin/ai-content/AiContentPanel";
import { useToasty } from "@/components/Toast";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BlogFormData {
  title: string;
  content: string;
  status: BlogStatus;
  publishedAt: string;
  thumbnailFile: File | null;
  thumbnailPreview: string;
  type: BlogType;
}

export type BlogFormErrors = Partial<Record<keyof BlogFormData | "_thumbnail", string>>;

export const DEFAULT_FORM: BlogFormData = {
  title: "",
  content: "",
  status: "DRAFT",
  publishedAt: "",
  thumbnailFile: null,
  thumbnailPreview: "",
  type: "TIN_MOI",
};

export function blogToForm(blog: BlogDetail): BlogFormData {
  return {
    title: blog.title,
    content: blog.content,
    status: blog.status,
    publishedAt: blog.publishedAt ? new Date(blog.publishedAt).toISOString().slice(0, 16) : "",
    thumbnailFile: null,
    thumbnailPreview: blog.thumbnail ?? "",
    type: (blog.type ?? "TIN_MOI") as BlogType,
  };
}

export function formToFormData(form: BlogFormData): FormData {
  const fd = new FormData();
  const jsonData: Record<string, any> = {
    title: form.title.trim(),
    content: form.content,
    status: form.status,
    type: form.type,
  };
  if (form.publishedAt) jsonData.publishedAt = form.publishedAt;
  fd.append("data", JSON.stringify(jsonData));
  if (form.thumbnailFile) fd.append("imageUrl", form.thumbnailFile);
  return fd;
}

// ── Validation ─────────────────────────────────────────────────────────────────

const TITLE_MIN = 10;
const TITLE_MAX = 200;
const CONTENT_MIN = 100;
const THUMB_MAX_MB = 5;

function validateForm(form: BlogFormData, isEdit: boolean): BlogFormErrors {
  const errors: BlogFormErrors = {};

  const title = form.title.trim();
  if (!title) {
    errors.title = "Tiêu đề không được để trống";
  } else if (title.length < TITLE_MIN) {
    errors.title = `Tiêu đề phải có ít nhất ${TITLE_MIN} ký tự`;
  } else if (title.length > TITLE_MAX) {
    errors.title = `Tiêu đề tối đa ${TITLE_MAX} ký tự`;
  }

  const plainContent = form.content.replace(/<[^>]*>/g, "").trim();
  if (!plainContent) {
    errors.content = "Nội dung không được để trống";
  } else if (plainContent.length < CONTENT_MIN) {
    errors.content = `Nội dung phải có ít nhất ${CONTENT_MIN} ký tự (hiện tại: ${plainContent.length})`;
  }

  if (form.thumbnailFile) {
    const sizeMB = form.thumbnailFile.size / (1024 * 1024);
    if (sizeMB > THUMB_MAX_MB) {
      errors._thumbnail = `Ảnh quá lớn (${sizeMB.toFixed(1)}MB). Tối đa ${THUMB_MAX_MB}MB`;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(form.thumbnailFile.type)) {
      errors._thumbnail = "Chỉ chấp nhận ảnh JPG, PNG, WebP hoặc GIF";
    }
  }

  if (form.publishedAt) {
    const date = new Date(form.publishedAt);
    if (isNaN(date.getTime())) {
      errors.publishedAt = "Ngày đăng không hợp lệ";
    }
  }

  return errors;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const inputCls = (hasError?: boolean) =>
  [
    "w-full px-3 py-2 text-[13px] border rounded-xl text-primary bg-neutral-light",
    "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-neutral-dark/50",
    hasError ? "border-promotion bg-promotion-light/20" : "border-neutral",
  ].join(" ");

// ── Sub-components ─────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] text-promotion mt-0.5">
      <span className="w-1 h-1 rounded-full bg-promotion inline-block shrink-0" />
      {msg}
    </p>
  );
}

function FormRow({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">
        {label}
        {required && <span className="text-promotion normal-case font-normal ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-neutral-dark/70">{hint}</p>}
      <FieldError msg={error} />
    </div>
  );
}

function ThumbnailUpload({ preview, error, onFileChange, onRemove }: { preview: string; error?: string; onFileChange: (file: File, previewUrl: string) => void; onRemove: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onFileChange(file, url);
    e.target.value = "";
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
          className={[
            "w-full aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group",
            error ? "border-promotion bg-promotion-light/10" : "border-neutral",
          ].join(" ")}
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-light-active flex items-center justify-center group-hover:bg-accent/10 transition-colors">
            <ImageIcon size={18} className={error ? "text-promotion" : "text-neutral-dark group-hover:text-accent transition-colors"} />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-medium text-primary">Chọn ảnh thumbnail</p>
            <p className="text-[11px] text-neutral-dark mt-0.5">PNG, JPG, WebP — tối đa 5MB</p>
          </div>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <FieldError msg={error} />
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
  layout?: "page" | "panel";
  isEdit?: boolean;
}

export function BlogForm({ initialData, onSubmit, saving, error, submitLabel = "Lưu", onCancel, layout = "page", isEdit = false }: BlogFormProps) {
  const { error: toastError } = useToasty();

  const [form, setForm] = useState<BlogFormData>(initialData);
  const [fieldErrors, setFieldErrors] = useState<BlogFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Reset khi initialData thay đổi (ví dụ load blog edit)
  useEffect(() => {
    setForm(initialData);
    setFieldErrors({});
    setSubmitted(false);
  }, [initialData]);

  const set = useCallback(
    <K extends keyof BlogFormData>(key: K, value: BlogFormData[K]) => {
      setForm((prev) => {
        const next = { ...prev, [key]: value };
        // Re-validate realtime sau lần submit đầu tiên
        if (submitted) setFieldErrors(validateForm(next, isEdit));
        return next;
      });
    },
    [submitted, isEdit],
  );

  const handleThumbnailChange = useCallback((file: File, previewUrl: string) => {
    setForm((prev) => ({ ...prev, thumbnailFile: file, thumbnailPreview: previewUrl }));
    setFieldErrors((prev) => ({ ...prev, _thumbnail: undefined }));
  }, []);

  const handleThumbnailRemove = useCallback(() => {
    setForm((prev) => ({ ...prev, thumbnailFile: null, thumbnailPreview: "" }));
    setFieldErrors((prev) => ({ ...prev, _thumbnail: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);

      const errors = validateForm(form, isEdit);
      setFieldErrors(errors);

      if (Object.keys(errors).length > 0) {
        const msgs = Object.values(errors).filter(Boolean) as string[];
        const first = msgs[0];
        const extra = msgs.length > 1 ? ` (+${msgs.length - 1} lỗi khác)` : "";
        toastError(`${first}${extra}`, {
          title: "Dữ liệu không hợp lệ",
          duration: 5000,
        });
        // Scroll đến field lỗi đầu tiên
        const firstErrorKey = Object.keys(errors)[0];
        document.getElementById(`field-${firstErrorKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const fd = formToFormData(form);
      await onSubmit(fd, form);
    },
    [form, isEdit, onSubmit, toastError],
  );

  const isPanel = layout === "panel";
  const e = fieldErrors;

  // ── Shared field renderers ────────────────────────────────────────────────────

  const TitleField = (
    <FormRow label="Tiêu đề" required error={e.title}>
      <div id="field-title">
        <textarea
          value={form.title}
          onChange={(ev) => set("title", ev.target.value)}
          placeholder="Tiêu đề bài viết..."
          rows={2}
          maxLength={TITLE_MAX}
          className={`${inputCls(!!e.title)} resize-none`}
        />
        <p className="text-[10px] text-neutral-dark/50 text-right mt-0.5">
          {form.title.trim().length}/{TITLE_MAX}
        </p>
      </div>
    </FormRow>
  );

  const ContentField = (
    <FormRow label="Nội dung" required error={e.content}>
      <div id="field-content">
        <CKEditorWrapper value={form.content} onChange={(val) => set("content", val)} uploadFolder="blogs" minHeight={isPanel ? 350 : 500} />
      </div>
    </FormRow>
  );

  const StatusField = (
    <FormRow label="Trạng thái">
      <select value={form.status} onChange={(ev) => set("status", ev.target.value as BlogStatus)} className={`${inputCls()} cursor-pointer`}>
        <option value="DRAFT">Nháp</option>
        <option value="PUBLISHED">Đăng ngay</option>
        <option value="ARCHIVED">Lưu trữ</option>
      </select>
    </FormRow>
  );

  const PublishedAtField = (
    <FormRow label="Ngày đăng" hint="Để trống = tự động khi đăng" error={e.publishedAt}>
      <div id="field-publishedAt">
        <input type="datetime-local" value={form.publishedAt} onChange={(ev) => set("publishedAt", ev.target.value)} className={inputCls(!!e.publishedAt)} />
      </div>
    </FormRow>
  );

  const TypeField = (
    <FormRow label="Loại bài viết" required>
      <select value={form.type} onChange={(ev) => set("type", ev.target.value as BlogType)} className={`${inputCls()} cursor-pointer`}>
        {Object.entries(BLOG_TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </FormRow>
  );

  const ThumbField = (
    <div id="field-_thumbnail">
      <ThumbnailUpload preview={form.thumbnailPreview} error={e._thumbnail} onFileChange={handleThumbnailChange} onRemove={handleThumbnailRemove} />
    </div>
  );

  const AiPanel = <AiContentPanel mode="blog" blogType={form.type} currentTitle={form.title} currentContent={form.content} onApply={(content) => set("content", content)} />;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} noValidate className={isPanel ? "space-y-4" : "space-y-6"}>
      {/* Server-side error */}
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {isPanel ? (
        // ── Panel layout ──────────────────────────────────────────────────────
        <div className="space-y-4">
          {TitleField}
          {ContentField}
          {AiPanel}
          {ThumbField}
          <div className="grid grid-cols-2 gap-3">
            {StatusField}
            {PublishedAtField}
          </div>
          {TypeField}
        </div>
      ) : (
        // ── Page layout ───────────────────────────────────────────────────────
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: content */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
              <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Nội dung bài viết</p>
              {TitleField}
              {ContentField}
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="space-y-4">
            {AiPanel}

            <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
              <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Cài đặt đăng</p>
              {StatusField}
              {PublishedAtField}
              {TypeField}
            </div>

            <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-3">
              <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Thumbnail</p>
              {ThumbField}
            </div>

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

      {/* Panel actions */}
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
