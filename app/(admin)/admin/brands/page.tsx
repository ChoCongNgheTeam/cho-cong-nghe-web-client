"use client";

import { useEffect, useState, useCallback } from "react";
import {
   Search,
   Filter,
   CalendarDays,
   Share2,
   Plus,
   ChevronDown,
   Eye,
   Pencil,
   Trash2,
} from "lucide-react";
import Link from "next/link";

import { Brand, GetBrandsParams } from "./brand.types";
import { STATUS_OPTIONS } from "./const";
import { BrandImage } from "./components/BrandImage";
import { getAllBrands } from "./_libs";
import AdminPagination from "@/components/admin/PaginationAdmin";
import AdminTable, { AdminColumn } from "@/components/admin/AdminTables";
import { getBrandColumns } from "./components/TableBrands";

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
      const next = new Set(selected);
      if (allChecked) paginated.forEach((b) => next.delete(b.id));
      else paginated.forEach((b) => next.add(b.id));
      setSelected(next);
   };

   const toggleOne = (id: string) => {
      const next = new Set(selected);
      next.has(id) ? next.delete(id) : next.add(id);
      setSelected(next);
   };

   const columns = getBrandColumns({
      page,
      pageSize,
      selected,
      openStatusId,
      toggleOne,
      setOpenStatusId,
   });

   return (
      <div className="min-h-screen bg-neutral-light font-inters">
         <div className="flex items-center justify-end px-6 pt-5 pb-3">
            <button className="flex items-center gap-2 bg-accent hover:bg-accent-hover active:bg-accent-active text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm cursor-pointer">
               <Plus size={15} strokeWidth={2.5} />
               Thêm thương hiệu
            </button>
         </div>

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
               <form
                  onSubmit={(e) => {
                     e.preventDefault();
                     setSearch(searchInput);
                  }}
                  className="relative"
               >
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
                  <Filter size={13} /> Bộ lọc
               </button>
               <button className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg bg-neutral-light text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer">
                  <CalendarDays size={13} /> Lọc theo ngày
               </button>
               <button className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg bg-neutral-light text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer">
                  <Share2 size={13} /> Chia sẻ
               </button>
            </div>
         </div>

         {selected.size > 0 && (
            <div className="mx-6 mb-3 flex items-center gap-3 px-4 py-2.5 rounded-lg border border-accent-light bg-accent-light text-[13px] text-primary">
               <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded accent-accent cursor-pointer"
               />
               <span className="font-medium">
                  Đã chọn{" "}
                  <span className="text-accent font-semibold">
                     {selected.size}
                  </span>{" "}
                  mục
               </span>
               <button className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium text-promotion hover:bg-promotion-light transition-colors cursor-pointer">
                  <Trash2 size={13} /> Xoá đã chọn
               </button>
            </div>
         )}

         {error && (
            <div className="mx-6 mb-3 border border-promotion/30 bg-promotion-light text-promotion text-[13px] px-4 py-2.5 rounded-lg">
               {error}
            </div>
         )}

         <AdminTable<Brand>
            columns={columns}
            data={paginated}
            rowKey="id"
            loading={loading}
            className="mx-6"
            rowClassName={(brand) =>
               selected.has(brand.id) ? "bg-accent-light/30" : ""
            }
         />

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

         {openStatusId && (
            <div
               className="fixed inset-0 z-10"
               onClick={() => setOpenStatusId(null)}
            />
         )}
      </div>
   );
}
