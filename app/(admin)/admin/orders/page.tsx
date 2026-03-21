"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { Search, Filter, CalendarDays, Eye, Package, RefreshCw, Plus, X, ChevronDown } from "lucide-react";
import AdminPagination from "@/components/admin/PaginationAdmin";
import type { Order, OrderStatus, PaymentStatus } from "./order.types";
import { cancelOrder, getAllOrders } from "./_libs/orders";
import { STATUS_TABS } from "./const";
import { OrderStatusCell, PaymentStatusCell, PaymentBadge, TableSkeleton } from "./components";
import { formatDate, formatVND } from "@/helpers";
import Link from "next/link";
import { Popzy } from "@/components/Modal";
import { Ban, ShoppingCart, Clock, CheckCircle, Truck } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";

// ─── Types ───────────────────────────────────────────────────────────────────
interface OrderMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}

const DEFAULT_META: OrderMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  statusCounts: { ALL: 0, PENDING: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 },
};

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

export default function OrdersPage() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // ─── Data state ──────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<OrderMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Query params ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Bộ lọc thanh toán
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "ALL">("ALL");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Lọc theo ngày
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);

  // ─── Cancel modal ─────────────────────────────────────────────────────────────
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // ─── Close dropdowns khi click ngoài ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilterDropdown(false);
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDatePicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Fetch ────────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllOrders({
        page,
        limit: pageSize,
        status: activeTab === "ALL" ? undefined : activeTab,
        search: search || undefined,
        paymentStatus: paymentFilter === "ALL" ? undefined : paymentFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setOrders(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeTab, search, paymentFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refetch khi navigate về list từ detail
  useEffect(() => {
    const wasOnDetail = prevPathname.current !== pathname && prevPathname.current.startsWith("/admin/orders/");
    prevPathname.current = pathname;
    if (wasOnDetail) fetchOrders();
  }, [pathname, fetchOrders]);

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const resetPage = () => setPage(1);
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    resetPage();
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    resetPage();
  };

  const handlePaymentFilterChange = (val: PaymentStatus | "ALL") => {
    setPaymentFilter(val);
    setShowFilterDropdown(false);
    resetPage();
  };

  const handleApplyDate = () => {
    setShowDatePicker(false);
    resetPage();
  };
  const handleClearDate = () => {
    setDateFrom("");
    setDateTo("");
    setShowDatePicker(false);
    resetPage();
  };

  const hasPaymentFilter = paymentFilter !== "ALL";
  const hasDateFilter = !!dateFrom || !!dateTo;

  const handleStatusChange = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o)));
  }, []);

  // ✅ Fix type: dùng PaymentStatus thay vì string
  const handlePaymentStatusChange = useCallback((orderId: string, newPaymentStatus: PaymentStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o)));
  }, []);

  const handleCancelRequest = useCallback((orderId: string) => {
    setCancelTargetId(orderId);
  }, []);

  const handleCancelConfirm = useCallback(async () => {
    if (!cancelTargetId) return;
    setCancelling(true);
    try {
      await cancelOrder(cancelTargetId);
      handleStatusChange(cancelTargetId, "CANCELLED");
      setCancelTargetId(null);
      fetchOrders();
    } catch (e: any) {
      setError(e?.message ?? "Không thể hủy đơn hàng. Vui lòng thử lại.");
    } finally {
      setCancelling(false);
    }
  }, [cancelTargetId, handleStatusChange, fetchOrders]);

  return (
    <div className="space-y-5 p-5 bg-neutral-light h-full">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Tổng đơn hàng" value={meta.statusCounts.ALL ?? 0} sub="Tất cả đơn trong hệ thống" icon={<ShoppingCart size={18} />} valueClassName="text-accent" />
        <StatsCard
          label="Đơn hàng mới"
          value={meta.statusCounts.PENDING ?? 0}
          sub="Đơn đang chờ bạn xác nhận"
          icon={<Clock size={18} />}
          valueClassName="text-yellow-600"
          iconClassName="text-yellow-600"
        />
        <StatsCard
          label="Đơn hàng thành công"
          value={meta.statusCounts.DELIVERED ?? 0}
          sub="Đã hoàn tất giao đến khách hàng"
          icon={<CheckCircle size={18} />}
          valueClassName="text-emerald-600"
          iconClassName="text-emerald-600"
        />
        <StatsCard
          label="Đang giao hàng"
          value={meta.statusCounts.SHIPPED ?? 0}
          sub="Sản phẩm đang trên đường vận chuyển"
          icon={<Truck size={18} />}
          valueClassName="text-blue-600"
          iconClassName="text-blue-600"
        />
      </div>

      <div className="bg-neutral-light border border-neutral rounded-xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral gap-4 flex-wrap">
          {/* Status tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.value ? "bg-accent text-white shadow-sm" : "text-primary hover:bg-neutral-light-active"
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${activeTab === tab.value ? "bg-white/20 text-white" : "bg-neutral-light-active text-primary"}`}>
                  {meta.statusCounts[tab.value] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm mã đơn, khách hàng..."
                className="w-52 pl-9 pr-3 py-2 text-[12px] border border-neutral rounded-lg bg-neutral-light-active text-primary placeholder:text-primary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" />
            </form>

            {/* Bộ lọc thanh toán */}
            <div ref={filterRef} className="relative">
              <button
                onClick={() => setShowFilterDropdown((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] transition-all cursor-pointer ${
                  hasPaymentFilter ? "border-accent bg-accent-light text-accent" : "border-neutral text-primary hover:bg-neutral-light-active"
                }`}
              >
                <Filter size={14} />
                {hasPaymentFilter ? PAYMENT_STATUS_OPTIONS.find((o) => o.value === paymentFilter)?.label : "Bộ lọc"}
                {hasPaymentFilter ? (
                  <X
                    size={12}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePaymentFilterChange("ALL");
                    }}
                    className="hover:text-promotion"
                  />
                ) : (
                  <ChevronDown size={12} className={`transition-transform duration-150 ${showFilterDropdown ? "rotate-180" : ""}`} />
                )}
              </button>
              {showFilterDropdown && (
                <div className="absolute top-full left-0 mt-1.5 w-48 bg-neutral-light border border-neutral rounded-xl shadow-lg z-20 overflow-hidden">
                  <p className="px-3 py-2 text-[10px] font-semibold text-neutral-dark uppercase tracking-wider border-b border-neutral">Trạng thái thanh toán</p>
                  {PAYMENT_STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handlePaymentFilterChange(opt.value)}
                      className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer ${
                        paymentFilter === opt.value ? "bg-accent-light text-accent font-semibold" : "text-primary hover:bg-neutral-light-active"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lọc theo ngày */}
            <div ref={dateRef} className="relative">
              <button
                onClick={() => setShowDatePicker((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] transition-all cursor-pointer ${
                  hasDateFilter ? "border-accent bg-accent-light text-accent" : "border-neutral text-primary hover:bg-neutral-light-active"
                }`}
              >
                <CalendarDays size={14} />
                {hasDateFilter ? `${dateFrom || "..."} → ${dateTo || "..."}` : "Lọc theo ngày"}
                {hasDateFilter && (
                  <X
                    size={12}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearDate();
                    }}
                    className="hover:text-promotion"
                  />
                )}
              </button>
              {showDatePicker && (
                <div className="absolute top-full right-0 mt-1.5 w-72 bg-neutral-light border border-neutral rounded-xl shadow-lg z-20 p-4 space-y-3">
                  <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Khoảng thời gian</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-dark">Từ ngày</label>
                      <input
                        type="date"
                        value={dateFrom}
                        max={dateTo || undefined}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-2 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light-active text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-dark">Đến ngày</label>
                      <input
                        type="date"
                        value={dateTo}
                        min={dateFrom || undefined}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-2 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light-active text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleClearDate} className="flex-1 py-1.5 rounded-lg border border-neutral text-[12px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer">
                      Xóa
                    </button>
                    <button onClick={handleApplyDate} className="flex-1 py-1.5 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent-hover transition-all cursor-pointer">
                      Áp dụng
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/admin/orders/create"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent-hover transition-all shadow-sm cursor-pointer"
            >
              <Plus size={14} /> Thêm đơn hàng
            </Link>
          </div>
        </div>

        {/* Active filter chips */}
        {(hasPaymentFilter || hasDateFilter) && (
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-neutral bg-neutral-light-active/50 flex-wrap">
            <span className="text-[11px] text-neutral-dark">Đang lọc:</span>
            {hasPaymentFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-light border border-accent text-[11px] text-accent font-medium">
                Thanh toán: {PAYMENT_STATUS_OPTIONS.find((o) => o.value === paymentFilter)?.label}
                <X size={10} className="cursor-pointer hover:text-promotion" onClick={() => handlePaymentFilterChange("ALL")} />
              </span>
            )}
            {hasDateFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-light border border-accent text-[11px] text-accent font-medium">
                Ngày: {dateFrom || "..."} → {dateTo || "..."}
                <X size={10} className="cursor-pointer hover:text-promotion" onClick={handleClearDate} />
              </span>
            )}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-center justify-between px-5 py-3 bg-promotion-light border-b border-promotion-light-active">
            <span className="text-[12px] text-promotion">{error}</span>
            <button onClick={fetchOrders} className="flex items-center gap-1 text-[12px] text-promotion hover:underline cursor-pointer">
              <RefreshCw size={12} /> Thử lại
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-light-active border-b border-neutral">
                {["STT", "Mã đơn", "Khách hàng", "Địa chỉ giao hàng", "Tổng tiền", "Phương thức", "Trạng thái đơn", "Thanh toán", "Ngày đặt", "Hành động"].map((col, i) => (
                  <th key={i} className="px-4 py-3 text-left text-[12px] font-semibold text-primary uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-primary">
                      <Package size={36} className="opacity-40" />
                      <span className="text-sm">Không có đơn hàng nào</span>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order, idx) => {
                  const rowNum = (meta.page - 1) * meta.limit + idx + 1;
                  return (
                    <tr key={order.id} className="border-b border-neutral hover:bg-neutral-light-active/60 transition-colors duration-100">
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] text-primary">{rowNum}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] font-semibold text-accent">#{order.orderCode}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[12px] font-medium text-primary">{order.user.fullName}</span>
                          <span className="text-[12px] text-primary/60">{order.user.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5 max-w-[190px]">
                          <span className="text-[12px] text-primary line-clamp-1">{order.shippingContactName}</span>
                          <span className="text-[12px] text-primary/60 line-clamp-1">
                            {order.shippingDetail} · {order.shippingPhone}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] font-semibold text-primary">{formatVND(order.totalAmount)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] text-primary">{order.paymentMethod.name}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <OrderStatusCell orderId={order.id} status={order.orderStatus} onStatusChange={handleStatusChange} onCancelRequest={handleCancelRequest} />
                      </td>
                      <td className="px-4 py-3.5">
                        {order.orderStatus === "DELIVERED" ? (
                          <PaymentStatusCell orderId={order.id} status={order.paymentStatus} onStatusChange={(newStatus) => handlePaymentStatusChange(order.id, newStatus)} />
                        ) : (
                          <PaymentBadge status={order.paymentStatus} />
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] text-primary">{formatDate(order.orderDate)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          title="Xem chi tiết"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-primary hover:bg-accent-light hover:text-accent cursor-pointer transition-all"
                        >
                          <Eye size={14} />
                        </Link>
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
            currentPage={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            pageSize={meta.limit}
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
              <h3 className="text-[15px] font-bold text-primary mb-1">Hủy đơn hàng?</h3>
              <p className="text-[13px] text-neutral-dark leading-relaxed">Đơn hàng sẽ bị hủy và tồn kho sẽ được hoàn lại. Bạn có chắc chắn muốn tiếp tục không?</p>
            </div>
          </div>
        }
        footerButtons={[
          {
            title: "Không, giữ lại",
            className: "px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer",
            onClick: () => setCancelTargetId(null),
          },
          {
            title: cancelling ? "Đang hủy..." : "Xác nhận hủy",
            className: "px-4 py-2 rounded-lg bg-promotion text-white text-[13px] font-medium hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
            onClick: handleCancelConfirm,
          },
        ]}
      />
    </div>
  );
}
