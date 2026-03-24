"use client";

import { useState, useEffect } from "react";
import { Order, OrderResponse } from "../type/order";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import apiRequest from "@/lib/api";
import { Popzy } from "@/components/Modal";
import { tabs } from "./components/Constants";
import {
  ErrorState,
  EmptyState,
  LoadingState,
} from "./components/OrderStatesTemp";
import OrderCard from "./components/OrderCard";
import OrderDetailModal from "./components/OrderDetailModal";
import Pagination from "./components/Pagination";

const ORDERS_PER_PAGE = 5;

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { refetchCart } = useCart();

  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: OrderResponse = await apiRequest.get("/orders/my");
      setOrders(data.data);
    } catch {
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  useEffect(() => {
    if (!selectedOrder) return;
    const refreshed = orders.find((o) => o.id === selectedOrder.id);
    if (refreshed) setSelectedOrder(refreshed);
  }, [orders]);

  const filteredOrders = orders.filter((o) =>
    activeTab === "all" ? true : o.orderStatus === activeTab,
  );
  const countByStatus = (statusId: string) =>
    statusId === "all"
      ? orders.length
      : orders.filter((o) => o.orderStatus === statusId).length;
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
      <h1 className="text-base sm:text-xl font-bold text-primary mb-3 sm:mb-4 mt-1 sm:mt-2">
        Đơn hàng của tôi
      </h1>

      <div className="bg-neutral-light rounded-xl shadow-sm overflow-hidden border border-neutral">
        {/* ── Tabs ── */}
        <div className="border-b border-neutral">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const count = countByStatus(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    relative flex-shrink-0 flex items-center justify-center gap-1 sm:gap-1.5
                    px-2.5 sm:px-3 py-2.5 sm:py-3.5
                    text-xs sm:text-sm font-medium
                    border-b-2 transition-all whitespace-nowrap cursor-pointer
                    min-w-[60px] sm:min-w-[80px]
                    ${
                      activeTab === tab.id
                        ? "border-accent text-accent"
                        : "border-transparent text-neutral-darker hover:text-primary"
                    }
                  `}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`
                      inline-flex items-center justify-center
                      min-w-[15px] sm:min-w-[18px] h-[15px] sm:h-[18px]
                      px-0.5 sm:px-1 rounded-full
                      text-[9px] sm:text-[10px] font-bold
                      ${activeTab === tab.id ? "bg-accent text-neutral-light" : "bg-neutral text-neutral-darker"}
                    `}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="min-h-96">
          {authLoading || loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : filteredOrders.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
              {paginatedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetail={() => setSelectedOrder(order)}
                  onCancelSuccess={fetchOrders}
                  onReorderSuccess={fetchOrders}
                  onBeforeNavigate={() => refetchCart(true)}
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

      {/* ── Order Detail Modal ── */}
      <Popzy
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        scrollLockTarget={() => document.documentElement}
        closeMethods={["escape", "overlay", "button"]}
        footer={false}
        cssClass="max-w-[680px] w-full mx-3 sm:mx-auto"
        content={
          selectedOrder ? <OrderDetailModal order={selectedOrder} /> : null
        }
      />
    </div>
  );
}
