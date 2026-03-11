// app/(client)/cart/components/DeleteConfirmSidebar.tsx
"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import Popzy from "@/components/Modal/Popzy";

interface DeleteConfirmSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  isLoading?: boolean;
}

export default function DeleteConfirmSidebar({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isLoading = false,
}: DeleteConfirmSidebarProps) {
  const content = (
    <div className="py-1">
      <p className="text-sm text-neutral-darker mb-5">
        Bạn có chắc chắn muốn xoá{" "}
        <span className="font-semibold text-primary">"{productName}"</span>{" "}
        khỏi giỏ hàng không?
      </p>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-lg border border-neutral font-semibold text-sm text-neutral-darker
            hover:bg-neutral transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Huỷ
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-sm
            transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Xoá
        </button>
      </div>
    </div>
  );

  return (
    <Popzy
      isOpen={isOpen}
      onClose={onClose}
      content={content}
      closeMethods={isLoading ? [] : ["button", "overlay", "escape"]}
      footer={false}
      cssClass="max-w-[360px]"
    />
  );
}