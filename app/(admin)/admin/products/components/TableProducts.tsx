import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AdminColumn } from "@/components/admin/AdminTables";
import type { ProductCard } from "../product.types";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { formatVND, formatDate } from "@/helpers";

interface GetProductColumnsParams {
  page: number;
  pageSize: number;
  selected: Set<string>;
  toggleOne: (id: string) => void;
  onToggleActive: (product: ProductCard) => void;
  onDeleteClick: (product: ProductCard) => void;
}

export function getProductColumns({ page, pageSize, selected, toggleOne, onToggleActive, onDeleteClick }: GetProductColumnsParams): AdminColumn<ProductCard>[] {
  return [
    {
      key: "_select",
      label: "",
      width: "w-10",
      align: "center",
      render: (product) => (
        <input
          type="checkbox"
          checked={selected.has(product.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleOne(product.id);
          }}
          className="w-3.5 h-3.5 rounded accent-accent cursor-pointer"
        />
      ),
    },
    {
      key: "_stt",
      label: "STT",
      width: "w-14",
      render: (_, idx) => (page - 1) * pageSize + idx + 1,
    },
    {
      key: "name",
      label: "Sản phẩm",
      render: (product) => (
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral bg-neutral-light-active shrink-0">
            {product.thumbnail ? (
              <Image src={product.thumbnail} alt={product.name} width={40} height={40} className="object-contain w-full h-full" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-dark text-[10px]">N/A</div>
            )}
          </div>
          {/* Name + slug */}
          <div className="min-w-0">
            <span className="text-[13px] font-medium text-primary block truncate max-w-[220px]">{product.name}</span>
            <span className="text-[11px] text-neutral-dark font-mono truncate block max-w-[220px]">{product.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Giá",
      render: (product) => <span className="text-[13px] font-semibold text-primary whitespace-nowrap">{formatVND(product.priceOrigin)}</span>,
    },
    {
      key: "rating",
      label: "Đánh giá",
      align: "center",
      render: (product) => (
        <div className="text-center">
          <span className="text-[13px] font-medium text-amber-500">★ {Number(product.rating.average).toFixed(1)}</span>
          <span className="text-[11px] text-neutral-dark block">({product.rating.count})</span>
        </div>
      ),
    },
    {
      key: "inStock",
      label: "Tồn kho",
      align: "center",
      render: (product) => <span className={`text-[12px] font-medium ${product.inStock ? "text-emerald-600" : "text-promotion"}`}>{product.inStock ? "Còn hàng" : "Hết hàng"}</span>,
    },
    {
      key: "isActive",
      label: "Trạng thái",
      render: (product) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!product.deletedAt) onToggleActive(product);
          }}
          disabled={!!product.deletedAt}
          className="cursor-pointer disabled:cursor-default"
          title={product.deletedAt ? "Sản phẩm đã xóa" : "Nhấn để đổi trạng thái"}
        >
          <ProductStatusBadge product={product} />
        </button>
      ),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (product) => <span className="text-[12px] text-neutral-dark whitespace-nowrap">{product.createdAt ? formatDate(product.createdAt) : "—"}</span>,
    },
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (product) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/products/${product.id}`}
            title="Xem"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
          >
            <Eye size={14} />
          </Link>
          {!product.deletedAt && (
            <Link
              href={`/admin/products/${product.id}?edit=true`}
              title="Chỉnh sửa"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
            >
              <Pencil size={14} />
            </Link>
          )}
          <button
            title={product.deletedAt ? "Xóa vĩnh viễn" : "Xóa"}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(product);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-promotion-light hover:text-promotion transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];
}
