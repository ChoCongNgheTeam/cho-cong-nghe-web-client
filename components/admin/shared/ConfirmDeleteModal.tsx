"use client";

import type { ReactNode } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Popzy } from "@/components/modal";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Vd: "Xoá thương hiệu?" */
  title: string;
  /** Tên/label của item đang xoá, hiển thị trong ngoặc kép. Có thể bỏ trống cho xoá hàng loạt. */
  itemName?: string;
  /** Dòng mô tả phụ phía trên tên item, mặc định "Bạn có chắc chắn muốn xoá" */
  description?: string;
  /** Cảnh báo phía dưới, mặc định "Hành động này không thể hoàn tác." */
  warningText?: string;
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
  /** Nhãn nút xác nhận lúc chưa loading, vd "Xoá thương hiệu" */
  confirmLabel: string;
  /** Nhãn nút xác nhận lúc đang loading, vd "Đang xoá..." */
  confirmLoadingLabel?: string;
  /** Nội dung phụ chèn giữa title và warningText, vd banner cảnh báo cho bulk delete */
  extra?: ReactNode;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  title,
  itemName,
  description = "Bạn có chắc chắn muốn xoá",
  warningText = "Hành động này không thể hoàn tác.",
  onConfirm,
  loading = false,
  error,
  confirmLabel,
  confirmLoadingLabel = "Đang xoá...",
  extra,
}: ConfirmDeleteModalProps) {
  return (
    <Popzy
      isOpen={isOpen}
      onClose={onClose}
      footer={false}
      closeMethods={loading ? [] : ["button", "overlay", "escape"]}
      content={
        <div className="py-2">
          <div className="w-12 h-12 rounded-2xl bg-promotion-light flex items-center justify-center text-promotion mx-auto mb-4">
            <Trash2 size={22} strokeWidth={1.5} />
          </div>
          <h3 className="text-[16px] font-bold text-primary text-center mb-1">{title}</h3>
          {description && <p className="text-[13px] text-primary/60 text-center mb-1">{description}</p>}
          {itemName && <p className="text-[14px] font-semibold text-primary text-center mb-5">&quot;{itemName}&quot;</p>}
          {extra}
          {warningText && <p className="text-[12px] text-promotion text-center mb-6">{warningText}</p>}
          {error && <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">{error}</div>}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              {loading ? confirmLoadingLabel : confirmLabel}
            </button>
          </div>
        </div>
      }
    />
  );
}
