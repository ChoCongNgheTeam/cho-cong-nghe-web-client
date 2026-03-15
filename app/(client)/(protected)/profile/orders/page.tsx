"use client";

import { useState, useEffect } from "react";
import { Order, OrderResponse } from "../type/order";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import apiRequest from "@/lib/api";
import { Popzy } from "@/components/Modal";
import { tabs } from "./components/Constants";
import { ErrorState, EmptyState, LoadingState } from "./components/OrderStatesTemp";
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
    if (!user) return;
    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter((order) => (activeTab === "all" ? true : order.orderStatus === activeTab));

  // Count per tab for badges
  const countByStatus = (statusId: string) => (statusId === "all" ? orders.length : orders.filter((o) => o.orderStatus === statusId).length);

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  // Sync selectedOrder khi orders được refresh
  useEffect(() => {
    if (!selectedOrder) return;
    const refreshed = orders.find((o) => o.id === selectedOrder.id);
    if (refreshed) setSelectedOrder(refreshed);
  }, [orders]);

  return (
    <div>
      <h1 className="text-xl font-bold text-primary mb-4 mt-2">Đơn hàng của tôi</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral">
        {/* ── Tabs ── */}
        <div className="border-b border-neutral">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const count = countByStatus(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex-1 flex items-center justify-center gap-1.5 px-3 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer min-w-[80px]
                    ${activeTab === tab.id ? "border-promotion text-promotion" : "border-transparent text-neutral-darker hover:text-primary"}`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold
                      ${activeTab === tab.id ? "bg-promotion text-white" : "bg-neutral text-neutral-darker"}`}
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
            <div className="p-5 space-y-4">
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
              {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
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
        cssClass="max-w-[680px] w-full"
        content={selectedOrder ? <OrderDetailModal order={selectedOrder} /> : null}
      />
    </div>
  );
}
