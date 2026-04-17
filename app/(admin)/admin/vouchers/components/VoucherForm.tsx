"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, AlertCircle, Plus, X, Info, Users, Search, UserCheck, Lock } from "lucide-react";
import type { VoucherDetail, CreateVoucherPayload, UpdateVoucherPayload, TargetType, UserResult } from "../voucher.types";
import { TARGET_TYPE_LABELS } from "../const";
import { SingleProductSearch, SingleSelectDropdown, type EntityOption } from "./MultiSelectDropdown";
import { fetchProductSearch, fetchAllCategories, fetchAllBrands, searchUsers } from "../_libs/vouchers";
import { utcToVNLocal, vnLocalToUtc } from "@/helpers/timezoneHelpers";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PrivateUserEntry {
  user: UserResult;
  maxUses: number;
}

export interface VoucherFormData {
  code: string;
  description: string;
  discountType: "DISCOUNT_PERCENT" | "DISCOUNT_FIXED";
  discountValue: number;
  minOrderValue: number;
  maxDiscountValue: string;
  maxUses: string;
  maxUsesPerUser: string;
  startDate: string;
  endDate: string;
  priority: number;
  isActive: boolean;
  targets: Array<{ targetType: TargetType; targetId?: string; targetName?: string }>;
  // Gán người dùng riêng tư ngay khi tạo
  privateUsers: PrivateUserEntry[];
}

export const DEFAULT_FORM: VoucherFormData = {
  code: "",
  description: "",
  discountType: "DISCOUNT_PERCENT",
  discountValue: 10,
  minOrderValue: 0,
  maxDiscountValue: "",
  maxUses: "",
  maxUsesPerUser: "",
  startDate: "",
  endDate: "",
  priority: 0,
  isActive: true,
  targets: [{ targetType: "ALL" }],
  privateUsers: [],
};

export function voucherToForm(v: VoucherDetail): VoucherFormData {
  return {
    code: v.code,
    description: v.description ?? "",
    discountType: v.discountType,
    discountValue: v.discountValue,
    minOrderValue: v.minOrderValue,
    maxDiscountValue: v.maxDiscountValue !== undefined ? String(v.maxDiscountValue) : "",
    maxUses: v.maxUses !== undefined ? String(v.maxUses) : "",
    maxUsesPerUser: v.maxUsesPerUser !== undefined ? String(v.maxUsesPerUser) : "",
    startDate: utcToVNLocal(v.startDate),
    endDate: utcToVNLocal(v.endDate),
    priority: v.priority,
    isActive: v.isActive,
    targets:
      v.targets.length > 0
        ? v.targets.map((t) => ({
            targetType: t.targetType,
            targetId: t.targetId,
            targetName: t.targetName,
          }))
        : [{ targetType: "ALL" }],
    privateUsers: [], // edit mode không load lại list này
  };
}

export function formToCreatePayload(form: VoucherFormData): CreateVoucherPayload & { userIds?: string[] } {
  const base: CreateVoucherPayload = {
    code: form.code.trim().toUpperCase(),
    description: form.description.trim() || undefined,
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    minOrderValue: Number(form.minOrderValue) || 0,
    maxDiscountValue: form.maxDiscountValue ? Number(form.maxDiscountValue) : undefined,
    maxUses: form.maxUses ? Number(form.maxUses) : undefined,
    maxUsesPerUser: form.maxUsesPerUser ? Number(form.maxUsesPerUser) : undefined,
    startDate: vnLocalToUtc(form.startDate),
    endDate: vnLocalToUtc(form.endDate),
    priority: Number(form.priority) || 0,
    isActive: form.isActive,
    targets: form.targets,
  };

  // Nếu có private users → gửi kèm userIds
  if (form.privateUsers.length > 0) {
    return {
      ...base,
      userIds: form.privateUsers.map((pu) => pu.user.id),
      // maxUsesPerUser lấy từ entry đầu tiên (hoặc field chung nếu muốn đồng nhất)
      maxUsesPerUser: (form.privateUsers[0]?.maxUses ?? Number(form.maxUsesPerUser)) || 1,
    };
  }

  return base;
}

