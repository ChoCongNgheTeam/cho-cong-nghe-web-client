"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
   Search,
   Filter,
   CalendarDays,
   Download,
   Eye,
   Ban,
   Package,
   RefreshCw,
} from "lucide-react";
import AdminPagination from "@/components/admin/PaginationAdmin";
import type { Order, OrderStatus } from "./order.types";
import { cancelOrder, getAllOrders } from "./_libs";
import { STATUS_TABS } from "./const";
import {
   OrderStatusCell,
   PaymentBadge,
   StatsCard,
   TableSkeleton,
} from "./components";
import { formatDate, formatVND } from "@/helpers";
import Link from "next/link";
import { Popzy } from "@/components/Modal";

export default function OrdersPage() {
   const [allOrders, setAllOrders] = useState<Order[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(10);
   const [activeTab, setActiveTab] = useState("ALL");
   const [search, setSearch] = useState("");
   const [searchInput, setSearchInput] = useState("");

   const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
   const [cancelling, setCancelling] = useState(false);

   const fetchOrders = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         const res = await getAllOrders();
         setAllOrders(res.data);
      } catch (e: any) {
         setError(e?.message ?? "Không thể tải danh sách đơn hàng");
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchOrders();
   }, [fetchOrders]);

   const filteredOrders = useMemo(() => {
      return allOrders.filter((o) => {
         const matchTab = activeTab === "ALL" || o.orderStatus === activeTab;
         const q = search.toLowerCase();
         const matchSearch =
            !search ||
            o.id.toLowerCase().includes(q) ||
            o.orderCode.toLowerCase().includes(q) ||
            o.user.fullName.toLowerCase().includes(q) ||
            o.user.phone.includes(q) ||
            o.shippingContactName.toLowerCase().includes(q);
         return matchTab && matchSearch;
      });
   }, [allOrders, activeTab, search]);

   const totalFiltered = filteredOrders.length;
   const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
   const paginatedOrders = useMemo(() => {
      const start = (page - 1) * pageSize;
      return filteredOrders.slice(start, start + pageSize);
   }, [filteredOrders, page, pageSize]);

   const statusCounts = useMemo<Record<string, number>>(
      () => ({
         ALL: allOrders.length,
         PENDING: allOrders.filter((o) => o.orderStatus === "PENDING").length,
         PROCESSING: allOrders.filter((o) => o.orderStatus === "PROCESSING")
            .length,
         SHIPPED: allOrders.filter((o) => o.orderStatus === "SHIPPED").length,
         DELIVERED: allOrders.filter((o) => o.orderStatus === "DELIVERED")
            .length,
         CANCELLED: allOrders.filter((o) => o.orderStatus === "CANCELLED")
            .length,
      }),
      [allOrders],
   );

   const todayRevenue = allOrders.reduce(
      (s, o) => s + Number(o.totalAmount),
      0,
   );

   const handleStatusChange = useCallback(
      (orderId: string, newStatus: OrderStatus) => {
         setAllOrders((prev) =>
            prev.map((o) =>
               o.id === orderId ? { ...o, orderStatus: newStatus } : o,
            ),
         );
      },
      [],
   );

   const handleCancelConfirm = useCallback(async () => {
      if (!cancelTargetId) return;
      setCancelling(true);
      try {
         await cancelOrder(cancelTargetId);
         handleStatusChange(cancelTargetId, "CANCELLED");
         setCancelTargetId(null);
      } catch (e: any) {
         setError(e?.message ?? "Không thể hủy đơn hàng. Vui lòng thử lại.");
      } finally {
         setCancelling(false);
      }
   }, [cancelTargetId, handleStatusChange]);

   return (
      <div className="space-y-5 p-5 bg-neutral-light h-full">
         {/* Stats */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
               label="Doanh thu hôm nay"
               value={new Intl.NumberFormat("vi-VN").format(todayRevenue)}
               sub="Tổng giá trị các đơn đã thanh toán"
            />
            <StatsCard
               label="Đơn hàng mới"
               value={String(statusCounts.PENDING)}
               sub="Đơn đang chờ bạn xác nhận"
            />
            <StatsCard
               label="Đơn hàng thành công"
               value={String(statusCounts.DELIVERED)}
               sub="Đã hoàn tất giao đến khách hàng"
            />
            <StatsCard
               label="Đang giao hàng"
               value={String(statusCounts.SHIPPED)}
               sub="Sản phẩm đang trên đường vận chuyển"
            />
         </div>

         <div className="bg-neutral-light border border-neutral rounded-xl">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral gap-4 flex-wrap">
               <div className="flex items-center gap-1 flex-wrap">
                  {STATUS_TABS.map((tab) => (
                     <button
                        key={tab.value}
                        onClick={() => {
                           setActiveTab(tab.value);
                           setPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                           activeTab === tab.value
                              ? "bg-accent text-primary shadow-sm"
                              : "text-primary hover:bg-neutral-light-active hover:text-primary"
                        }`}
                     >
                        {tab.label}
                        <span
                           className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                              activeTab === tab.value
                                 ? "bg-white/20 text-white"
                                 : "bg-neutral-light-active text-primary"
                           }`}
                        >
                           {statusCounts[tab.value] ?? 0}
                        </span>
                     </button>
                  ))}
               </div>

               <div className="flex items-center gap-2">
                  <form
                     onSubmit={(e) => {
                        e.preventDefault();
                        setSearch(searchInput);
                        setPage(1);
                     }}
                     className="relative"
                  >
                     <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search..."
                        className="w-52 pl-9 pr-3 py-2 text-[12px] border border-neutral rounded-lg bg-neutral-light-active text-primary placeholder:text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                     />
                     <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                     />
                  </form>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral text-[12px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer">
                     <Filter size={14} /> Bộ lọc
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral text-[12px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer">
                     <CalendarDays size={14} /> Lọc theo ngày
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral text-[12px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer">
                     <Download size={14} /> Chia sẻ
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent-hover transition-all shadow-sm cursor-pointer">
                     <Package size={14} /> Thêm đơn hàng
                  </button>
               </div>
            </div>

            {/* Error */}
            {error && (
               <div className="flex items-center justify-between px-5 py-3 bg-promotion-light border-b border-promotion-light-active">
                  <span className="text-[12px] text-promotion">{error}</span>
                  <button
                     onClick={fetchOrders}
                     className="flex items-center gap-1 text-[12px] text-promotion hover:underline cursor-pointer"
                  >
                     <RefreshCw size={12} /> Thử lại
                  </button>
               </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="bg-neutral-light-active border-b border-neutral">
                        {[
                           "STT",
                           "Mã đơn",
                           "Khách hàng",
                           "Địa chỉ giao hàng",
                           "Tổng tiền",
                           "Phương thức",
                           "Trạng thái đơn",
                           "Thanh toán",
                           "Ngày đặt",
                           "Hành động",
                        ].map((col, i) => (
                           <th
                              key={i}
                              className="px-4 py-3 text-left text-[12px] font-semibold text-primary uppercase tracking-wider whitespace-nowrap"
                           >
                              {col}
                           </th>
                        ))}
                     </tr>
                  </thead>
                  <tbody>
                     {loading ? (
                        <TableSkeleton />
                     ) : paginatedOrders.length === 0 ? (
                        <tr>
                           <td colSpan={10} className="px-4 py-16 text-center">
                              <div className="flex flex-col items-center gap-3 text-primary">
                                 <Package size={36} className="opacity-40" />
                                 <span className="text-sm">
                                    Không có đơn hàng nào
                                 </span>
                              </div>
                           </td>
                        </tr>
                     ) : (
                        paginatedOrders.map((order, idx) => {
                           const rowNum = (page - 1) * pageSize + idx + 1;
                           const shortId = `#${order.orderCode}`;
                           const canCancel =
                              order.orderStatus === "PENDING" ||
                              order.orderStatus === "PROCESSING";
                           return (
                              <tr
                                 key={order.id}
                                 className="border-b border-neutral hover:bg-neutral-light-active/60 transition-colors duration-100 group"
                              >
                                 <td className="px-4 py-3.5">
                                    <span className="text-[12px] text-primary">
                                       {rowNum}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3.5">
                                    <span className="text-[12px] font-semibold text-accent">
                                       {shortId}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3.5">
                                    <div className="flex flex-col gap-0.5">
                                       <span className="text-[12px] font-medium text-primary">
                                          {order.user.fullName}
                                       </span>
                                       <span className="text-[12px] text-primary">
                                          {order.user.phone}
                                       </span>
                                    </div>
                                 </td>
                                 <td className="px-4 py-3.5">
                                    <div className="flex flex-col gap-0.5 max-w-47.5">
                                       <span className="text-[12px] text-primary line-clamp-1">
                                          {order.shippingContactName}
                                       </span>
                                       <span className="text-[12px] text-primary line-clamp-1">
                                          {order.shippingDetail} ·{" "}
                                          {order.shippingPhone}
                                       </span>
                                    </div>
                                 </td>
                                 <td className="px-4 py-3.5">
                                    <span className="text-[12px] font-semibold text-primary">
                                       {formatVND(order.totalAmount)}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3.5">
                                    <span className="text-[12px] text-primary">
                                       {order.paymentMethod.name}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3.5">
                                    <OrderStatusCell
                                       orderId={order.id}
                                       status={order.orderStatus}
                                       onStatusChange={handleStatusChange}
                                    />
                                 </td>
                                 <td className="px-4 py-3.5">
                                    <PaymentBadge
                                       status={order.paymentStatus}
                                    />
                                 </td>
                                 <td className="px-4 py-3.5">
                                    <span className="text-[12px] text-primary">
                                       {formatDate(order.orderDate)}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-1">
                                       <Link
                                          href={`/admin/orders/${order.id}`}
                                          title="Xem"
                                          className="w-7 h-7 flex items-center justify-center rounded-lg text-primary hover:bg-accent-light hover:text-accent cursor-pointer transition-all"
                                       >
                                          <Eye size={14} />
                                       </Link>
                                       <button
                                          title={
                                             canCancel
                                                ? "Hủy đơn"
                                                : "Không thể hủy"
                                          }
                                          onClick={() =>
                                             canCancel &&
                                             setCancelTargetId(order.id)
                                          }
                                          disabled={!canCancel}
                                          className="w-7 h-7 flex items-center justify-center rounded-lg text-primary hover:bg-promotion-light hover:text-promotion cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                       >
                                          <Ban size={14} />
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

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-neutral">
               <AdminPagination
                  currentPage={page}
                  totalPages={totalPages}
                  total={totalFiltered}
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
         </div>

         {/* Cancel Confirm Modal */}
         <Popzy
            isOpen={!!cancelTargetId}
            onClose={() => !cancelling && setCancelTargetId(null)}
            closeMethods={cancelling ? [] : ["button", "overlay", "escape"]}
            footer
            content={
               <div className="flex flex-col gap-3 pt-1">
                  <div className="w-11 h-11 rounded-full bg-promotion-light flex items-center justify-center">
                     <Ban size={20} className="text-promotion" />
                  </div>
                  <div>
                     <h3 className="text-[15px] font-bold text-primary mb-1">
                        Hủy đơn hàng?
                     </h3>
                     <p className="text-[13px] text-neutral-dark leading-relaxed">
                        Đơn hàng sẽ bị hủy và không thể khôi phục. Bạn có chắc
                        chắn muốn tiếp tục không?
                     </p>
                  </div>
               </div>
            }
            footerButtons={[
               {
                  title: "Không, giữ lại",
                  className:
                     "px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer",
                  onClick: () => setCancelTargetId(null),
               },
               {
                  title: cancelling ? "Đang hủy..." : "Xác nhận hủy",
                  className:
                     "px-4 py-2 rounded-lg bg-promotion text-white text-[13px] font-medium hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                  onClick: handleCancelConfirm,
               },
            ]}
         />
      </div>
   );
}
