"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
   Search,
   Filter,
   CalendarDays,
   Share2,
   Plus,
   CirclePlus,
   Pencil,
   Trash2,
   ChevronDown,
   ImageOff,
   Eye,
} from "lucide-react";
import { Brand, GetBrandsParams } from "./brand.types";
import AdminPagination from "@/components/admin/PaginationAdmin";
import { STATUS_OPTIONS } from "./const";
import { BrandImage } from "./components/BrandImage";
import Link from "next/link";
import { getAllBrands } from "./_libs";

type SortBy = "name" | "createdAt" | "productCount";
type SortOrder = "asc" | "desc";

export default function AdminBrandsPage() {
   const [brands, setBrands] = useState<Brand[]>([]);
   const [total, setTotal] = useState(0);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const [search, setSearch] = useState("");
   const [searchInput, setSearchInput] = useState("");
   const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
   const [isFeatured, setIsFeatured] = useState<boolean | undefined>(undefined);
   const [sortBy, setSortBy] = useState<SortBy>("name");
   const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(10);

   const [selected, setSelected] = useState<Set<string>>(new Set());
   const [openStatusId, setOpenStatusId] = useState<string | null>(null);

   const totalPages = Math.ceil(total / pageSize) || 1;

   const fetchBrands = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         const params: GetBrandsParams = {
            ...(search ? { search } : {}),
            ...(isActive !== undefined ? { isActive } : {}),
            ...(isFeatured !== undefined ? { isFeatured } : {}),
            sortBy,
            sortOrder,
         };
         const res = await getAllBrands(params);
         console.log(res);

         setBrands(res.data);
         setTotal(res.data.length);
      } catch (err: any) {
         setError(err?.message || "Không thể tải danh sách thương hiệu");
      } finally {
         setLoading(false);
      }
   }, [search, isActive, isFeatured, sortBy, sortOrder]);

   useEffect(() => {
      fetchBrands();
      setSelected(new Set());
      setPage(1);
   }, [fetchBrands]);

   const paginated = brands.slice((page - 1) * pageSize, page * pageSize);
   const allChecked =
      paginated.length > 0 && paginated.every((b) => selected.has(b.id));

   const toggleAll = () => {
      if (allChecked) {
         const next = new Set(selected);
         paginated.forEach((b) => next.delete(b.id));
         setSelected(next);
      } else {
         const next = new Set(selected);
         paginated.forEach((b) => next.add(b.id));
         setSelected(next);
      }
   };

   const toggleOne = (id: string) => {
      const next = new Set(selected);
      next.has(id) ? next.delete(id) : next.add(id);
      setSelected(next);
   };

   const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
   };

   return (
      <div className="min-h-screen bg-neutral-light font-inters">
         {/* ── Top action bar ── */}
         <div className="flex items-center justify-end px-6 pt-5 pb-3">
            <button className="flex items-center gap-2 bg-accent hover:bg-accent-hover active:bg-accent-active text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm cursor-pointer">
               <Plus size={15} strokeWidth={2.5} />
               Thêm thương hiệu
            </button>
         </div>

         {/* ── Tabs + toolbar row ── */}
         <div className="px-6 flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-1">
               <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-light-active text-[13px] font-semibold text-primary transition-colors cursor-pointer">
                  Tất cả nhãn hiệu
                  <span className="text-accent font-bold text-[12px]">
                     ({total})
                  </span>
               </button>
            </div>

            <div className="flex items-center gap-2">
               <form onSubmit={handleSearchSubmit} className="relative">
                  <Search
                     size={14}
                     className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none"
                  />
                  <input
                     type="text"
                     value={searchInput}
                     onChange={(e) => setSearchInput(e.target.value)}
                     placeholder="Search"
                     className="pl-8 pr-3 py-1.5 text-[13px] bg-neutral-light border border-neutral rounded-lg text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/40 w-52 transition-all"
                  />
               </form>

               <button className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg bg-neutral-light text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer">
                  <Filter size={13} />
                  Bộ lọc
               </button>

               <button className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg bg-neutral-light text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer">
                  <CalendarDays size={13} />
                  Lọc theo ngày
               </button>

               <button className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg bg-neutral-light text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer">
                  <Share2 size={13} />
                  Chia sẻ
               </button>
            </div>
         </div>

         {/* ── Error ── */}
         {error && (
            <div className="mx-6 mb-3 border border-promotion/30 bg-promotion-light text-promotion text-[13px] px-4 py-2.5 rounded-lg">
               {error}
            </div>
         )}

         {/* ── Table ── */}
         <div className="mx-6 border border-neutral rounded-xl overflow-hidden bg-neutral-light">
            <table className="w-full">
               <thead>
                  <tr className="border-b border-neutral bg-neutral-light-hover">
                     <th className="w-10 px-4 py-3">
                        <input
                           type="checkbox"
                           checked={allChecked}
                           onChange={toggleAll}
                           className="w-3.5 h-3.5 rounded accent-accent cursor-pointer"
                        />
                     </th>
                     <th className="w-16 px-4 py-3 text-left text-[11px] font-semibold text-neutral-dark tracking-wide uppercase">
                        STT
                     </th>
                     <th className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-dark tracking-wide uppercase">
                        Tên thương hiệu
                     </th>
                     <th className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-dark tracking-wide uppercase">
                        Mô tả
                     </th>
                     <th className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-dark tracking-wide uppercase">
                        Nổi bật
                     </th>
                     <th className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-dark tracking-wide uppercase">
                        <div className="flex items-center gap-1">
                           Trạng thái
                           <ChevronDown size={11} />
                        </div>
                     </th>
                     <th className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-dark tracking-wide uppercase">
                        <div className="flex items-center gap-1">
                           Hành động
                           <ChevronDown size={11} />
                        </div>
                     </th>
                  </tr>
               </thead>

               <tbody>
                  {loading ? (
                     <tr>
                        <td
                           colSpan={7}
                           className="py-20 text-center text-[13px] text-neutral-dark"
                        >
                           <span className="animate-pulse">Đang tải...</span>
                        </td>
                     </tr>
                  ) : paginated.length === 0 ? (
                     <tr>
                        <td
                           colSpan={7}
                           className="py-20 text-center text-[13px] text-neutral-dark"
                        >
                           Không có dữ liệu
                        </td>
                     </tr>
                  ) : (
                     paginated.map((brand, idx) => {
                        const stt = (page - 1) * pageSize + idx + 1;
                        const statusOption = brand.isActive
                           ? {
                                label: "Hoạt động",
                                color: "text-emerald-600 bg-emerald-50",
                             }
                           : {
                                label: "Ẩn",
                                color: "text-orange-500 bg-orange-50",
                             };
                        const isOpen = openStatusId === brand.id;
                        return (
                           <tr
                              key={brand.id}
                              className={`border-b border-neutral last:border-b-0 hover:bg-neutral-light-active/50 transition-colors ${
                                 selected.has(brand.id)
                                    ? "bg-accent-light/30"
                                    : ""
                              }`}
                           >
                              {/* Checkbox */}
                              <td className="w-10 px-4 py-3">
                                 <input
                                    type="checkbox"
                                    checked={selected.has(brand.id)}
                                    onChange={() => toggleOne(brand.id)}
                                    className="w-3.5 h-3.5 rounded accent-accent cursor-pointer"
                                 />
                              </td>

                              {/* STT */}
                              <td className="px-4 py-3 text-[13px] text-primary tabular-nums">
                                 {stt}
                              </td>

                              {/* Tên + logo */}
                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-2.5">
                                    <BrandImage brand={brand} />
                                    <span className="text-[13px] font-medium text-primary">
                                       {brand.name}
                                    </span>
                                 </div>
                              </td>

                              {/* Mô tả */}
                              <td className="px-4 py-3 text-[13px] text-primary max-w-xs">
                                 <span className="line-clamp-1">
                                    {brand.description ?? "—"}
                                 </span>
                              </td>

                              {/* Nổi bật */}
                              <td className="px-4 py-3 text-[13px]">
                                 {brand.isFeatured ? (
                                    <span className="text-amber-500">
                                       ⭐ Nổi bật
                                    </span>
                                 ) : (
                                    <span className="text-neutral-dark">
                                       — Bình thường
                                    </span>
                                 )}
                              </td>

                              {/* Trạng thái dropdown */}
                              <td className="px-4 py-3">
                                 <div className="relative inline-block">
                                    <button
                                       onClick={() =>
                                          setOpenStatusId(
                                             isOpen ? null : brand.id,
                                          )
                                       }
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
                                                onClick={() =>
                                                   setOpenStatusId(null)
                                                }
                                                className={`w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-neutral-light-active transition-colors cursor-pointer ${opt.color}`}
                                             >
                                                {opt.label}
                                             </button>
                                          ))}
                                       </div>
                                    )}
                                 </div>
                              </td>

                              {/* Hành động */}
                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-2">
                                    <Link
                                       href={`/admin/brands/${brand.id}`}
                                       title="Xem"
                                       className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors cursor-pointer"
                                    >
                                       <Eye size={14} />
                                    </Link>
                                    <button
                                       title="Chỉnh sửa"
                                       className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors cursor-pointer"
                                    >
                                       <Pencil size={14} />
                                    </button>
                                    <button
                                       title="Xoá"
                                       className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-promotion-light hover:text-promotion transition-colors cursor-pointer"
                                    >
                                       <Trash2 size={14} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        );
                     })
                  )}
               </tbody>
            </table>
         </div>

         {/* ── Pagination ── */}
         <div className="px-6 py-4">
            <AdminPagination
               currentPage={page}
               totalPages={totalPages}
               total={total}
               pageSize={pageSize}
               onPageChange={setPage}
               onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
               }}
               pageSizeOptions={[10, 20, 50]}
               siblingCount={1}
            />
         </div>

         {/* Close dropdown on outside click */}
         {openStatusId && (
            <div
               className="fixed inset-0 z-10"
               onClick={() => setOpenStatusId(null)}
            />
         )}
      </div>
   );
}
