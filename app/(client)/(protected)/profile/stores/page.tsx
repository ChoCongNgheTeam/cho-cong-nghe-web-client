"use client";

import { Phone, Clock, MapPin, Navigation, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";

const STORE = {
  name: "Chợ Công Nghệ",
  address: "Trường Cao đẳng FPT Polytechnic",
  phone: "1800.6060",
  hours: [
    { day: "Thứ 2 – Thứ 6", time: "7:30 – 22:00" },
    { day: "Thứ 7 – Chủ nhật", time: "8:00 – 21:30" },
  ],
  lat: 10.853854768806652,
  lng: 106.62830293258942,
};

export default function StoresPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(STORE.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigate = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${STORE.lat},${STORE.lng}`, "_blank");
  };

  const handleCall = () => {
    window.location.href = `tel:${STORE.phone.replace(/\./g, "")}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-lg font-bold text-primary">Cửa hàng</h1>
        <p className="text-xs text-neutral-400 mt-0.5">Tìm đường đến chúng tôi</p>
      </div>

      {/* ── Map ── */}
      <div className="relative mx-4 rounded-2xl overflow-hidden shadow-sm border border-neutral-200" style={{ height: 260 }}>
        <iframe
          src={`https://www.google.com/maps?q=${STORE.lat},${STORE.lng}&z=16&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Navigate FAB */}
        <button
          onClick={handleNavigate}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white text-accent font-semibold text-xs px-3 py-2 rounded-full shadow-md border border-neutral-200 active:scale-95 transition-all"
        >
          <Navigation className="w-3.5 h-3.5" />
          Chỉ đường
        </button>
      </div>

      {/* ── Info card ── */}
      <div className="mx-4 mt-3 rounded-2xl bg-white border border-neutral-100 shadow-sm overflow-hidden">
        {/* Address */}
        <div className="flex items-start gap-3 px-4 py-3.5 border-b border-neutral-100">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-neutral-400 mb-0.5">Địa chỉ</p>
            <p className="text-sm font-medium text-primary leading-snug">{STORE.address}</p>
          </div>
          <button onClick={handleCopy} className="shrink-0 mt-1 p-1.5 rounded-lg hover:bg-neutral-100 active:scale-95 transition-all">
            {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-neutral-400" />}
          </button>
        </div>

        {/* Phone */}
        <button onClick={handleCall} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-neutral-100 active:bg-neutral-50 transition-colors text-left">
          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="text-[11px] text-neutral-400 mb-0.5">Hotline</p>
            <p className="text-sm font-semibold text-green-600">{STORE.phone}</p>
          </div>
          <span className="ml-auto text-[11px] text-neutral-400">Gọi ngay →</span>
        </button>

        {/* Hours */}
        <div className="flex items-start gap-3 px-4 py-3.5">
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-neutral-400 mb-1.5">Giờ mở cửa</p>
            <div className="space-y-1">
              {STORE.hours.map((h) => (
                <div key={h.day} className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">{h.day}</span>
                  <span className="text-xs font-medium text-primary">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="mx-4 mt-3 mb-6">
        <button
          onClick={handleNavigate}
          className="w-full flex items-center justify-center gap-2 bg-accent text-white font-semibold py-3.5 rounded-2xl shadow-sm active:scale-95 transition-all text-sm"
        >
          <Navigation className="w-4 h-4" />
          Mở Google Maps
        </button>
      </div>
    </div>
  );
}
