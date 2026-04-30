// page.tsx — analytics

"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, BarChart3 } from "lucide-react";

import { getAnalytics } from "./_libs/analytics";
import type { TimeGranularity } from "./analytics.types";
import { DateRangePicker, GranularitySelector, resolvePreset, autoGranularity, getValidGranularities, type QuickRange } from "./components/DateRangePicker";
import { SummaryKPIs } from "./components/SummaryKPIs";
import { RevenueChart } from "./components/RevenueChart";
import { PaymentMethodChart, CategoryChart } from "./components/BreakdownCharts";
import { ConversionFunnelChart } from "./components/ConversionFunnelChart";
import { TopCustomersTable } from "./components/TopCustomersTable";
import { useAuth } from "@/hooks/useAuth";

function Skeleton() {
  return (
    <div className="animate-pulse space-y-2.5">
      <div className="grid grid-cols-[180px_1fr] gap-2.5">
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-neutral-light rounded-xl border border-neutral h-12" />
          ))}
        </div>
        <div className="space-y-2.5">
          <div className="bg-neutral-light rounded-xl border border-neutral h-44" />
          <div className="grid grid-cols-3 gap-2.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-neutral-light rounded-xl border border-neutral h-48" />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-neutral-light rounded-xl border border-neutral h-32" />
    </div>
  );
}

export default function AnalyticsPage() {
  const [preset, setPreset] = useState<QuickRange>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const { user } = useAuth();

  const { from, to } = resolvePreset(preset, customFrom, customTo);

  // granularity tự động reset về giá trị hợp lệ khi range thay đổi
  const [granularity, setGranularity] = useState<TimeGranularity>(() => autoGranularity(from, to));

  useEffect(() => {
    const valid = getValidGranularities(from, to);
    // Nếu granularity hiện tại không còn hợp lệ với range mới → reset về auto
    if (!valid.includes(granularity)) {
      setGranularity(autoGranularity(from, to));
    }
  }, [from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-analytics", from, to, granularity],
    queryFn: () => getAnalytics({ from, to, granularity }),
    staleTime: 1000 * 60 * 3,
    enabled: !!from && !!to,
  });

  const analytics = data?.data;

  return (
    <div className="min-h-screen">
      <div className="px-6 py-3 space-y-2.5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-primary leading-tight">Thống kê doanh thu</h1>
              <p className="text-[10px] text-neutral-dark">{from === to ? from : `${from} → ${to}`}</p>
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
            {/* GranularitySelector chỉ show options hợp lệ theo range */}
            <GranularitySelector value={granularity} onChange={setGranularity} from={from} to={to} />
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-neutral bg-neutral-light text-neutral-dark hover:text-accent hover:border-accent-light-active transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {isLoading && <Skeleton />}

        {analytics && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 xl:grid-cols-[180px_1fr] gap-2.5 items-start">
              <SummaryKPIs summary={analytics.summary} />
              <div className="space-y-2.5">
                <RevenueChart data={analytics.revenueOverTime} comparison={analytics.comparisonOverTime} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <PaymentMethodChart data={analytics.revenueByPaymentMethod} />
                  <CategoryChart data={analytics.revenueByCategory} />
                  <ConversionFunnelChart data={analytics.conversionFunnel} />
                </div>
              </div>
            </div>
            <TopCustomersTable customers={analytics.topCustomers} user={user} />
          </div>
        )}

        {!isLoading && !analytics && (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-dark">
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
