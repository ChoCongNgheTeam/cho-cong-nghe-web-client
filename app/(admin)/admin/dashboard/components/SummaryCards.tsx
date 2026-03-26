"use client";

import { TrendingUp, TrendingDown, ShoppingCart, Users, Package, Bot } from "lucide-react";
import type { DashboardSummary } from "../dashboard.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatVND = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

interface ChangeBadgeProps {
  change: number;
}

function ChangeBadge({ change }: ChangeBadgeProps) {
  const isPositive = change >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
      <Icon className="w-3 h-3" />
      {Math.abs(change)}%
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  subLabel?: string;
  change?: number;
  icon: React.ReactNode;
  accent: string;
  alert?: { label: string; count: number } | null;
  primary?: boolean;
}

function StatCard({ label, value, subLabel, change, icon, accent, alert, primary }: StatCardProps) {
  if (primary) {
    // Card doanh thu — nổi bật với bg-accent
    return (
      <div className="bg-accent rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white">{icon}</div>
          {change !== undefined && (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white`}>
              {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
          <p className="text-sm text-white/70 mt-0.5">{label}</p>
          {subLabel && <p className="text-xs text-white/50 mt-1">{subLabel}</p>}
        </div>
        {alert && alert.count > 0 && (
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
            <Bot className="w-4 h-4 text-white shrink-0" />
            <span className="text-xs text-white font-medium">
              {alert.count} {alert.label}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>{icon}</div>
        {change !== undefined && <ChangeBadge change={change} />}
      </div>

      <div>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
        {subLabel && <p className="text-xs text-slate-400 mt-1">{subLabel}</p>}
      </div>

      {alert && alert.count > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <Bot className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs text-amber-700 font-medium">
            {alert.count} {alert.label}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards: StatCardProps[] = [
    {
      label: "Doanh thu kỳ này",
      value: formatVND(summary.revenue.total),
      change: summary.revenue.change,
      icon: <span className="text-xl font-bold">₫</span>,
      accent: "",
      primary: true,
    },
    {
      label: "Đơn hàng",
      value: formatNumber(summary.orders.total),
      change: summary.orders.change,
      icon: <ShoppingCart className="w-5 h-5" />,
      accent: "bg-accent/10 text-accent",
      alert: summary.orders.pendingChatbot > 0 ? { label: "đơn chatbot chờ duyệt", count: summary.orders.pendingChatbot } : null,
    },
    {
      label: "Khách hàng",
      value: formatNumber(summary.customers.total),
      subLabel: `+${formatNumber(summary.customers.newThisPeriod)} mới kỳ này`,
      change: summary.customers.change,
      icon: <Users className="w-5 h-5" />,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Biến thể sản phẩm",
      value: formatNumber(summary.products.totalActive),
      icon: <Package className="w-5 h-5" />,
      accent: "bg-orange-50 text-orange-600",
      alert:
        summary.products.lowStock + summary.products.outOfStock > 0
          ? {
              label: `sắp/hết hàng (${summary.products.outOfStock} hết, ${summary.products.lowStock} sắp)`,
              count: summary.products.lowStock + summary.products.outOfStock,
            }
          : null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
