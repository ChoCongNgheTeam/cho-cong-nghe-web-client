"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, CSSProperties } from "react";
import { Slider } from "../../_libs";
interface HomeSliderProps {
  sliders: Slider[];
}

type AnimTheme = {
  imgAnim: string;
  imgDuration: number; // ms
  textAnims: {
    keyframe: string;
    delay: number; // ms (tính từ lúc visible=true)
    duration: number; // ms
  }[];
};

const THEMES: AnimTheme[] = [
  {
    imgAnim: "hsImgZoomIn",
    imgDuration: 750,
    textAnims: [
      { keyframe: "hsClipDown", delay: 550, duration: 500 },
      { keyframe: "hsClipDown", delay: 700, duration: 500 },
      { keyframe: "hsClipDown", delay: 840, duration: 480 },
      { keyframe: "hsSlideUp", delay: 980, duration: 480 },
    ],
  },
  {
    imgAnim: "hsImgSlideRight",
    imgDuration: 700,
    textAnims: [
      { keyframe: "hsFadeScale", delay: 520, duration: 520 },
      { keyframe: "hsFadeScale", delay: 680, duration: 520 },
      { keyframe: "hsFadeScale", delay: 820, duration: 500 },
      { keyframe: "hsSlideUp", delay: 960, duration: 480 },
    ],
  },
  {
    imgAnim: "hsImgDropBounce",
    imgDuration: 800,
    textAnims: [
      { keyframe: "hsBlurIn", delay: 580, duration: 550 },
      { keyframe: "hsBlurIn", delay: 730, duration: 550 },
      { keyframe: "hsBlurIn", delay: 880, duration: 530 },
      { keyframe: "hsSlideUp", delay: 1020, duration: 480 },
    ],
  },
  {
    imgAnim: "hsImgZoomIn",
    imgDuration: 750,
    textAnims: [
      { keyframe: "hsSlideDown", delay: 540, duration: 500 },
      { keyframe: "hsSlideDown", delay: 690, duration: 500 },
      { keyframe: "hsSlideDown", delay: 830, duration: 480 },
      { keyframe: "hsSlideUp", delay: 970, duration: 480 },
    ],
  },
];

const KEYFRAMES = `
   /* ── Image animations ── */
   @keyframes hsImgZoomIn {
      from { opacity: 0; transform: scale(0.82); }
      to   { opacity: 1; transform: scale(1); }
   }
   @keyframes hsImgSlideRight {
      from { opacity: 0; transform: translateX(60px) rotate(3deg); }
      60%  { transform: translateX(-6px) rotate(-0.5deg); }
      to   { opacity: 1; transform: translateX(0) rotate(0deg); }
   }
   @keyframes hsImgDropBounce {
      0%   { opacity: 0; transform: translateY(-48px) scale(0.92); }
      65%  { transform: translateY(10px) scale(1.02); }
      82%  { transform: translateY(-5px) scale(0.99); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
   }

   /* ── Text animations ── */
   @keyframes hsClipDown {
      from { opacity: 0; clip-path: inset(0 0 100% 0); transform: translateY(-10px); }
      to   { opacity: 1; clip-path: inset(0 0 0% 0);   transform: translateY(0); }
   }
   @keyframes hsFadeScale {
      from { opacity: 0; transform: scale(0.88) translateY(8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
   }
   @keyframes hsBlurIn {
      from { opacity: 0; filter: blur(10px); transform: translateY(12px); }
      to   { opacity: 1; filter: blur(0px);  transform: translateY(0); }
   }
   @keyframes hsSlideDown {
      from { opacity: 0; transform: translateY(-24px); }
      to   { opacity: 1; transform: translateY(0); }
   }
   @keyframes hsSlideUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
   }

   /* ── Progress bar ── */
   @keyframes hsProgress {
      from { width: 0% }
      to   { width: 100% }
   }
`;

