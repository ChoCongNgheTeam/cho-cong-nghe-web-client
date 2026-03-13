"use client";

import { FlashSaleData } from "../../_libs";
import { useState, useEffect } from "react";
import { Slidezy } from "@/components/Slider";
import { Flame } from "lucide-react";
import HotSaleProductCard from "./HotSaleProductCard";

interface HotSaleOnlineProps {
  flashSale: FlashSaleData;
}

const getTimeLeft = (end: string | null) => {
  if (!end) return { hours: 0, minutes: 0, seconds: 0 };
  const diff = Math.max(0, new Date(end).getTime() - Date.now());
  return {
    hours: Math.floor(diff / 1000 / 3600),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

export function HotSaleOnline({ flashSale }: HotSaleOnlineProps) {
  const { products, startDate, endDate } = flashSale;

  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft(endDate));
    const timer = setInterval(() => setTimeLeft(getTimeLeft(endDate)), 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const formatSessionTime = (date: string | null) => {
    if (!date) return "--:--";
    return new Date(date)
      .toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      })
      .replace(/-/g, "/");
  };

  const countdown = timeLeft ? `${timeLeft.hours}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}` : "--:--:--";

  const sessions = [
    {
      time: formatSessionTime(startDate),
      countdown,
      active: true,
    },
    { time: "10:00, 30/01", status: "Sắp diễn ra", active: false },
    { time: "10:00, 30/01", status: "Sắp diễn ra", active: false },
  ];

  return (
    <section className="py-6 md:py-8">
      <div className="container">
        <div className="relative">
          <div className="flex justify-center relative z-10">
            <div className="bg-promotion px-16 py-3 flex items-center gap-2 rounded-t-2xl">
              <Flame className="w-10 h-10 text-yellow-400 fill-yellow-400" />
              <h2 className="text-xl md:text-2xl font-black text-yellow-300 tracking-wider">FLASH SALE</h2>
            </div>
          </div>

          <div className="relative rounded-3xl border-4 border-promotion overflow-hidden bg-neutral-light -mt-1">
            <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {sessions.map((session, i) => (
                <button
                  key={i}
                  className={`shrink-0 w-45 px-4 py-4 text-center transition-all cursor-pointer ${
                    session.active ? "bg-promotion-light border-b-2 border-promotion-hover" : "hover:bg-neutral-light-active"
                  }`}
                >
                  <div className="font-semibold text-primary text-sm leading-tight">{session.time}</div>
                  {session.active ? (
                    <div className="text-xs mt-0.5 text-primary leading-tight">
                      Kết thúc sau:{" "}
                      <span className="font-bold text-promotion" suppressHydrationWarning>
                        {session.countdown}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs mt-0.5 text-neutral-dark leading-tight">{session.status}</div>
                  )}
                </button>
              ))}
            </div>

            <div className="px-4 py-2 border-t border-neutral">
              <Slidezy items={{ mobile: 2, tablet: 3, desktop: 4 }} gap={16} speed={300} loop={false} nav={false} controls={true} slideBy={1} draggable={true}>
                {products.map((product, index) => (
                  <HotSaleProductCard key={product.id} product={product} index={index} />
                ))}
              </Slidezy>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
