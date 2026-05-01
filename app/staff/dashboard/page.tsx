"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useAdminHref } from "@/hooks/useAdminHref";
import { getDashboard } from "@/(admin)/admin/dashboard/_libs/dashboard";
import { PeriodSelector } from "@/(admin)/admin/dashboard/components/PeriodSelector";
import { RecentOrdersTable } from "@/(admin)/admin/dashboard/components/RecentOrdersTable";
import { OrderStatusChart } from "@/(admin)/admin/dashboard/components/OrderStatusChart";
import { TopProducts } from "@/(admin)/admin/dashboard/components/TopProducts";
import type { DashboardPeriod, DashboardData } from "@/(admin)/admin/dashboard/dashboard.types";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Package,
  AlertTriangle,
  BarChart3,
  Users,
  RefreshCw,
  ArrowUpRight,
  Megaphone,
  Star,
  MessageSquare,
  CreditCard,
  Wallet,
  FileText,
  Bell,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtVND(v: number) {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}T`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toLocaleString("vi-VN");
}

function fmtNum(v: number) {
  return v.toLocaleString("vi-VN");
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-neutral border border-neutral" />
        ))}
      </div>
      <div className="h-48 rounded-xl bg-neutral border border-neutral" />
      <div className="h-64 rounded-xl bg-neutral border border-neutral" />
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  href,
  urgent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: "blue" | "amber" | "emerald" | "red" | "purple" | "neutral";
  href?: string;
  urgent?: boolean;
}) {
  const colorMap = {
    blue: { icon: "bg-accent/10 text-accent", border: urgent ? "border-accent/40" : "border-neutral" },
    amber: { icon: "bg-amber-50 text-amber-500", border: urgent ? "border-amber-300" : "border-neutral" },
    emerald: { icon: "bg-emerald-50 text-emerald-600", border: urgent ? "border-emerald-300" : "border-neutral" },
    red: { icon: "bg-promotion-light text-promotion", border: urgent ? "border-promotion/40" : "border-neutral" },
    purple: { icon: "bg-purple-50 text-purple-600", border: urgent ? "border-purple-300" : "border-neutral" },
    neutral: { icon: "bg-neutral text-neutral-dark", border: "border-neutral" },
  };
  const c = colorMap[color];

  const inner = (
    <div
      className={`bg-neutral-light rounded-xl border ${c.border} px-4 py-3.5 flex flex-col gap-2 h-full transition-all
      ${href ? "hover:shadow-sm hover:-translate-y-0.5 cursor-pointer" : ""}
      ${urgent ? "shadow-sm" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.icon}`}>
          <Icon size={16} />
        </div>
        {urgent && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-promotion text-white animate-pulse">CẦN XỬ LÝ</span>}
        {href && !urgent && <ArrowUpRight size={13} className="text-neutral-dark mt-0.5" />}
      </div>
      <div>
        <p className="text-[20px] font-bold text-primary leading-none">{value}</p>
        <p className="text-[12px] text-neutral-dark mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-neutral-dark mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  if (href)
    return (
      <Link href={href} className="block h-full">
        {inner}
      </Link>
    );
  return inner;
}

// ── Greeting ──────────────────────────────────────────────────────────────────

function Greeting({ name, role }: { name: string; role: string }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  const roleLabel: Record<string, string> = {
    SALES: "Nhân viên bán hàng",
    MARKETING: "Nhân viên Marketing",
    SUPPORT: "Nhân viên CSKH",
    ACCOUNTING: "Kế toán",
  };

  return (
    <div>
      <p className="text-[13px] text-neutral-dark">{greet},</p>
      <h1 className="text-[20px] font-bold text-primary leading-tight">{name}</h1>
      <p className="text-[11px] text-neutral-dark mt-0.5">{roleLabel[role] ?? role}</p>
    </div>
  );
}

// ── SALES Dashboard ───────────────────────────────────────────────────────────

function SalesDashboard({ data, period, href }: { data: DashboardData; period: DashboardPeriod; href: (p: string) => string }) {
  const { summary, orderStatusBreakdown, recentOrders } = data;

  const pending = orderStatusBreakdown.find((s) => s.status === "PENDING")?.count ?? 0;
  const processing = orderStatusBreakdown.find((s) => s.status === "PROCESSING")?.count ?? 0;
  const delivered = orderStatusBreakdown.find((s) => s.status === "DELIVERED")?.count ?? 0;
  const cancelled = orderStatusBreakdown.find((s) => s.status === "CANCELLED")?.count ?? 0;
  const chatbot = orderStatusBreakdown.find((s) => s.status === "REQUEST_PENDING")?.count ?? 0;

  return (
    <div className="space-y-3">
      {/* Urgent banner */}
      {pending + chatbot > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <p className="text-[13px] text-amber-800 flex-1">
            <strong>{pending + chatbot} đơn</strong> đang chờ xác nhận — cần xử lý sớm
          </p>
          <Link href={href("/orders?status=PENDING")} className="text-[12px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1">
            Xử lý ngay <ArrowUpRight size={12} />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Đơn chờ xác nhận" value={pending + chatbot} icon={Clock} color="amber" href={href("/orders?status=PENDING")} urgent={pending + chatbot > 0} />
        <StatCard label="Đang xử lý" value={processing} icon={ShoppingCart} color="blue" href={href("/orders?status=PROCESSING")} />
        <StatCard label="Đã giao thành công" value={delivered} sub={period === "today" ? "hôm nay" : period === "week" ? "7 ngày qua" : undefined} icon={CheckCircle2} color="emerald" />
        <StatCard label="Đã hủy" value={cancelled} icon={XCircle} color="red" />
      </div>

      {/* Revenue + orders row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-1">
          <OrderStatusChart data={orderStatusBreakdown} />
        </div>
        <div className="lg:col-span-2 bg-neutral-light border border-neutral rounded-xl px-4 py-3">
          <p className="text-[13px] font-semibold text-primary mb-3">Tổng quan kỳ này</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-neutral-light-active">
              <p className="text-[11px] text-neutral-dark">Doanh thu</p>
              <p className="text-[18px] font-bold text-primary mt-0.5">{fmtVND(summary.revenue.total)}</p>
              <p className={`text-[11px] mt-0.5 flex items-center gap-0.5 ${summary.revenue.change >= 0 ? "text-emerald-600" : "text-promotion"}`}>
                <TrendingUp size={10} />
                {summary.revenue.change >= 0 ? "+" : ""}
                {summary.revenue.change}% so kỳ trước
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-light-active">
              <p className="text-[11px] text-neutral-dark">Tổng đơn hàng</p>
              <p className="text-[18px] font-bold text-primary mt-0.5">{fmtNum(summary.orders.total)}</p>
              <p className={`text-[11px] mt-0.5 flex items-center gap-0.5 ${summary.orders.change >= 0 ? "text-emerald-600" : "text-promotion"}`}>
                <TrendingUp size={10} />
                {summary.orders.change >= 0 ? "+" : ""}
                {summary.orders.change}% so kỳ trước
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-light-active">
              <p className="text-[11px] text-neutral-dark">Khách hàng mới</p>
              <p className="text-[18px] font-bold text-primary mt-0.5">{fmtNum(summary.customers.newThisPeriod)}</p>
              <p className="text-[11px] text-neutral-dark mt-0.5">Tổng: {fmtNum(summary.customers.total)}</p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-light-active">
              <p className="text-[11px] text-neutral-dark">Tồn kho cảnh báo</p>
              <p className={`text-[18px] font-bold mt-0.5 ${summary.products.outOfStock > 0 ? "text-promotion" : summary.products.lowStock > 0 ? "text-amber-500" : "text-primary"}`}>
                {summary.products.outOfStock + summary.products.lowStock}
              </p>
              <p className="text-[11px] text-neutral-dark mt-0.5">
                {summary.products.outOfStock} hết · {summary.products.lowStock} sắp hết
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <RecentOrdersTable orders={recentOrders} title="Đơn hàng cần xử lý" href={href} user={null} />
    </div>
  );
}

// ── MARKETING Dashboard ───────────────────────────────────────────────────────

function MarketingDashboard({ data, href }: { data: DashboardData; href: (p: string) => string }) {
  const { summary, topProducts } = data;

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Doanh thu kỳ này"
          value={fmtVND(summary.revenue.total)}
          icon={TrendingUp}
          color="blue"
          sub={`${summary.revenue.change >= 0 ? "+" : ""}${summary.revenue.change}% so kỳ trước`}
        />
        <StatCard label="Tổng đơn hàng" value={fmtNum(summary.orders.total)} icon={ShoppingCart} color="emerald" />
        <StatCard label="Khách hàng mới" value={fmtNum(summary.customers.newThisPeriod)} icon={Users} color="purple" sub={`Tổng: ${fmtNum(summary.customers.total)}`} />
        <StatCard label="Sản phẩm hết hàng" value={summary.products.outOfStock} icon={AlertTriangle} color="red" urgent={summary.products.outOfStock > 0} />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Bài viết Blog", icon: FileText, href: href("/blogs"), desc: "Tạo & quản lý content" },
          { label: "Chiến dịch", icon: Megaphone, href: href("/campaigns"), desc: "Quản lý chiến dịch" },
          { label: "Voucher", icon: CreditCard, href: href("/vouchers"), desc: "Mã giảm giá" },
          { label: "Media", icon: Package, href: href("/media"), desc: "Banner & slider" },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="bg-neutral-light border border-neutral rounded-xl px-4 py-3 hover:shadow-sm hover:-translate-y-0.5 transition-all group">
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-2 group-hover:bg-accent group-hover:text-white transition-all">
              <item.icon size={16} />
            </div>
            <p className="text-[13px] font-semibold text-primary">{item.label}</p>
            <p className="text-[11px] text-neutral-dark mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Top products */}
      <TopProducts products={topProducts} />
    </div>
  );
}

// ── SUPPORT Dashboard ─────────────────────────────────────────────────────────

function SupportDashboard({ data, href }: { data: DashboardData; href: (p: string) => string }) {
  const { summary, orderStatusBreakdown, recentOrders } = data;

  const pending = orderStatusBreakdown.find((s) => s.status === "PENDING")?.count ?? 0;
  const cancelled = orderStatusBreakdown.find((s) => s.status === "CANCELLED")?.count ?? 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Đơn chờ xác nhận" value={pending} icon={Clock} color="amber" href={href("/orders?status=PENDING")} urgent={pending > 0} />
        <StatCard label="Đơn đã hủy" value={cancelled} icon={XCircle} color="red" href={href("/orders?status=CANCELLED")} />
        <StatCard label="Tổng khách hàng" value={fmtNum(summary.customers.total)} icon={Users} color="blue" sub={`+${summary.customers.newThisPeriod} mới`} />
        <StatCard label="Tổng đơn hàng" value={fmtNum(summary.orders.total)} icon={ShoppingCart} color="emerald" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Đánh giá sản phẩm", icon: Star, href: href("/reviews"), desc: "Duyệt & phản hồi đánh giá" },
          { label: "Bình luận", icon: MessageSquare, href: href("/comments"), desc: "Quản lý bình luận" },
          { label: "Danh sách đơn", icon: ShoppingCart, href: href("/orders"), desc: "Tra cứu & xử lý đơn" },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="bg-neutral-light border border-neutral rounded-xl px-4 py-3 hover:shadow-sm hover:-translate-y-0.5 transition-all group">
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-2 group-hover:bg-accent group-hover:text-white transition-all">
              <item.icon size={16} />
            </div>
            <p className="text-[13px] font-semibold text-primary">{item.label}</p>
            <p className="text-[11px] text-neutral-dark mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>

      <RecentOrdersTable orders={recentOrders} title="Đơn hàng gần đây" href={href} user={null} />
    </div>
  );
}

// ── ACCOUNTING Dashboard ──────────────────────────────────────────────────────

function AccountingDashboard({ data, period, href }: { data: DashboardData; period: DashboardPeriod; href: (p: string) => string }) {
  const { summary, orderStatusBreakdown } = data;

  const delivered = orderStatusBreakdown.find((s) => s.status === "DELIVERED")?.count ?? 0;
  const cancelled = orderStatusBreakdown.find((s) => s.status === "CANCELLED")?.count ?? 0;

  return (
    <div className="space-y-3">
      {/* Revenue highlight */}
      <div className="bg-accent rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[12px] text-white/70">Doanh thu kỳ này</p>
          <p className="text-[28px] font-bold text-white leading-none mt-1">{fmtVND(summary.revenue.total)}</p>
          <p className={`text-[12px] mt-1 ${summary.revenue.change >= 0 ? "text-emerald-300" : "text-red-300"}`}>
            {summary.revenue.change >= 0 ? "▲" : "▼"} {Math.abs(summary.revenue.change)}% so với kỳ trước
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <Wallet size={22} className="text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Tổng đơn hàng" value={fmtNum(summary.orders.total)} icon={ShoppingCart} color="blue" />
        <StatCard label="Đơn đã giao" value={delivered} icon={CheckCircle2} color="emerald" />
        <StatCard label="Đơn đã hủy" value={cancelled} icon={XCircle} color="red" />
        <StatCard label="Khách hàng mới" value={fmtNum(summary.customers.newThisPeriod)} icon={Users} color="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <OrderStatusChart data={orderStatusBreakdown} />
        <div className="bg-neutral-light border border-neutral rounded-xl px-4 py-3">
          <p className="text-[13px] font-semibold text-primary mb-3">Truy cập nhanh</p>
          <div className="space-y-2">
            {[
              { label: "Thống kê doanh thu", icon: BarChart3, href: href("/analytics") },
              { label: "Phương thức thanh toán", icon: CreditCard, href: href("/payment-methods") },
              { label: "Danh sách đơn hàng", icon: ShoppingCart, href: href("/orders") },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-light-active transition-colors group">
                <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                  <item.icon size={14} />
                </div>
                <span className="text-[13px] text-primary">{item.label}</span>
                <ArrowUpRight size={13} className="text-neutral-dark ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const href = useAdminHref();
  const [period, setPeriod] = useState<DashboardPeriod>("month");

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["staff-dashboard", period],
    queryFn: () => getDashboard({ period }),
    staleTime: 1000 * 60 * 2,
  });

  const dashboard = data?.data;
  const role = user?.role ?? "";

  return (
    <div className="min-h-screen bg-neutral-light-active">
      <div className="px-6 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Greeting name={user?.fullName ?? "bạn"} role={role} />
          <div className="flex items-center gap-2">
            <PeriodSelector value={period} onChange={setPeriod} />
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-neutral bg-neutral-light text-neutral-dark hover:text-accent hover:border-accent/30 transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading && <Skeleton />}

        {dashboard && (
          <>
            {role === "SALES" && <SalesDashboard data={dashboard} period={period} href={href} />}
            {role === "MARKETING" && <MarketingDashboard data={dashboard} href={href} />}
            {role === "SUPPORT" && <SupportDashboard data={dashboard} href={href} />}
            {role === "ACCOUNTING" && <AccountingDashboard data={dashboard} period={period} href={href} />}
          </>
        )}

        {!isLoading && !dashboard && (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-dark">
            <BarChart3 size={32} className="mb-2 opacity-30" />
            <p className="text-[13px]">Không thể tải dữ liệu.</p>
            <button onClick={() => refetch()} className="mt-3 text-[13px] text-accent hover:underline">
              Thử lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
