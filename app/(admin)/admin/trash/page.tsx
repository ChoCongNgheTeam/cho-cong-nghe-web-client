"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
   Trash2,
   RotateCcw,
   Search,
   ChevronLeft,
   ChevronRight,
   Loader2,
   PackageX,
   AlertCircle,
   Tag,
   Package,
   Bookmark,
   Users,
   ShoppingCart,
   FileText,
   MessageSquare,
   Star,
   Percent,
   Ticket,
   Megaphone,
} from "lucide-react";
import {
   getTrash,
   restoreTrashItem,
   getItemDisplayName,
   getItemSubInfo,
   type TrashResource,
   type TrashItem,
   DEFAULT_PAGINATION,
} from "./_libs/getTrash";
import { useToasty } from "@/components/Toast";
import { formatDate } from "@/helpers";

// ─── Resource config ──────────────────────────────────────────────────────────

interface ResourceConfig {
   key: TrashResource;
   label: string;
   icon: React.ReactNode;
   group: "catalog" | "content" | "transaction" | "user";
}

const RESOURCES: ResourceConfig[] = [
   // Catalog
   {
      key: "categories",
      label: "Danh mục",
      icon: <Tag size={13} />,
      group: "catalog",
   },
   {
      key: "brands",
      label: "Thương hiệu",
      icon: <Bookmark size={13} />,
      group: "catalog",
   },
   {
      key: "products",
      label: "Sản phẩm",
      icon: <Package size={13} />,
      group: "catalog",
   },

   {
      key: "promotions",
      label: "Khuyến mãi",
      icon: <Percent size={13} />,
      group: "transaction",
   },
   {
      key: "vouchers",
      label: "Voucher",
      icon: <Ticket size={13} />,
      group: "transaction",
   },
   {
      key: "campaigns",
      label: "Chiến dịch",
      icon: <Megaphone size={13} />,
      group: "transaction",
   },
   // Content
   {
      key: "blogs",
      label: "Bài viết",
      icon: <FileText size={13} />,
      group: "content",
   },
   {
      key: "comments",
      label: "Bình luận",
      icon: <MessageSquare size={13} />,
      group: "content",
   },
   {
      key: "reviews",
      label: "Đánh giá",
      icon: <Star size={13} />,
      group: "content",
   },
   // User
   {
      key: "users",
      label: "Người dùng",
      icon: <Users size={13} />,
      group: "user",
   },
];

const GROUP_LABELS: Record<ResourceConfig["group"], string> = {
   catalog: "Danh mục & Sản phẩm",
   transaction: "Giao dịch",
   content: "Nội dung",
   user: "Tài khoản",
};

