"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, CSSProperties } from "react";
import { Slider } from "../../types";

interface HomeSliderProps {
  sliders: Slider[];
}

type AnimTheme = {
  imgAnim: string;
  imgDuration: number;
  textAnims: {
    keyframe: string;
    delay: number;
    duration: number;
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
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Chỉ xử lý swipe ngang, bỏ qua scroll dọc
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (sliders.length === 0) return null;

  const slide = sliders[current];
  const theme = THEMES[current % THEMES.length];

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
    <div className="relative w-full overflow-hidden aspect-video md:aspect-[21/8] bg-slate-950" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <style>{KEYFRAMES}</style>

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute right-[8%] top-1/2 -translate-y-1/2 w-[55%] aspect-square rounded-full bg-accent blur-[120px] opacity-[0.12]" />

      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      {/* Progress bar */}
      <div key={`prog-${current}`} className="absolute bottom-0 left-0 h-0.5 bg-accent z-20 opacity-60" style={{ animation: visible ? "hsProgress 5.5s linear forwards" : "none" }} />

      {/* Grid */}
      <div className="container relative z-10 grid grid-cols-2 items-center h-full gap-[3%]">
        {/* LEFT: text */}
        <div className="flex flex-col">
          <h2 className="font-extrabold leading-tight py-1 tracking-wider text-white text-[clamp(18px,3.6vw,56px)]" style={textStyle(1)}>
            {slide.title}
          </h2>

          <p key={`sub-${current}`} className="text-slate-400 leading-relaxed max-w-[34ch] text-[clamp(10px,1.1vw,17px)] mb-4 md:mb-[clamp(12px,2.2vw,30px)] mt-2" style={textStyle(2)}>
            {slide.subTitle}
          </p>

          <Link
            key={`cta-${current}`}
            href={slide.linkUrl ?? "#"}
            className={[
              "group inline-flex items-center gap-2 w-fit rounded-full font-semibold text-white bg-accent",
              "px-[clamp(14px,1.8vw,28px)] py-[clamp(8px,1vw,13px)]",
              "text-[clamp(10px,0.95vw,15px)]",
              "shadow-[0_0_28px_-6px_rgb(var(--accent)/0.8)]",
              "hover:shadow-[0_0_44px_-4px_rgb(var(--accent)/1)] hover:bg-accent-hover hover:scale-[1.03]",
              "active:bg-accent-active active:scale-[0.97] transition-[box-shadow,transform,background-color] duration-200",
            ].join(" ")}
            style={textStyle(3)}
          >
            Xem Ngay
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
          <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square rounded-full border border-accent/20" />
          <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[112%] aspect-square rounded-full border border-accent/10" />
          {slide.imageUrl && (
            <Image
              src={slide.imageUrl}
              alt={slide.title ?? ""}
              fill
              sizes="(max-width: 768px) 90vw, 45vw"
              className="object-contain object-center"
              quality={80}
              priority={current === 0}
              loading={current === 0 ? "eager" : "lazy"}
            />
          )}
        </Link>
      </div>

      {/* ── Prev arrow — ẩn mobile, style giống Slidezy ── */}
      <button
        onClick={prev}
        aria-label="Slide trước"
        disabled={animating}
        className="hidden md:flex cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl text-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
      >
        ‹
      </button>

      {/* ── Next arrow — ẩn mobile, style giống Slidezy ── */}
      <button
        onClick={next}
        aria-label="Slide tiếp"
        disabled={animating}
        className="hidden md:flex cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl text-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-[clamp(8px,1.6vw,18px)] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {sliders.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Đến slide ${i + 1}`}
            className={["h-1.5 rounded-full border-none cursor-pointer transition-all duration-300", i === current ? "w-6 bg-accent" : "w-1.5 bg-white/30 hover:bg-white/50"].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
