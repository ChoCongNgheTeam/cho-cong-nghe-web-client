"use client";

import Link from "next/link";
import { ArrowUpRight, Crown } from "lucide-react";
import type { TopCustomer } from "../analytics.types";

const formatVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));

interface TopCustomersTableProps {
  customers: TopCustomer[];
}

export function TopCustomersTable({ customers }: TopCustomersTableProps) {
  const maxSpent = customers[0]?.totalSpent ?? 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <h3 className="text-sm font-semibold text-slate-700">Top khách hàng chi tiêu</h3>
        <Link
          href="/admin/customers"
          className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1"
        >
          Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">Không có dữ liệu</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3 w-8">#</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Khách hàng</th>
                <th className="text-center text-xs font-medium text-slate-400 px-4 py-3">Đơn hàng</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Mua lần cuối</th>
                <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Tổng chi tiêu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.map((c, i) => (
                <tr key={c.userId} className="hover:bg-slate-50/50 transition-colors group">
                  {/* Rank */}
                  <td className="px-5 py-3.5">
                    {i === 0 ? (
                      <Crown className="w-4 h-4 text-amber-400" />
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">{i + 1}</span>
                    )}
                  </td>

                  {/* Customer info */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar initials */}
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-accent">
                          {(c.fullName ?? c.email)[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{c.fullName ?? "—"}</p>
                        <p className="text-[10px] text-slate-400 truncate">{c.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Order count */}
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold">
                      {c.totalOrders}
                    </span>
                  </td>

                  {/* Last order */}
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-slate-500">{formatDate(c.lastOrderDate)}</span>
                  </td>

                  {/* Total spent + bar */}
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-bold text-slate-900">{formatVND(c.totalSpent)}</span>
                      <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${(c.totalSpent / maxSpent) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}