const GROUPS = ["catalog", "transaction", "content", "user"] as const;

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
   return (
      <div className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-[11px] font-bold text-accent uppercase select-none">
         {name?.charAt(0) ?? "?"}
      </div>
   );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TrashPage() {
   const { success, error: toastError } = useToasty();

   const [resource, setResource] = useState<TrashResource>("categories");
   const [search, setSearch] = useState("");
   const [debouncedSearch, setDebouncedSearch] = useState("");
   const [page, setPage] = useState(1);

   const [items, setItems] = useState<TrashItem[]>([]);
   const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [restoringId, setRestoringId] = useState<string | null>(null);

   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   // Debounce search
   useEffect(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
         setDebouncedSearch(search);
         setPage(1);
      }, 400);
      return () => {
         if (debounceRef.current) clearTimeout(debounceRef.current);
      };
   }, [search]);

   // Reset khi đổi resource
   useEffect(() => {
      setPage(1);
      setSearch("");
      setDebouncedSearch("");
      setItems([]);
      setPagination(DEFAULT_PAGINATION);
      setError(null);
   }, [resource]);

   // Fetch
   const fetchData = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         const res = await getTrash({
            resource,
            page,
            limit: 20,
            search: debouncedSearch || undefined,
         });
         setItems(res.data ?? []);
         setPagination(res.pagination ?? DEFAULT_PAGINATION);
      } catch (e: any) {
         setError(e?.message ?? "Không thể tải dữ liệu");
         setPagination(DEFAULT_PAGINATION);
      } finally {
         setLoading(false);
      }
   }, [resource, page, debouncedSearch]);

   useEffect(() => {
      fetchData();
   }, [fetchData]);

   const handleRestore = async (item: TrashItem) => {
      setRestoringId(item.id);
      try {
         await restoreTrashItem(resource, item.id);
         success(
            `Đã khôi phục "${getItemDisplayName(item, resource)}" thành công`,
         );
         fetchData();
      } catch (e: any) {
         toastError(e?.message ?? "Khôi phục thất bại");
      } finally {
         setRestoringId(null);
      }
   };

   const currentResource = RESOURCES.find((r) => r.key === resource)!;
   const { total, totalPages, page: currentPage, limit } = pagination;

   return (
      <div className="space-y-5 p-5 bg-neutral-light min-h-full">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-[18px] font-bold text-primary flex items-center gap-2">
                  <Trash2 size={18} className="text-promotion" />
                  Thùng rác
               </h1>
               <p className="mt-0.5 text-[12px] text-primary/50">
                  Quản lý các mục đã xóa mềm — có thể khôi phục
               </p>
            </div>
            {!loading && total > 0 && (
               <span className="text-[11px] font-semibold text-promotion bg-promotion-light border border-promotion/20 px-2.5 py-1 rounded-full">
                  {total} mục đã xóa
               </span>
            )}
         </div>

         {/* Resource tabs — grouped */}
         <div className="space-y-2 flex justify-between">
            {GROUPS.map((group) => {
               const groupResources = RESOURCES.filter(
                  (r) => r.group === group,
               );
               return (
                  <div key={group} className="flex items-center gap-2 flex-col">
                     <span className="text-[10px] font-semibold uppercase tracking-wider text-primary shrink-0 text-left w-full">
                        {GROUP_LABELS[group]}
                     </span>
                     <div className="flex items-center gap-1 p-1 bg-neutral-light border border-neutral rounded-xl">
                        {groupResources.map((r) => (
                           <button
                              key={r.key}
                              type="button"
                              onClick={() => setResource(r.key)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                                 resource === r.key
                                    ? "bg-accent text-white shadow-sm"
                                    : "text-primary/60 hover:bg-neutral hover:text-primary"
                              }`}
                           >
                              {r.icon}
                              {r.label}
                           </button>
                        ))}
                     </div>
                  </div>
               );
            })}
         </div>

         {/* Table card */}
         <div className="bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-neutral flex items-center justify-between gap-3">
               <div className="flex items-center gap-2 text-[13px] font-semibold text-primary">
                  {currentResource.icon}
                  <span className="text-accent">{currentResource.label}</span>
                  <span className="text-primary/30 font-normal">đã xóa</span>
               </div>
               <div className="relative w-64">
                  <Search
                     size={13}
                     className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30 pointer-events-none"
                  />
                  <input
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     placeholder={`Tìm ${currentResource.label.toLowerCase()}...`}
                     className="w-full rounded-xl border border-neutral pl-8 pr-3.5 py-2 text-[12px] text-primary bg-neutral-light placeholder-primary/30 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
               </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
               <table className="w-full text-[12px]">
                  <thead>
                     <tr className="border-b border-neutral bg-neutral-light-active">
                        <th className="text-left px-4 py-2.5 font-semibold text-primary/50 uppercase tracking-wider text-[10px] w-10">
                           #
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-primary/50 uppercase tracking-wider text-[10px]">
                           Tên / ID
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-primary/50 uppercase tracking-wider text-[10px]">
                           Thông tin
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-primary/50 uppercase tracking-wider text-[10px]">
                           Ngày xóa
                        </th>
                        <th className="text-right px-4 py-2.5 font-semibold text-primary/50 uppercase tracking-wider text-[10px]">
                           Thao tác
                        </th>
                     </tr>
                  </thead>
                  <tbody>
                     {loading ? (
                        <tr>
                           <td colSpan={5} className="py-16 text-center">
                              <Loader2
                                 size={20}
                                 className="animate-spin text-accent mx-auto"
                              />
                           </td>
                        </tr>
                     ) : error ? (
                        <tr>
                           <td colSpan={5} className="py-16 text-center">
                              <div className="flex flex-col items-center gap-2 text-promotion">
                                 <AlertCircle size={20} />
                                 <p className="text-[12px]">{error}</p>
                                 <button
                                    onClick={fetchData}
                                    className="text-[11px] underline text-accent cursor-pointer"
                                 >
                                    Thử lại
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ) : items.length === 0 ? (
                        <tr>
                           <td colSpan={5} className="py-16 text-center">
                              <div className="flex flex-col items-center gap-2 text-primary/30">
                                 <PackageX size={28} />
                                 <p className="text-[12px]">
                                    Không có mục nào trong thùng rác
                                 </p>
                              </div>
                           </td>
                        </tr>
                     ) : (
                        items.map((item, idx) => {
                           const rowNum = (currentPage - 1) * limit + idx + 1;
                           const isRestoring = restoringId === item.id;
                           const displayName = getItemDisplayName(
                              item,
                              resource,
                           );
                           const subInfo = getItemSubInfo(item, resource);
                           return (
                              <tr
                                 key={item.id}
                                 className="border-b border-neutral last:border-0 hover:bg-neutral-light-active transition-colors"
                              >
                                 <td className="px-4 py-3 text-primary/40 font-mono text-[11px]">
                                    {rowNum}
                                 </td>
                                 <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                       <Avatar name={displayName} />
                                       <span className="font-medium text-primary">
                                          {displayName}
                                       </span>
                                    </div>
                                 </td>
                                 <td className="px-4 py-3 text-primary/50 font-mono text-[11px]">
                                    {subInfo ?? "—"}
                                 </td>
                                 <td className="px-4 py-3 text-primary/50">
                                    {formatDate(item.deletedAt ?? "")}
                                 </td>
                                 <td className="px-4 py-3 text-right">
                                    <button
                                       type="button"
                                       onClick={() => handleRestore(item)}
                                       disabled={isRestoring}
                                       className="inline-flex items-center gap-1.5 rounded-lg border border-neutral px-2.5 py-1.5 text-[11px] font-medium text-primary/60 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                       {isRestoring ? (
                                          <Loader2
                                             size={11}
                                             className="animate-spin"
                                          />
                                       ) : (
                                          <RotateCcw size={11} />
                                       )}
                                       Khôi phục
                                    </button>
                                 </td>
                              </tr>
                           );
                        })
                     )}
                  </tbody>
               </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
               <div className="px-4 py-3 border-t border-neutral flex items-center justify-between text-[12px] text-primary/50">
                  <span>
                     Hiển thị{" "}
                     <span className="font-medium text-primary">
                        {(currentPage - 1) * limit + 1}–
                        {Math.min(currentPage * limit, total)}
                     </span>{" "}
                     / {total} mục
                  </span>
                  <div className="flex items-center gap-1">
                     <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-neutral hover:border-accent hover:text-accent transition-all disabled:opacity-40 cursor-pointer disabled:cursor-default"
                     >
                        <ChevronLeft size={13} />
                     </button>

                     {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                           (p) =>
                              p === 1 ||
                              p === totalPages ||
                              Math.abs(p - currentPage) <= 1,
                        )
                        .reduce<(number | "...")[]>((acc, p, i, arr) => {
                           if (i > 0 && p - (arr[i - 1] as number) > 1)
                              acc.push("...");
                           acc.push(p);
                           return acc;
                        }, [])
                        .map((p, i) =>
                           p === "..." ? (
                              <span
                                 key={`e-${i}`}
                                 className="px-1 text-primary/30"
                              >
                                 …
                              </span>
                           ) : (
                              <button
                                 key={p}
                                 type="button"
                                 onClick={() => setPage(p as number)}
                                 className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                                    currentPage === p
                                       ? "bg-accent text-white border-accent"
                                       : "border-neutral hover:border-accent hover:text-accent"
                                 }`}
                              >
                                 {p}
                              </button>
                           ),
                        )}

                     <button
                        type="button"
                        onClick={() =>
                           setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage >= totalPages}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-neutral hover:border-accent hover:text-accent transition-all disabled:opacity-40 cursor-pointer disabled:cursor-default"
                     >
                        <ChevronRight size={13} />
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
