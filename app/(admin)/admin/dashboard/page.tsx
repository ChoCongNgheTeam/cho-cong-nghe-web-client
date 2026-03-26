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

function Skeleton() {
  return (
    <div className="space-y-2.5 animate-pulse">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 h-20" />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-100 h-32" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <div className="bg-white rounded-xl border border-slate-100 h-56" />
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 h-56" />
      </div>
      <div className="bg-white rounded-xl border border-slate-100 h-52" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("month");

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-dashboard", period],
    queryFn: () => getDashboard({ period }),
    staleTime: 1000 * 60 * 2,
  });

  const dashboard = data?.data;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 space-y-2.5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <LayoutDashboard className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">Dashboard</h1>
              <p className="text-[10px] text-slate-400">Tổng quan hoạt động kinh doanh</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PeriodSelector value={period} onChange={setPeriod} />
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-accent hover:border-accent/30 transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoading && <Skeleton />}

        {/* ── Content ── */}
        {dashboard && (
          <div className="space-y-2.5">
            {/* Chatbot banner */}
            {dashboard.chatbotPendingOrders.length > 0 && <ChatbotPendingBanner orders={dashboard.chatbotPendingOrders} />}

            {/* Row 1: 4 stat cards */}
            <SummaryCards summary={dashboard.summary} />

            {/* Row 2: Revenue chart (full width) */}
            {/* <RevenueChart data={revenueChartData} period={period} /> */}

            {/* Row 3: Donut (1/3) + Top Products (2/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
              <OrderStatusChart data={dashboard.orderStatusBreakdown} />
              <div className="lg:col-span-2">
                <TopProducts products={dashboard.topProducts} />
              </div>
            </div>

            {/* Row 4: Recent Orders table */}
            <RecentOrdersTable orders={dashboard.recentOrders} title="Đơn hàng mới nhất" />
          </div>
        )}

        {/* ── Error ── */}
        {!isLoading && !dashboard && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <LayoutDashboard className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">Không thể tải dữ liệu.</p>
            <button onClick={() => refetch()} className="mt-3 text-xs text-accent hover:underline">
              Thử lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
