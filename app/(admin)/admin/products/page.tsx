"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
   Search,
   Filter,
   ChevronDown,
   Loader2,
   PackageSearch,
   Clock,
   AlertCircle,
   CheckCircle2,
   RefreshCw,
   ArrowUpRight,
   Flame,
   CircleDot,
   Smartphone,
   Cpu,
} from "lucide-react";
import AdminPagination from "@/components/admin/PaginationAdmin";

// ── Types ──────────────────────────────────────────────────────────────────
type OrderStatus =
   | "pending"
   | "confirmed"
   | "processing"
   | "shipping"
   | "delivered"
   | "cancelled"
   | "return_request";

interface PhoneItem {
   name: string;       // VD: iPhone 15 Pro Max
   brand: string;      // Apple / Samsung / Xiaomi...
   variant: string;    // 256GB / Titan Black
   qty: number;
   unitPrice: number;
   sku: string;
}

interface Order {
   id: string;
   code: string;
   customerName: string;
   customerPhone: string;
   status: OrderStatus;
   total: number;
   items: PhoneItem[];
   createdAt: string;
   note?: string;
   isUrgent?: boolean;
   shippingAddress: string;
}

// ── Mock data — điện thoại ─────────────────────────────────────────────────
const MOCK_ORDERS: Order[] = [
   {
      id: "1", code: "ORD-250301-001",
      customerName: "Nguyễn Văn An", customerPhone: "0901234567",
      status: "pending", total: 34990000,
      items: [{ name: "iPhone 15 Pro Max", brand: "Apple", variant: "256GB – Titan Tự Nhiên", qty: 1, unitPrice: 34990000, sku: "IP15PM-256-TT" }],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
      isUrgent: true, shippingAddress: "12 Lê Lợi, Q.1, TP.HCM",
      note: "Khách cần giao trước 17h, gói hộp quà",
   },
   {
      id: "2", code: "ORD-250301-002",
      customerName: "Trần Thị Bích", customerPhone: "0912345678",
      status: "confirmed", total: 22990000,
      items: [
         { name: "Samsung Galaxy S24 Ultra", brand: "Samsung", variant: "512GB – Titanium Black", qty: 1, unitPrice: 22990000, sku: "SS-S24U-512-TK" },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      shippingAddress: "88 Trần Hưng Đạo, Q.5, TP.HCM",
   },
   {
      id: "3", code: "ORD-250301-003",
      customerName: "Lê Hoàng Nam", customerPhone: "0923456789",
      status: "processing", total: 46480000,
      items: [
         { name: "iPhone 15 Pro", brand: "Apple", variant: "128GB – Titan Đen", qty: 1, unitPrice: 28990000, sku: "IP15P-128-TD" },
         { name: "Samsung Galaxy Z Fold 5", brand: "Samsung", variant: "256GB – Kem", qty: 1, unitPrice: 17490000, sku: "SS-ZF5-256-CM" },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      shippingAddress: "45 Nguyễn Huệ, Q.1, TP.HCM",
      note: "Kiểm tra máy trước khi đóng gói",
   },
   {
      id: "4", code: "ORD-250301-004",
      customerName: "Phạm Minh Tuấn", customerPhone: "0934567890",
      status: "pending", total: 8990000,
      items: [{ name: "Xiaomi 14", brand: "Xiaomi", variant: "256GB – Trắng", qty: 1, unitPrice: 8990000, sku: "XM14-256-TR" }],
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      shippingAddress: "99 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM",
   },
   {
      id: "5", code: "ORD-250228-005",
      customerName: "Võ Thị Lan", customerPhone: "0945678901",
      status: "return_request", total: 13490000,
      items: [{ name: "Google Pixel 8 Pro", brand: "Google", variant: "128GB – Porcelain", qty: 1, unitPrice: 13490000, sku: "GP8P-128-PO" }],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
      isUrgent: true, shippingAddress: "30 Võ Văn Tần, Q.3, TP.HCM",
      note: "KH phản ánh camera lấy nét kém, yêu cầu đổi máy mới",
   },
   {
      id: "6", code: "ORD-250301-006",
      customerName: "Đặng Quốc Bảo", customerPhone: "0956789012",
      status: "confirmed", total: 17980000,
      items: [
         { name: "OPPO Find X7", brand: "OPPO", variant: "256GB – Đen", qty: 1, unitPrice: 11990000, sku: "OP-FX7-256-D" },
         { name: "Vivo X100 Pro", brand: "Vivo", variant: "256GB – Đen", qty: 1, unitPrice: 5990000, sku: "VV-X100P-256-D" },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
      shippingAddress: "67 Lý Tự Trọng, Q.1, TP.HCM",
   },
   {
      id: "7", code: "ORD-250301-007",
      customerName: "Hoàng Thị Mai", customerPhone: "0967890123",
      status: "processing", total: 29990000,
      items: [{ name: "Samsung Galaxy S24+", brand: "Samsung", variant: "256GB – Cobalt Violet", qty: 1, unitPrice: 29990000, sku: "SS-S24P-256-CV" }],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 31).toISOString(),
      isUrgent: true, shippingAddress: "15 Pasteur, Q.1, TP.HCM",
      note: "Giao gấp – quà sinh nhật, cần trước 10h sáng mai",
   },
   {
      id: "8", code: "ORD-250228-008",
      customerName: "Bùi Văn Khánh", customerPhone: "0978901234",
      status: "return_request", total: 6490000,
      items: [{ name: "Realme GT 5 Pro", brand: "Realme", variant: "128GB – Xanh", qty: 1, unitPrice: 6490000, sku: "RM-GT5P-128-X" }],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 73).toISOString(),
      isUrgent: true, shippingAddress: "200 Cống Quỳnh, Q.1, TP.HCM",
      note: "Máy tự khởi động lại liên tục",
   },
   {
      id: "9", code: "ORD-250301-009",
      customerName: "Ngô Thị Thu", customerPhone: "0989012345",
      status: "pending", total: 19990000,
      items: [{ name: "iPhone 14", brand: "Apple", variant: "128GB – Đỏ", qty: 1, unitPrice: 19990000, sku: "IP14-128-DO" }],
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      shippingAddress: "55 Hai Bà Trưng, Q.1, TP.HCM",
   },
   {
      id: "10", code: "ORD-250301-010",
      customerName: "Trịnh Công Sơn", customerPhone: "0990123456",
      status: "confirmed", total: 11990000,
      items: [
         { name: "Xiaomi 14 Ultra", brand: "Xiaomi", variant: "512GB – Titan Bạc", qty: 1, unitPrice: 11990000, sku: "XM14U-512-TB" },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      shippingAddress: "77 Bùi Thị Xuân, Q.1, TP.HCM",
   },
];

// ── Config ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
   OrderStatus,
   { label: string; color: string; bg: string; dot: string; actionLabel?: string; actionColor?: string }
> = {
   pending:        { label: "Chờ xác nhận",    color: "text-amber-600",   bg: "bg-amber-50",   dot: "bg-amber-400",   actionLabel: "Xác nhận",      actionColor: "bg-emerald-500 hover:bg-emerald-600 text-white" },
   confirmed:      { label: "Đã xác nhận",     color: "text-blue-600",    bg: "bg-blue-50",    dot: "bg-blue-400",    actionLabel: "Bắt đầu xử lý", actionColor: "bg-blue-500 hover:bg-blue-600 text-white" },
   processing:     { label: "Đang xử lý",      color: "text-violet-600",  bg: "bg-violet-50",  dot: "bg-violet-400",  actionLabel: "Giao vận",      actionColor: "bg-violet-500 hover:bg-violet-600 text-white" },
   shipping:       { label: "Đang giao",       color: "text-cyan-600",    bg: "bg-cyan-50",    dot: "bg-cyan-400" },
   delivered:      { label: "Đã giao",         color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-400" },
   cancelled:      { label: "Đã huỷ",          color: "text-neutral-400", bg: "bg-neutral-100",dot: "bg-neutral-300" },
   return_request: { label: "Yêu cầu hoàn",   color: "text-red-500",     bg: "bg-red-50",     dot: "bg-red-400",     actionLabel: "Xử lý hoàn",   actionColor: "bg-red-500 hover:bg-red-600 text-white" },
};

const NEED_ACTION: OrderStatus[] = ["pending", "confirmed", "processing", "return_request"];

const BRAND_COLOR: Record<string, string> = {
   Apple:   "bg-slate-100 text-slate-600",
   Samsung: "bg-blue-50 text-blue-600",
   Xiaomi:  "bg-orange-50 text-orange-500",
   Google:  "bg-green-50 text-green-600",
   OPPO:    "bg-teal-50 text-teal-600",
   Vivo:    "bg-indigo-50 text-indigo-600",
   Realme:  "bg-yellow-50 text-yellow-600",
};

const TAB_FILTERS: { label: string; value: OrderStatus | "all" }[] = [
   { label: "Tất cả", value: "all" },
   { label: "Chờ xác nhận", value: "pending" },
   { label: "Đã xác nhận", value: "confirmed" },
   { label: "Đang xử lý", value: "processing" },
   { label: "Yêu cầu hoàn", value: "return_request" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function formatCurrency(n: number) {
   return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

function timeAgo(iso: string) {
   const diff = Date.now() - new Date(iso).getTime();
   const m = Math.floor(diff / 60000);
   if (m < 60) return `${m} phút trước`;
   const h = Math.floor(m / 60);
   if (h < 24) return `${h} giờ trước`;
   return `${Math.floor(h / 24)} ngày trước`;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function PhoneOrderDashboard() {
   const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
   const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
   const [searchInput, setSearchInput] = useState("");
   const [search, setSearch] = useState("");
   const [updatingId, setUpdatingId] = useState<string | null>(null);
   const [openStatusId, setOpenStatusId] = useState<string | null>(null);
   const [page, setPage] = useState(1);
   const [pageSize] = useState(10);

   // ── Filter ──
   const filtered = orders.filter((o) => {
      const matchStatus =
         filterStatus === "all"
            ? NEED_ACTION.includes(o.status)
            : o.status === filterStatus;
      const q = search.toLowerCase();
      const matchSearch =
         !search ||
         o.code.toLowerCase().includes(q) ||
         o.customerName.toLowerCase().includes(q) ||
         o.customerPhone.includes(q) ||
         o.items.some((i) => i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q));
      return matchStatus && matchSearch;
   });

   const urgentCount = orders.filter((o) => o.isUrgent && NEED_ACTION.includes(o.status)).length;
   const total = filtered.length;
   const totalPages = Math.ceil(total / pageSize) || 1;
   const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

   const tabCount = (val: OrderStatus | "all") =>
      val === "all"
         ? orders.filter((o) => NEED_ACTION.includes(o.status)).length
         : orders.filter((o) => o.status === val).length;

   const totalRevenuePending = orders
      .filter((o) => NEED_ACTION.includes(o.status))
      .reduce((s, o) => s + o.total, 0);

   // ── Advance status ──
   const handleAdvance = useCallback((orderId: string, current: OrderStatus) => {
      const next: Partial<Record<OrderStatus, OrderStatus>> = {
         pending: "confirmed",
         confirmed: "processing",
         processing: "shipping",
         return_request: "cancelled",
      };
      if (!next[current]) return;
      setUpdatingId(orderId);
      setTimeout(() => {
         setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: next[current]!, isUrgent: false } : o));
         setUpdatingId(null);
      }, 600);
   }, []);

   const handleChangeStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
      setUpdatingId(orderId);
      setOpenStatusId(null);
      setTimeout(() => {
         setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus, isUrgent: false } : o));
         setUpdatingId(null);
      }, 500);
   }, []);

   const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
      setPage(1);
   };

   // ── Stats ──
   const stats = [
      { icon: <Clock size={15} />,        label: "Chờ xác nhận",  value: orders.filter((o) => o.status === "pending").length,        color: "bg-amber-50 text-amber-500",   border: "border-amber-200" },
      { icon: <CircleDot size={15} />,    label: "Đã xác nhận",   value: orders.filter((o) => o.status === "confirmed").length,      color: "bg-blue-50 text-blue-500",     border: "border-blue-200" },
      { icon: <Cpu size={15} />,          label: "Đang xử lý",    value: orders.filter((o) => o.status === "processing").length,     color: "bg-violet-50 text-violet-500", border: "border-violet-200" },
      { icon: <AlertCircle size={15} />,  label: "Yêu cầu hoàn",  value: orders.filter((o) => o.status === "return_request").length, color: "bg-red-50 text-red-500",       border: "border-red-200" },
   ];

   return (
      <div className="min-h-screen bg-neutral-light font-inters">

         {/* ── Header ── */}
         <div className="px-6 pt-5 pb-4 flex items-start justify-between">
            <div>
               <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-primary" />
                  <h1 className="text-[16px] font-bold text-primary">Đơn hàng điện thoại cần xử lý</h1>
                  {urgentCount > 0 && (
                     <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-500">
                        <Flame size={10} />
                        {urgentCount} đơn gấp
                     </span>
                  )}
               </div>
               <p className="text-[12px] text-neutral-dark mt-0.5">
                  Giá trị đang chờ xử lý:{" "}
                  <span className="font-semibold text-primary">{formatCurrency(totalRevenuePending)}</span>
               </p>
            </div>
            <button
               onClick={() => setOrders([...MOCK_ORDERS])}
               className="flex items-center gap-1.5 text-[13px] text-neutral-dark hover:text-primary border border-neutral rounded-xl px-3 py-2 hover:bg-neutral-light-active transition-colors cursor-pointer"
            >
               <RefreshCw size={13} />
               Làm mới
            </button>
         </div>

         {/* ── Stats ── */}
         <div className="px-6 grid grid-cols-4 gap-3 mb-5">
            {stats.map((s) => (
               <div key={s.label} className={`bg-neutral-light border ${s.border} rounded-2xl px-4 py-3 flex items-center gap-3`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                     {s.icon}
                  </div>
                  <div>
                     <p className="text-[11px] text-neutral-dark">{s.label}</p>
                     <p className="text-[15px] font-bold text-primary">{s.value}</p>
                  </div>
               </div>
            ))}
         </div>

         {/* ── Toolbar ── */}
         <div className="px-6 flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-1 bg-neutral-light-hover/60 p-1 rounded-xl border border-neutral">
               {TAB_FILTERS.map((tab) => {
                  const isSelected = filterStatus === tab.value;
                  return (
                     <button
                        key={tab.value}
                        onClick={() => { setFilterStatus(tab.value); setPage(1); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer whitespace-nowrap transition-all ${
                           isSelected
                              ? "bg-neutral-light text-primary font-semibold shadow-sm border border-neutral"
                              : "text-neutral-dark hover:text-primary hover:bg-neutral-light/60"
                        }`}
                     >
                        {tab.label}
                        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md min-w-5 text-center ${
                           isSelected
                              ? tab.value === "pending"       ? "bg-amber-100 text-amber-600"
                              : tab.value === "confirmed"     ? "bg-blue-100 text-blue-600"
                              : tab.value === "processing"    ? "bg-violet-100 text-violet-600"
                              : tab.value === "return_request"? "bg-red-100 text-red-500"
                              : "bg-blue-100 text-blue-500"
                              : "bg-neutral text-neutral-dark"
                        }`}>
                           {tabCount(tab.value)}
                        </span>
                     </button>
                  );
               })}
            </div>

            <div className="flex items-center gap-2">
               <form onSubmit={handleSearch} className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
                  <input
                     type="text"
                     value={searchInput}
                     onChange={(e) => setSearchInput(e.target.value)}
                     placeholder="Mã đơn, tên KH, model máy..."
                     className="pl-8 pr-3 py-1.5 text-[13px] bg-neutral-light border border-neutral rounded-lg text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/40 w-56 transition-all"
                  />
               </form>
               <button className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg bg-neutral-light text-[13px] text-primary-light hover:bg-neutral-light-active transition-colors cursor-pointer">
                  <Filter size={13} />
                  Bộ lọc
               </button>
            </div>
         </div>

         {/* ── Table ── */}
         <div className="mx-6 border border-neutral rounded-xl overflow-hidden bg-neutral-light">
            <table className="w-full">
               <thead>
                  <tr className="border-b border-neutral bg-neutral-light-hover">
                     {["Mã đơn", "Khách hàng", "Sản phẩm", "Tổng tiền", "Trạng thái", "Thời gian", "Hành động"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-dark tracking-wide uppercase whitespace-nowrap">
                           {h}
                        </th>
                     ))}
                  </tr>
               </thead>

               <tbody>
                  {paginated.length === 0 ? (
                     <tr>
                        <td colSpan={7} className="py-20 text-center">
                           <div className="flex flex-col items-center gap-2 text-neutral-dark">
                              <PackageSearch size={32} strokeWidth={1.2} />
                              <p className="text-[13px]">Không có đơn hàng nào cần xử lý</p>
                           </div>
                        </td>
                     </tr>
                  ) : (
                     paginated.map((order) => {
                        const cfg = STATUS_CONFIG[order.status];
                        const isUpdating = updatingId === order.id;
                        const isOpen = openStatusId === order.id;
                        const firstItem = order.items[0];
                        const brandColor = BRAND_COLOR[firstItem.brand] ?? "bg-neutral-100 text-neutral-600";

                        return (
                           <tr
                              key={order.id}
                              className={`border-b border-neutral last:border-b-0 transition-colors ${
                                 order.isUrgent
                                    ? "bg-red-50/30 hover:bg-red-50/50"
                                    : "hover:bg-neutral-light-active/40"
                              }`}
                           >
                              {/* Mã đơn */}
                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-1.5">
                                    {order.isUrgent && <Flame size={12} className="text-red-400 shrink-0" />}
                                    <span className="text-[13px] font-semibold text-primary font-mono">{order.code}</span>
                                 </div>
                                 {order.note && (
                                    <p className="text-[11px] text-orange-500 mt-0.5 line-clamp-1 max-w-[150px]">
                                       📝 {order.note}
                                    </p>
                                 )}
                              </td>

                              {/* Khách hàng */}
                              <td className="px-4 py-3">
                                 <p className="text-[13px] font-medium text-primary whitespace-nowrap">{order.customerName}</p>
                                 <p className="text-[11px] text-neutral-dark">{order.customerPhone}</p>
                                 <p className="text-[11px] text-neutral-dark line-clamp-1 max-w-[140px]">{order.shippingAddress}</p>
                              </td>

                              {/* Sản phẩm */}
                              <td className="px-4 py-3">
                                 <div className="flex items-start gap-2">
                                    {/* Brand badge */}
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 mt-0.5 ${brandColor}`}>
                                       {firstItem.brand}
                                    </span>
                                    <div>
                                       <p className="text-[13px] font-medium text-primary line-clamp-1 max-w-[160px]">
                                          {firstItem.name}
                                       </p>
                                       <p className="text-[11px] text-neutral-dark">{firstItem.variant}</p>
                                       {order.items.length > 1 && (
                                          <p className="text-[11px] text-neutral-dark">+{order.items.length - 1} sản phẩm khác</p>
                                       )}
                                    </div>
                                 </div>
                              </td>

                              {/* Tổng tiền */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                 <span className="text-[13px] font-semibold text-primary tabular-nums">
                                    {formatCurrency(order.total)}
                                 </span>
                                 <p className="text-[11px] text-neutral-dark">
                                    {order.items.reduce((s, i) => s + i.qty, 0)} máy
                                 </p>
                              </td>

                              {/* Trạng thái */}
                              <td className="px-4 py-3">
                                 <div className="relative inline-block">
                                    <button
                                       disabled={isUpdating}
                                       onClick={() => setOpenStatusId(isOpen ? null : order.id)}
                                       className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium cursor-pointer transition-colors disabled:opacity-50 whitespace-nowrap ${cfg.color} ${cfg.bg}`}
                                    >
                                       <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                                       {isUpdating ? <Loader2 size={11} className="animate-spin" /> : cfg.label}
                                       <ChevronDown size={10} />
                                    </button>

                                    {isOpen && (
                                       <div className="absolute z-20 left-0 top-full mt-1 w-44 bg-neutral-light border border-neutral rounded-xl shadow-lg overflow-hidden">
                                          {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => {
                                             const c = STATUS_CONFIG[s];
                                             const isCurrent = s === order.status;
                                             return (
                                                <button
                                                   key={s}
                                                   disabled={isCurrent}
                                                   onClick={() => handleChangeStatus(order.id, s)}
                                                   className="w-full text-left px-3 py-2 text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default hover:bg-neutral-light-active"
                                                >
                                                   <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                                                   <span className={c.color}>{c.label}</span>
                                                   {isCurrent && <span className="ml-auto text-[10px]">✓</span>}
                                                </button>
                                             );
                                          })}
                                       </div>
                                    )}
                                 </div>
                              </td>

                              {/* Thời gian */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                 <span className={`text-[12px] ${order.isUrgent ? "text-red-400 font-medium" : "text-neutral-dark"}`}>
                                    {timeAgo(order.createdAt)}
                                 </span>
                              </td>

                              {/* Hành động */}
                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-2">
                                    {cfg.actionLabel && (
                                       <button
                                          disabled={isUpdating}
                                          onClick={() => handleAdvance(order.id, order.status)}
                                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap ${cfg.actionColor}`}
                                       >
                                          {isUpdating
                                             ? <Loader2 size={11} className="animate-spin" />
                                             : <CheckCircle2 size={12} />
                                          }
                                          {cfg.actionLabel}
                                       </button>
                                    )}
                                    <Link
                                       href={`/admin/orders/${order.id}`}
                                       className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
                                       title="Xem chi tiết"
                                    >
                                       <ArrowUpRight size={14} />
                                    </Link>
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
               onPageSizeChange={() => {}}
               pageSizeOptions={[10, 20, 50]}
               siblingCount={1}
            />
         </div>

         {openStatusId && (
            <div className="fixed inset-0 z-10" onClick={() => setOpenStatusId(null)} />
         )}
      </div>
   );
}