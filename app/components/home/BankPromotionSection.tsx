"use client";

import { useEffect, useRef, useState } from "react";
import { bankPromotions } from "@/data/bankPromotions";

export default function BankPromotionSection() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDown.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const stopDrag = () => (isDown.current = false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.1;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <section className="bg-color-neutral-light dark:bg-color-neutral py-6 rounded-xl transition-colors">
  <div className="container">
    <h2 className="text-lg font-bold text-color-primary mb-4">
      🏦 Ưu đãi ngân hàng
    </h2>

    <div
      ref={sliderRef}
      className="flex gap-4 overflow-x-auto select-none cursor-grab scrollbar-none"
      onMouseDown={isDesktop ? onMouseDown : undefined}
      onMouseUp={isDesktop ? stopDrag : undefined}
      onMouseLeave={isDesktop ? stopDrag : undefined}
      onMouseMove={isDesktop ? onMouseMove : undefined}
    >
      {bankPromotions.map((bank) => (
        <div key={bank.id} className="shrink-0 w-40">
          <div className="relative h-full bg-color-neutral-light dark:bg-color-neutral border border-color-neutral-dark rounded-xl p-3 flex flex-col items-center gap-2 transition-all hover:shadow-sm">
            <span className="absolute -top-2 right-2 bg-color-promotion text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {bank.discount}
            </span>

            <div className="h-12 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bank.logo}
                alt={bank.name}
                className="max-h-full object-contain"
              />
            </div>

            <span className="text-[11px] text-color-primary text-center font-medium">
              {bank.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
  );
}
