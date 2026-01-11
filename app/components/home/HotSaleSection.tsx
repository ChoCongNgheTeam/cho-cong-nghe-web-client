"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { hotProducts } from "../../data/hotProducts";
import ProductCard from "./ProductCard";

export default function HotSaleSection() {
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
  const onMouseLeave = () => (isDown.current = false);
  const onMouseUp = () => (isDown.current = false);
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <section className="bg-color-neutral-light py-8 mb-6 rounded-lg transition-colors">
      <div className="container mx-auto px-4 lg:px-8">
        {/* TITLE */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl lg:text-2xl font-bold text-color-promotion flex items-center gap-2">
            🔥 Hot Sale
          </h2>
          <Link
            href="/hot-sale"
            className="text-sm text-color-promotion hover:text-color-promotion-hover hover:underline transition-colors"
          >
            Xem tất cả →
          </Link>
        </div>

        {/* SLIDER */}
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto select-none cursor-grab scrollbar-none"
          onMouseDown={isDesktop ? onMouseDown : undefined}
          onMouseLeave={isDesktop ? onMouseLeave : undefined}
          onMouseUp={isDesktop ? onMouseUp : undefined}
          onMouseMove={isDesktop ? onMouseMove : undefined}
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE 10+
          }}
        >
          {hotProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="
  shrink-0
  w-[85%]
  sm:w-[45%]
  lg:w-[calc((100%-64px)/5)]
"
            >
              <ProductCard product={product} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
