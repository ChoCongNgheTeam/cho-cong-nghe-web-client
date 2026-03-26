"use client";

import Link from "next/link";
import { Bot, ChevronRight, Clock } from "lucide-react";
import type { RecentOrder } from "../dashboard.types";

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

const formatTime = (iso: string) => new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }).format(new Date(iso));

interface ChatbotPendingBannerProps {
  orders: RecentOrder[];
}

export function ChatbotPendingBanner({ orders }: ChatbotPendingBannerProps) {
  if (orders.length === 0) return null;

  return (
    <div className="bg-accent/5 border border-accent/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-accent/10 border-b border-accent/20">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-accent">{orders.length} đơn chatbot đang chờ xác nhận</p>
          <p className="text-xs text-accent/60">Vui lòng xem xét và xác nhận hoặc từ chối</p>
        </div>
        <Link href="/admin/orders?status=REQUEST_PENDING" className="text-xs font-semibold text-accent hover:text-accent/80 flex items-center gap-0.5 shrink-0">
          Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Orders list */}
      <div className="divide-y divide-accent/10">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/5 transition-colors">
            <Clock className="w-4 h-4 text-accent/30 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-accent">#{order.orderCode}</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-600 truncate">{order.customerName}</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-700 shrink-0">{formatVND(order.totalAmount)}</span>
            <span className="text-xs text-slate-400 shrink-0">{formatTime(order.orderDate)}</span>
            <Link
              href={`/admin/orders/${order.id}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer bg-accent text-white hover:opacity-90 shrink-0"
            >
              Xem
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
