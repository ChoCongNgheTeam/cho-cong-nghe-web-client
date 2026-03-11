"use client";

import type { Dispatch, SetStateAction } from "react";
import type { BlogFormState } from "./blog-form";

type BlogFormBasicInfoProps = {
  form: BlogFormState;
  setForm: Dispatch<SetStateAction<BlogFormState>>;
  inputClass: string;
  toSlug: (value: string) => string;
};

export default function BlogFormBasicInfo({ form, setForm, inputClass, toSlug }: BlogFormBasicInfoProps) {
  return (
    <>
      <div>
        <label className="mb-2 block text-base font-semibold text-primary">Tiêu đề bài viết</label>
        <input
          value={form.title}
          onChange={(event) => {
            const nextTitle = event.target.value;
            setForm((prev) => ({ ...prev, title: nextTitle, slug: toSlug(nextTitle) }));
          }}
          className={inputClass}
          placeholder="VD: Sản phẩm công nghệ mới"
        />
      </div>

      <div>
        <label className="mb-2 block text-base font-semibold text-primary">Slug (URL thân thiện)</label>
        <input
          value={form.slug}
          onChange={(event) => setForm((prev) => ({ ...prev, slug: toSlug(event.target.value) }))}
          className={inputClass}
          placeholder="Slug (tự sinh, chỉ chữ thường, số và dấu gạch ngang)"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-base font-semibold text-primary">Danh mục</label>
          <select
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            className={inputClass}
          >
            <option value="">Công nghệ</option>
            <option value="tin-moi">Tin mới</option>
            <option value="khuyen-mai">Khuyến mãi</option>
            <option value="danh-gia-tu-van">Đánh giá - Tư vấn</option>
            <option value="kien-thuc-doi-song">Kiến thức - Đời sống</option>
            <option value="thu-thuat">Thủ thuật</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-base font-semibold text-primary">Thẻ tag</label>
          <input
            value={form.tags}
            onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
            className={inputClass}
            placeholder="Công nghệ, điện máy + Thêm"
          />
        </div>
      </div>
    </>
  );
}
