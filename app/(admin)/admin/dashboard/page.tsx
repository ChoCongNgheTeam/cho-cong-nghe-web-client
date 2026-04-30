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
import { useAdminHref } from "@/hooks/useAdminHref";
import { useAuth } from "@/hooks/useAuth";

function Skeleton() {
  return (
    <div className="space-y-2.5 animate-pulse">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-neutral-light rounded-xl border border-neutral h-20" />
        ))}
      </div>
      <div className="bg-neutral-light rounded-xl border border-neutral h-32" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <div className="bg-neutral-light rounded-xl border border-neutral h-56" />
        <div className="lg:col-span-2 bg-neutral-light rounded-xl border border-neutral h-56" />
      </div>
      <div className="bg-neutral-light rounded-xl border border-neutral h-52" />
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
  const { user } = useAuth();
  const href = useAdminHref();

  const dashboard = data?.data;

  return (
    <div className="min-h-screen bg-neutral-light-active">
      <div className="px-6 py-3 space-y-2.5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <LayoutDashboard className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-primary leading-tight">Dashboard</h1>
              <p className="text-[14px] text-primary-light">Tổng quan hoạt động kinh doanh</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PeriodSelector value={period} onChange={setPeriod} />
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-neutral bg-neutral-light text-primary-light hover:text-accent hover:border-accent/30 transition-colors disabled:opacity-50"
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
            {dashboard.chatbotPendingOrders.length > 0 && <ChatbotPendingBanner orders={dashboard.chatbotPendingOrders} />}

            <SummaryCards summary={dashboard.summary} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
              <OrderStatusChart data={dashboard.orderStatusBreakdown} />
              <div className="lg:col-span-2">
                <TopProducts products={dashboard.topProducts} />
              </div>
            </div>

            <RecentOrdersTable orders={dashboard.recentOrders} title="Đơn hàng mới nhất" href={href} user={user} />
          </div>
        )}

        {/* ── Error ── */}
        {!isLoading && !dashboard && (
          <div className="flex flex-col items-center justify-center py-16 text-primary-light">
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
