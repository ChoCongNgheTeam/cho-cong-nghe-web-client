"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, LayoutDashboard } from "lucide-react";

import { getDashboard } from "./_libs/dashboard";
import type { DashboardPeriod } from "./dashboard.types";

import { PeriodSelector } from "./components/PeriodSelector";
import { SummaryCards } from "./components/SummaryCards";
import { OrderStatusChart } from "./components/OrderStatusChart";
import { RecentOrdersTable } from "./components/RecentOrdersTable";
import { TopProducts } from "./components/TopProducts";
import { ChatbotPendingBanner } from "./components/ChatbotPendingBanner";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-36" />
        ))}
      </div>
      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 h-72" />
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 h-72" />
      </div>
      {/* Row 3 */}
      <div className="bg-white rounded-2xl border border-slate-100 h-64" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("month");

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-dashboard", period],
    queryFn: () => getDashboard({ period }),
    staleTime: 1000 * 60 * 2, // cache 2 phút
  });

  const dashboard = data?.data;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <LayoutDashboard className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Dashboard</h1>
              <p className="text-xs text-slate-400 mt-0.5">Tổng quan hoạt động kinh doanh</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PeriodSelector value={period} onChange={setPeriod} />
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-accent hover:border-accent/30 transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoading && <DashboardSkeleton />}

        {/* ── Content ── */}
        {dashboard && (
          <div className="space-y-5">
            {/* Chatbot pending alert — chỉ hiện khi có đơn chờ */}
            {dashboard.chatbotPendingOrders.length > 0 && <ChatbotPendingBanner orders={dashboard.chatbotPendingOrders} />}

            {/* Row 1: Summary Cards */}
            <SummaryCards summary={dashboard.summary} />

            {/* Row 2: Order Status Donut + Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <OrderStatusChart data={dashboard.orderStatusBreakdown} />
              <div className="lg:col-span-2">
                <TopProducts products={dashboard.topProducts} />
              </div>
            </div>

            {/* Row 3: Recent Orders */}
            <RecentOrdersTable orders={dashboard.recentOrders} title="Đơn hàng mới nhất" />
          </div>
        )}

        {/* ── Error state ── */}
        {!isLoading && !dashboard && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <LayoutDashboard className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Không thể tải dữ liệu. Vui lòng thử lại.</p>
            <button onClick={() => refetch()} className="mt-4 text-sm text-accent hover:underline">
              Thử lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
