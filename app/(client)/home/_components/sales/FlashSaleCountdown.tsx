"use client";

import { memo, useEffect, useRef, type RefObject } from "react";
import { flashSale } from "./flashSaleTheme";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function calcParts(endDate: string | null) {
  const diff = Math.max(0, endDate ? new Date(endDate).getTime() - Date.now() : 0);
  return {
    hours: pad(Math.floor(diff / 3_600_000)),
    minutes: pad(Math.floor((diff / 60_000) % 60)),
    seconds: pad(Math.floor((diff / 1_000) % 60)),
  };
}

const DigitBox = memo(({ initialValue, digitRef }: { initialValue: string; digitRef: RefObject<HTMLSpanElement | null> }) => {
  return (
    <span
      ref={digitRef}
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
      {initialValue}
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
  const hoursRef = useRef<HTMLSpanElement>(null);
  const minutesRef = useRef<HTMLSpanElement>(null);
  const secondsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tick = () => {
      const { hours, minutes, seconds } = calcParts(endDate);
      if (hoursRef.current) hoursRef.current.textContent = hours;
      if (minutesRef.current) minutesRef.current.textContent = minutes;
      if (secondsRef.current) secondsRef.current.textContent = seconds;
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

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
        <DigitBox initialValue="00" digitRef={hoursRef} />
        <Sep />
        <DigitBox initialValue="00" digitRef={minutesRef} />
        <Sep />
        <DigitBox initialValue="00" digitRef={secondsRef} />
      </div>
    </div>
  );
});

FlashSaleCountdown.displayName = "FlashSaleCountdown";

export default FlashSaleCountdown;
