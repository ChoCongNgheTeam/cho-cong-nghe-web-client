"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, BarChart3 } from "lucide-react";

import { getAnalytics } from "./_libs/analytics";
import type { TimeGranularity } from "./analytics.types";
import { DateRangePicker, GranularitySelector, resolvePreset, type QuickRange } from "./components/DateRangePicker";
import { SummaryKPIs } from "./components/SummaryKPIs";
import { RevenueChart } from "./components/RevenueChart";
import { PaymentMethodChart, CategoryChart } from "./components/BreakdownCharts";
import { ConversionFunnelChart } from "./components/ConversionFunnelChart";
import { TopCustomersTable } from "./components/TopCustomersTable";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Main grid skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-4">
        {/* KPI column */}
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 h-24" />
          ))}
        </div>
        {/* Charts area */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 h-56" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 h-64" />
            <div className="bg-white rounded-2xl border border-slate-100 h-64" />
            <div className="bg-white rounded-2xl border border-slate-100 h-64" />
          </div>
        </div>
      </div>
      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-slate-100 h-48" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [preset, setPreset] = useState<QuickRange>("30d");
  const [granularity, setGranularity] = useState<TimeGranularity>("day");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const { from, to } = resolvePreset(preset, customFrom, customTo);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-analytics", from, to, granularity],
    queryFn: () => getAnalytics({ from, to, granularity }),
    staleTime: 1000 * 60 * 3,
    enabled: !!from && !!to,
  });

  const analytics = data?.data;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Thống kê doanh thu</h1>
              <p className="text-xs text-slate-400 mt-0.5">{from === to ? from : `${from} → ${to}`}</p>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker
              preset={preset}
              from={from}
              to={to}
              onPresetChange={(p) => setPreset(p)}
              onCustomChange={(f, t) => {
                setCustomFrom(f);
                setCustomTo(t);
              }}
            />
            <GranularitySelector value={granularity} onChange={setGranularity} />
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
        {isLoading && <AnalyticsSkeleton />}

        {/* ── Content ── */}
        {analytics && (
          <div className="space-y-4">
            {/* ── Main grid: KPI sidebar + Charts ── */}
            <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-4 items-start">
              {/* Col 1 — KPI cards stacked vertically */}
              <SummaryKPIs summary={analytics.summary} />

              {/* Col 2-4 — Charts stacked */}
              <div className="space-y-4">
                {/* Row A: Revenue chart — full width of right area */}
                <RevenueChart data={analytics.revenueOverTime} />

                {/* Row B: 3 equal columns — Payment | Category | Funnel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PaymentMethodChart data={analytics.revenueByPaymentMethod} />
                  <CategoryChart data={analytics.revenueByCategory} />
                  <ConversionFunnelChart data={analytics.conversionFunnel} />
                </div>
              </div>
            </div>

            {/* ── Row 2: Top customers — full 4 cols ── */}
            <TopCustomersTable customers={analytics.topCustomers} />
          </div>
        )}

        {/* ── Error state ── */}
        {!isLoading && !analytics && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <BarChart3 className="w-10 h-10 mb-3 opacity-30" />
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
