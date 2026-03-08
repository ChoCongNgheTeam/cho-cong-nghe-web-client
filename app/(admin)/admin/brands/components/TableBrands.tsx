import { ChevronDown, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { AdminColumn } from "@/components/admin/AdminTables";
import { BrandImage } from "./BrandImage";
import { STATUS_OPTIONS } from "../const";
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

export function getBrandColumns({
   page,
   pageSize,
   selected,
   openStatusId,
   toggleOne,
   setOpenStatusId,
   onToggleActive,
   onDeleteClick,
}: GetBrandColumnsParams): AdminColumn<Brand>[] {
   return [
      {
         key: "_select",
         label: "",
         width: "w-10",
         align: "center",
         render: (brand) => (
            <input
               type="checkbox"
               checked={selected.has(brand.id)}
               onChange={(e) => {
                  e.stopPropagation();
                  toggleOne(brand.id);
               }}
               className="w-3.5 h-3.5 rounded accent-accent cursor-pointer"
            />
         ),
      },
      {
         key: "_stt",
         label: "STT",
         width: "w-16",
         render: (_, idx) => (page - 1) * pageSize + idx + 1,
      },
      {
         key: "name",
         label: "Tên thương hiệu",
         render: (brand) => (
            <div className="flex items-center gap-2.5">
               <BrandImage brand={brand} />
               <span className="text-[13px] font-medium text-primary">
                  {brand.name}
               </span>
            </div>
         ),
      },
      {
         key: "description",
         label: "Mô tả",
         render: (brand) => (
            <span className="line-clamp-1 text-[13px] text-primary max-w-xs block">
               {brand.description ?? "—"}
            </span>
         ),
      },
      {
         key: "isFeatured",
         label: "Nổi bật",
         render: (brand) =>
            brand.isFeatured ? (
               <span className="text-amber-500 text-[13px]">⭐ Nổi bật</span>
            ) : (
               <span className="text-neutral-dark text-[13px]">
                  — Bình thường
               </span>
            ),
      },
      {
         key: "isActive",
         label: "Trạng thái",
         render: (brand) => {
            const statusOption = brand.isActive
               ? { label: "Hoạt động", color: "text-emerald-600 bg-emerald-50" }
               : { label: "Ẩn", color: "text-orange-500 bg-orange-50" };
            const isOpen = openStatusId === brand.id;
            return (
               <div className="relative inline-block">
                  <button
                     onClick={(e) => {
                        e.stopPropagation();
                        setOpenStatusId(isOpen ? null : brand.id);
                     }}
                     className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${statusOption.color}`}
                  >
                     {statusOption.label}
                     <ChevronDown size={11} />
                  </button>
                  {isOpen && (
                     <div className="absolute z-20 left-0 top-full mt-1 w-40 bg-neutral-light border border-neutral rounded-xl shadow-lg overflow-hidden">
                        {STATUS_OPTIONS.map((opt) => (
                           <button
                              key={opt.value}
                              onClick={(e) => {
                                 e.stopPropagation();
                                 // 👇 chỉ gọi nếu khác trạng thái hiện tại
                                 if (
                                    opt.value !==
                                    (brand.isActive ? "active" : "hidden")
                                 ) {
                                    onToggleActive(brand);
                                 }
                                 setOpenStatusId(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-neutral-light-active transition-colors cursor-pointer ${opt.color}`}
                           >
                              {opt.label}
                           </button>
                        ))}
                     </div>
                  )}
               </div>
            );
         },
      },
      {
         key: "_actions",
         label: "Hành động",
         align: "right",
         render: (brand) => (
            <div className="flex items-center justify-end gap-2">
               <Link
                  href={`/admin/brands/${brand.id}`}
                  title="Xem"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
               >
                  <Eye size={14} />
               </Link>
               <Link
                  href={`/admin/brands/${brand.id}?edit=true`}
                  title="Chỉnh sửa"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
               >
                  <Pencil size={14} />
               </Link>
               <button
                  title="Xoá"
                  onClick={() => onDeleteClick(brand)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-promotion-light hover:text-promotion transition-colors cursor-pointer"
               >
                  <Trash2 size={14} />
               </button>
            </div>
         ),
      },
   ];
}
