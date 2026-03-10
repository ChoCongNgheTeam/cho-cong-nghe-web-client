"use client";

import type { Dispatch, SetStateAction } from "react";
import type { BlogFormState } from "./blog-form";

type BlogFormMediaProps = {
  form: BlogFormState;
  setForm: Dispatch<SetStateAction<BlogFormState>>;
  setThumbnailFile: Dispatch<SetStateAction<File | null>>;
  inputClass: string;
};

export default function BlogFormMedia({ form, setForm, setThumbnailFile, inputClass }: BlogFormMediaProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-base font-semibold text-primary">Ảnh bài viết</label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setThumbnailFile(file);
            }}
            className="block h-12 w-full cursor-pointer rounded-xl border border-neutral bg-neutral-light-active px-4 py-2 text-[14px] text-primary file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-neutral-light hover:file:bg-accent-hover"
          />
        </div>

        <div>
          <label className="mb-2 block text-base font-semibold text-primary">URL ảnh</label>
          <input
            value={form.thumbnail}
            onChange={(event) => setForm((prev) => ({ ...prev, thumbnail: event.target.value }))}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
      </div>
    </>
  );
}
