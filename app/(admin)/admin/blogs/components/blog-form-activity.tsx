"use client";

import { CalendarDays, Eye } from "lucide-react";
import type { BlogFormState } from "./blog-form";

type BlogFormActivityProps = {
  form: BlogFormState;
  setForm: React.Dispatch<React.SetStateAction<BlogFormState>>;
  inputClass: string;
  isSubmitting: boolean;
  submitLabel: string;
  submitModeRef: React.MutableRefObject<"draft" | "publish">;
  showPreviewContent: boolean;
  setShowPreviewContent: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function BlogFormActivity({
  form,
  setForm,
  inputClass,
  isSubmitting,
  submitLabel,
  submitModeRef,
  showPreviewContent,
  setShowPreviewContent,
}: BlogFormActivityProps) {
  return (
    <section className="rounded-2xl border border-neutral bg-neutral-light p-4">
      <h3 className="mb-3 text-xl font-semibold text-primary">Thiết lập Hoạt động</h3>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setShowPreviewContent((prev) => !prev)}
          className={`inline-flex h-10 items-center justify-center gap-1 rounded-lg border text-[14px] font-medium transition ${
            showPreviewContent
              ? "border-accent bg-accent/10 text-accent"
              : "border-neutral text-primary hover:bg-neutral-light-active"
          }`}
        >
          <Eye size={14} />
          Xem trước
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          onClick={() => {
            submitModeRef.current = "publish";
          }}
          className="h-10 rounded-lg bg-accent text-[14px] font-semibold text-neutral-light hover:bg-accent-hover disabled:opacity-60"
        >
          {isSubmitting ? "Đang lưu..." : submitLabel}
        </button>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-base font-semibold text-primary">Lên lịch đăng</label>
        <div className="relative">
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(event) => setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
            className={inputClass}
          />
          <CalendarDays
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary-light"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[15px] text-primary">Nổi bật :</span>
        <button
          type="button"
          onClick={() => setForm((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}
          className={`relative h-8 w-16 rounded-full transition ${form.isFeatured ? "bg-accent" : "bg-neutral"}`}
          aria-label="Bật tắt nổi bật"
        >
          {form.isFeatured ? (
            <span className="absolute left-3 top-1.5 text-[11px] font-semibold text-neutral-light">ON</span>
          ) : null}
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-black transition ${
              form.isFeatured ? "left-9" : "left-1"
            }`}
          />
        </button>
      </div>
    </section>
  );
}
