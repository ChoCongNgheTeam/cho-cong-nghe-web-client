"use client";

import { TrendingUp, TrendingDown, ShoppingCart, CheckCircle, XCircle, BarChart3, Banknote } from "lucide-react";
import type { AnalyticsSummary } from "../analytics.types";

const fmtVND = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);
const fmtVNDShort = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}T`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  return fmtVND(v);
};
const fmtNum = (v: number) => new Intl.NumberFormat("vi-VN").format(v);
const fmtPct = (v: number) => `${v.toFixed(1)}%`;

interface ChangePillProps {
  change?: number;
}
function ChangePill({ change }: ChangePillProps) {
  if (change === undefined) return null;
  const up = change >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded ${up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
      <Icon className="w-2 h-2" />
      {Math.abs(change)}%
    </span>
  );
}

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  change?: number;
  primary?: boolean;
  danger?: boolean;
}

function KPICard({ label, value, sub, icon, iconBg, change, primary, danger }: KPICardProps) {
  if (primary) {
    return (
      <div className="bg-accent rounded-xl px-3 py-2.5 flex items-center gap-2.5 shadow-sm">
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-white truncate">{value}</p>
            {change !== undefined && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded bg-white/20 text-white shrink-0">
                {change >= 0 ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
                {Math.abs(change)}%
              </span>
            )}
          </div>
          <p className="text-[10px] text-white/70 truncate">{label}</p>
          {sub && <p className="text-[9px] text-white/50 truncate">{sub}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border px-3 py-2.5 flex items-center gap-2.5 shadow-sm ${danger ? "border-red-100" : "border-slate-100"}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={`text-sm font-bold truncate ${danger ? "text-red-600" : "text-slate-900"}`}>{value}</p>
          <ChangePill change={change} />
        </div>
        <p className="text-[10px] text-slate-500 truncate">{label}</p>
        {sub && <p className="text-[9px] text-slate-400 truncate">{sub}</p>}
      </div>
    </div>
  );
}

export function SummaryKPIs({ summary }: { summary: AnalyticsSummary }) {
  return (
    <div className="flex flex-col gap-2">
      <KPICard
        label="Tổng doanh thu"
        primary
        value={fmtVNDShort(summary.totalRevenue)}
        sub={`AOV ${fmtVNDShort(summary.averageOrderValue)}/đơn`}
        icon={<Banknote className="w-3.5 h-3.5" />}
        iconBg=""
        change={summary.revenueChange}
      />
      <KPICard label="Tổng đơn hàng" value={fmtNum(summary.totalOrders)} icon={<ShoppingCart className="w-3.5 h-3.5" />} iconBg="bg-accent/10 text-accent" change={summary.ordersChange} />
      <KPICard label="Đã giao thành công" value={fmtNum(summary.totalDelivered)} icon={<CheckCircle className="w-3.5 h-3.5" />} iconBg="bg-emerald-50 text-emerald-600" />
      <KPICard label="Tỉ lệ giao hàng" value={fmtPct(summary.deliveryRate)} icon={<TrendingUp className="w-3.5 h-3.5" />} iconBg="bg-blue-50 text-blue-600" />
      <KPICard
        label="Tỉ lệ huỷ đơn"
        value={fmtPct(summary.cancellationRate)}
        icon={<XCircle className="w-3.5 h-3.5" />}
        iconBg={summary.cancellationRate > 10 ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-400"}
        danger={summary.cancellationRate > 10}
      />
      <KPICard label="Giá trị đơn TB" value={fmtVNDShort(summary.averageOrderValue)} icon={<BarChart3 className="w-3.5 h-3.5" />} iconBg="bg-orange-50 text-orange-500" />
    </div>
  );
}
