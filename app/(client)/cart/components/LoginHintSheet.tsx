"use client";

import { X, LogIn } from "lucide-react";

interface LoginHintSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export default function LoginHintSheet({ isOpen, onClose, onLoginClick }: LoginHintSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[9998]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-light rounded-t-2xl shadow-2xl z-[9999] flex flex-col">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral" />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">Ưu đãi &amp; Voucher</div>
          <button onClick={onClose} className="text-neutral-dark hover:text-primary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col items-center px-6 py-8 gap-5 text-center">
          <div className="w-14 h-14 rounded-full bg-accent-light flex items-center justify-center">
            <LogIn size={24} className="text-accent" />
          </div>
          <div>
            <p className="font-semibold text-primary text-sm mb-1">Bạn cần đăng nhập trước</p>
            <p className="text-xs text-neutral-darker leading-relaxed">Vui lòng đăng nhập để có thể chọn và áp dụng voucher ưu đãi cho đơn hàng.</p>
          </div>
          <button onClick={onLoginClick} className="w-full py-2.5 bg-primary text-neutral-light text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors">
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </>
  );
}
