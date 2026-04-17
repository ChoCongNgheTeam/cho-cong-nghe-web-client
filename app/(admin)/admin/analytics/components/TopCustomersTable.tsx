"use client";

import Link from "next/link";
import { ArrowUpRight, Crown } from "lucide-react";
import type { TopCustomer } from "../analytics.types";
import { formatDate, formatVND } from "@/helpers";

export function TopCustomersTable({ customers }: { customers: TopCustomer[] }) {
  const maxSpent = customers[0]?.totalSpent ?? 1;

  return (
    <div className="bg-neutral-light rounded-xl border border-neutral shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral">
        <h3 className="font-semibold text-primary">Top khách hàng chi tiêu</h3>
        <Link href="/admin/users" className="text-[13px] text-accent hover:text-accent-hover font-medium flex items-center gap-0.5">
          Xem tất cả <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="py-8 text-center text-neutral-dark text-xs">Không có dữ liệu</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-neutral border-b border-neutral">
                <th className="text-left text-[10px] font-medium text-neutral-dark px-4 py-2 w-6">#</th>
                <th className="text-left text-[10px] font-medium text-neutral-dark px-3 py-2">Khách hàng</th>
                <th className="text-left text-[10px] font-medium text-neutral-dark px-3 py-2">Liên hệ</th>
                <th className="text-center text-[10px] font-medium text-neutral-dark px-3 py-2">Đơn</th>
                <th className="text-left text-[10px] font-medium text-neutral-dark px-3 py-2">Mua cuối</th>
                <th className="text-right text-[10px] font-medium text-neutral-dark px-4 py-2">Tổng chi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral">
              {customers.map((c, i) => (
                <tr key={c.userId} className="hover:bg-neutral-light-hover transition-colors group">
                  {/* Rank */}
                  <td className="px-4 py-2.5">{i === 0 ? <Crown className="w-3.5 h-3.5 text-star" /> : <span className="text-[10px] text-neutral-dark">{i + 1}</span>}</td>

                  {/* Name + avatar */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent-light flex items-center justify-center shrink-0">
                        <span className="text-[13px] font-bold text-accent">{(c.fullName ?? c.email)[0].toUpperCase()}</span>
                      </div>
                      <span className="text-[13px] font-semibold text-primary truncate max-w-[120px]">{c.fullName ?? "—"}</span>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-3 py-2.5">
                    <p className="text-[13px] text-primary truncate max-w-[160px]">{c.email}</p>
                    {c.phone && <p className="text-[13px] text-neutral-dark">{c.phone}</p>}
                  </td>

                  {/* Order count badge */}
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent-light text-accent text-[13px] font-bold">{c.totalOrders}</span>
                  </td>

                  {/* Last order date */}
                  <td className="px-3 py-2.5">
                    <span className="text-[13px] text-neutral-dark">{formatDate(c.lastOrderDate)}</span>
                  </td>

                  {/* Total spent + bar */}
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-bold text-primary">{formatVND(c.totalSpent)}</span>
                      <div className="w-16 h-1 bg-neutral rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{
                            width: `${(c.totalSpent / maxSpent) * 100}%`,
                          }}
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
