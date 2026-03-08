"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin, CreditCard, Package } from "lucide-react";
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
    color: "text-accent",
    bgColor: "bg-accent-light",
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
    color: "text-promotion",
    bgColor: "bg-promotion-light",
  },
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data: OrderResponse = await apiRequest.get("/orders/my");
        setOrders(data.data);
      } catch (err: any) {
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 2;

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    return order.orderStatus === activeTab;
  });

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE,
  );

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-semibold text-primary mb-4 text-left mt-2">
        Đơn hàng của tôi
      </h1>

      <div className="bg-neutral-light rounded-lg shadow-sm overflow-hidden">
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
                      ? "border-promotion text-promotion"
                      : "border-transparent text-primary-dark hover:text-primary"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-125">
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
        closeMethods={["escape", "overlay", "button"]}
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
          className="rounded-lg border border-neutral overflow-hidden animate-pulse"
        >
          <div className="h-10 bg-neutral-light-active" />
          <div className="flex gap-4 px-6 py-4">
            <div className="w-16 h-16 rounded bg-neutral shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 bg-neutral rounded w-2/3" />
              <div className="h-3 bg-neutral-light-active rounded w-1/3" />
            </div>
          </div>
          <div className="h-10 bg-neutral-light-active" />
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
      <p className="text-primary-dark text-sm text-center">{message}</p>
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
      <h3 className="text-lg font-semibold text-primary mb-2">
        Bạn chưa có đơn hàng nào
      </h3>
      <p className="text-primary-dark mb-8 text-center text-sm">
        Cùng khám phá hàng ngàn sản phẩm tại ChoCongNghe Shop nhé!
      </p>
      <Link
        href="/products"
        className="bg-promotion hover:bg-promotion-hover text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-md hover:shadow-lg"
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
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg text-sm border border-neutral text-primary-dark hover:bg-neutral-light-active disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        ‹
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer
            ${
              currentPage === page
                ? "bg-promotion text-white shadow-sm"
                : "border border-neutral text-primary-dark hover:bg-neutral-light-active"
            }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg text-sm border border-neutral text-primary-dark hover:bg-neutral-light-active disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        ›
      </button>
    </div>
  );
}

/* ============================================================================
 * ORDER CARD
 * ========================================================================== */