export function formToUpdatePayload(form: VoucherFormData): UpdateVoucherPayload {
  const { code, ...rest } = formToCreatePayload(form);
  return rest;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveLabel(targetType: TargetType, targetId: string, categories: EntityOption[], brands: EntityOption[]): EntityOption | null {
  if (!targetId) return null;
  if (targetType === "CATEGORY") return categories.find((c) => c.id === targetId) ?? { id: targetId, name: targetId };
  if (targetType === "BRAND") return brands.find((b) => b.id === targetId) ?? { id: targetId, name: targetId };
  return null;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-neutral-dark/50";

function FormRow({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">
        {label}
        {required && <span className="text-promotion normal-case font-normal ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-neutral-dark/70">{hint}</p>}
    </div>
  );
}

// ── UserSearchInput — async search với debounce ───────────────────────────────

interface UserSearchInputProps {
  onSelect: (user: UserResult) => void;
  excludeIds: string[];
}

function UserSearchInput({ onSelect, excludeIds }: UserSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
        const data = await searchUsers(val.trim(), 10);
        setResults(data.filter((u) => !excludeIds.includes(u.id)));
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const pick = (user: UserResult) => {
    onSelect(user);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
        {loading && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark animate-spin" />}
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Tìm tên, email hoặc username người dùng..."
          className={`${inputCls} pl-8 pr-8`}
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-30 left-0 top-full mt-1 w-full bg-white border border-neutral rounded-xl shadow-lg overflow-hidden">
          {results.map((u) => (
            <button key={u.id} type="button" onClick={() => pick(u)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-light/70 transition-colors text-left">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 text-accent text-[12px] font-bold overflow-hidden">
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
            </button>
          ))}
        </div>
      )}

      {open && !loading && query.trim() && results.length === 0 && (
        <div className="absolute z-30 left-0 top-full mt-1 w-full bg-white border border-neutral rounded-xl shadow-lg px-4 py-3">
          <p className="text-[13px] text-neutral-dark text-center">Không tìm thấy người dùng nào</p>
        </div>
      )}
    </div>
  );
}

// ── PrivateUsersSection ───────────────────────────────────────────────────────

interface PrivateUsersSectionProps {
  users: PrivateUserEntry[];
  onChange: (users: PrivateUserEntry[]) => void;
  globalMaxUsesPerUser: string; // fallback từ field chính
}

function PrivateUsersSection({ users, onChange, globalMaxUsesPerUser }: PrivateUsersSectionProps) {
  const excludeIds = users.map((pu) => pu.user.id);

  const addUser = (user: UserResult) => {
    const defaultUses = Number(globalMaxUsesPerUser) || 1;
    onChange([...users, { user, maxUses: defaultUses }]);
  };

  const removeUser = (userId: string) => {
    onChange(users.filter((pu) => pu.user.id !== userId));
  };

  const updateMaxUses = (userId: string, val: number) => {
    onChange(users.map((pu) => (pu.user.id === userId ? { ...pu, maxUses: val } : pu)));
  };

  return (
    <div className="space-y-3">
      <UserSearchInput onSelect={addUser} excludeIds={excludeIds} />

      {users.length > 0 && (
        <div className="space-y-2 mt-2">
          {users.map((pu) => (
            <div key={pu.user.id} className="flex items-center gap-3 px-3 py-2.5 bg-accent/5 border border-accent/15 rounded-xl">
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0 text-accent text-[11px] font-bold overflow-hidden">
                {pu.user.avatarImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pu.user.avatarImage} alt={pu.user.fullName} className="w-full h-full object-cover" />
                ) : (
                  (pu.user.fullName?.[0] ?? pu.user.email[0]).toUpperCase()
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-primary truncate">{pu.user.fullName || pu.user.userName}</p>
                <p className="text-[11px] text-neutral-dark truncate">{pu.user.email}</p>
              </div>

              {/* Max uses per user */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-neutral-dark whitespace-nowrap">Lượt dùng:</span>
                <input
                  type="number"
                  min={1}
                  value={pu.maxUses}
                  onChange={(e) => updateMaxUses(pu.user.id, Math.max(1, Number(e.target.value)))}
                  className="w-14 px-2 py-1 text-[12px] border border-neutral rounded-lg text-center text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeUser(pu.user.id)}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-promotion-light hover:text-promotion cursor-pointer shrink-0 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {users.length === 0 && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-neutral-light border border-dashed border-neutral rounded-xl">
          <Users size={14} className="text-neutral-dark/50 shrink-0" />
          <p className="text-[12px] text-neutral-dark/60">Tìm và thêm người dùng bên trên. Voucher sẽ chỉ dành riêng cho những người được thêm vào.</p>
        </div>
      )}
    </div>
  );
}

// ── Main VoucherForm ──────────────────────────────────────────────────────────

interface VoucherFormProps {
  initialData: VoucherFormData;
  isEdit?: boolean;
  onSubmit: (form: VoucherFormData) => Promise<void>;
  saving: boolean;
  error: string | null;
  submitLabel?: string;
  onCancel?: () => void;
}

export function VoucherForm({ initialData, isEdit = false, onSubmit, saving, error, submitLabel = "Lưu", onCancel }: VoucherFormProps) {
  const [form, setForm] = useState<VoucherFormData>(initialData);
  const [enablePrivate, setEnablePrivate] = useState(false);

  const [categories, setCategories] = useState<EntityOption[]>([]);
  const [brands, setBrands] = useState<EntityOption[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Record<number, EntityOption | null>>(() => {
    const initial: Record<number, EntityOption | null> = {};
    initialData.targets.forEach((t, idx) => {
      if (t.targetType === "PRODUCT" && t.targetId) {
        initial[idx] = { id: t.targetId, name: t.targetName ?? t.targetId };
      }
    });
    return initial;
  });

  useEffect(() => {
    setLoadingCats(true);
    fetchAllCategories()
      .then((d) => setCategories(d))
      .finally(() => setLoadingCats(false));

    setLoadingBrands(true);
    fetchAllBrands()
      .then((d) => setBrands(d))
      .finally(() => setLoadingBrands(false));
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const set = (key: keyof VoucherFormData, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const addTarget = () =>
    setForm((prev) => ({
      ...prev,
      targets: [...prev.targets, { targetType: "ALL" as TargetType }],
    }));

  const removeTarget = (idx: number) => {
    setSelectedProducts((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
    setForm((prev) => ({
      ...prev,
      targets: prev.targets.filter((_, i) => i !== idx),
    }));
  };

  const updateTargetType = (idx: number, targetType: TargetType) => {
    setSelectedProducts((prev) => ({ ...prev, [idx]: null }));
    setForm((prev) => ({
      ...prev,
      targets: prev.targets.map((t, i) => (i === idx ? { targetType, targetId: undefined } : t)),
    }));
  };

  const updateTargetId = (idx: number, targetId: string) =>
    setForm((prev) => ({
      ...prev,
      targets: prev.targets.map((t, i) => (i === idx ? { ...t, targetId: targetId || undefined } : t)),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Nếu bật private nhưng chưa thêm ai → vẫn submit bình thường (voucher public)
    await onSubmit(form);
  };

  // Khi tắt private → clear list
  const handleTogglePrivate = (val: boolean) => {
    setEnablePrivate(val);
    if (!val) setForm((prev) => ({ ...prev, privateUsers: [] }));
  };

  const isPercent = form.discountType === "DISCOUNT_PERCENT";
  const hasPrivateUsers = form.privateUsers.length > 0;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Thông tin cơ bản ── */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Thông tin cơ bản</p>

        <div className="grid grid-cols-2 gap-4">
          <FormRow label="Mã voucher" required hint="Tự động chuyển chữ hoa">
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              disabled={isEdit}
              placeholder="SUMMER20"
              className={`${inputCls} font-mono ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
              required
            />
          </FormRow>
          <FormRow label="Ưu tiên" hint="Số lớn hơn = ưu tiên cao hơn">
            <input type="number" value={form.priority} onChange={(e) => set("priority", e.target.value)} className={inputCls} />
          </FormRow>
        </div>

        <FormRow label="Mô tả">
          <input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Nhập mô tả ngắn..." className={inputCls} />
        </FormRow>
      </div>

      {/* ── Giảm giá ── */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Giảm giá</p>

        <FormRow label="Loại giảm giá" required>
          <select value={form.discountType} onChange={(e) => set("discountType", e.target.value)} className={`${inputCls} cursor-pointer`}>
            <option value="DISCOUNT_PERCENT">Giảm theo % (phần trăm)</option>
            <option value="DISCOUNT_FIXED">Giảm tiền trực tiếp</option>
          </select>
        </FormRow>

        <div className="grid grid-cols-2 gap-4">
          <FormRow label={isPercent ? "Phần trăm giảm (%)" : "Số tiền giảm (VNĐ)"} required>
            <div className="relative">
              <input type="number" value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)} min={0} max={isPercent ? 100 : undefined} className={inputCls} required />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-neutral-dark font-medium">{isPercent ? "%" : "₫"}</span>
            </div>
          </FormRow>

          {isPercent && (
            <FormRow label="Giảm tối đa (VNĐ)" hint="Để trống = không giới hạn">
              <input type="number" value={form.maxDiscountValue} onChange={(e) => set("maxDiscountValue", e.target.value)} placeholder="200000" className={inputCls} />
            </FormRow>
          )}

          <FormRow label="Đơn tối thiểu (VNĐ)">
            <input type="number" value={form.minOrderValue} onChange={(e) => set("minOrderValue", e.target.value)} min={0} className={inputCls} />
          </FormRow>
        </div>
      </div>

      {/* ── Giới hạn sử dụng ── */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Giới hạn sử dụng</p>
        <div className="grid grid-cols-2 gap-4">
          <FormRow label="Tổng lượt dùng" hint="Để trống = không giới hạn">
            <input type="number" value={form.maxUses} onChange={(e) => set("maxUses", e.target.value)} placeholder="100" min={1} className={inputCls} />
          </FormRow>
          <FormRow label="Lượt/người dùng" hint={hasPrivateUsers ? "Áp dụng làm giá trị mặc định cho người được gán" : "Để trống = không giới hạn"}>
            <input type="number" value={form.maxUsesPerUser} onChange={(e) => set("maxUsesPerUser", e.target.value)} placeholder="1" min={1} className={inputCls} />
          </FormRow>
        </div>
      </div>

      {/* ── Thời gian ── */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Thời gian áp dụng</p>
        <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border border-accent/20 rounded-lg">
          <Info size={13} className="text-accent shrink-0" />
          <p className="text-[11px] text-accent">
            Thời gian nhập theo <strong>giờ Việt Nam (GMT+7)</strong>. Hệ thống tự chuyển đổi khi lưu.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormRow label="Ngày bắt đầu" hint="Để trống = hiệu lực ngay">
            <input type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls} />
          </FormRow>
          <FormRow label="Ngày kết thúc" hint="Để trống = không hết hạn">
            <input type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputCls} />
          </FormRow>
        </div>
      </div>

      {/* ── Phạm vi áp dụng ── */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Phạm vi áp dụng</p>
          <button type="button" onClick={addTarget} className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-accent border border-accent/30 rounded-lg hover:bg-accent/5 cursor-pointer">
            <Plus size={11} /> Thêm
          </button>
        </div>

        <div className="space-y-2">
          {form.targets.map((target, idx) => (
            <div key={idx} className="flex items-center gap-2 flex-col">
              <select value={target.targetType} onChange={(e) => updateTargetType(idx, e.target.value as TargetType)} className={`${inputCls} w-40 shrink-0 cursor-pointer`}>
                {Object.entries(TARGET_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              {target.targetType === "PRODUCT" && (
                <div className="flex-1 w-full">
                  <SingleProductSearch
                    value={selectedProducts[idx] ?? null}
                    onChange={(opt) => {
                      setSelectedProducts((prev) => ({ ...prev, [idx]: opt }));
                      updateTargetId(idx, opt?.id ?? "");
                    }}
                    onSearch={fetchProductSearch}
                    placeholder="Tìm sản phẩm..."
                  />
                </div>
              )}
              {target.targetType === "CATEGORY" && (
                <div className="flex-1 w-full">
                  <SingleSelectDropdown
                    value={resolveLabel("CATEGORY", target.targetId ?? "", categories, brands)}
                    onChange={(opt) => updateTargetId(idx, opt?.id ?? "")}
                    options={categories}
                    loading={loadingCats}
                    placeholder="Chọn danh mục..."
                  />
                </div>
              )}
              {target.targetType === "BRAND" && (
                <div className="flex-1 w-full">
                  <SingleSelectDropdown
                    value={resolveLabel("BRAND", target.targetId ?? "", categories, brands)}
                    onChange={(opt) => updateTargetId(idx, opt?.id ?? "")}
                    options={brands}
                    loading={loadingBrands}
                    placeholder="Chọn thương hiệu..."
                  />
                </div>
              )}
              {target.targetType === "ALL" && <div className="flex-1" />}

              {form.targets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTarget(idx)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-promotion-light hover:text-promotion cursor-pointer shrink-0"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Gán người dùng riêng tư (chỉ khi TẠO MỚI) ── */}
      {!isEdit && (
        <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
          {/* Toggle header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock size={14} className={enablePrivate ? "text-accent" : "text-neutral-dark/50"} />
              <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Voucher riêng tư</p>
              {hasPrivateUsers && <span className="px-2 py-0.5 bg-accent/10 text-accent text-[11px] font-semibold rounded-full">{form.privateUsers.length} người</span>}
            </div>
            <button
              type="button"
              onClick={() => handleTogglePrivate(!enablePrivate)}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${enablePrivate ? "bg-accent" : "bg-neutral-dark/20"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enablePrivate ? "translate-x-5" : "translate-x-0"}`} />{" "}
            </button>
          </div>

          {!enablePrivate ? (
            <div className="flex items-start gap-2.5 px-3 py-2.5 bg-neutral-light-active rounded-xl">
              <Info size={13} className="text-neutral-dark/50 shrink-0 mt-0.5" />
              <p className="text-[12px] text-neutral-dark/60 leading-relaxed">
                Bật để gán voucher cho người dùng cụ thể ngay khi tạo. Voucher riêng tư chỉ người được gán mới dùng được — không xuất hiện công khai.
              </p>
            </div>
          ) : (
            <PrivateUsersSection users={form.privateUsers} onChange={(users) => set("privateUsers", users)} globalMaxUsesPerUser={form.maxUsesPerUser} />
          )}
        </div>
      )}

      {/* ── Cài đặt ── */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5">
        <label className="flex items-start gap-3 cursor-pointer w-fit">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-accent cursor-pointer" />
          <div>
            <p className="text-[13px] font-medium text-primary">Đang hoạt động</p>
            <p className="text-[11px] text-neutral-dark">Voucher được hiển thị và áp dụng</p>
          </div>
        </label>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-5 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
          >
            Huỷ
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl cursor-pointer"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Đang lưu..." : hasPrivateUsers ? `${submitLabel} & Gán ${form.privateUsers.length} người dùng` : submitLabel}
        </button>
      </div>
    </form>
  );
}
