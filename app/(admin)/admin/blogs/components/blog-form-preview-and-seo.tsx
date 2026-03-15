"use client";

import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import type { BlogFormState } from "./blog-form";
import { stripHtml, toSlug } from "./blog-form-utils";

type BlogFormPreviewAndSeoProps = {
  form: BlogFormState;
  setForm: Dispatch<SetStateAction<BlogFormState>>;
  thumbnailPreviewUrl: string | null;
  showPreviewContent: boolean;
};

export default function BlogFormPreviewAndSeo({
  form,
  setForm,
  thumbnailPreviewUrl,
  showPreviewContent,
}: BlogFormPreviewAndSeoProps) {
  const slugPreview = form.slug || toSlug(form.title || "");
  const excerptPreview =
    form.excerpt || stripHtml(form.content).slice(0, 120) || "";

  return (
    <section className="rounded-2xl border border-neutral bg-neutral-light p-4">
      <h3 className="mb-3 text-xl font-semibold text-primary">Xu hướng công nghệ 2026 mới nhất</h3>
      <div className="relative mb-3 aspect-video overflow-hidden rounded-lg border border-neutral bg-neutral-light-active">
        <Image
          src={thumbnailPreviewUrl || form.thumbnail || "/images/avatar.png"}
          alt={form.title || "blog-preview"}
          fill
          sizes="(min-width: 1280px) 420px, 100vw"
          className="object-cover"
        />
      </div>

      <p className="line-clamp-2 text-lg font-semibold leading-tight text-primary">
        {form.title || "Xu hướng công nghệ năm 2026"}
      </p>
      <p className="text-sm text-primary-light">/blogs/{slugPreview}</p>
      <p className="mt-1 line-clamp-2 text-[14px] text-primary-light">{excerptPreview}</p>

      {showPreviewContent ? (
        <div className="mt-3 rounded-lg border border-neutral bg-neutral-light-active p-3">
          <p className="mb-2 text-[12px] font-medium text-primary-light">Nội dung bài :</p>
          <div
            className="prose prose-sm max-w-none text-primary"
            dangerouslySetInnerHTML={{ __html: form.content || "<p>Chưa có nội dung.</p>" }}
          />
        </div>
      ) : null}

      <h3 className="mt-5 mb-3 text-2xl font-semibold leading-none text-primary">Cấu hình SEO</h3>
      <div className="space-y-3">
        <div>
          <label className="mb-2 block text-base font-semibold text-primary">Tiêu đề SEO</label>
          <input
            value={form.seoTitle}
            onChange={(event) => setForm((prev) => ({ ...prev, seoTitle: event.target.value }))}
            className="min-h-12 w-full rounded-xl border border-neutral bg-neutral-light-active px-4 py-2 text-[14px] text-primary outline-none transition focus:border-accent"
            placeholder="VD: Xu hướng công nghệ năm 2026"
          />
        </div>

        <div>
          <label className="mb-2 block text-base font-semibold text-primary">Mô tả SEO</label>
          <textarea
            value={form.seoDescription}
            onChange={(event) => setForm((prev) => ({ ...prev, seoDescription: event.target.value }))}
            className="min-h-24 w-full rounded-xl border border-neutral bg-neutral-light-active px-4 py-2 text-[14px] text-primary outline-none transition focus:border-accent"
            placeholder="VD: Khám phá những công nghệ mới năm 2026 và là xu hướng trong năm"
          />
        </div>
      </div>
    </section>
  );
}
