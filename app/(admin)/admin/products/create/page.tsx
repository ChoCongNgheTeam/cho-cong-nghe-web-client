"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductForm from "../components/product-form";

export default function CreateProductPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
        >
          <ArrowLeft size={14} /> Quay lại
        </button>
        <span className="text-neutral-dark text-[13px]">/</span>
        <Link href="/admin/products" className="text-[13px] text-neutral-dark hover:text-accent transition-colors">
          Sản phẩm
        </Link>
        <span className="text-neutral-dark text-[13px]">/</span>
        <span className="text-[13px] text-primary font-medium">Tạo mới</span>
      </div>

      <div className="px-6 py-4 max-w-7xl mx-auto">
        <div className="mb-5">
          <h1 className="text-[20px] font-bold text-primary">Tạo sản phẩm mới</h1>
          <p className="text-[13px] text-neutral-dark mt-1">Điền đầy đủ thông tin, biến thể và hình ảnh sản phẩm.</p>
        </div>

        <ProductForm />
      </div>
    </div>
  );
}
