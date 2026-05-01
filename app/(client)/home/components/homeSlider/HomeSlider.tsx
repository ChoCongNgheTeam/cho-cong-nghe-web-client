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

  /* Float chính — lên xuống */
  @keyframes hsFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    30%       { transform: translateY(-10px) rotate(0.4deg); }
    60%       { transform: translateY(-6px) rotate(-0.3deg); }
  }

  /* Glow orb pulse — mạnh hơn cũ */
  @keyframes hsGlowPulse {
    0%, 100% { opacity: 0.7;  transform: translate(-50%, -50%) scale(1); }
    50%       { opacity: 1;    transform: translate(-50%, -50%) scale(1.18); }
  }

  /* Ring rotate chậm để tạo cảm giác 3D sống */
  @keyframes hsRingRotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to   { transform: translate(-50%, -50%) rotate(360deg); }
  }
  @keyframes hsRingRotateReverse {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to   { transform: translate(-50%, -50%) rotate(-360deg); }
  }

  /* Perspective grid scroll — tạo cảm giác lướt về phía trước */
  @keyframes hsPerspGridScroll {
    from { background-position: 50% 0%; }
    to   { background-position: 50% 100%; }
  }

  /* Accent dot blink trên grid 3D */
  @keyframes hsDotBlink {
    0%, 90%, 100% { opacity: 0; }
    45%            { opacity: 1; }
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
        animation: `${theme.imgAnim} ${theme.imgDuration}ms cubic-bezier(0.22,1,0.36,1) 0ms both, hsFloat 5s ease-in-out ${theme.imgDuration}ms infinite`,
      };

  return (
    <div
      className="relative w-full overflow-hidden aspect-video md:aspect-[21/8]"
      style={{
        background: "linear-gradient(160deg, #f0f5ff 0%, #dce8fb 40%, #eef3fd 70%, #f5f0ff 100%)",
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{KEYFRAMES}</style>

      {/* ── Layer 1: Perspective 3D grid ─────────────────────────────────────── */}
      {/*
        Kỹ thuật: dùng perspective + rotateX để tạo lưới "đổ về phía trước".
        Vùng cuối (gần viewer) đậm + đen hơn → điểm nhấn mạnh mẽ như yêu cầu.
        Chia làm 2 lớp:
          a) Grid nền (mờ, xa)
          b) Grid đậm foreground (gần, tối) — đây là "đoạn grid đậm màu đen"
      */}

      {/* a) Far grid — perspective nhẹ, mờ */}
      {/* <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ perspective: "600px" }}>
        <div
          style={{
            position: "absolute",
            inset: "-20% -10% -10% -10%",
            transform: "rotateX(55deg)",
            transformOrigin: "50% 0%",
            backgroundImage: `
              linear-gradient(rgba(73,121,228,0.18) 1px, transparent 1px),
              linear-gradient(90deg, rgba(73,121,228,0.18) 1px, transparent 1px)
            `,
            backgroundSize: "52px 52px",
            animation: "hsPerspGridScroll 8s linear infinite",
            maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.7) 65%, black 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.7) 65%, black 100%)",
          }}
        />
      </div> */}

      {/* b) Near grid — đậm + tối, tạo "điểm nhấn mạnh mẽ" ở vùng bên phải-dưới */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ perspective: "400px" }}>
        <div
          style={{
            position: "absolute",
            inset: "30% -5% -5% 45%",
            transform: "rotateX(48deg) rotateZ(-4deg)",
            transformOrigin: "50% 0%",
            backgroundImage: `
              linear-gradient(rgba(10,20,60,0.45) 1.5px, transparent 1.5px),
              linear-gradient(90deg, rgba(10,20,60,0.45) 1.5px, transparent 1.5px)
            `,
            backgroundSize: "38px 38px",
            animation: "hsPerspGridScroll 6s linear infinite",
            maskImage: "linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.6) 40%, black 75%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.6) 40%, black 75%, transparent 100%)",
          }}
        />
        {/* Accent: vài intersection dot sáng lên — hiệu ứng "circuit" */}
        {[
          { top: "52%", left: "62%", delay: "0s" },
          { top: "64%", left: "70%", delay: "1.2s" },
          { top: "58%", left: "80%", delay: "2.4s" },
          { top: "72%", left: "66%", delay: "0.7s" },
          { top: "68%", left: "76%", delay: "1.8s" },
        ].map((dot, i) => (
          <div
            key={i}
            className="pointer-events-none absolute"
            style={{
              top: dot.top,
              left: dot.left,
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              background: "rgba(73,121,228,0.9)",
              boxShadow: "0 0 6px 2px rgba(73,121,228,0.5)",
              animation: `hsDotBlink 3s ease-in-out ${dot.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Layer 2: Radial mesh blobs ────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 80% at 78% 50%, rgba(73,121,228,0.16) 0%, transparent 65%),
            radial-gradient(ellipse 40% 55% at 15% 28%, rgba(123,94,167,0.1) 0%, transparent 65%),
            radial-gradient(ellipse 28% 38% at 52% 90%, rgba(73,121,228,0.1) 0%, transparent 60%)
          `,
        }}
      />

      {/* ── Layer 3: Noise texture nhẹ ───────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      {/* ── Layer 4: Bottom fade ─────────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10"
        style={{
          height: "28%",
          background: "linear-gradient(to bottom, transparent 0%, rgba(247,247,247,0.55) 60%, #f7f7f7 100%)",
        }}
      />

      {/* ── Progress bar ─────────────────────────────────────────────────────── */}
      <div
        key={`prog-${current}`}
        className="absolute bottom-0 left-0 h-[3px] z-20"
        style={{
          background: "linear-gradient(90deg, #4979E4, #7b5ea7)",
          animation: visible ? "hsProgress 5.5s linear forwards" : "none",
          width: visible ? undefined : "0%",
          borderRadius: "0 2px 2px 0",
          opacity: 0.85,
        }}
      />

      {/* ── Main content grid ────────────────────────────────────────────────── */}
      <div className="container relative z-10 grid grid-cols-2 items-center h-full gap-[3%]">
        {/* LEFT: text */}
        <div className="flex flex-col pl-4">
          <h2 className="font-extrabold leading-tight py-1 tracking-tight text-[clamp(18px,3.6vw,56px)]" style={{ color: "#0f1f4a", ...textStyle(1) }}>
            {slide.title}
          </h2>

          <p key={`sub-${current}`} className="leading-relaxed max-w-[34ch] text-[clamp(10px,1.1vw,17px)] mb-4 md:mb-[clamp(12px,2.2vw,30px)] mt-2" style={{ color: "#475fa8", ...textStyle(2) }}>
            {slide.subTitle}
          </p>

          <Link
            key={`cta-${current}`}
            href={slide.linkUrl ?? "#"}
            className="group inline-flex items-center gap-2 w-fit rounded-full font-semibold text-white px-[clamp(14px,1.8vw,28px)] py-[clamp(8px,1vw,13px)] text-[clamp(10px,0.95vw,15px)] transition-[box-shadow,transform,background-color] duration-200 active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #4979E4, #6359c8)",
              boxShadow: "0 4px 22px -4px rgba(73,121,228,0.55)",
              ...textStyle(3),
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 30px -4px rgba(73,121,228,0.75)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 22px -4px rgba(73,121,228,0.55)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
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

        {/* RIGHT: product image with 3-layer glow + animated rings */}
        <div className="relative h-[78%]">
          {/* Glow layer 1 — base ambient, mạnh hơn cũ (blur 80px) */}
          <div
            className="pointer-events-none absolute"
            style={{
              top: "50%",
              left: "50%",
              width: "85%",
              aspectRatio: "1",
              background: "radial-gradient(circle, rgba(73,121,228,0.30) 0%, rgba(123,94,167,0.14) 45%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(28px)",
              animation: "hsGlowPulse 3.5s ease-in-out infinite",
            }}
          />

          {/* Glow layer 2 — inner hot spot, màu trắng xanh */}
          <div
            className="pointer-events-none absolute"
            style={{
              top: "50%",
              left: "50%",
              width: "45%",
              aspectRatio: "1",
              background: "radial-gradient(circle, rgba(180,210,255,0.35) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(16px)",
              animation: "hsGlowPulse 2.8s ease-in-out 0.4s infinite",
            }}
          />

          {/* Ring 1 — xoay chậm, đậm hơn cũ */}
          <span
            className="pointer-events-none absolute"
            style={{
              top: "50%",
              left: "50%",
              width: "86%",
              aspectRatio: "1",
              borderRadius: "50%",
              border: "1.5px solid rgba(73,121,228,0.28)",
              animation: "hsRingRotate 18s linear infinite",
            }}
          />

          {/* Ring 2 — ngược chiều, to hơn */}
          <span
            className="pointer-events-none absolute"
            style={{
              top: "50%",
              left: "50%",
              width: "112%",
              aspectRatio: "1",
              borderRadius: "50%",
              border: "1px solid rgba(73,121,228,0.13)",
              borderTopColor: "rgba(73,121,228,0.35)",
              animation: "hsRingRotateReverse 28s linear infinite",
            }}
          />

          {/* Ring 3 — nhỏ, nhanh, dashed feel */}
          <span
            className="pointer-events-none absolute"
            style={{
              top: "50%",
              left: "50%",
              width: "64%",
              aspectRatio: "1",
              borderRadius: "50%",
              border: "1px dashed rgba(73,121,228,0.18)",
              animation: "hsRingRotate 10s linear infinite",
            }}
          />

          {/* Product image */}
          <Link key={`img-${current}`} href={slide.linkUrl ?? "#"} className="relative h-full block" style={imgStyle}>
            {slide.imageUrl && (
              <Image
                src={slide.imageUrl}
                alt={slide.title ?? ""}
                fill
                sizes="(max-width: 768px) 90vw, 45vw"
                className="object-contain object-center"
                style={{
                  // Shadow mạnh hơn nhiều — sản phẩm "nổi lên" thay vì "dán lên nền"
                  filter: "drop-shadow(0 28px 55px rgba(30,60,180,0.22)) drop-shadow(0 8px 20px rgba(0,0,0,0.18))",
                }}
                quality={80}
                priority={current === 0}
                loading={current === 0 ? "eager" : "lazy"}
              />
            )}
          </Link>
        </div>
      </div>

      {/* ── Prev arrow ───────────────────────────────────────────────────────── */}
      <button
        onClick={prev}
        aria-label="Slide trước"
        disabled={animating}
        className="hidden md:flex cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full shadow-md text-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
        style={{
          background: "rgba(255,255,255,0.88)",
          color: "#0f1f4a",
          border: "0.5px solid rgba(73,121,228,0.2)",
          backdropFilter: "blur(6px)",
        }}
      >
        ‹
      </button>

      {/* ── Next arrow ───────────────────────────────────────────────────────── */}
      <button
        onClick={next}
        aria-label="Slide tiếp"
        disabled={animating}
        className="hidden md:flex cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full shadow-md text-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
        style={{
          background: "rgba(255,255,255,0.88)",
          color: "#0f1f4a",
          border: "0.5px solid rgba(73,121,228,0.2)",
          backdropFilter: "blur(6px)",
        }}
      >
        ›
      </button>

      {/* ── Dots ─────────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-[clamp(8px,1.6vw,18px)] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {sliders.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Đến slide ${i + 1}`}
            className="h-1.5 rounded-full border-none cursor-pointer transition-all duration-300"
            style={{
              width: i === current ? "24px" : "6px",
              background: i === current ? "#4979E4" : "rgba(73,121,228,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
