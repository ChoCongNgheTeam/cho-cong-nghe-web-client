"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { createBlog } from "../_libs/blogs";
import { BlogForm, DEFAULT_FORM } from "../components/BlogForm";
import { useToasty } from "@/components/Toast";

export default function NewBlogPage() {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToasty();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setSaving(true);
    setError(null);
    try {
      const res = await createBlog(formData);
      toastSuccess("Bài viết đã được tạo thành công!", { title: "Tạo bài viết" });
      router.push(`/admin/blogs/${res.data.id}`);
    } catch (e: any) {
      const msg = e?.message ?? "Không thể tạo bài viết";
      setError(msg);
      toastError(msg, { title: "Tạo thất bại" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
          <ArrowLeft size={14} /> Quay lại
        </button>
        <span className="text-neutral-dark text-[13px]">/</span>
        <Link href="/admin/blogs" className="text-[13px] text-neutral-dark hover:text-accent">
          Bài viết
        </Link>
        <span className="text-neutral-dark text-[13px]">/</span>
        <span className="text-[13px] text-primary font-medium">Viết bài mới</span>
      </div>

      {/* Header */}
      <div className="px-6 pb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          <BookOpen size={18} />
        </div>
        <div>
          <h1 className="text-[18px] font-bold text-primary">Viết bài mới</h1>
          <p className="text-[12px] text-neutral-dark">Soạn thảo và đăng bài viết mới</p>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 pb-8">
        <BlogForm initialData={DEFAULT_FORM} onSubmit={handleSubmit} saving={saving} error={error} submitLabel="Tạo bài viết" onCancel={() => router.push("/admin/blogs")} layout="page" />
      </div>
    </div>
  );
}
