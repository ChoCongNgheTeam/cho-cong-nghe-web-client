"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LoginHintSheet from "@/cart/components/LoginHintSheet";
import { getSpinStatus, type SpinStatus } from "@/lib/api/spin.api";
import SpinWheelModal from "./SpinWheelModal";

export const OPEN_SPIN_WHEEL_EVENT = "ccnshop:open-spin-wheel";

export default function SpinWheelButton() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [showLoginHint, setShowLoginHint] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [status, setStatus] = useState<SpinStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const openWheel = useCallback(async () => {
    // AuthContext vẫn đang xác nhận phiên đăng nhập (vd vừa load trang, đang refresh token) —
    // KHÔNG được kết luận "chưa đăng nhập" lúc này, chờ xác định xong rồi mới quyết định.
    if (authLoading) return;

    if (!user) {
      setShowLoginHint(true);
      return;
    }

    setShowWheel(true);
    setLoadingStatus(true);
    try {
      const res = await getSpinStatus();
      setStatus(res.data);
    } catch {
      setStatus({ canSpin: false, prizes: [], wonPrize: null });
    } finally {
      setLoadingStatus(false);
    }
  }, [user, authLoading]);

  // Cho phép banner khuyến mãi (PromoPopup) mở thẳng vòng quay qua nút "Xem quà tặng"
  useEffect(() => {
    const handler = () => openWheel();
    window.addEventListener(OPEN_SPIN_WHEEL_EVENT, handler);
    return () => window.removeEventListener(OPEN_SPIN_WHEEL_EVENT, handler);
  }, [openWheel]);

  const handleLoginClick = () => {
    setShowLoginHint(false);
    sessionStorage.setItem("loginRedirectIntent", "/");
    router.push("/account?tab=login");
  };

  return (
    <>
      <button
        onClick={openWheel}
        disabled={authLoading}
        aria-label="Vòng quay may mắn"
        className="w-12 h-12 rounded-full flex items-center justify-center
          bg-gradient-to-br from-accent to-orange-500 text-white
          shadow-[0_8px_30px_rgb(0,0,0,0.14)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.20)]
          hover:scale-105 active:scale-95 transition-all duration-300 animate-pulse
          disabled:opacity-60 disabled:cursor-not-allowed disabled:animate-none"
      >
        <Sparkles size={22} />
      </button>

      <LoginHintSheet isOpen={showLoginHint} onClose={() => setShowLoginHint(false)} onLoginClick={handleLoginClick} />

      {showWheel && !loadingStatus && status && <SpinWheelModal isOpen={showWheel} onClose={() => setShowWheel(false)} prizes={status.prizes} canSpin={status.canSpin} wonPrize={status.wonPrize} />}
    </>
  );
}
