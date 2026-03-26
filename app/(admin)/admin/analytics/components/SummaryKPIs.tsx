"use client";

import { TrendingUp, ShoppingCart, CheckCircle, XCircle, BarChart3, Banknote } from "lucide-react";
import type { AnalyticsSummary } from "../analytics.types";

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);
const formatNumber = (v: number) => new Intl.NumberFormat("vi-VN").format(v);
const formatPct = (v: number) => `${v.toFixed(1)}%`;

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  primary?: boolean;
}

function KPICard({ label, value, sub, icon, iconBg, primary }: KPICardProps) {
  if (primary) {
    return (
      <div className="bg-accent rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-base font-bold text-white truncate">{value}</p>
          <p className="text-xs text-white/70 truncate">{label}</p>
          {sub && <p className="text-[10px] text-white/50 truncate mt-0.5">{sub}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-base font-bold text-slate-900 truncate">{value}</p>
        <p className="text-xs text-slate-500 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 truncate mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── SummaryKPIs ──────────────────────────────────────────────────────────────

interface SummaryKPIsProps {
  summary: AnalyticsSummary;
}

export function SummaryKPIs({ summary }: SummaryKPIsProps) {
  return (
    <div className="flex flex-col gap-3">
      <KPICard label="Tổng doanh thu" value={formatVND(summary.totalRevenue)} sub={`TB ${formatVND(summary.averageOrderValue)}/đơn`} icon={<Banknote className="w-4.5 h-4.5" />} iconBg="" primary />
      <KPICard label="Tổng đơn hàng" value={formatNumber(summary.totalOrders)} icon={<ShoppingCart className="w-4.5 h-4.5" />} iconBg="bg-accent/10 text-accent" />
      <KPICard label="Đã giao thành công" value={formatNumber(summary.totalDelivered)} icon={<CheckCircle className="w-4.5 h-4.5" />} iconBg="bg-emerald-50 text-emerald-600" />
      <KPICard label="Tỉ lệ giao thành công" value={formatPct(summary.deliveryRate)} icon={<TrendingUp className="w-4.5 h-4.5" />} iconBg="bg-blue-50 text-blue-600" />
      <KPICard
        label="Tỉ lệ huỷ đơn"
        value={formatPct(summary.cancellationRate)}
        icon={<XCircle className="w-4.5 h-4.5" />}
        iconBg={summary.cancellationRate > 10 ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-400"}
      />
      <KPICard label="AOV" value={formatVND(summary.averageOrderValue)} icon={<BarChart3 className="w-4.5 h-4.5" />} iconBg="bg-orange-50 text-orange-500" />
    </div>
  );
}
