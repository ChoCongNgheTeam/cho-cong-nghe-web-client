"use client";

import { TrendingUp, TrendingDown, ShoppingCart, Users, Package, Bot } from "lucide-react";
import type { DashboardSummary } from "../dashboard.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

<<<<<<<<< Temporary merge branch 1
=========
export const formatVNDShort = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}T`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return new Intl.NumberFormat("vi-VN").format(value);
};

export const formatVNDFull = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
>>>>>>>>> Temporary merge branch 2

const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color = "#fff", opacity = 0.5 }: { data: number[]; color?: string; opacity?: number }) {
  if (!data || data.length < 2) return null;
  const W = 72,
    H = 20;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 2) - 1,
  }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cpx = (pts[i].x + pts[i + 1].x) / 2;
    d += ` C ${cpx} ${pts[i].y}, ${cpx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  const area = `${d} L ${W} ${H} L 0 ${H} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={opacity * 0.5} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg${color.replace("#", "")})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeOpacity={opacity} strokeLinecap="round" />
    </svg>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  subLabel?: string;
  change?: number;
  icon: React.ReactNode;
  iconCls: string;
  alert?: { label: string; count: number } | null;
  primary?: boolean;
  sparkline?: number[];
}

function StatCard({ label, value, subLabel, change, icon, iconCls, alert, primary, sparkline }: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  if (primary) {
    return (
      <div className="bg-accent rounded-xl px-3.5 py-3 flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[80px]">
        {sparkline && (
          <div className="absolute bottom-0 right-1 opacity-40 pointer-events-none">
            <Sparkline data={sparkline} color="#fff" opacity={0.6} />
          </div>
        )}
        <div className="flex items-center justify-between relative">
          <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-white">{icon}</div>
          {change !== undefined && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/20 text-white">
              <TrendIcon className="w-2.5 h-2.5" />
              {Math.abs(change)}%
            </span>
          )}
        </div>
        <div className="mt-1 relative">
          <p className="text-base font-bold text-white leading-tight tracking-tight">{value}</p>
          <p className="text-[11px] text-white/70 mt-0.5">{label}</p>
        </div>
        {alert && alert.count > 0 && (
          <div className="flex items-center gap-1 bg-white/15 rounded px-1.5 py-0.5 mt-1">
            <Bot className="w-2.5 h-2.5 text-white shrink-0" />
            <span className="text-[10px] text-white font-medium truncate">
              {alert.count} {alert.label}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 px-3.5 py-3 flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[80px]">
      {sparkline && sparkline.length >= 2 && (
        <div className="absolute bottom-0 right-1 opacity-25 pointer-events-none">
          <Sparkline data={sparkline} color="#4979e4" opacity={0.9} />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${iconCls}`}>{icon}</div>
        {change !== undefined && (
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
            <TrendIcon className="w-2.5 h-2.5" />
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="mt-1 relative">
        <p className="text-base font-bold text-slate-900 leading-tight tracking-tight">{value}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
        {subLabel && <p className="text-[10px] text-slate-400">{subLabel}</p>}
      </div>
      {alert && alert.count > 0 && (
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 mt-1">
          <Bot className="w-2.5 h-2.5 text-amber-500 shrink-0" />
          <span className="text-[10px] text-amber-700 font-medium truncate">
            {alert.count} {alert.label}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  const cards: StatCardProps[] = [
    {
      label: "Doanh thu kỳ này",
      value: formatVNDShort(summary.revenue.total),
      change: summary.revenue.change,
      icon: <span className="text-xs font-bold">₫</span>,
      iconCls: "",
      primary: true,
      sparkline: summary.revenue.sparkline,
    },
    {
      label: "Đơn hàng",
      value: formatNumber(summary.orders.total),
      change: summary.orders.change,
      icon: <ShoppingCart className="w-3 h-3" />,
      iconCls: "bg-accent/10 text-accent",
      alert: summary.orders.pendingChatbot > 0 ? { label: "chatbot chờ", count: summary.orders.pendingChatbot } : null,
      sparkline: summary.orders.sparkline,
    },
    {
      label: "Khách hàng",
      value: formatNumber(summary.customers.total),
      subLabel: `+${formatNumber(summary.customers.newThisPeriod)} mới`,
      change: summary.customers.change,
      icon: <Users className="w-3 h-3" />,
      iconCls: "bg-emerald-50 text-emerald-600",
      sparkline: summary.customers.sparkline,
    },
    {
      label: "Biến thể SP",
      value: formatNumber(summary.products.totalActive),
      icon: <Package className="w-3 h-3" />,
      iconCls: "bg-orange-50 text-orange-600",
      alert: summary.products.lowStock + summary.products.outOfStock > 0 ? { label: "sắp/hết hàng", count: summary.products.lowStock + summary.products.outOfStock } : null,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
