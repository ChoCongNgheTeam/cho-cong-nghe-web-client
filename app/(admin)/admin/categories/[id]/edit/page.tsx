"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Loader2, AlertCircle } from "lucide-react";
import type { CategoryDetail } from "../../category.types";
import { getCategoryDetail } from "../../_libs/categories";
import CategoryForm from "../../components/CategoryForm";

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();

  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCategoryDetail(id)
      .then((res: any) => setCategory(res?.data ?? res))
      .catch((e: any) => setError(e?.message ?? "Không thể tải danh mục"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] gap-3 text-neutral-dark">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-[13px]">Đang tải...</span>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 px-4 py-3 bg-promotion-light border border-promotion/20 rounded-xl text-promotion text-[13px]">
          <AlertCircle size={15} /> {error ?? "Không tìm thấy danh mục"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/admin/categories/${id}`} className="w-8 h-8 flex items-center justify-center rounded-xl border border-neutral hover:bg-neutral-light-active transition-colors">
          <ArrowLeft size={15} className="text-neutral-dark" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
              <Pencil size={13} className="text-accent" />
            </div>
            <h1 className="text-[16px] font-semibold text-primary">Chỉnh sửa danh mục</h1>
          </div>
          <p className="text-[12px] text-neutral-dark mt-0.5 font-mono">/{category.slug}</p>
        </div>
      </div>

      <CategoryForm mode="edit" initialData={category as any} />
    </div>
  );
}
