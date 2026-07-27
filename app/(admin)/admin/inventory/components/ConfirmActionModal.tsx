"use client";

import { Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { Popzy } from "@/components/modal";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmLoadingLabel?: string;
  tone?: "accent" | "danger";
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * ConfirmActionModal — xác nhận cho hành động đổi trạng thái (không phải xoá),
 * vd "Hoàn tất kiểm kê", "Hủy phiếu". Không dùng ConfirmDeleteModal vì icon/copy
 * mặc định của nó gắn chặt với ngữ cảnh xoá dữ liệu.
 */
export function ConfirmActionModal({ isOpen, onClose, title, description, confirmLabel, confirmLoadingLabel = "Đang xử lý...", tone = "accent", onConfirm, loading = false, error }: ConfirmActionModalProps) {
  const toneCls = tone === "danger" ? "bg-promotion hover:bg-promotion/90" : "bg-accent hover:bg-accent/90";
  const iconCls = tone === "danger" ? "bg-promotion-light text-promotion" : "bg-accent/10 text-accent";

  return (
    <Popzy
      isOpen={isOpen}
      onClose={onClose}
      footer={false}
      closeMethods={loading ? [] : ["button", "overlay", "escape"]}
      content={
        <div className="py-1">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconCls}`}>
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-[16px] font-bold text-primary mb-1.5">{title}</h3>
          <p className="text-[13px] text-neutral-dark mb-5">{description}</p>

          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px] mb-4">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50">
              Huỷ
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-60 ${toneCls}`}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? confirmLoadingLabel : confirmLabel}
            </button>
          </div>
        </div>
      }
    />
  );
}
