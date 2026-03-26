"use client";

import Link from "next/link";
import { Bot, ArrowUpRight } from "lucide-react";
import type { RecentOrder } from "../dashboard.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

const formatDate = (iso: string) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

// ─── Status Badge ─────────────────────────────────────────────────────────────

const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  REQUEST_PENDING: { label: "Chatbot", cls: "bg-purple-50 text-purple-600 border-purple-100" },
  PENDING: { label: "Chờ xác nhận", cls: "bg-amber-50  text-amber-600  border-amber-100" },
  PROCESSING: { label: "Xử lý", cls: "bg-blue-50   text-blue-600   border-blue-100" },
  SHIPPED: { label: "Đang giao", cls: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  DELIVERED: { label: "Đã giao", cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  CANCELLED: { label: "Đã hủy", cls: "bg-red-50    text-red-500    border-red-100" },
};

const PAYMENT_STATUS: Record<string, { label: string; cls: string }> = {
  UNPAID: { label: "Chưa TT", cls: "text-slate-500" },
  PAID: { label: "Đã TT", cls: "text-emerald-600 font-semibold" },
  REFUNDED: { label: "Hoàn TT", cls: "text-orange-500" },
};

function OrderStatusBadge({ status }: { status: string }) {
  const cfg = ORDER_STATUS[status] ?? { label: status, cls: "bg-slate-50 text-slate-500 border-slate-100" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cfg.cls}`}>{cfg.label}</span>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface RecentOrdersTableProps {
  orders: RecentOrder[];
  title?: string;
  emptyMessage?: string;
}

export function RecentOrdersTable({ orders, title = "Đơn hàng gần đây", emptyMessage = "Chưa có đơn hàng nào" }: RecentOrdersTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <Link href="/admin/orders" className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1">
          Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table */}
      {orders.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Mã đơn</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Khách hàng</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Trạng thái</th>
                <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Thanh toán</th>
                <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Tổng tiền</th>
                <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order) => {
                const payment = PAYMENT_STATUS[order.paymentStatus] ?? { label: order.paymentStatus, cls: "text-slate-400" };
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {order.isChatbotRequest && (
                          <span title="Đơn từ chatbot">
                            <Bot className="w-3.5 h-3.5 text-accent/50 shrink-0" />
                          </span>
                        )}
                        <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs text-accent hover:text-accent/80 font-semibold group-hover:underline">
                          #{order.orderCode}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-slate-800 text-xs leading-tight">{order.customerName}</p>
                        <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[160px]">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`text-xs ${payment.cls}`}>{payment.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-semibold text-slate-900 text-xs">{formatVND(order.totalAmount)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-slate-400">{formatDate(order.orderDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
