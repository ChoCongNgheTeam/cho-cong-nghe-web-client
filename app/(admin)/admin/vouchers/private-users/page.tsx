"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Search, X, ChevronLeft, ChevronRight, Trash2, Plus, Loader2, UserCheck } from "lucide-react";
import { getVoucherUsers, revokeVoucherUser, assignVoucherToUsers, searchUsers } from "../_libs/vouchers";
import { VoucherUserItem, GetVoucherUsersParams, UserResult } from "../voucher.types";
import { DISCOUNT_TYPE_LABELS, DISCOUNT_TYPE_COLORS } from "../const";
import { formatDate, formatVND } from "@/helpers";
import { useToasty } from "@/components/Toast";
import apiRequest from "@/lib/api";

// ── Shared style ──────────────────────────────────────────────────────────────

const inputCls =
  "px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-neutral-dark/50";

// ── Async search helpers ──────────────────────────────────────────────────────

interface VoucherSearchResult {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  isActive: boolean;
}

async function searchVouchers(q: string): Promise<VoucherSearchResult[]> {
  if (!q.trim()) return [];
  const res = await apiRequest.get<{ data: any[] }>("/vouchers/admin/all", {
    params: { search: q, limit: 10 },
  });
  return (res?.data ?? []).map((v: any) => ({
    id: v.id,
    code: v.code,
    discountType: v.discountType,
    discountValue: v.discountValue,
    isActive: v.isActive,
  }));
}

// ── AsyncSearchDropdown — tái sử dụng cho voucher + user ─────────────────────

interface AsyncSearchDropdownProps<T> {
  placeholder: string;
  value: T | null;
  onSelect: (item: T) => void;
  onClear: () => void;
  onSearch: (q: string) => Promise<T[]>;
  renderItem: (item: T) => React.ReactNode;
  renderSelected: (item: T) => React.ReactNode;
  getKey: (item: T) => string;
}

function AsyncSearchDropdown<T>({ placeholder, value, onSelect, onClear, onSearch, renderItem, renderSelected, getKey }: AsyncSearchDropdownProps<T>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!val.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await onSearch(val);
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  if (value) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1">{renderSelected(value)}</div>
        <button
          type="button"
          onClick={onClear}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-neutral text-neutral-dark hover:bg-neutral-light-active cursor-pointer transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
        {loading && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark animate-spin" />}
        <input value={query} onChange={(e) => handleChange(e.target.value)} onFocus={() => results.length > 0 && setOpen(true)} placeholder={placeholder} className={`${inputCls} pl-8 pr-8 w-full`} />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-30 left-0 top-full mt-1 w-full bg-white border border-neutral rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {results.map((item) => (
            <button
              key={getKey(item)}
              type="button"
              onClick={() => {
                onSelect(item);
                setQuery("");
                setResults([]);
                setOpen(false);
              }}
              className="w-full text-left hover:bg-neutral-light/70 transition-colors"
            >
              {renderItem(item)}
            </button>
          ))}
        </div>
      )}

      {open && !loading && query.trim() && results.length === 0 && (
        <div className="absolute z-30 left-0 top-full mt-1 w-full bg-white border border-neutral rounded-xl shadow-lg px-4 py-3">
          <p className="text-[13px] text-neutral-dark text-center">Không tìm thấy kết quả</p>
        </div>
      )}
    </div>
  );
}

// ── AssignModal ───────────────────────────────────────────────────────────────

interface AssignModalProps {
  onClose: () => void;
  onAssigned: () => void;
}