function OrderCard({
  order,
  onViewDetail,
}: {
  order: Order;
  onViewDetail: () => void;
}) {
  const status = statusConfig[order.orderStatus] ?? {
    label: order.orderStatus,
    color: "text-primary-dark",
    bgColor: "bg-neutral-light-active",
  };

  return (
    <div className="bg-neutral-light rounded-lg border border-neutral overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2 px-6 py-3 bg-neutral-light-active border-b border-neutral">
        <div className="flex-col font-medium text-primary">
          <h2>Đơn hàng: #{order.orderCode}</h2>
        </div>
        <span
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color} ${status.bgColor}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {status.label}
        </span>
        <div className="flex flex-wrap items-center gap-2 text-sm text-primary-dark">
          <span>
            Ngày đặt:{" "}
            <span className="text-primary">
              {new Date(order.orderDate).toLocaleDateString("vi-VN")}
            </span>
          </span>
          <span className="text-primary">•</span>
          <span>{order.paymentMethod.description}</span>
          <span className="text-primary">•</span>
          <span>{order.orderItems.length} sản phẩm</span>
        </div>
      </div>

      {/* Product List */}
      <div className="divide-y divide-neutral">
        {order.orderItems.map((item) => {
          const imageUrl =
            item.productVariant?.product?.img?.[0]?.imageUrl ?? "";
          const attrs = item.productVariant?.variantAttributes
            ?.map((a) => a.attributeOption.value)
            .join(" · ");

          return (
            <div key={item.id} className="flex gap-4 px-6 py-4">
              <div className="relative w-16 h-16 shrink-0 bg-neutral-light-active overflow-hidden">
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
                <h3 className="font-medium text-primary mb-1 line-clamp-2">
                  {item.productVariant?.product?.name}
                </h3>
                {attrs && (
                  <p className="text-sm text-primary-dark mb-0.5">{attrs}</p>
                )}
                <p className="text-sm text-primary-dark">
                  Số lượng: {item.quantity}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-semibold text-primary">
                  {Number(item.unitPrice).toLocaleString("vi-VN")}₫
                </p>
                {Number(item.productVariant?.price) >
                  Number(item.unitPrice) && (
                  <p className="text-sm line-through text-primary-dark">
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
      <div className="px-6 py-4 bg-neutral-light-active border-t border-neutral space-y-3">
        <div className="flex justify-between items-center text-sm">
          <div className="text-right">
            <span className="text-primary-dark">Tổng tiền:</span>
            <span className="text-promotion font-semibold ml-2 text-lg">
              {Number(order.totalAmount).toLocaleString("vi-VN")}₫
            </span>
          </div>
               <button
            onClick={onViewDetail}
            className="h-9  hover:bg-promotion-hover hover:text-white  flex items-center gap-1 cursor-pointer transition-colors text-sm text-promotion border border-promotion px-4  rounded-lg"
          >
            Xem chi tiết
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* <div className="flex justify-between items-center">
     
          <Link href="/products">
            <button className="h-9 bg-promotion hover:bg-promotion-hover text-white px-6  rounded-lg text-sm font-medium transition-colors cursor-pointer">
              Mua lại
            </button>
          </Link>
        </div> */}
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
    color: "text-primary",
    bgColor: "bg-neutral-light-active",
  };

  return (
    <div className="max-h-[75vh] overflow-y-auto  custom-scroll  px-6  pl-2 mt-6">
      {/* Title */}
      <h2 className="text-lg font-semibold text-primary mb-1 border-b pb-3 border-neutral flex items-center justify-between">
        Chi tiết đơn hàng
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color} ${status.bgColor}`}
        >
          {status.label}
        </span>
      </h2>

      <div className="divide-y divide-neutral space-y-0 p-2">
        {/* Thông tin đơn */}
        <div className="py-4 space-y-1.5 text-sm text-primary">
          <p>
            <span className="font-medium text-primary">Ngày đặt:</span>{" "}
            {new Date(order.orderDate).toLocaleString("vi-VN")}
          </p>
          <p>
            <span className="font-medium text-primary">Thanh toán:</span>{" "}
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
          <p className="text-sm font-medium text-primary flex items-center gap-1.5 mb-2">
            <MapPin size={15} className="text-promotion" />
            Địa chỉ giao hàng
          </p>
          <div className="bg-neutral-light-active rounded-lg px-4 py-3 text-sm text-primary-dark space-y-1">
            <p className="font-medium text-primary">
              {order.shippingContactName}
            </p>
            <p>
              {order.shippingDetail}, {order.shippingWard},{" "}
              {order.shippingProvince}
            </p>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="py-4">
          <p className="text-sm font-medium text-primary flex items-center gap-1.5 mb-3">
            <Package size={15} className="text-promotion" />
            Sản phẩm ({order.orderItems.length})
          </p>
          <div className="divide-y border rounded-lg overflow-hidden border-neutral">
            {order.orderItems.map((item) => {
              const imageUrl =
                item.productVariant?.product?.img?.[0]?.imageUrl ?? "";
              const attrs = item.productVariant?.variantAttributes
                ?.map((a) => a.attributeOption.value)
                .join(" · ");
              return (
                <div
                  key={item.id}
                  className="flex gap-3 px-4 py-3 bg-neutral-light"
                >
                  <div className="relative w-14 h-14 shrink-0 bg-neutral-light-active overflow-hidden">
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
                    <p className="text-sm font-medium text-primary line-clamp-2">
                      {item.productVariant?.product?.name}
                    </p>
                    {attrs && (
                      <p className="text-xs text-primary-dark mt-0.5">
                        {attrs}
                      </p>
                    )}
                    <p className="text-xs text-primary-dark mt-0.5">
                      x{item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary shrink-0">
                    {Number(item.unitPrice).toLocaleString("vi-VN")}₫
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="py-4">
          <p className="text-sm font-medium text-primary flex items-center gap-1.5 mb-3">
            <CreditCard size={15} className="text-promotion" />
            Thanh toán
          </p>
          <div className="bg-neutral-light-active rounded-lg px-4 py-3 space-y-2 text-sm">
            <div className="flex justify-between text-primary-dark">
              <span>Tạm tính</span>
              <span>
                {Number(order.subtotalAmount).toLocaleString("vi-VN")}₫
              </span>
            </div>
            <div className="flex justify-between text-primary-dark">
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
            <div className="flex justify-between font-semibold text-primary border-t border-neutral pt-2 mt-1">
              <span>Tổng cộng</span>
              <span className="text-promotion text-base">
                {Number(order.totalAmount).toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
