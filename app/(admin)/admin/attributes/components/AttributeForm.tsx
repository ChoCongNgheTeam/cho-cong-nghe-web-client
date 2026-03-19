"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import type { Attribute, AttributeOption, CreateOptionPayload, UpdateOptionPayload } from "../attribute.types";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface AttributeFormData {
  code: string;
  name: string;
  isActive: boolean;
}

export const DEFAULT_FORM: AttributeFormData = {
  code: "",
  name: "",
  isActive: true,
};

export function attrToForm(attr: Attribute): AttributeFormData {
  return { code: attr.code, name: attr.name, isActive: attr.isActive };
}

export function formToCreatePayload(form: AttributeFormData) {
  return { code: form.code.trim(), name: form.name.trim(), isActive: form.isActive };
}

export function formToUpdatePayload(form: AttributeFormData) {
  return { name: form.name.trim(), isActive: form.isActive };
}

// ── Sub-components ──────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-neutral-dark/50";

function FormRow({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">
        {label} {required && <span className="text-promotion normal-case font-normal">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-neutral-dark/70">{hint}</p>}
    </div>
  );
}

// ── Option row (inline edit) ────────────────────────────────────────────────────
interface OptionRowProps {
  option: AttributeOption;
  onUpdateLabel: (optionId: string, label: string) => Promise<void>;
  onToggleActive: (optionId: string, isActive: boolean) => Promise<void>;
}

function OptionRow({ option, onUpdateLabel, onToggleActive }: OptionRowProps) {
  const [editing, setEditing] = useState(false);
  const [labelInput, setLabelInput] = useState(option.label);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (labelInput.trim() === option.label) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onUpdateLabel(option.id, labelInput.trim());
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setLabelInput(option.label);
    setEditing(false);
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${option.isActive ? "border-neutral bg-neutral-light" : "border-neutral/50 bg-neutral-light/50 opacity-60"}`}
    >
      {/* value badge */}
      <span className="text-[11px] font-mono text-neutral-dark bg-neutral-light-active px-2 py-0.5 rounded shrink-0">{option.value}</span>

      {/* label */}
      {editing ? (
        <input
          autoFocus
          value={labelInput}
          onChange={(e) => setLabelInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          className="flex-1 px-2 py-1 text-[12px] border border-accent rounded-lg focus:outline-none bg-neutral-light"
        />
      ) : (
        <span className="flex-1 text-[13px] text-primary">{option.label}</span>
      )}

      {/* actions */}
      <div className="flex items-center gap-1 shrink-0">
        {editing ? (
          <>
            <button onClick={handleSave} disabled={saving} className="w-6 h-6 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer disabled:opacity-50">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            </button>
            <button onClick={handleCancel} className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-neutral-light-active cursor-pointer">
              <X size={12} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              title="Sửa label"
              className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent cursor-pointer"
            >
              <Pencil size={11} />
            </button>
            <button
              onClick={() => onToggleActive(option.id, !option.isActive)}
              title={option.isActive ? "Tạm dừng" : "Kích hoạt"}
              className={`w-6 h-6 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${option.isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-orange-500 hover:bg-orange-50"}`}
            >
              <span className="text-[10px] font-bold">{option.isActive ? "ON" : "OFF"}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Add option form ─────────────────────────────────────────────────────────────
interface AddOptionFormProps {
  onAdd: (payload: CreateOptionPayload) => Promise<void>;
}

function AddOptionForm({ onAdd }: AddOptionFormProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!value.trim() || !label.trim()) {
      setErr("Vui lòng điền đủ value và label");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await onAdd({ value: value.trim(), label: label.trim(), isActive: true });
      setValue("");
      setLabel("");
      setOpen(false);
    } catch (e: any) {
      setErr(e?.message ?? "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-neutral rounded-xl text-[12px] text-neutral-dark hover:border-accent hover:text-accent hover:bg-accent/5 transition-all cursor-pointer"
      >
        <Plus size={13} /> Thêm option
      </button>
    );
  }

  return (
    <div className="border border-accent/30 rounded-xl p-3 space-y-2 bg-accent/5">
      {err && <p className="text-[11px] text-promotion">{err}</p>}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">
            Value <span className="text-promotion">*</span>
          </label>
          <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder="red" className={inputCls} />
          <p className="text-[10px] text-neutral-dark/60">Chỉ chữ thường, số, - _</p>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">
            Label <span className="text-promotion">*</span>
          </label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="Đỏ" className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setValue("");
            setLabel("");
            setErr(null);
          }}
          className="px-3 py-1.5 border border-neutral rounded-lg text-[12px] text-primary hover:bg-neutral-light-active cursor-pointer"
        >
          Huỷ
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-[12px] font-medium cursor-pointer disabled:opacity-60"
        >
          {saving && <Loader2 size={11} className="animate-spin" />}
          Thêm
        </button>
      </div>
    </div>
  );
}

