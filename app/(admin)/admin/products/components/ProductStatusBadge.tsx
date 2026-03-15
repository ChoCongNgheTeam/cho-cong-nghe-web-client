import type { ProductCard } from "../product.types";

export function ProductStatusBadge({ product }: { product: ProductCard }) {
  if (product.deletedAt) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-500">Đã xóa</span>;
  }
  if (!product.isActive) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-500">Ẩn</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600">Hiển thị</span>;
}
