"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, X, MapPin, CreditCard, Package } from "lucide-react";
import { Order, OrderResponse } from "../type/order";
import { useAuth } from "@/hooks/useAuth";
import apiRequest from "@/lib/api";
import { Popzy } from "@/components/Modal";

// Tab configuration
const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "PENDING", label: "Đang xử lý" },
  { id: "PROCESSING", label: "Đã xác nhận" },
  { id: "SHIPPED", label: "Đang giao" },
  { id: "DELIVERED", label: "Hoàn tất" },
  { id: "CANCELLED", label: "Đã hủy" },
];

// Status configuration
const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  PROCESSING: {
    label: "Đã xác nhận",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  SHIPPED: {
    label: "Đang giao",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  DELIVERED: {
    label: "Hoàn tất",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  /* ============================================================================
   * FETCH ORDERS
   * ========================================================================== */
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching orders for user:", user?.id);
        const data: OrderResponse = await apiRequest.get("/orders/my");
        console.log("Orders response:", data);
        setOrders(data.data);
      } catch (err: any) {
        console.error("Error fetching orders:", err?.status, err?.message, err);
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 2;

  /* ============================================================================
   * FILTER + PAGINATION
   * ========================================================================== */
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    return order.orderStatus === activeTab;
  });

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE,
  );

  // Reset về trang 1 khi đổi tab
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  /* ============================================================================
   * RENDER
   * ========================================================================== */
  return (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-left mt-2">
        Đơn hàng của tôi
      </h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="py-2">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 px-3 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer
                  ${
                    activeTab === tab.id
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[500px]">
          {authLoading || loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : filteredOrders.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="p-6 space-y-4">
              {paginatedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetail={() => setSelectedOrder(order)}
                />
              ))}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <Popzy
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        scrollLockTarget={() => document.documentElement}
        closeMethods={["escape", "overlay"]}
        footer={false}
        cssClass="max-w-[680px] w-full"
        content={
          selectedOrder ? <OrderDetailModal order={selectedOrder} /> : null
        }
      />
    </div>
  );
}

/* ============================================================================
 * LOADING STATE
 * ========================================================================== */
function LoadingState() {
  return (
    <div className="flex flex-col gap-4 p-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 overflow-hidden animate-pulse"
        >
          <div className="h-10 bg-gray-100" />
          <div className="flex gap-4 px-6 py-4">
            <div className="w-16 h-16 rounded bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          </div>
          <div className="h-10 bg-gray-50" />
        </div>
      ))}
    </div>
  );
}

/* ============================================================================
 * ERROR STATE
 * ========================================================================== */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-3">
      <span className="text-4xl">⚠️</span>
      <p className="text-gray-600 text-sm text-center">{message}</p>
    </div>
  );
}

/* ============================================================================
 * EMPTY STATE
 * ========================================================================== */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <img
        src="https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/estore-v2/img/empty_state.png"
        alt="Không có đơn hàng"
        className="object-contain w-60 h-60 mx-auto"
      />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Bạn chưa có đơn hàng nào
      </h3>
      <p className="text-gray-600 mb-8 text-center text-sm">
        Cùng khám phá hàng ngàn sản phẩm tại ChoCongNghe Shop nhé!
      </p>
      <Link
        href="/products"
        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-md hover:shadow-lg"
      >
        Khám phá ngay
      </Link>
    </div>
  );
}

