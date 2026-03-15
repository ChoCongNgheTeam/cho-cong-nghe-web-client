"use client";

import { useTransition, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/contexts/WishlistContext";
import {
   addToWishlist,
   removeFromWishlist,
} from "@/(client)/(protected)/profile/wishlist/_libs";

interface WishlistHeartProps {
   productId: string;
   className?: string;
}

const COLORS = [
   "#ef4444",
   "#f97316",
   "#fbbf24",
   "#fb7185",
   "#e879f9",
   "#a78bfa",
   "#60a5fa",
];
const SHAPES = [
   "dot",
   "heart",
   "star",
   "dot",
   "heart",
   "star",
   "dot",
   "heart",
   "star",
   "dot",
] as const;

function easePow(t: number, p: number) {
   return 1 - Math.pow(1 - t, p);
}

function drawMiniHeart(ctx: CanvasRenderingContext2D, size: number) {
   const s = size * 0.13;
   ctx.save();
   ctx.scale(s, s);
   ctx.beginPath();
   ctx.moveTo(0, -3);
   ctx.bezierCurveTo(-5, -8, -10, -3, -10, 1);
   ctx.bezierCurveTo(-10, 6, 0, 11, 0, 11);
   ctx.bezierCurveTo(0, 11, 10, 6, 10, 1);
   ctx.bezierCurveTo(10, -3, 5, -8, 0, -3);
   ctx.fill();
   ctx.restore();
}

function drawMiniStar(ctx: CanvasRenderingContext2D, size: number) {
   const r = size * 0.55,
      ri = r * 0.42;
   ctx.beginPath();
   for (let i = 0; i < 5; i++) {
      const ao = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const ai = ao + Math.PI / 5;
      ctx.lineTo(Math.cos(ao) * r, Math.sin(ao) * r);
      ctx.lineTo(Math.cos(ai) * ri, Math.sin(ai) * ri);
   }
   ctx.closePath();
   ctx.fill();
}

function burstRings(canvas: HTMLCanvasElement) {
   const ctx = canvas.getContext("2d")!;
   const cx = 50,
      cy = 50;
   const rings = [
      { r: 0, maxR: 28, alpha: 0.8, color: "#ef4444", width: 2.5, delay: 0 },
      { r: 0, maxR: 22, alpha: 0.5, color: "#f97316", width: 2.0, delay: 60 },
      { r: 0, maxR: 18, alpha: 0.4, color: "#fbbf24", width: 1.5, delay: 120 },
   ];
   let start: number | null = null;
   function draw(ts: number) {
      if (!start) start = ts;
      const el = ts - start;
      ctx.clearRect(0, 0, 100, 100);
      let any = false;
      for (const ring of rings) {
         const t = el - ring.delay;
         if (t < 0) {
            any = true;
            continue;
         }
         const prog = Math.min(t / 420, 1);
         ring.r = ring.maxR * easePow(prog, 2);
         const alpha = ring.alpha * (1 - prog);
         if (alpha <= 0) continue;
         any = true;
         ctx.beginPath();
         ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
         ctx.strokeStyle = ring.color;
         ctx.lineWidth = ring.width;
         ctx.globalAlpha = alpha;
         ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (any) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, 100, 100);
   }
   requestAnimationFrame(draw);
}

function shootStars(canvas: HTMLCanvasElement) {
   const ctx = canvas.getContext("2d")!;
   const cx = 50,
      cy = 50;
   const particles = Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = 2.2 + Math.random() * 1.4;
      return {
         x: cx,
         y: cy,
         vx: Math.cos(angle) * speed,
         vy: Math.sin(angle) * speed,
         color: COLORS[i % COLORS.length],
         size: 3.5 + Math.random() * 3,
         shape: SHAPES[i],
         life: 1,
         decay: 0.028 + Math.random() * 0.018,
         rot: Math.random() * Math.PI * 2,
         rspeed: (Math.random() - 0.5) * 0.18,
      };
   });
   function draw() {
      ctx.clearRect(0, 0, 100, 100);
      let alive = false;
      for (const p of particles) {
         p.x += p.vx;
         p.y += p.vy;
         p.vy += 0.04;
         p.vx *= 0.97;
         p.life -= p.decay;
         p.rot += p.rspeed;
         if (p.life <= 0) continue;
         alive = true;
         ctx.globalAlpha = Math.max(0, p.life);
         ctx.fillStyle = p.color;
         ctx.save();
         ctx.translate(p.x, p.y);
         ctx.rotate(p.rot);
         if (p.shape === "dot") {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
         } else if (p.shape === "heart") {
            drawMiniHeart(ctx, p.size);
         } else {
            drawMiniStar(ctx, p.size);
         }
         ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (alive) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, 100, 100);
   }
   requestAnimationFrame(draw);
}

