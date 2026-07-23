import { Eye, Pencil, Trash2 } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { selectColumn, sttColumn, statusDropdownColumn, RowActionButton } from "@/components/admin/columns/adminColumns";
import { BrandImage } from "./BrandImage";
import { STATUS_OPTIONS } from "../_lib/constants";
import { Brand } from "../brand.types";

interface GetBrandColumnsParams {
  page: number;
  pageSize: number;
  selected: Set<string>;
  openStatusId: string | null;
  toggleOne: (id: string) => void;
  setOpenStatusId: (id: string | null) => void;
  onToggleActive: (brand: Brand) => void;
  onDeleteClick: (brand: Brand) => void;
}

export function getBrandColumns({ page, pageSize, selected, openStatusId, toggleOne, setOpenStatusId, onToggleActive, onDeleteClick }: GetBrandColumnsParams): AdminColumn<Brand>[] {
  return [
    selectColumn<Brand>((b) => b.id, selected, toggleOne),
    sttColumn<Brand>(page, pageSize),
    {
      key: "name",
      label: "Tên thương hiệu",
      render: (brand) => (
        <div className="flex items-center gap-2.5">
          <BrandImage brand={brand} />
          <span className="text-[13px] font-medium text-primary">{brand.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      label: "Mô tả",
      render: (brand) => <span className="line-clamp-1 text-[13px] text-primary max-w-xs block">{brand.description ?? "—"}</span>,
    },
    {
      key: "isFeatured",
      label: "Nổi bật",
      render: (brand) => (brand.isFeatured ? <span className="text-amber-500 text-[13px]">⭐ Nổi bật</span> : <span className="text-neutral-dark text-[13px]">— Bình thường</span>),
    },
    statusDropdownColumn<Brand>({
      getId: (b) => b.id,
      getCurrentValue: (b) => (b.isActive ? "active" : "hidden"),
      getCurrentDisplay: (b) => (b.isActive ? { label: "Hoạt động", color: "text-emerald-600 bg-emerald-50" } : { label: "Ẩn", color: "text-orange-500 bg-orange-50" }),
      options: STATUS_OPTIONS,
      openId: openStatusId,
      setOpenId: setOpenStatusId,
      onChange: onToggleActive,
    }),
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (brand) => (
        <div className="flex items-center justify-end gap-2">
          <RowActionButton href={`/admin/brands/${brand.id}`} title="Xem">
            <Eye size={14} />
          </RowActionButton>
          <RowActionButton href={`/admin/brands/${brand.id}?edit=true`} title="Chỉnh sửa">
            <Pencil size={14} />
          </RowActionButton>
          {brand._count.products === 0 && (
            <RowActionButton title="Xoá" variant="danger" onClick={() => onDeleteClick(brand)}>
              <Trash2 size={14} />
            </RowActionButton>
          )}
        </div>
      ),
    },
  ];
}
