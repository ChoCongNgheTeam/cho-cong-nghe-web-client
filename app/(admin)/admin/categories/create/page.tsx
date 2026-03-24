"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import CategoryForm from "../components/CategoryForm";

export default function CreateCategoryPage() {
  const searchParams = useSearchParams();
  const defaultParent = searchParams.get("parentId") ?? "";

  return (
    <div className="p-5 space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/categories" className="w-8 h-8 flex items-center justify-center rounded-xl border border-neutral hover:bg-neutral-light-active transition-colors">
          <ArrowLeft size={15} className="text-neutral-dark" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
              <Plus size={14} className="text-accent" />
            </div>
            <h1 className="text-[16px] font-semibold text-primary">Thêm danh mục mới</h1>
          </div>
          <p className="text-[12px] text-neutral-dark mt-0.5">{defaultParent ? "Tạo danh mục con" : "Tạo danh mục gốc hoặc danh mục con"}</p>
        </div>
      </div>

      <CategoryForm mode="create" defaultParentId={defaultParent} />
    </div>
  );
}
