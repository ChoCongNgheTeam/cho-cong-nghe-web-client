import { Eye, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { AdminColumn } from "@/components/admin/AdminTables";
import { selectColumn, sttColumn, RowActionButton } from "@/components/admin/columns/adminColumns";
import type { ProductCard } from "../product.types";
import { ProductStatusCell } from "./ProductStatusCell";
import { formatVND, formatDate } from "@/helpers";

interface GetProductColumnsParams {
  page: number;
  pageSize: number;
  selected: Set<string>;
  toggleOne: (id: string) => void;
  onStatusChange: (productId: string, updates: { isActive?: boolean; isFeatured?: boolean }) => void;
  onDeleteClick: (product: ProductCard) => void;
  href: (path: string) => string;
  isStaff?: boolean; // ← thêm
}

export function getProductColumns({ page, pageSize, selected, toggleOne, onStatusChange, onDeleteClick, href, isStaff = false }: GetProductColumnsParams): AdminColumn<ProductCard>[] {
  return [
    // Ẩn checkbox bulk-select với staff (không có bulk action)
    ...(!isStaff ? [selectColumn<ProductCard>((p) => p.id, selected, toggleOne)] : []),
    sttColumn<ProductCard>(page, pageSize),
    {
      key: "name",
      label: "Sản phẩm",
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral bg-neutral-light-active shrink-0">
            {product.thumbnail ? (
              <Image src={product.thumbnail} alt={product.name} width={40} height={40} className="object-contain w-full h-full" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-dark text-[10px]">N/A</div>
            )}
          </div>
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
      render: (product) => {
        const rating = product.rating;
        const hasRating = rating && rating.count > 0 && rating.average !== undefined;
        return (
          <div className="text-center">
            {hasRating ? (
              <>
                <span className="text-[13px] font-medium text-amber-500">★ {Number(rating.average).toFixed(1)}</span>
                <span className="text-[11px] text-neutral-dark block">({rating.count})</span>
              </>
            ) : (
              <span className="text-neutral-400">_</span>
            )}
          </div>
        );
      },
    },
    {
      key: "inStock",
      label: "Tồn kho",
      align: "center",
      render: (product) => {
        const isLowStock = product.stockWarning === "low_stock";
        const isOutOfStock = product.stockWarning === "out_of_stock";
        return (
          <div className="flex flex-col items-center gap-0.5">
            <span className={`text-[12px] font-medium ${isOutOfStock ? "text-promotion" : isLowStock ? "text-amber-600" : "text-emerald-600"}`}>
              {isOutOfStock ? "Hết hàng" : isLowStock ? "Sắp hết" : "Còn hàng"}
            </span>
            {(isLowStock || isOutOfStock) && product.minQuantity !== undefined && (
              <span className="text-[10px] text-amber-500 font-semibold">{isOutOfStock ? "0 còn lại" : `${product.minQuantity} còn lại`}</span>
            )}
          </div>
        );
      },
    },
    // Ẩn cột trạng thái toggle với staff (họ không được đổi isActive/isFeatured)
    ...(!isStaff
      ? [
          {
            key: "isActive",
            label: "Trạng thái",
            render: (product: ProductCard) =>
              product.deletedAt ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-neutral-light-active text-neutral-dark border-neutral">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-dark shrink-0" />
                  Đã xóa
                </span>
              ) : (
                <ProductStatusCell productId={product.id} isActive={product.isActive} isFeatured={product.isFeatured} onStatusChange={onStatusChange} />
              ),
          },
        ]
      : [
          // Staff chỉ thấy badge tĩnh, không toggle được
          {
            key: "isActive",
            label: "Trạng thái",
            render: (product: ProductCard) => (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border
            ${product.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-neutral-light-active text-neutral-dark border-neutral"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${product.isActive ? "bg-emerald-500" : "bg-neutral-dark"}`} />
                {product.isActive ? "Hiển thị" : "Ẩn"}
              </span>
            ),
          },
        ]),
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
          {/* Xem chi tiết — staff xem nhưng href trỏ đúng prefix /staff */}
          <RowActionButton href={href(`/products/${product.id}`)} title="Xem">
            <Eye size={14} />
          </RowActionButton>

          {/* Edit — chỉ admin */}
          {!isStaff && !product.deletedAt && (
            <RowActionButton href={href(`/products/${product.id}/edit`)} title="Chỉnh sửa">
              <Pencil size={14} />
            </RowActionButton>
          )}

          {/* Xóa — chỉ admin */}
          {!isStaff && (
            <RowActionButton title={product.deletedAt ? "Xóa vĩnh viễn" : "Xóa"} variant="danger" onClick={() => onDeleteClick(product)}>
              <Trash2 size={14} />
            </RowActionButton>
          )}
        </div>
      ),
    },
  ];
}
