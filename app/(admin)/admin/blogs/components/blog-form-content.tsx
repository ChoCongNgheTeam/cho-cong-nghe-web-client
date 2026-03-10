"use client";

import type { Dispatch, SetStateAction } from "react";
import type { BlogFormState } from "./blog-form";
import CkEditorField from "./ckeditor-field";

type BlogFormContentProps = {
  form: BlogFormState;
  setForm: Dispatch<SetStateAction<BlogFormState>>;
};

export default function BlogFormContent({ form, setForm }: BlogFormContentProps) {
  return (
    <div>
      <label className="mb-2 block text-base font-semibold text-primary">Nội dung bài viết</label>
      <CkEditorField
        value={form.content}
        onChange={(nextValue) => setForm((prev) => ({ ...prev, content: nextValue }))}
      />
    </div>
  );
}
