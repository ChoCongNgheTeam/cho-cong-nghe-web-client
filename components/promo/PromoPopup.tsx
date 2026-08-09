"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Gift } from "lucide-react";
import { OPEN_SPIN_WHEEL_EVENT } from "@/components/spin/SpinWheelButton";

interface PromoBanner {
  id: string;
  title: string | null;
  subTitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
}

interface PromoPopupProps {
  banners: PromoBanner[];
}

const STORAGE_KEY_PREFIX = "ccnshop_promo_popup_dismissed_";

export default function PromoPopup({ banners }: PromoPopupProps) {
  const banner = banners[0];
  const [isOpen, setIsOpen] = useState(false);
  const [wasDismissed, setWasDismissed] = useState(false);

  useEffect(() => {
    if (!banner) return;
    const key = `${STORAGE_KEY_PREFIX}${banner.id}`;
    const today = new Date().toISOString().slice(0, 10);
    const lastDismissed = localStorage.getItem(key);
    if (lastDismissed === today) {
      setWasDismissed(true);
      return;
    }

    const timer = setTimeout(() => setIsOpen(true), 600);
    return () => clearTimeout(timer);
  }, [banner]);

  const handleClose = () => {
    if (banner) {
      const key = `${STORAGE_KEY_PREFIX}${banner.id}`;
      localStorage.setItem(key, new Date().toISOString().slice(0, 10));
    }
    setIsOpen(false);
    setWasDismissed(true);
  };

  const handleViewGift = () => {
    handleClose();
    window.dispatchEvent(new Event(OPEN_SPIN_WHEEL_EVENT));
  };

  const handleReopen = () => setIsOpen(true);

  if (!banner) return null;

  // Popup đã đóng (trong ngày hôm nay hoặc vừa đóng trong phiên này) — hiện nút nhỏ để mở lại,
  // đặt góc dưới TRÁI để không đụng cụm nút nổi (Zalo/Chat/Vòng quay/Back-to-top) ở góc phải.
  if (!isOpen) {
    if (!wasDismissed) return null;
    return (
      <button
        onClick={handleReopen}
        aria-label="Xem lại ưu đãi"
        className="fixed z-40 bottom-25 left-2 md:bottom-6 md:left-4 flex items-center gap-1.5 pl-2.5 pr-3.5 py-2 rounded-full
          bg-white border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.14)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.20)]
          hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        <span className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
          <Gift size={14} />
        </span>
        <span className="text-[12px] font-semibold text-primary whitespace-nowrap">Xem lại ưu đãi</span>
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={handleClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl bg-neutral-light">
          <button
            onClick={handleClose}
            aria-label="Đóng"
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {banner.imageUrl && (
            <div className="relative w-full aspect-[1500/1024] max-h-[80vh]">
              <Image src={banner.imageUrl} alt={banner.title ?? "Khuyến mãi"} fill className="object-contain" priority />
            </div>
          )}

          {(banner.title || banner.subTitle) && (
            <div className="px-5 py-4 text-center">
              {banner.title && <p className="text-[16px] font-bold text-primary">{banner.title}</p>}
              {banner.subTitle && <p className="text-[13px] text-neutral-dark mt-1">{banner.subTitle}</p>}
            </div>
          )}

          <div className="px-5 pb-5">
            <button
              onClick={handleViewGift}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 text-white text-[14px] font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Gift size={16} />
              Xem quà tặng
            </button>
          </div>
        </div>
      </div>
    </>
  );
}