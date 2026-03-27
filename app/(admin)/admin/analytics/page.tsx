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

function Skeleton() {
  return (
    <div className="animate-pulse space-y-2.5">
      <div className="grid grid-cols-[180px_1fr] gap-2.5">
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 h-12" />
          ))}
        </div>
        <div className="space-y-2.5">
          <div className="bg-white rounded-xl border border-slate-100 h-44" />
          <div className="grid grid-cols-3 gap-2.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 h-48" />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 h-32" />
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
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 space-y-2.5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">Thống kê doanh thu</h1>
              <p className="text-[10px] text-slate-400">{from === to ? from : `${from} → ${to}`}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DateRangePicker
              preset={preset}
              from={from}
              to={to}
              onPresetChange={setPreset}
              onCustomChange={(f, t) => {
                setCustomFrom(f);
                setCustomTo(t);
              }}
            />
            <GranularitySelector value={granularity} onChange={setGranularity} />
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
        {analytics && (
          <div className="space-y-2.5">
            {/* ── Main grid: KPI sidebar (fixed 180px) + charts ── */}
            <div className="grid grid-cols-1 xl:grid-cols-[180px_1fr] gap-2.5 items-start">
              {/* Col 1: KPI stack */}
              <SummaryKPIs summary={analytics.summary} />

              {/* Col 2: Charts */}
              <div className="space-y-2.5">
                {/* Revenue line chart — full width of right col */}
                <RevenueChart data={analytics.revenueOverTime} comparison={analytics.comparisonOverTime} />

                {/* 3-col breakdown row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <PaymentMethodChart data={analytics.revenueByPaymentMethod} />
                  <CategoryChart data={analytics.revenueByCategory} />
                  <ConversionFunnelChart data={analytics.conversionFunnel} />
                </div>
              </div>
            </div>

            {/* ── Top customers full-width ── */}
            <TopCustomersTable customers={analytics.topCustomers} />
          </div>
        )}

        {/* ── Error ── */}
        {!isLoading && !analytics && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <BarChart3 className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">Không thể tải dữ liệu. Vui lòng thử lại.</p>
            <button onClick={() => refetch()} className="mt-3 text-xs text-accent hover:underline">
              Thử lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
