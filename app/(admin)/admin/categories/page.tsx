"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
   Search,
   Filter,
   Plus,
   Eye,
   Pencil,
   Trash2,
   ChevronDown,
   ChevronRight,
   Star,
   Loader2,
   ImageOff,
   FolderTree,
   Layers,
} from "lucide-react";
import { Category, GetCategoriesParams } from "./category.types";
import { getAllCategories } from "./_libs/getAllCategories";
import AdminPagination from "@/components/admin/PaginationAdmin";

function CategoryImage({ category }: { category: Category }) {
   const [imgError, setImgError] = useState(false);
   const src = category.imageUrl ?? category.imagePath ?? null;

   if (src && !imgError) {
      return (
         <div className="relative w-7 h-7 shrink-0">
            <Image
               src={src}
               alt={category.name}
               fill
               className="object-contain"
               onError={() => setImgError(true)}
               unoptimized={!category.imageUrl}
            />
         </div>
      );
   }

   return (
      <div className="w-7 h-7 rounded-lg bg-neutral-light-active flex items-center justify-center shrink-0 text-neutral-dark">
         <ImageOff size={13} strokeWidth={1.5} />
      </div>
   );
}

export default function AdminCategories() {
   // allCategories = toàn bộ data gốc từ API, không bao giờ bị lọc
   const [allCategories, setAllCategories] = useState<Category[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [updatingId, setUpdatingId] = useState<string | null>(null);

   const [searchInput, setSearchInput] = useState("");
   const [search, setSearch] = useState("");
   const [filterActive, setFilterActive] = useState<boolean | undefined>(
      undefined,
   );
   const [openStatusId, setOpenStatusId] = useState<string | null>(null);

   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(10);

   // ── Fetch toàn bộ data từ API, không truyền isActive ──
   const fetchCategories = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         const params: GetCategoriesParams = {
            ...(search ? { search } : {}),
         };
         const res = await getAllCategories(params);
         setAllCategories(res.data);
      } catch (err: any) {
         setError(err?.message || "Không thể tải danh sách danh mục");
      } finally {
         setLoading(false);
      }
   }, [search]);

   useEffect(() => {
      fetchCategories();
      setPage(1);
   }, [fetchCategories]);

   // ── FE filter theo filterActive ──
   const filtered =
      filterActive === undefined
         ? allCategories
         : allCategories.filter((c) => c.isActive === filterActive);

   const total = filtered.length;
   const totalPages = Math.ceil(total / pageSize) || 1;
   const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

   const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
   };

   // ── Stats từ allCategories (luôn chính xác dù đang lọc) ──
   const activeCount = allCategories.filter((c) => c.isActive).length;
   const hiddenCount = allCategories.filter((c) => !c.isActive).length;
   const featuredCount = allCategories.filter((c) => c.isFeatured).length;
   const rootCount = allCategories.filter((c) => !c.parentId).length;

   const statusTabs = [
      { label: "Tất cả", value: undefined, count: allCategories.length },
      { label: "Hoạt động", value: true, count: activeCount },
      { label: "Ẩn", value: false, count: hiddenCount },
   ];

   return (
      <div className="min-h-screen bg-neutral-light font-inters">
         {/* ── Header ── */}
         <div className="px-6 pt-5 pb-4 flex items-center justify-between">
            <div>
               <h1 className="text-[16px] font-bold text-primary">
                  Danh mục sản phẩm
               </h1>
               <p className="text-[12px] text-neutral-dark mt-0.5">
                  Quản lý toàn bộ danh mục và danh mục con
               </p>
            </div>
            <button className="flex items-center gap-2 bg-accent hover:bg-accent-hover active:bg-accent-active text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm cursor-pointer">
               <Plus size={15} strokeWidth={2.5} />
               Thêm danh mục
            </button>
         </div>

         {/* ── Stats row ── */}
         <div className="px-6 grid grid-cols-4 gap-3 mb-5">
            {[
               {
                  icon: <Layers size={15} />,
                  label: "Tổng danh mục",
                  value: allCategories.length,
                  color: "bg-blue-50 text-blue-500",
               },
               {
                  icon: <FolderTree size={15} />,
                  label: "Danh mục gốc",
                  value: rootCount,
                  color: "bg-violet-50 text-violet-500",
               },
               {
                  icon: <ChevronRight size={15} />,
                  label: "Đang hoạt động",
                  value: activeCount,
                  color: "bg-emerald-50 text-emerald-500",
               },
               {
                  icon: <Star size={14} />,
                  label: "Nổi bật",
                  value: featuredCount,
                  color: "bg-amber-50 text-amber-500",
               },
            ].map((s) => (
               <div
                  key={s.label}
                  className="bg-neutral-light border border-neutral rounded-2xl px-4 py-3 flex items-center gap-3"
               >
                  <div
                     className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}
                  >
                     {s.icon}
                  </div>
                  <div>
                     <p className="text-[11px] text-neutral-dark">{s.label}</p>
                     <p className="text-[15px] font-bold text-primary">
                        {loading ? (
                           <span className="animate-pulse">—</span>
                        ) : (
                           s.value
                        )}
                     </p>
                  </div>
               </div>
            ))}
         </div>

         {/* ── Toolbar ── */}
         <div className="px-6 flex items-center justify-between gap-3 mb-4">
            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-neutral-light-hover/60 p-1 rounded-xl border border-neutral">
               {statusTabs.map((tab) => {
                  const isSelected = filterActive === tab.value;
                  return (
                     <button
                        key={String(tab.value)}
                        onClick={() => {
                           setFilterActive(tab.value);
                           setPage(1);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer whitespace-nowrap ${
                           isSelected
                              ? "bg-neutral-light text-primary font-semibold shadow-sm border border-neutral"
                              : "text-neutral-dark hover:text-primary hover:bg-neutral-light/60"
                        }`}
                     >
                        {tab.label}
                        <span
                           className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md min-w-5 text-center ${
                              isSelected
                                 ? tab.value === true
                                    ? "bg-emerald-100 text-emerald-600"
                                    : tab.value === false
                                      ? "bg-orange-100 text-orange-500"
                                      : "bg-blue-100 text-blue-500"
                                 : "bg-neutral text-neutral-dark"
                           }`}
                        >
                           {loading ? "—" : tab.count}
                        </span>
                     </button>
                  );
               })}
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
                     placeholder="Tìm danh mục..."
                     className="pl-8 pr-3 py-1.5 text-[13px] bg-neutral-light border border-neutral rounded-lg text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/40 w-52 transition-all"
                  />
               </form>

               <button className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg bg-neutral-light text-[13px] text-primary-light hover:bg-neutral-light-active transition-colors cursor-pointer">
                  <Filter size={13} />
                  Bộ lọc
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
                     <th className="w-12 px-4 py-3 text-left text-[11px] font-semibold text-neutral-dark tracking-wide uppercase">
                        STT
                     </th>
                     <th className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-dark tracking-wide uppercase">
                        Tên danh mục
                     </th>
                     <th className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-dark tracking-wide uppercase">
                        Mô tả
                     </th>
                     <th className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-dark tracking-wide uppercase">
                        Danh mục con
                     </th>
                     <th className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-dark tracking-wide uppercase">
                        Vị trí
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
                        Hành động
                     </th>
                  </tr>
               </thead>

               <tbody>
                  {loading ? (
                     Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-neutral">
                           {Array.from({ length: 8 }).map((_, j) => (
                              <td key={j} className="px-4 py-3">
                                 <div className="h-4 bg-neutral rounded animate-pulse" />
                              </td>
                           ))}
                        </tr>
                     ))
                  ) : paginated.length === 0 ? (
                     <tr>
                        <td
                           colSpan={8}
                           className="py-20 text-center text-[13px] text-neutral-dark"
                        >
                           Không có dữ liệu
                        </td>
                     </tr>
                  ) : (
                     paginated.map((cat, idx) => {
                        const stt = (page - 1) * pageSize + idx + 1;
                        const isUpdating = updatingId === cat.id;
                        const isOpen = openStatusId === cat.id;
                        const isChild = !!cat.parentId;

                        const statusOption = cat.isActive
                           ? {
                                label: "Hoạt động",
                                color: "text-emerald-600 bg-emerald-50",
                             }
                           : {
                                label: "Ẩn",
                                color: "text-orange-500 bg-orange-50",
                             };

                        return (
                           <tr
                              key={cat.id}
                              className={`border-b border-neutral last:border-b-0 hover:bg-neutral-light-active/50 transition-colors ${
                                 isChild ? "bg-neutral-light-hover/30" : ""
                              }`}
                           >
                              <td className="px-4 py-3 text-[13px] text-primary-light tabular-nums">
                                 {stt}
                              </td>

                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-2.5">
                                    {isChild && (
                                       <span className="text-neutral-dark/40 shrink-0">
                                          <ChevronRight size={12} />
                                       </span>
                                    )}
                                    <CategoryImage category={cat} />
                                    <div>
                                       <span className="text-[13px] font-medium text-primary">
                                          {cat.name}
                                       </span>
                                       <p className="text-[11px] text-neutral-dark font-mono">
                                          /{cat.slug}
                                       </p>
                                    </div>
                                 </div>
                              </td>

                              <td className="px-4 py-3 text-[13px] text-primary-light max-w-50">
                                 <span className="line-clamp-1">
                                    {cat.description ?? "—"}
                                 </span>
                              </td>

                              <td className="px-4 py-3">
                                 <span className="inline-flex items-center gap-1 text-[12px] text-primary-light bg-neutral-light-active px-2.5 py-1 rounded-lg">
                                    <FolderTree size={11} />
                                    {cat._count.children}
                                 </span>
                              </td>

                              <td className="px-4 py-3 text-[13px] text-primary-light tabular-nums">
                                 #{cat.position}
                              </td>

                              <td className="px-4 py-3">
                                 <button
                                    disabled={isUpdating}
                                    onClick={async () => {
                                       setUpdatingId(cat.id);
                                       setAllCategories((prev) =>
                                          prev.map((c) =>
                                             c.id === cat.id
                                                ? {
                                                     ...c,
                                                     isFeatured: !c.isFeatured,
                                                  }
                                                : c,
                                          ),
                                       );
                                       try {
                                          // updateCategory(cat.id, { isFeatured: !cat.isFeatured })
                                       } catch {
                                          fetchCategories();
                                       } finally {
                                          setUpdatingId(null);
                                       }
                                    }}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium cursor-pointer disabled:opacity-50 ${
                                       cat.isFeatured
                                          ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                                          : "text-neutral-dark bg-neutral-light-active hover:bg-neutral-light-hover"
                                    }`}
                                 >
                                    {isUpdating ? (
                                       <Loader2
                                          size={11}
                                          className="animate-spin"
                                       />
                                    ) : (
                                       <Star
                                          size={11}
                                          fill={
                                             cat.isFeatured
                                                ? "currentColor"
                                                : "none"
                                          }
                                       />
                                    )}
                                    {cat.isFeatured ? "Nổi bật" : "Thường"}
                                 </button>
                              </td>

                              <td className="px-4 py-3">
                                 <div className="relative inline-block">
                                    <button
                                       disabled={isUpdating}
                                       onClick={() =>
                                          setOpenStatusId(
                                             isOpen ? null : cat.id,
                                          )
                                       }
                                       className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition-colors cursor-pointer disabled:opacity-50 ${statusOption.color}`}
                                    >
                                       {isUpdating ? (
                                          <Loader2
                                             size={11}
                                             className="animate-spin"
                                          />
                                       ) : (
                                          <ChevronDown size={11} />
                                       )}
                                       {statusOption.label}
                                    </button>

                                    {isOpen && (
                                       <div className="absolute z-20 left-0 top-full mt-1 w-40 bg-neutral-light border border-neutral rounded-xl shadow-lg overflow-hidden">
                                          {[
                                             {
                                                value: "active",
                                                label: "Hoạt động",
                                                color: "text-emerald-600 bg-emerald-50",
                                             },
                                             {
                                                value: "hidden",
                                                label: "Ẩn",
                                                color: "text-orange-500 bg-orange-50",
                                             },
                                          ].map((opt) => {
                                             const isCurrent =
                                                (opt.value === "active") ===
                                                cat.isActive;
                                             return (
                                                <button
                                                   key={opt.value}
                                                   disabled={isCurrent}
                                                   onClick={async () => {
                                                      const newActive =
                                                         opt.value === "active";
                                                      setUpdatingId(cat.id);
                                                      setOpenStatusId(null);
                                                      // Cập nhật optimistic trong allCategories
                                                      setAllCategories((prev) =>
                                                         prev.map((c) =>
                                                            c.id === cat.id
                                                               ? {
                                                                    ...c,
                                                                    isActive:
                                                                       newActive,
                                                                 }
                                                               : c,
                                                         ),
                                                      );
                                                      try {
                                                         // updateCategory(cat.id, { isActive: newActive })
                                                      } catch {
                                                         fetchCategories();
                                                      } finally {
                                                         setUpdatingId(null);
                                                      }
                                                   }}
                                                   className={`w-full text-left px-3 py-2 text-[12px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default hover:bg-neutral-light-active ${opt.color}`}
                                                >
                                                   {opt.label}
                                                   {isCurrent && (
                                                      <span className="float-right text-[10px]">
                                                         ✓
                                                      </span>
                                                   )}
                                                </button>
                                             );
                                          })}
                                       </div>
                                    )}
                                 </div>
                              </td>

                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-2">
                                    <Link
                                       href={`/admin/categories/${cat.id}`}
                                       title="Xem"
                                       className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
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

         {openStatusId && (
            <div
               className="fixed inset-0 z-10"
               onClick={() => setOpenStatusId(null)}
            />
         )}
      </div>
   );
}
