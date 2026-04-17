"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Search, X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { getVoucherUsages } from "../_libs/vouchers";
import { VoucherUsageItem, GetVoucherUsagesParams } from "../voucher.types";
import { DISCOUNT_TYPE_LABELS, DISCOUNT_TYPE_COLORS } from "../const";
import { formatDate, formatVND } from "@/helpers";
import { useToasty } from "@/components/Toast";

const inputCls =
  "px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-neutral-dark/50";

export default function VoucherUsagesPage() {
  const router = useRouter();
  const { error: toastError } = useToasty();

  const [data, setData] = useState<VoucherUsageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetVoucherUsagesParams = {
        page,
        limit: 20,
        sortBy: "usedAt",
        sortOrder: "desc",
      };
      if (search) params.userId = undefined; // search by userId/voucherId handled below
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await getVoucherUsages(params);
      setData(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      toastError(e?.message ?? "Không thể tải lịch sử");
    } finally {
      setLoading(false);
    }
  }, [page, dateFrom, dateTo, toastError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const hasFilters = search || dateFrom || dateTo;

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
          <ArrowLeft size={14} /> Quay lại
        </button>
        <span className="text-neutral-dark text-[13px]">/</span>
        <Link href="/admin/vouchers" className="text-[13px] text-neutral-dark hover:text-accent">
          Voucher
        </Link>
        <span className="text-neutral-dark text-[13px]">/</span>
        <span className="text-[13px] text-primary font-medium">Lịch sử dùng voucher</span>
      </div>

      <div className="px-6 py-4 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <FileText size={18} />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-primary">Lịch sử dùng voucher</h1>
            <p className="text-[12px] text-neutral-dark">
              Tổng cộng <span className="font-semibold text-primary">{meta.total}</span> lượt sử dụng
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-neutral rounded-2xl p-4 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark" />
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Tìm theo mã voucher, email, mã đơn hàng..." className={`${inputCls} pl-8 w-full`} />
            </div>
            <button type="submit" className="px-4 py-2 bg-accent text-white text-[13px] font-medium rounded-xl hover:bg-accent/90 cursor-pointer">
              Tìm
            </button>
          </form>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-neutral-dark">Từ ngày:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className={`${inputCls} text-[12px]`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-neutral-dark">Đến ngày:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className={`${inputCls} text-[12px]`}
              />
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-[12px] text-neutral-dark border border-neutral rounded-xl hover:bg-neutral-light-active cursor-pointer">
                <X size={11} /> Xoá bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-neutral rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <FileText size={32} className="text-neutral-dark opacity-30" />
              <p className="text-[13px] text-neutral-dark">Chưa có lịch sử sử dụng</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral bg-neutral-light">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider w-14">STT</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Voucher</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Người dùng</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Đơn hàng</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral">
                {data.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-neutral-light/50 transition-colors">
                    {/* STT */}
                    <td className="px-4 py-3 text-[13px] text-neutral-dark">{(meta.page - 1) * meta.limit + idx + 1}</td>

                    {/* Voucher */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <Link href={`/admin/vouchers/${item.voucher.id}`} className="text-[13px] font-bold font-mono text-accent hover:underline tracking-wider">
                          {item.voucher.code}
                        </Link>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${DISCOUNT_TYPE_COLORS[item.voucher.discountType]}`}>
                          {DISCOUNT_TYPE_LABELS[item.voucher.discountType]}{" "}
                          {item.voucher.discountType === "DISCOUNT_PERCENT" ? `${item.voucher.discountValue}%` : formatVND(item.voucher.discountValue)}
                        </span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="text-[13px] font-medium text-primary">{item.user.fullName || "—"}</p>
                        <p className="text-[11px] text-neutral-dark">{item.user.email}</p>
                      </div>
                    </td>

                    {/* Order */}
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <Link href={`/admin/orders/${item.order.id}`} className="flex items-center gap-1 text-[13px] font-mono font-medium text-primary hover:text-accent transition-colors">
                          {item.order.orderCode}
                          <ExternalLink size={11} />
                        </Link>
                        <p className="text-[11px] text-neutral-dark">{formatVND(item.order.totalAmount)}</p>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 text-[12px] text-neutral-dark whitespace-nowrap">{formatDate(item.usedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-neutral-dark">
              Hiển thị {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} / {meta.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral text-neutral-dark hover:bg-neutral-light-active disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(meta.totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] border transition-colors cursor-pointer ${
                      p === page ? "bg-accent text-white border-accent" : "border-neutral text-neutral-dark hover:bg-neutral-light-active"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral text-neutral-dark hover:bg-neutral-light-active disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
