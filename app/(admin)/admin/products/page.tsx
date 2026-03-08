"use client";

import { useEffect, useState, useCallback } from "react";
import { Pagination, Product } from "./product.types";
import { getAllProduct } from "./_libs";
import AdminPagination from "@/components/admin/PaginationAdmin";
// ─── Types ────────────────────────────────────────────────────────────────────

type StatusType = "active" | "hidden" | "out";

const STATUS_MAP: Record<StatusType, { label: string; cls: string }> = {
   active: {
      label: "Hoạt động",
      cls: "bg-[rgb(var(--accent-light))] text-accent border border-[rgb(var(--accent-light-active))]",
   },
   hidden: {
      label: "Ẩn",
      cls: "bg-amber-50 text-amber-700 border border-amber-200",
   },
   out: {
      label: "Hết hàng",
      cls: "bg-[rgb(var(--promotion-light))] text-promotion border border-[rgb(var(--promotion-light-active))]",
   },
};

const fmt = (n: number) =>
   new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
   }).format(n);

const SAMPLE_STATUSES: StatusType[] = [
   "active",
   "active",
   "active",
   "hidden",
   "active",
   "active",
   "active",
   "active",
   "active",
   "out",
   "active",
   "active",
];

// ─── Status Dropdown ──────────────────────────────────────────────────────────

function StatusDropdown({
   value,
   onChange,
}: {
   value: StatusType;
   onChange: (v: StatusType) => void;
}) {
   const [open, setOpen] = useState(false);
   const s = STATUS_MAP[value];

   return (
      <div className="relative inline-block text-left">
         <button
            onClick={() => setOpen((o) => !o)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${s.cls}`}
         >
            {s.label}
            <svg
               className="w-3 h-3"
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
               />
            </svg>
         </button>
         {open && (
            <div className="absolute z-30 mt-1.5 left-0 w-32 bg-neutral-light border border-neutral rounded-xl shadow-xl overflow-hidden">
               {(Object.keys(STATUS_MAP) as StatusType[]).map((k) => (
                  <button
                     key={k}
                     onClick={() => {
                        onChange(k);
                        setOpen(false);
                     }}
                     className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-neutral-light-active ${value === k ? "bg-neutral-light-active" : ""}`}
                  >
                     <span
                        className={`inline-flex px-2 py-0.5 rounded-md font-semibold ${STATUS_MAP[k].cls}`}
                     >
                        {STATUS_MAP[k].label}
                     </span>
                  </button>
               ))}
            </div>
         )}
      </div>
   );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
   title,
   value,
   trend,
   sub,
   sparkline,
   children,
}: {
   title: string;
   value?: string;
   trend?: string;
   sub?: string;
   sparkline?: boolean;
   children?: React.ReactNode;
}) {
   return (
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 shadow-sm relative overflow-hidden">
         {sparkline && (
            <svg
               className="absolute right-4 top-4 w-16 h-8 opacity-20"
               viewBox="0 0 64 32"
               fill="none"
            >
               <polyline
                  points="0,28 10,20 20,24 30,12 40,16 50,8 64,14"
                  stroke="rgb(var(--accent))"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               />
            </svg>
         )}
         {children ?? (
            <>
               <p className="text-3xl font-bold text-primary tracking-tight">
                  {value}
               </p>
               <p className="text-xs text-neutral-dark font-medium mt-0.5">
                  {title}
               </p>
               <div className="flex items-center gap-1.5 mt-3">
                  {trend && (
                     <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
                        <svg
                           className="w-3 h-3"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 15l7-7 7 7"
                           />
                        </svg>
                        {trend}
                     </span>
                  )}
                  {sub && (
                     <span className="text-xs text-neutral-dark">{sub}</span>
                  )}
               </div>
            </>
         )}
      </div>
   );
}

// ─── Rating Circle ────────────────────────────────────────────────────────────