function AssignModal({ onClose, onAssigned }: AssignModalProps) {
  const { success, error: toastError } = useToasty();
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherSearchResult | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<UserResult[]>([]);
  const [maxUsesPerUser, setMaxUsesPerUser] = useState(1);
  const [saving, setSaving] = useState(false);

  const addUser = (user: UserResult) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const removeUser = (userId: string) => setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));

  const handleAssign = async () => {
    if (!selectedVoucher || selectedUsers.length === 0) return;
    setSaving(true);
    try {
      await assignVoucherToUsers({
        voucherId: selectedVoucher.id,
        userIds: selectedUsers.map((u) => u.id),
        maxUsesPerUser,
      });
      success(`Đã gán voucher cho ${selectedUsers.length} người dùng!`);
      onAssigned();
      onClose();
    } catch (e: any) {
      toastError(e?.message ?? "Không thể gán voucher");
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = selectedVoucher && selectedUsers.length > 0 && !saving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <UserCheck size={15} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-primary">Gán voucher</h2>
              <p className="text-[11px] text-neutral-dark">Chọn voucher và người dùng để gán</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-neutral-light-active cursor-pointer">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Chọn voucher */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">
              Voucher <span className="text-promotion font-normal normal-case">*</span>
            </label>
            <AsyncSearchDropdown<VoucherSearchResult>
              placeholder="Tìm mã voucher..."
              value={selectedVoucher}
              onSelect={setSelectedVoucher}
              onClear={() => setSelectedVoucher(null)}
              onSearch={searchVouchers}
              getKey={(v) => v.id}
              renderItem={(v) => (
                <div className="flex items-center gap-2.5 px-3 py-2.5">
                  <span className="font-mono font-bold text-[13px] text-accent tracking-wider">{v.code}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${DISCOUNT_TYPE_COLORS[v.discountType]}`}>{DISCOUNT_TYPE_LABELS[v.discountType]}</span>
                  {!v.isActive && <span className="text-[11px] text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md font-medium">Tạm dừng</span>}
                </div>
              )}
              renderSelected={(v) => (
                <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border border-accent/20 rounded-xl">
                  <span className="font-mono font-bold text-[13px] text-accent tracking-wider">{v.code}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${DISCOUNT_TYPE_COLORS[v.discountType]}`}>{DISCOUNT_TYPE_LABELS[v.discountType]}</span>
                </div>
              )}
            />
          </div>

          {/* Tìm + thêm user */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">
              Người dùng <span className="text-promotion font-normal normal-case">*</span>
            </label>
            <AsyncSearchDropdown<UserResult>
              placeholder="Tìm tên, email người dùng..."
              value={null} // luôn null — multi-select
              onSelect={addUser}
              onClear={() => {}}
              onSearch={(q) => searchUsers(q, 10)}
              getKey={(u) => u.id}
              renderItem={(u) => (
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0 text-accent text-[11px] font-bold overflow-hidden">
                    {u.avatarImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatarImage} alt={u.fullName} className="w-full h-full object-cover" />
                    ) : (
                      (u.fullName?.[0] ?? u.email[0]).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-primary truncate">{u.fullName || u.userName}</p>
                    <p className="text-[11px] text-neutral-dark truncate">{u.email}</p>
                  </div>
                  {selectedUsers.find((su) => su.id === u.id) && <span className="text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full font-medium shrink-0">Đã chọn</span>}
                </div>
              )}
              renderSelected={() => <></>}
            />

            {/* Danh sách đã chọn */}
            {selectedUsers.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {selectedUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-3 py-2 bg-accent/5 border border-accent/15 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center shrink-0 text-accent text-[10px] font-bold overflow-hidden">
                      {u.avatarImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatarImage} alt={u.fullName} className="w-full h-full object-cover" />
                      ) : (
                        (u.fullName?.[0] ?? u.email[0]).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-primary truncate">{u.fullName || u.userName}</p>
                      <p className="text-[10px] text-neutral-dark truncate">{u.email}</p>
                    </div>
                    <button type="button" onClick={() => removeUser(u.id)} className="w-5 h-5 flex items-center justify-center rounded text-neutral-dark hover:text-promotion cursor-pointer">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lượt dùng mỗi người */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Lượt dùng / người</label>
            <div className="flex items-center gap-2">
              <input type="number" min={1} value={maxUsesPerUser} onChange={(e) => setMaxUsesPerUser(Math.max(1, Number(e.target.value)))} className={`${inputCls} w-24`} />
              <p className="text-[12px] text-neutral-dark">lượt mỗi người dùng</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-neutral bg-neutral-light/50">
          <button onClick={onClose} className="px-4 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
            Huỷ
          </button>
          <button
            onClick={handleAssign}
            disabled={!canSubmit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white text-[13px] font-semibold rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            {saving ? "Đang gán..." : `Gán voucher${selectedUsers.length > 0 ? ` cho ${selectedUsers.length} người` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function VoucherPrivateUsersPage() {
  const router = useRouter();
  const { success, error: toastError } = useToasty();

  const [data, setData] = useState<VoucherUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);

  // Filter state — dùng search object thay vì UUID raw
  const [filterVoucher, setFilterVoucher] = useState<VoucherSearchResult | null>(null);
  const [filterUser, setFilterUser] = useState<UserResult | null>(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetVoucherUsersParams = {
        page,
        limit: 20,
        voucherId: filterVoucher?.id,
        userId: filterUser?.id,
      };
      const res = await getVoucherUsers(params);
      setData(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      toastError(e?.message ?? "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [page, filterVoucher, filterUser, toastError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRevoke = async (item: VoucherUserItem) => {
    if (!confirm(`Thu hồi voucher "${item.voucher.code}" của ${item.user.fullName || item.user.email}?`)) return;
    setRevokingId(item.id);
    try {
      await revokeVoucherUser(item.voucher.id, item.user.id);
      success("Đã thu hồi voucher!");
      fetchData();
    } catch (e: any) {
      toastError(e?.message ?? "Không thể thu hồi");
    } finally {
      setRevokingId(null);
    }
  };

  const clearFilters = () => {
    setFilterVoucher(null);
    setFilterUser(null);
    setPage(1);
  };

  const hasFilters = filterVoucher || filterUser;

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
        <span className="text-[13px] text-primary font-medium">Voucher riêng tư</span>
      </div>

      <div className="px-6 py-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Users size={18} />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-primary">Voucher riêng tư</h1>
              <p className="text-[12px] text-neutral-dark">
                Tổng cộng <span className="font-semibold text-primary">{meta.total}</span> assignment
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-[13px] font-semibold rounded-xl hover:bg-accent/90 cursor-pointer transition-colors"
          >
            <Plus size={14} /> Gán voucher
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white border border-neutral rounded-2xl p-4 space-y-3">
          <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Lọc theo</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Filter voucher */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-neutral-dark">Voucher</label>
              <AsyncSearchDropdown<VoucherSearchResult>
                placeholder="Tìm mã voucher..."
                value={filterVoucher}
                onSelect={(v) => {
                  setFilterVoucher(v);
                  setPage(1);
                }}
                onClear={() => {
                  setFilterVoucher(null);
                  setPage(1);
                }}
                onSearch={searchVouchers}
                getKey={(v) => v.id}
                renderItem={(v) => (
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <span className="font-mono font-bold text-[13px] text-accent">{v.code}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${DISCOUNT_TYPE_COLORS[v.discountType]}`}>{DISCOUNT_TYPE_LABELS[v.discountType]}</span>
                  </div>
                )}
                renderSelected={(v) => (
                  <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border border-accent/20 rounded-xl">
                    <span className="font-mono font-bold text-[12px] text-accent">{v.code}</span>
                  </div>
                )}
              />
            </div>

            {/* Filter user */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-neutral-dark">Người dùng</label>
              <AsyncSearchDropdown<UserResult>
                placeholder="Tìm tên hoặc email..."
                value={filterUser}
                onSelect={(u) => {
                  setFilterUser(u);
                  setPage(1);
                }}
                onClear={() => {
                  setFilterUser(null);
                  setPage(1);
                }}
                onSearch={(q) => searchUsers(q, 10)}
                getKey={(u) => u.id}
                renderItem={(u) => (
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[11px] font-bold overflow-hidden shrink-0">
                      {u.avatarImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatarImage} alt={u.fullName} className="w-full h-full object-cover" />
                      ) : (
                        (u.fullName?.[0] ?? u.email[0]).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-primary truncate">{u.fullName || u.userName}</p>
                      <p className="text-[11px] text-neutral-dark truncate">{u.email}</p>
                    </div>
                  </div>
                )}
                renderSelected={(u) => (
                  <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border border-accent/20 rounded-xl">
                    <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center text-accent text-[10px] font-bold overflow-hidden shrink-0">
                      {u.avatarImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatarImage} alt={u.fullName} className="w-full h-full object-cover" />
                      ) : (
                        (u.fullName?.[0] ?? u.email[0]).toUpperCase()
                      )}
                    </div>
                    <span className="text-[12px] font-medium text-primary truncate">{u.fullName || u.email}</span>
                  </div>
                )}
              />
            </div>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-1.5 text-[12px] text-neutral-dark border border-neutral rounded-xl hover:bg-neutral-light-active cursor-pointer">
              <X size={11} /> Xoá bộ lọc
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-neutral rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Users size={32} className="text-neutral-dark opacity-30" />
              <p className="text-[13px] text-neutral-dark">Chưa có assignment nào</p>
              <button
                onClick={() => setShowAssignModal(true)}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent text-[13px] font-medium rounded-lg hover:bg-accent/20 cursor-pointer transition-colors"
              >
                <Plus size={13} /> Gán voucher ngay
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral bg-neutral-light">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider w-14">STT</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Voucher</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Người dùng</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Lượt dùng</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Trạng thái voucher</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Ngày gán</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral">
                {data.map((item, idx) => {
                  const usagePercent = Math.min(100, (item.usedCount / item.maxUses) * 100);
                  return (
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
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[11px] font-bold shrink-0">
                            {(item.user.fullName?.[0] ?? item.user.email[0]).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-primary truncate">{item.user.fullName || "—"}</p>
                            <p className="text-[11px] text-neutral-dark truncate">{item.user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Lượt dùng */}
                      <td className="px-4 py-3">
                        <div className="text-center">
                          <span className="text-[13px] font-semibold text-primary">{item.usedCount}</span>
                          <span className="text-[11px] text-neutral-dark">/{item.maxUses}</span>
                          <div className="w-16 h-1 bg-neutral-light-active rounded-full mx-auto mt-1">
                            <div className={`h-full rounded-full transition-all ${usagePercent >= 100 ? "bg-promotion" : "bg-accent"}`} style={{ width: `${usagePercent}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Trạng thái voucher */}
                      <td className="px-4 py-3">
                        {item.voucher.isActive ? (
                          item.voucher.endDate && new Date(item.voucher.endDate) < new Date() ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold text-neutral-dark bg-neutral-light-active">Hết hạn</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-600 bg-emerald-50">Đang hoạt động</span>
                          )
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold text-orange-500 bg-orange-50">Tạm dừng</span>
                        )}
                      </td>

                      {/* Ngày gán */}
                      <td className="px-4 py-3 text-[12px] text-neutral-dark whitespace-nowrap">{formatDate(item.createdAt)}</td>

                      {/* Hành động */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleRevoke(item)}
                            disabled={revokingId === item.id}
                            title="Thu hồi"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-promotion-light hover:text-promotion transition-colors cursor-pointer disabled:opacity-40"
                          >
                            {revokingId === item.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Assign Modal */}
      {showAssignModal && <AssignModal onClose={() => setShowAssignModal(false)} onAssigned={fetchData} />}
    </div>
  );
}
