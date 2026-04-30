"use client";

import { Phone, Clock, MapPin, Navigation, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";

const STORE = {
  address: "Trường Cao đẳng FPT Polytechnic",
  phone: "1800.6060",
  hours: [
    { day: "Thứ 2 – Thứ 6", time: "7:30 – 22:00" },
    { day: "Thứ 7 – Chủ nhật", time: "8:00 – 21:30" },
  ],
  lat: 10.853854768806652,
  lng: 106.62830293258942,
};

interface StoreLocatorSectionProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function StoreLocatorSection({
  title = "Cửa hàng & liên hệ",
  description = "Tìm đường đến showroom và liên hệ trực tiếp với chúng tôi.",
  className = "",
}: StoreLocatorSectionProps) {
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
    <section className={className}>
      <div className="mb-4">
        <h2 className="mb-2 font-bold text-primary">{title}</h2>
        <p className="text-primary">{description}</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-neutral shadow-sm" style={{ height: 260 }}>
        <iframe
          src={`https://www.google.com/maps?q=${STORE.lat},${STORE.lng}&z=16&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        <button
          onClick={handleNavigate}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-neutral bg-neutral-light px-3 py-2 text-xs font-semibold text-accent shadow-md transition-all active:scale-95"
        >
          <Navigation className="h-3.5 w-3.5" />
          Chỉ đường
        </button>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-neutral bg-neutral-light shadow-sm">
        <div className="flex items-start gap-3 border-b border-neutral px-4 py-3.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-light">
            <MapPin className="h-4 w-4 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-[11px] text-neutral-dark">Địa chỉ</p>
            <p className="text-sm font-medium leading-snug text-primary">{STORE.address}</p>
          </div>
          <button onClick={handleCopy} className="mt-1 shrink-0 rounded-lg p-1.5 transition-all hover:bg-neutral-light-active active:scale-95">
            {copied ? <CheckCheck className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4 text-neutral-dark" />}
          </button>
        </div>

        <button onClick={handleCall} className="flex w-full items-center gap-3 border-b border-neutral px-4 py-3.5 text-left transition-colors active:bg-neutral-light-active">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-light">
            <Phone className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="mb-0.5 text-[11px] text-neutral-dark">Hotline</p>
            <p className="text-sm font-semibold text-accent">{STORE.phone}</p>
          </div>
          <span className="ml-auto text-[11px] text-neutral-dark">Gọi ngay →</span>
        </button>

        <div className="flex items-start gap-3 px-4 py-3.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-light">
            <Clock className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1">
            <p className="mb-1.5 text-[11px] text-neutral-dark">Giờ mở cửa</p>
            <div className="space-y-1">
              {STORE.hours.map((h) => (
                <div key={h.day} className="flex items-center justify-between">
                  <span className="text-xs text-neutral-dark">{h.day}</span>
                  <span className="text-xs font-medium text-primary">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <button
          onClick={handleNavigate}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-sm font-semibold text-neutral-light shadow-sm transition-all hover:bg-accent-hover active:scale-95"
        >
          <Navigation className="h-4 w-4" />
          Mở Google Maps
        </button>
      </div>
    </section>
  );
}