function RatingCircle({ value }: { value: number }) {
   const pct = value / 5;
   const r = 22,
      circ = 2 * Math.PI * r;
   return (
      <div className="flex items-center justify-center relative w-14 h-14">
         <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 56 56"
         >
            <circle
               cx="28"
               cy="28"
               r={r}
               fill="none"
               stroke="rgb(var(--neutral-light-active))"
               strokeWidth="4"
            />
            <circle
               cx="28"
               cy="28"
               r={r}
               fill="none"
               stroke="#22c55e"
               strokeWidth="4"
               strokeDasharray={`${pct * circ} ${circ}`}
               strokeLinecap="round"
            />
         </svg>
         <span className="text-sm font-bold text-primary relative z-10">
            {value.toFixed(1)}
         </span>
      </div>
   );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
   return (
      <tr className="border-b border-neutral">
         {[10, 48, 20, 24, 12, 16, 24, 20, 16].map((w, i) => (
            <td key={i} className="py-3.5 px-4">
               <div
                  className="h-3 bg-neutral rounded-full animate-pulse"
                  style={{ width: `${w * 4}px` }}
               />
            </td>
         ))}
      </tr>
   );
}

// ─── Product Row ──────────────────────────────────────────────────────────────

function ProductRow({
   product,
   idx,
   checked,
   onCheck,
}: {
   product: Product;
   idx: number;
   checked: boolean;
   onCheck: () => void;
}) {
   const [status, setStatus] = useState<StatusType>(
      SAMPLE_STATUSES[idx % SAMPLE_STATUSES.length],
   );

   return (
      <tr className="border-b border-neutral hover:bg-neutral-light-hover transition-colors group">
         <td className="py-3.5 px-4 w-10">
            <input
               type="checkbox"
               checked={checked}
               onChange={onCheck}
               className="rounded border-neutral w-4 h-4 cursor-pointer accent-accent"
            />
         </td>
         <td className="py-3.5 px-4">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 rounded-xl bg-neutral shrink-0 overflow-hidden flex items-center justify-center">
                  {product.thumbnail ? (
                     <img
                        src={product.thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                     />
                  ) : (
                     <svg
                        className="w-4 h-4 text-neutral-dark"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={1.5}
                           d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                     </svg>
                  )}
               </div>
               <div className="min-w-0">
                  <p className="text-sm font-medium text-primary truncate max-w-45">
                     {product.name}
                  </p>
                  <p className="text-[11px] text-neutral-dark mt-0.5 flex items-center gap-1">
                     SKU: {product.slug.toUpperCase().slice(0, 14)}
                     <svg
                        className="w-2.5 h-2.5 opacity-40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                     </svg>
                  </p>
               </div>
            </div>
         </td>
         <td className="py-3.5 px-4">
            <span className="text-xs text-neutral-dark bg-neutral px-2 py-1 rounded-lg">
               Điện thoại
            </span>
         </td>
         <td className="py-3.5 px-4 text-sm font-semibold text-primary whitespace-nowrap">
            {fmt(product.priceOrigin)}
         </td>
         <td className="py-3.5 px-4 text-sm text-primary text-center font-medium">
            8
         </td>
         <td className="py-3.5 px-4 text-sm text-neutral-dark text-center">
            0.00
         </td>
         <td className="py-3.5 px-4 text-sm font-medium text-primary whitespace-nowrap">
            {fmt(product.priceOrigin * 8)}
         </td>
         <td className="py-3.5 px-4">
            <StatusDropdown value={status} onChange={setStatus} />
         </td>
         <td className="py-3.5 px-4">
            <div className="flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
               <button className="p-1.5 rounded-lg hover:bg-neutral-light-active text-neutral-dark hover:text-primary transition-colors">
                  <svg
                     className="w-3.5 h-3.5"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                     />
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                     />
                  </svg>
               </button>
               <button className="p-1.5 rounded-lg hover:bg-accent-light text-neutral-dark hover:text-accent transition-colors">
                  <svg
                     className="w-3.5 h-3.5"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                     />
                  </svg>
               </button>
               <button className="p-1.5 rounded-lg hover:bg-promotion-light text-neutral-dark hover:text-promotion transition-colors">
                  <svg
                     className="w-3.5 h-3.5"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                     />
                  </svg>
               </button>
            </div>
         </td>
      </tr>
   );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
   { key: "all", label: "Tất cả sản phẩm", count: 145 },
   { key: "featured", label: "Sản phẩm nổi bật" },
   { key: "promo", label: "Sản phẩm khuyến mãi" },
   { key: "out", label: "Hết hàng" },
];

const TH = ({ children }: { children: React.ReactNode }) => (
   <th className="py-3 px-4 text-xs font-semibold text-neutral-dark whitespace-nowrap cursor-pointer select-none hover:text-primary transition-colors">
      <span className="flex items-center gap-1">
         {children}
         <svg
            className="w-3 h-3 opacity-30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
         >
            <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
         </svg>
      </span>
   </th>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminProducts() {
   const [products, setProducts] = useState<Product[]>([]);
   const [pagination, setPagination] = useState<Pagination>({
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 1,
   });
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [search, setSearch] = useState("");
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(12);
   const [activeTab, setActiveTab] = useState("all");
   const [selected, setSelected] = useState<Set<string>>(new Set());

   const fetchProducts = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         const res = await getAllProduct({
            page,
            limit: pageSize,
            ...(search ? { search } : {}),
         });
         setProducts(res.data);
         setPagination(res.pagination);
      } catch (e) {
         setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
      } finally {
         setLoading(false);
      }
   }, [page, pageSize, search]);

   useEffect(() => {
      fetchProducts();
   }, [fetchProducts]);

   const allChecked = products.length > 0 && selected.size === products.length;
   const toggleAll = () =>
      setSelected(allChecked ? new Set() : new Set(products.map((p) => p.id)));
   const toggleOne = (id: string) =>
      setSelected((s) => {
         const n = new Set(s);
         n.has(id) ? n.delete(id) : n.add(id);
         return n;
      });

   const handlePageChange = (p: number) => {
      setPage(p);
      setSelected(new Set());
   };
   const handlePageSizeChange = (size: number) => {
      setPageSize(size);
      setPage(1);
      setSelected(new Set());
   };

   return (
      <div className="min-h-screen bg-neutral-light-active">
         <div className="mx-auto px-6 py-8 space-y-5">
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <StatCard
                  value="1,230"
                  title="Tổng sản phẩm trong hệ thống"
                  trend="7 ngày qua"
                  sub=""
                  sparkline
               />
               <StatCard
                  value="1,200"
                  title="Tổng sản phẩm đang Bán"
                  trend="189"
                  sub="với ngày qua"
               />
               <StatCard title="">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-3xl font-bold text-primary tracking-tight">
                           5,0/5.0
                        </p>
                        <p className="text-xs text-neutral-dark font-medium mt-0.5">
                           Điểm trung bình
                        </p>
                        <div className="flex items-center gap-0.5 mt-2">
                           {[...Array(5)].map((_, i) => (
                              <svg
                                 key={i}
                                 className="w-3.5 h-3.5 text-amber-400"
                                 fill="currentColor"
                                 viewBox="0 0 20 20"
                              >
                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                           ))}
                           <span className="text-xs text-green-600 font-medium ml-1.5">
                              ↑ Chất lượng tốt
                           </span>
                        </div>
                     </div>
                     <RatingCircle value={5.0} />
                  </div>
               </StatCard>
            </div>

            {/* ── Table Card ── */}
            <div className="bg-neutral-light border border-neutral rounded-2xl shadow-sm overflow-hidden">
               {/* Tabs + Controls */}
               <div className="flex items-end justify-between gap-4 flex-wrap px-5 pt-4 border-b border-neutral">
                  {/* Tabs */}
                  <div className="flex items-center">
                     {TABS.map((tab) => (
                        <button
                           key={tab.key}
                           onClick={() => {
                              setActiveTab(tab.key);
                              setPage(1);
                           }}
                           className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
                              activeTab === tab.key
                                 ? "text-primary border-accent"
                                 : "text-neutral-dark border-transparent hover:text-primary"
                           }`}
                        >
                           {tab.label}
                           {tab.count != null && (
                              <span
                                 className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                                    activeTab === tab.key
                                       ? "bg-accent text-white"
                                       : "bg-neutral text-neutral-dark"
                                 }`}
                              >
                                 {tab.count}
                              </span>
                           )}
                        </button>
                     ))}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 pb-3">
                     {/* Search */}
                     <div className="relative">
                        <svg
                           className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-dark"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                           />
                        </svg>
                        <input
                           type="text"
                           placeholder="Search"
                           value={search}
                           onChange={(e) => {
                              setSearch(e.target.value);
                              setPage(1);
                           }}
                           className="pl-8 pr-3 py-2 text-sm bg-neutral-light-active border border-neutral rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent w-44 placeholder:text-neutral-dark text-primary transition-all"
                        />
                     </div>
                     <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-primary border border-neutral rounded-xl hover:bg-neutral-light-active transition-colors font-medium">
                        <svg
                           className="w-3.5 h-3.5"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                           />
                        </svg>
                        Bộ lọc
                     </button>
                     <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-primary border border-neutral rounded-xl hover:bg-neutral-light-active transition-colors font-medium whitespace-nowrap">
                        <svg
                           className="w-3.5 h-3.5"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                           />
                        </svg>
                        Lọc theo ngày
                     </button>
                     <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-primary border border-neutral rounded-xl hover:bg-neutral-light-active transition-colors">
                        <svg
                           className="w-3.5 h-3.5"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                           />
                        </svg>
                     </button>
                     <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors font-medium shadow-sm">
                        <svg
                           className="w-3.5 h-3.5"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                           />
                        </svg>
                        Thêm
                     </button>
                  </div>
               </div>

               {/* Table */}
               <div className="overflow-x-auto">
                  {error ? (
                     <div className="flex flex-col items-center py-16 gap-2">
                        <p className="text-sm text-neutral-dark">{error}</p>
                        <button
                           onClick={fetchProducts}
                           className="text-xs text-accent hover:underline"
                        >
                           Thử lại
                        </button>
                     </div>
                  ) : (
                     <table className="w-full text-left">
                        <thead>
                           <tr className="border-b border-neutral bg-neutral-light-active/60">
                              <th className="py-3 px-4 w-10">
                                 <input
                                    type="checkbox"
                                    checked={allChecked}
                                    onChange={toggleAll}
                                    className="rounded border-neutral w-4 h-4 cursor-pointer accent-accent"
                                 />
                              </th>
                              <TH>Tên sản phẩm</TH>
                              <TH>Danh mục</TH>
                              <TH>Giá sản phẩm</TH>
                              <TH>Tồn Kho</TH>
                              <TH>Giảm giá</TH>
                              <TH>Tổng giá trị</TH>
                              <TH>Trạng thái</TH>
                              <th className="py-3 px-4 text-xs font-semibold text-neutral-dark">
                                 Hành động
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {loading ? (
                              [...Array(pageSize > 10 ? 10 : pageSize)].map(
                                 (_, i) => <SkeletonRow key={i} />,
                              )
                           ) : products.length === 0 ? (
                              <tr>
                                 <td
                                    colSpan={9}
                                    className="py-16 text-center text-sm text-neutral-dark"
                                 >
                                    Không có sản phẩm nào.
                                 </td>
                              </tr>
                           ) : (
                              products.map((p, i) => (
                                 <ProductRow
                                    key={p.id}
                                    product={p}
                                    idx={i}
                                    checked={selected.has(p.id)}
                                    onCheck={() => toggleOne(p.id)}
                                 />
                              ))
                           )}
                        </tbody>
                     </table>
                  )}
               </div>

               {/* Pagination */}
               {!loading && !error && pagination.totalPages > 0 && (
                  <div className="px-5 py-4 border-t border-neutral">
                     <AdminPagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        total={pagination.total}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        pageSizeOptions={[10, 20, 50]}
                        siblingCount={1}
                     />
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