/* ============================================================================
 * PAGINATION
 * ========================================================================== */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        ‹
      </button>

      {/* Pages */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer
            ${
              currentPage === page
                ? "bg-red-600 text-white shadow-sm"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        ›
      </button>
    </div>
  );
}
function OrderCard({
  order,
  onViewDetail,
}: {
  order: Order;
  onViewDetail: () => void;
}) {
  const status = statusConfig[order.orderStatus] ?? {
    label: order.orderStatus,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span>
            Ngày đặt:{" "}
            <span className="text-gray-800">
              {new Date(order.orderDate).toLocaleDateString("vi-VN")}
            </span>
          </span>
          <span className="text-gray-400">•</span>
          <span>{order.paymentMethod.description}</span>
          <span className="text-gray-400">•</span>
          <span>{order.orderItems.length} sản phẩm</span>
        </div>
        <span
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color} ${status.bgColor}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {status.label}
        </span>
      </div>

      {/* Product List */}
      <div className="divide-y">
        {order.orderItems.map((item) => {
          const imageUrl =
            item.productVariant?.product?.img?.[0]?.imageUrl ?? "";
          const attrs = item.productVariant?.variantAttributes
            ?.map((a) => a.attributeOption.value)
            .join(" · ");

          return (
            <div key={item.id} className="flex gap-4 px-6 py-4">
              <div className="relative w-16 h-16 shrink-0 bg-gray-100  overflow-hidden">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={item.productVariant?.product?.name ?? ""}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-gray-800 mb-1 line-clamp-2">
                  {item.productVariant?.product?.name}
                </h3>
                {attrs && (
                  <p className="text-xs text-gray-500 mb-0.5">{attrs}</p>
                )}
                <p className="text-sm text-gray-500">
                  Số lượng: {item.quantity}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-semibold text-gray-800">
                  {Number(item.unitPrice).toLocaleString("vi-VN")}₫
                </p>
                {Number(item.productVariant?.price) >
                  Number(item.unitPrice) && (
                  <p className="text-sm line-through text-gray-400">
                    {Number(item.productVariant?.price).toLocaleString("vi-VN")}
                    ₫
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t space-y-3 border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <button
            onClick={onViewDetail}
            className="text-gray-600 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            Xem chi tiết
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="text-right">
            <span className="text-gray-600">Tổng tiền:</span>
            <span className="text-red-600 font-semibold ml-2 text-lg">
              {Number(order.totalAmount).toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/products">
            {" "}
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
              Mua lại
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * ORDER DETAIL MODAL
 * ========================================================================== */
function OrderDetailModal({ order }: { order: Order }) {
  const status = statusConfig[order.orderStatus] ?? {
    label: order.orderStatus,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  };

  return (
    <div className="max-h-[75vh] overflow-y-auto pr-1 custom-scroll">
      {/* Title */}
      <h2 className="text-lg font-semibold mb-1 border-b pb-3 border-gray-200 flex items-center justify-between">
        Chi tiết đơn hàng
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color} ${status.bgColor}`}
        >
          {status.label}
        </span>
      </h2>

      <div className="divide-y divide-gray-100 space-y-0">
        {/* Thông tin đơn */}
        <div className="py-4 space-y-1.5 text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-700">Ngày đặt:</span>{" "}
            {new Date(order.orderDate).toLocaleString("vi-VN")}
          </p>
          <p>
            <span className="font-medium text-gray-700">Thanh toán:</span>{" "}
            {order.paymentMethod.name} —{" "}
            <span
              className={
                order.paymentStatus === "PAID"
                  ? "text-green-600 font-medium"
                  : "text-yellow-600 font-medium"
              }
            >
              {order.paymentStatus === "PAID"
                ? "Đã thanh toán"
                : "Chưa thanh toán"}
            </span>
          </p>
        </div>

        {/* Địa chỉ giao hàng */}
        <div className="py-4">
          <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-2">
            <MapPin size={15} className="text-red-500" />
            Địa chỉ giao hàng
          </p>
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-800">
              {order.shippingAddress.contactName}
            </p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.detailAddress}</p>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="py-4">
          <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-3">
            <Package size={15} className="text-red-500" />
            Sản phẩm ({order.orderItems.length})
          </p>
          <div className="divide-y border rounded-lg overflow-hidden border-gray-200">
            {order.orderItems.map((item) => {
              const imageUrl =
                item.productVariant?.product?.img?.[0]?.imageUrl ?? "";
              const attrs = item.productVariant?.variantAttributes
                ?.map((a) => a.attributeOption.value)
                .join(" · ");
              return (
                <div key={item.id} className="flex gap-3 px-4 py-3 bg-white">
                  <div className="relative w-14 h-14 shrink-0 bg-gray-100  overflow-hidden">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={item.productVariant?.product?.name ?? ""}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2">
                      {item.productVariant?.product?.name}
                    </p>
                    {attrs && (
                      <p className="text-xs text-gray-500 mt-0.5">{attrs}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      x{item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 shrink-0">
                    {Number(item.unitPrice).toLocaleString("vi-VN")}₫
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="py-4">
          <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-3">
            <CreditCard size={15} className="text-red-500" />
            Thanh toán
          </p>
          <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span>
              <span>
                {Number(order.subtotalAmount).toLocaleString("vi-VN")}₫
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Phí vận chuyển</span>
              <span>
                {Number(order.shippingFee) === 0 ? (
                  <span className="text-green-600">Miễn phí</span>
                ) : (
                  `${Number(order.shippingFee).toLocaleString("vi-VN")}₫`
                )}
              </span>
            </div>
            {Number(order.voucherDiscount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá voucher</span>
                <span>
                  -{Number(order.voucherDiscount).toLocaleString("vi-VN")}₫
                </span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-800 border-t pt-2 mt-1">
              <span>Tổng cộng</span>
              <span className="text-red-600 text-base">
                {Number(order.totalAmount).toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