// ── Main AttributeForm ──────────────────────────────────────────────────────────
interface AttributeFormProps {
  initialData: AttributeFormData;
  isEdit?: boolean;
  attribute?: Attribute; // for options management when editing
  onSubmit: (form: AttributeFormData) => Promise<void>;
  onAddOption?: (payload: CreateOptionPayload) => Promise<void>;
  onUpdateOption?: (optionId: string, payload: UpdateOptionPayload) => Promise<void>;
  saving: boolean;
  error: string | null;
  submitLabel?: string;
  onCancel?: () => void;
}

export function AttributeForm({ initialData, isEdit = false, attribute, onSubmit, onAddOption, onUpdateOption, saving, error, submitLabel = "Lưu", onCancel }: AttributeFormProps) {
  const [form, setForm] = useState<AttributeFormData>(initialData);

  const set = (key: keyof AttributeFormData, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const handleUpdateLabel = async (optionId: string, label: string) => {
    await onUpdateOption?.(optionId, { label });
  };

  const handleToggleOptionActive = async (optionId: string, isActive: boolean) => {
    await onUpdateOption?.(optionId, { isActive });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Section: Thông tin cơ bản */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Thông tin cơ bản</p>

        <div className="grid grid-cols-2 gap-4">
          <FormRow label="Code định danh" required hint="Chỉ chữ thường, số, - _ (vd: color, ram_size)">
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              disabled={isEdit}
              placeholder="color"
              className={`${inputCls} ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
              required
            />
          </FormRow>

          <FormRow label="Tên hiển thị" required>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Màu sắc" className={inputCls} required />
          </FormRow>
        </div>

        <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral hover:bg-neutral-light-active transition-colors cursor-pointer w-fit">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-accent cursor-pointer" />
          <div>
            <p className="text-[13px] font-medium text-primary">Đang hoạt động</p>
            <p className="text-[11px] text-neutral-dark">Thuộc tính này được hiển thị và sử dụng</p>
          </div>
        </label>
      </div>

      {/* Section: Options — chỉ hiện khi edit và có attribute */}
      {isEdit && attribute && (
        <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Danh sách Options</p>
            <span className="text-[11px] text-neutral-dark bg-neutral-light-active px-2 py-0.5 rounded-lg">{attribute.options.length} options</span>
          </div>

          {attribute.options.length === 0 ? (
            <p className="text-[12px] text-neutral-dark/60 italic text-center py-3">Chưa có option nào</p>
          ) : (
            <div className="space-y-1.5">
              {attribute.options.map((opt) => (
                <OptionRow key={opt.id} option={opt} onUpdateLabel={handleUpdateLabel} onToggleActive={handleToggleOptionActive} />
              ))}
            </div>
          )}

          {onAddOption && <AddOptionForm onAdd={onAddOption} />}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-5 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
          >
            Huỷ
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Đang lưu..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
