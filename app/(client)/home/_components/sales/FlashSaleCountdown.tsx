"use client";

import { memo, useState, useEffect } from "react";
import { flashSale } from "./flashSaleTheme";

const DigitBox = memo(({ value }: { value: string }) => {
  return (
    <span
      className="inline-flex items-center justify-center font-black tabular-nums"
      style={{
        background: "rgba(0,0,0,0.55)",
        color: "#ffffff",
        fontSize: "clamp(14px, 3vw, 20px)",
        minWidth: "clamp(28px, 5.5vw, 36px)",
        height: "clamp(30px, 6vw, 40px)",
        borderRadius: 7,
        letterSpacing: "-0.01em",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -2px 0 rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.15)",
      }}
    >
      {value}
    </span>
  );
});

DigitBox.displayName = "DigitBox";

const Sep = memo(() => {
  return (
    <span className="font-black select-none" style={{ color: flashSale.promotion, fontSize: "clamp(16px, 3vw, 22px)", lineHeight: 1, marginBottom: 1 }}>
      :
    </span>
  );
});

Sep.displayName = "Sep";

const FlashSaleCountdown = memo(({ endDate, label }: { endDate: string | null; label: string }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, endDate ? new Date(endDate).getTime() - Date.now() : 0);
      setTimeLeft({
        hours: Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff / 60_000) % 60),
        seconds: Math.floor((diff / 1_000) % 60),
      });
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div
      className="flex items-center gap-2 flex-wrap px-3 py-1.5 rounded-xl"
      style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
      suppressHydrationWarning
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "rgba(255,255,255,0.5)" }}>
        {label}
      </span>
      <div className="flex items-center gap-1">
        <DigitBox value={pad(timeLeft.hours)} />
        <Sep />
        <DigitBox value={pad(timeLeft.minutes)} />
        <Sep />
        <DigitBox value={pad(timeLeft.seconds)} />
      </div>
    </div>
  );
});

FlashSaleCountdown.displayName = "FlashSaleCountdown";

export default FlashSaleCountdown;
