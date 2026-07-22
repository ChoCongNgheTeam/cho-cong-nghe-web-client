import type { ProductCard } from "../product.types";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

export function ProductStatusBadge({ product }: { product: ProductCard }) {
  if (product.deletedAt) {
    return <StatusBadge label="Đã xóa" className="bg-red-50 text-red-500" size="sm" shape="pill" />;
  }
  if (!product.isActive) {
    return <StatusBadge label="Ẩn" className="bg-orange-50 text-orange-500" size="sm" shape="pill" />;
  }
  return <StatusBadge label="Hiển thị" className="bg-emerald-50 text-emerald-600" size="sm" shape="pill" />;
}
