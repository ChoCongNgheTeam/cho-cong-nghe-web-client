"use client";

import Link from "next/link";
import { ArrowUpRight, Crown } from "lucide-react";
import type { TopCustomer } from "../analytics.types";

const fmtVND = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);
const fmtDate = (iso: string) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));

export function TopCustomersTable({ customers }: { customers: TopCustomer[] }) {
  const maxSpent = customers[0]?.totalSpent ?? 1;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50">
        <h3 className="text-xs font-semibold text-slate-600">Top khách hàng chi tiêu</h3>
        <Link href="/admin/customers" className="text-[10px] text-accent hover:text-accent/80 font-medium flex items-center gap-0.5">
          Xem tất cả <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">Không có dữ liệu</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-[10px] font-medium text-slate-400 px-4 py-2 w-6">#</th>
                <th className="text-left text-[10px] font-medium text-slate-400 px-3 py-2">Khách hàng</th>
                <th className="text-left text-[10px] font-medium text-slate-400 px-3 py-2">Liên hệ</th>
                <th className="text-center text-[10px] font-medium text-slate-400 px-3 py-2">Đơn</th>
                <th className="text-left text-[10px] font-medium text-slate-400 px-3 py-2">Mua cuối</th>
                <th className="text-right text-[10px] font-medium text-slate-400 px-4 py-2">Tổng chi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.map((c, i) => (
                <tr key={c.userId} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-4 py-2.5">{i === 0 ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : <span className="text-[10px] text-slate-400">{i + 1}</span>}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-accent">{(c.fullName ?? c.email)[0].toUpperCase()}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[120px]">{c.fullName ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-[10px] text-slate-500 truncate max-w-[160px]">{c.email}</p>
                    {c.phone && <p className="text-[10px] text-slate-400">{c.phone}</p>}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent/10 text-accent text-[10px] font-bold">{c.totalOrders}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[10px] text-slate-500">{fmtDate(c.lastOrderDate)}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-bold text-slate-900">{fmtVND(c.totalSpent)}</span>
                      <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${(c.totalSpent / maxSpent) * 100}%` }} />
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