export function HomeSlider({ sliders }: HomeSliderProps) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (animating || index === current) return;
      setAnimating(true);
      setVisible(false);
      setTimeout(() => {
        setCurrent(index);
        setVisible(true);
        setAnimating(false);
      }, 420);
    },
    [animating, current],
  );

  const next = useCallback(() => goTo((current + 1) % sliders.length), [current, sliders.length, goTo]);

  const prev = useCallback(() => goTo((current - 1 + sliders.length) % sliders.length), [current, sliders.length, goTo]);

  useEffect(() => {
    timerRef.current = setTimeout(next, 5500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, next]);

  if (sliders.length === 0) return null;

  const slide = sliders[current];
  const theme = THEMES[current % THEMES.length];

  // Helper: trả về inline style cho animation khi visible, opacity:0 khi ẩn
  const textStyle = (idx: number): CSSProperties => {
    const t = theme.textAnims[idx];
    if (!visible) return { opacity: 0 };
    return {
      animation: `${t.keyframe} ${t.duration}ms cubic-bezier(0.22,1,0.36,1) ${t.delay}ms both`,
    };
  };

  const imgStyle: CSSProperties = !visible
    ? { opacity: 0 }
    : {
        animation: `${theme.imgAnim} ${theme.imgDuration}ms cubic-bezier(0.22,1,0.36,1) 0ms both`,
      };

  return (
    <div className="relative w-full overflow-hidden aspect-video md:aspect-[21/8] bg-slate-950">
      <style>{KEYFRAMES}</style>

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Ambient glow — màu thay theo slide */}
      <div className="pointer-events-none absolute right-[8%] top-1/2 -translate-y-1/2 w-[55%] aspect-square rounded-full bg-orange-500 blur-[120px] opacity-[0.12]" />

      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      {/* Progress bar */}
      <div
        key={`prog-${current}`}
        className="absolute bottom-0 left-0 h-0.5 bg-orange-500 z-20 opacity-60"
        style={{
          animation: visible ? "hsProgress 5.5s linear forwards" : "none",
        }}
      />

      {/* ── Grid ── */}
      <div className="relative z-10 grid grid-cols-2 items-center h-full px-[6%] gap-[4%]">
        {/* LEFT: text */}
        <div className="flex flex-col">
          {/* Badge */}
          <span
            key={`badge-${current}`}
            className={[
              "inline-flex items-center gap-1.5 w-fit mb-3 md:mb-[clamp(10px,1.8vw,20px)]",
              "px-3 py-1 rounded-full border",
              "text-[clamp(9px,0.85vw,12px)] font-semibold tracking-[0.1em] uppercase",
              "text-orange-400 border-orange-400/50 bg-orange-400/10",
            ].join(" ")}
            style={textStyle(0)}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Đang Hot
          </span>

          {/* Title */}
          <h2 key={`title-${current}`} className="font-extrabold leading-[1.05] tracking-tight text-white text-[clamp(18px,3.6vw,56px)] mb-2 md:mb-[clamp(8px,1.4vw,16px)]" style={textStyle(1)}>
            {slide.title}
          </h2>

          {/* Subtitle */}
          <p key={`sub-${current}`} className="text-slate-400 leading-relaxed max-w-[34ch] text-[clamp(10px,1.1vw,17px)] mb-4 md:mb-[clamp(12px,2.2vw,30px)]" style={textStyle(2)}>
            Khám phá ưu đãi hấp dẫn — số lượng có hạn!
          </p>

          {/* CTA */}
          <Link
            key={`cta-${current}`}
            href={slide.linkUrl ?? "#"}
            className={[
              "group inline-flex items-center gap-2 w-fit rounded-full font-semibold text-white bg-orange-500",
              "px-[clamp(14px,1.8vw,28px)] py-[clamp(8px,1vw,13px)]",
              "text-[clamp(10px,0.95vw,15px)]",
              "shadow-[0_0_28px_-6px_rgba(249,115,22,0.8)]",
              "hover:shadow-[0_0_44px_-4px_rgba(249,115,22,1)] hover:scale-[1.03]",
              "active:scale-[0.97] transition-[box-shadow,transform] duration-200",
            ].join(" ")}
            style={textStyle(3)}
          >
            Mua ngay
            <svg
              className="w-[clamp(12px,1.15vw,16px)] h-[clamp(12px,1.15vw,16px)] transition-transform duration-200 group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* RIGHT: image */}
        <Link key={`img-${current}`} href={slide.linkUrl ?? "#"} className="relative h-[78%] block" style={imgStyle}>
          <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square rounded-full border border-orange-500/20" />
          <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[112%] aspect-square rounded-full border border-orange-500/10" />
          {slide.imageUrl && <Image src={slide.imageUrl} alt={slide.title} fill sizes="(max-width: 768px) 90vw, 45vw" className="object-contain object-center" quality={80} priority={current === 0} />}
        </Link>
      </div>

      {/* Prev */}
      <button
        onClick={prev}
        aria-label="Slide trước"
        className="absolute left-[clamp(8px,1.4vw,20px)] top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full w-[clamp(28px,2.8vw,44px)] h-[clamp(28px,2.8vw,44px)] border border-white/15 bg-white/5 backdrop-blur-md text-white hover:bg-white/14 hover:border-white/30 active:scale-90 transition-all duration-200"
      >
        <svg className="w-[clamp(12px,1.2vw,17px)] h-[clamp(12px,1.2vw,17px)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next */}
      <button
        onClick={next}
        aria-label="Slide tiếp"
        className="absolute right-[clamp(8px,1.4vw,20px)] top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full w-[clamp(28px,2.8vw,44px)] h-[clamp(28px,2.8vw,44px)] border border-white/15 bg-white/5 backdrop-blur-md text-white hover:bg-white/14 hover:border-white/30 active:scale-90 transition-all duration-200"
      >
        <svg className="w-[clamp(12px,1.2vw,17px)] h-[clamp(12px,1.2vw,17px)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-[clamp(8px,1.6vw,18px)] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {sliders.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Đến slide ${i + 1}`}
            className={["h-1.5 rounded-full border-none cursor-pointer transition-all duration-300", i === current ? "w-6 bg-orange-500" : "w-1.5 bg-white/30 hover:bg-white/50"].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
