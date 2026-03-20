"use client";

/**
 * /admin/products/[id]/edit/page.tsx
 *
 * Edit page — load product data rồi truyền vào ProductForm.
 * ProductForm đã có đầy đủ: CKEditor, quản lý ảnh per-image,
 * auto SKU, color sync.
 *
 * Tạo file này tại: app/admin/products/[id]/edit/page.tsx
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import { getProduct } from "../../_libs/products";
import ProductForm from "../../components/product-form";
import type { ProductDetail } from "../../product.types";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProduct(id)
      .then((res) => setProduct(res.data))
      .catch((e) => setError(e?.message ?? "Không thể tải sản phẩm"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Package size={40} className="text-neutral-dark opacity-40" />
        <p className="text-sm text-neutral-dark">{error ?? "Không tìm thấy sản phẩm"}</p>
        <button onClick={() => router.back()} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
          Quay lại
        </button>
      </div>
    );
  }

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
        <Link href={`/admin/products/${id}`} className="text-[13px] text-neutral-dark hover:text-accent transition-colors truncate max-w-[200px]">
          {product.name}
        </Link>
        <span className="text-neutral-dark text-[13px]">/</span>
        <span className="text-[13px] text-primary font-medium">Chỉnh sửa</span>
      </div>

      <div className="px-6 py-4">
        <div className="mb-5">
          <h1 className="text-[20px] font-bold text-primary">Chỉnh sửa sản phẩm</h1>
          <p className="text-[13px] text-neutral-dark mt-1 truncate">
            Đang chỉnh sửa: <span className="font-medium text-primary">{product.name}</span>
          </p>
        </div>

        {/* ProductForm đã có CKEditor + quản lý ảnh đầy đủ */}
        <ProductForm product={product} />
      </div>
    </div>
  );
}