function setPulse(svg: SVGSVGElement | null, on: boolean) {
   if (!svg) return;
   svg.style.animation = on ? "wh-pulse 2s ease-in-out infinite" : "none";
}

export default function WishlistHeart({
   productId,
   className = "",
}: WishlistHeartProps) {
   const { isAuthenticated } = useAuth();
   const { likedIds, toggleLiked } = useWishlist();
   const router = useRouter();
   const [isPending, startTransition] = useTransition();
   const svgRef = useRef<SVGSVGElement>(null);
   const canvasRef = useRef<HTMLCanvasElement>(null);

   const liked = likedIds.has(productId);

   // set pulse on mount
   useEffect(() => {
      setPulse(svgRef.current, !liked);
   }, []); // eslint-disable-line react-hooks/exhaustive-deps

   const handleToggle = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
         e.preventDefault();
         e.stopPropagation();
         if (isPending) return;
         if (!isAuthenticated) {
            router.push("/account?tab=login");
            return;
         }

         const nextLiked = !liked;
         toggleLiked(productId, nextLiked);

         const svg = svgRef.current;
         if (svg) {
            // cancel mọi animation đang chạy
            svg.getAnimations().forEach((a) => a.cancel());
            svg.style.animation = "none";

            if (nextLiked) {
               svg.animate(
                  [
                     { transform: "scale(1)" },
                     { transform: "scale(0)", offset: 0.08 },
                     { transform: "scale(1.55)", offset: 0.35 },
                     { transform: "scale(0.88)", offset: 0.55 },
                     { transform: "scale(1.12)", offset: 0.72 },
                     { transform: "scale(0.96)", offset: 0.85 },
                     { transform: "scale(1)" },
                  ],
                  { duration: 600, easing: "ease-out", fill: "forwards" },
               );
               if (canvasRef.current) {
                  burstRings(canvasRef.current);
                  shootStars(canvasRef.current);
               }
            } else {
               const anim = svg.animate(
                  [
                     { transform: "scale(1)" },
                     { transform: "scale(0.6)", offset: 0.3 },
                     { transform: "scale(1.05)", offset: 0.7 },
                     { transform: "scale(1)" },
                  ],
                  { duration: 350, easing: "ease-out", fill: "forwards" },
               );
               // sau khi unlike xong → bật lại pulse
               anim.onfinish = () => setPulse(svgRef.current, true);
            }
         }

         startTransition(async () => {
            try {
               if (nextLiked) await addToWishlist(productId);
               else await removeFromWishlist(productId);
            } catch {
               toggleLiked(productId, liked);
            }
         });
      },
      [liked, isPending, isAuthenticated, productId, router, toggleLiked],
   );

   return (
      <>
         <style>{`
            @keyframes wh-pulse {
               0%, 100% { transform: scale(1); opacity: 1; }
               30%       { transform: scale(1.18); opacity: 0.85; }
               60%       { transform: scale(0.95); opacity: 1; }
            }
         `}</style>
         <button
            type="button"
            aria-label={liked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            onClick={handleToggle}
            disabled={isPending}
            className={`absolute top-2 right-2 z-10 w-9 h-9 flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-wait ${className}`}
         >
            <canvas
               ref={canvasRef}
               width={100}
               height={100}
               style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  pointerEvents: "none",
                  width: 100,
                  height: 100,
               }}
            />
            <svg
               ref={svgRef}
               width="26"
               height="26"
               viewBox="0 0 24 24"
               fill="none"
               style={{ display: "block", transformOrigin: "center" }}
            >
               <path
                  d="M12 21C12 21 2.5 14 2.5 8C2.5 5.24 4.74 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.26 3 21.5 5.24 21.5 8C21.5 14 12 21 12 21Z"
                  fill={liked ? "#ef4444" : "none"}
                  stroke={liked ? "#ef4444" : "#9ca3af"}
                  strokeWidth="1.8"
               />
            </svg>
         </button>
      </>
   );
}
