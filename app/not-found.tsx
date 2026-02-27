"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function NotFound() {
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const particles: {
         x: number;
         y: number;
         vx: number;
         vy: number;
         size: number;
         opacity: number;
         color: string;
      }[] = [];

      const colors = ["#4970e4", "#3f6ad0", "#c7d7f7", "#e9f8f8"];

      for (let i = 0; i < 60; i++) {
         particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 2.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.1,
            color: colors[Math.floor(Math.random() * colors.length)],
         });
      }

      let animId: number;
      const animate = () => {
         ctx.clearRect(0, 0, canvas.width, canvas.height);

         particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle =
               p.color +
               Math.floor(p.opacity * 255)
                  .toString(16)
                  .padStart(2, "0");
            ctx.fill();
         });

         // Draw connecting lines
         for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
               const dx = particles[i].x - particles[j].x;
               const dy = particles[i].y - particles[j].y;
               const dist = Math.sqrt(dx * dx + dy * dy);
               if (dist < 100) {
                  ctx.beginPath();
                  ctx.moveTo(particles[i].x, particles[i].y);
                  ctx.lineTo(particles[j].x, particles[j].y);
                  ctx.strokeStyle = `rgba(73,112,228,${0.12 * (1 - dist / 100)})`;
                  ctx.lineWidth = 0.5;
                  ctx.stroke();
               }
            }
         }

         animId = requestAnimationFrame(animate);
      };
      animate();

      const handleResize = () => {
         canvas.width = canvas.offsetWidth;
         canvas.height = canvas.offsetHeight;
      };
      window.addEventListener("resize", handleResize);

      return () => {
         cancelAnimationFrame(animId);
         window.removeEventListener("resize", handleResize);
      };
   }, []);

   return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-light dark:bg-[rgb(var(--neutral-light))]">
         {/* Particle canvas background */}
         <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
         />

         {/* Radial gradient overlay */}
         <div className="pointer-events-none absolute inset-0">
            <div
               className="absolute inset-0 opacity-30 dark:opacity-20"
               style={{
                  background:
                     "radial-gradient(ellipse 70% 60% at 50% 40%, rgb(73 121 228 / 0.18) 0%, transparent 70%)",
               }}
            />
         </div>

         {/* Glass card */}
         <div
            className="relative z-10 flex flex-col items-center px-8 py-14 text-center"
            style={{
               animation: "fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
         >
            {/* 404 big number */}
            <div className="relative mb-2 select-none">
               <span
                  className="block font-inters text-[clamp(7rem,20vw,14rem)] font-black leading-none tracking-tighter text-accent"
                  style={{
                     WebkitTextStroke: "2px rgb(var(--accent))",
                     textShadow:
                        "0 0 80px rgb(73 121 228 / 0.35), 0 0 160px rgb(73 121 228 / 0.15)",
                  }}
               >
                  404
               </span>
               {/* Ghost duplicate for depth */}
               <span
                  className="pointer-events-none absolute inset-0 block font-inters text-[clamp(7rem,20vw,14rem)] font-black leading-none tracking-tighter"
                  aria-hidden
                  style={{
                     WebkitTextStroke: "1px rgb(var(--accent))",
                     color: "transparent",
                     transform: "translate(4px, 4px)",
                     opacity: 0.15,
                  }}
               >
                  404
               </span>
            </div>

            {/* Divider line */}
            <div
               className="mb-7 h-px w-24 rounded-full bg-accent opacity-60"
               style={{
                  animation:
                     "scaleX 0.6s 0.3s cubic-bezier(0.22,1,0.36,1) both",
               }}
            />

            {/* Headline */}
            <h1
               className="mb-3 font-inters text-2xl font-semibold text-primary dark:text-primary md:text-3xl"
               style={{
                  animation:
                     "fadeUp 0.6s 0.2s cubic-bezier(0.22,1,0.36,1) both",
                  opacity: 0,
               }}
            >
               Trang không tồn tại
            </h1>

            {/* Subtext */}
            <p
               className="mb-10 max-w-sm font-inters text-sm font-normal leading-relaxed text-primary-light dark:text-primary-light"
               style={{
                  animation:
                     "fadeUp 0.6s 0.35s cubic-bezier(0.22,1,0.36,1) both",
                  opacity: 0,
               }}
            >
               Có vẻ như trang bạn đang tìm kiếm đã bị xóa, đổi tên, hoặc chưa
               từng tồn tại.
            </p>

            {/* Buttons */}
            <div
               className="flex flex-col gap-3 sm:flex-row"
               style={{
                  animation:
                     "fadeUp 0.6s 0.45s cubic-bezier(0.22,1,0.36,1) both",
                  opacity: 0,
               }}
            >
               <Link
                  href="/"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-accent px-7 py-3 font-inters text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_8px_30px_rgb(73,121,228,0.35)] active:bg-accent-active"
               >
                  <svg
                     className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor"
                     strokeWidth={2}
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                     />
                  </svg>
                  Về trang chủ
               </Link>

               <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-active bg-neutral-light px-7 py-3 font-inters text-sm font-medium text-primary shadow-sm transition-all duration-200 hover:border-accent hover:text-accent dark:border-neutral dark:bg-neutral-light dark:text-primary dark:hover:border-accent dark:hover:text-accent"
               >
                  <svg
                     className="h-4 w-4"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor"
                     strokeWidth={2}
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                     />
                  </svg>
                  Quay lại
               </button>
            </div>

            {/* Status badge */}
            <div
               className="mt-10 inline-flex items-center gap-2 rounded-full border border-neutral-active bg-neutral-light-active px-4 py-1.5 dark:border-neutral dark:bg-neutral-light"
               style={{
                  animation:
                     "fadeUp 0.6s 0.55s cubic-bezier(0.22,1,0.36,1) both",
                  opacity: 0,
               }}
            >
               <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-promotion" />
               <span className="font-inters text-xs text-primary-light dark:text-primary-light">
                  Error 404 · Page Not Found
               </span>
            </div>
         </div>

         <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleX {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 0.6; }
        }
      `}</style>
      </div>
   );
}
