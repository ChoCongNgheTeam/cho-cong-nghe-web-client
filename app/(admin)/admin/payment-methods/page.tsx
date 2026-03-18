"use client";

import { useEffect, useState, useCallback } from "react";
import { CreditCard, Plus, RefreshCw, Pencil, Loader2, X, AlertCircle, CheckCircle2, EyeOff, CheckCircle, PauseCircle } from "lucide-react";
import { Popzy } from "@/components/Modal";
import { formatDate } from "@/helpers";
import type { PaymentMethod, CreatePaymentMethodPayload, UpdatePaymentMethodPayload } from "./payment-method.types";
import { getAllPaymentMethods, createPaymentMethod, updatePaymentMethod } from "./_libs/payment-methods";
import { StatsCard } from "@/components/admin/StatsCard";

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${value ? "bg-accent" : "bg-neutral"}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

const inputCls =
  "w-full px-3 py-2 text-[13px] bg-neutral-light border border-neutral rounded-xl text-primary placeholder:text-neutral-dark/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all";

// ── Form state ────────────────────────────────────────────────────────────────
interface MethodForm {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

const EMPTY_FORM: MethodForm = { name: "", code: "", description: "", isActive: true };

function methodToForm(m: PaymentMethod): MethodForm {
  return {
    name: m.name,
    code: m.code,
    description: m.description ?? "",
    isActive: m.isActive,
  };
}

// ── Modal form ────────────────────────────────────────────────────────────────
function MethodFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  saving,
  error,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: MethodForm) => Promise<void>;
  initialData: MethodForm;
  saving: boolean;
  error: string | null;
  mode: "create" | "edit";
}) {
  const [form, setForm] = useState<MethodForm>(initialData);

  // Sync khi open lại
  useEffect(() => {
    setForm(initialData);
  }, [initialData, isOpen]);

  const set = <K extends keyof MethodForm>(k: K, v: MethodForm[K]) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Popzy
      isOpen={isOpen}
      onClose={onClose}
      footer={false}
      closeMethods={saving ? [] : ["button", "overlay", "escape"]}
      content={
        <div className="space-y-4">
          <h3 className="text-[15px] font-bold text-primary">{mode === "create" ? "Thêm phương thức thanh toán" : "Chỉnh sửa phương thức"}</h3>

          {/* Name */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider block mb-1.5">Tên *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="VD: Thanh toán khi nhận hàng" className={inputCls} />
          </div>

          {/* Code */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider block mb-1.5">Mã code *</label>
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase().replace(/\s+/g, "_"))}
              placeholder="VD: COD"
              className={`${inputCls} font-mono`}
              disabled={mode === "edit"} // code không nên đổi sau khi tạo
            />
            {mode === "edit" && <p className="text-[11px] text-neutral-dark mt-1">Code không thể thay đổi sau khi tạo</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider block mb-1.5">Mô tả</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="Mô tả ngắn (tùy chọn)" className={`${inputCls} resize-none`} />
          </div>

          {/* isActive */}
          <div className="flex items-center justify-between px-3 py-2.5 border border-neutral rounded-xl">
            <span className="text-[13px] text-primary">Kích hoạt</span>
            <Toggle value={form.isActive} onChange={(v) => set("isActive", v)} />
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[12px]">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              onClick={() => onSubmit(form)}
              disabled={saving || !form.name.trim() || !form.code.trim()}
              className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              {saving ? "Đang lưu..." : mode === "create" ? "Tạo mới" : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      }
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit modal
  const [editTarget, setEditTarget] = useState<PaymentMethod | null>(null);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchMethods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllPaymentMethods();
      setMethods(res.data);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải phương thức thanh toán");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = useCallback(async (form: MethodForm) => {
    setCreating(true);
    setCreateError(null);
    try {
      const payload: CreatePaymentMethodPayload = {
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description.trim() || undefined,
        isActive: form.isActive,
      };
      const res = await createPaymentMethod(payload);
      setMethods((prev) => [res.data, ...prev]);
      setCreateOpen(false);
    } catch (e: any) {
      setCreateError(e?.message ?? "Không thể tạo phương thức");
    } finally {
      setCreating(false);
    }
  }, []);

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = useCallback(
    async (form: MethodForm) => {
      if (!editTarget) return;
      setEditing(true);
      setEditError(null);
      try {
        const payload: UpdatePaymentMethodPayload = {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          isActive: form.isActive,
        };
        const res = await updatePaymentMethod(editTarget.id, payload);
        setMethods((prev) => prev.map((m) => (m.id === editTarget.id ? res.data : m)));
        setEditTarget(null);
      } catch (e: any) {
        setEditError(e?.message ?? "Không thể cập nhật");
      } finally {
        setEditing(false);
      }
    },
    [editTarget],
  );

  // ── Toggle active inline ───────────────────────────────────────────────────
  const handleToggleActive = useCallback(async (method: PaymentMethod) => {
    try {
      const res = await updatePaymentMethod(method.id, { isActive: !method.isActive });
      setMethods((prev) => prev.map((m) => (m.id === method.id ? res.data : m)));
    } catch (e: any) {
      setError(e?.message ?? "Không thể cập nhật trạng thái");
    }
  }, []);

  const activeCount = methods.filter((m) => m.isActive).length;

  return (
    <div className="space-y-5 p-5 bg-neutral-light min-h-full">
      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard label="Tổng" value={methods.length} sub="Phương thức đã cấu hình" icon={<CreditCard size={18} />} valueClassName="text-accent" />

        <StatsCard label="Đang hoạt động" value={activeCount} sub="Khách hàng có thể chọn" icon={<CheckCircle size={18} />} valueClassName="text-emerald-600" iconClassName="text-emerald-600" />

        <StatsCard label="Tạm dừng" value={methods.length - activeCount} sub="Đã bị vô hiệu hóa" icon={<PauseCircle size={18} />} valueClassName="text-orange-500" iconClassName="text-orange-500" />
      </div>

      {/* ── Main card ── */}
      <div className="bg-neutral-light border border-neutral rounded-xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral">
          <div>
            <h2 className="text-[14px] font-bold text-primary">Phương thức thanh toán</h2>
            <p className="text-[12px] text-neutral-dark mt-0.5">Quản lý các hình thức thanh toán cho đơn hàng</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMethods}
              disabled={loading}
              title="Làm mới"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral text-neutral-dark hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => {
                setCreateError(null);
                setCreateOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-[12px] font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={14} /> Thêm mới
            </button>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-neutral-dark">{error}</p>
            <button onClick={fetchMethods} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : methods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CreditCard size={36} className="text-neutral-dark opacity-30" />
            <p className="text-[13px] text-neutral-dark">Chưa có phương thức thanh toán nào</p>
            <button onClick={() => setCreateOpen(true)} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thêm phương thức đầu tiên
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral">
            {methods.map((method) => (
              <div key={method.id} className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-light-active/50 transition-colors">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${method.isActive ? "bg-accent/10 text-accent" : "bg-neutral-light-active text-neutral-dark"}`}>
                  <CreditCard size={18} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-primary">{method.name}</span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-neutral-light-active text-neutral-dark">{method.code}</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        method.isActive ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-500"
                      }`}
                    >
                      {method.isActive ? (
                        <>
                          <CheckCircle2 size={10} /> Hoạt động
                        </>
                      ) : (
                        <>
                          <EyeOff size={10} /> Tạm dừng
                        </>
                      )}
                    </span>
                  </div>
                  {method.description && <p className="text-[12px] text-neutral-dark mt-0.5 truncate">{method.description}</p>}
                  <p className="text-[11px] text-neutral-dark/60 mt-0.5">
                    Tạo {formatDate(method.createdAt)} · Cập nhật {formatDate(method.updatedAt)}
                  </p>
                </div>

                {/* Toggle active */}
                <Toggle value={method.isActive} onChange={() => handleToggleActive(method)} />

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setEditError(null);
                      setEditTarget(method);
                    }}
                    title="Chỉnh sửa"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors cursor-pointer"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      <MethodFormModal isOpen={createOpen} onClose={() => !creating && setCreateOpen(false)} onSubmit={handleCreate} initialData={EMPTY_FORM} saving={creating} error={createError} mode="create" />

      {/* ── Edit Modal ── */}
      <MethodFormModal
        isOpen={!!editTarget}
        onClose={() => !editing && setEditTarget(null)}
        onSubmit={handleEdit}
        initialData={editTarget ? methodToForm(editTarget) : EMPTY_FORM}
        saving={editing}
        error={editError}
        mode="edit"
      />
    </div>
  );
}
