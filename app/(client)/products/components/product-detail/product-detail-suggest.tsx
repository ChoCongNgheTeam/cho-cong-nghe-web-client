"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/components/product/types";
import apiRequest from "@/lib/api";

function getPageSize() {
  if (typeof window === "undefined") return 4;
  if (window.innerWidth < 640) return 2; // mobile: 2 cols
  if (window.innerWidth < 768) return 2; // sm: 2 cols
  return 4; // md+: 4 cols
}

export default function ProductDetailSuggest({ slug }: { slug: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(4);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [displayPage, setDisplayPage] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  // Update pageSize on resize
  useEffect(() => {
    const update = () => {
      const newSize = getPageSize();
      setPageSize(newSize);
      setPage(0);
      setDisplayPage(0);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!slug) return;
    const fetchRelated = async () => {
      try {
        const data = await apiRequest.get<{ data: Product[] }>(
          `/products/slug/${slug}/related`,
          { noAuth: true },
        );
        const unique = Array.from(
          new Map((data.data || []).map((item) => [item.id, item])).values(),
        );
        setProducts(unique);
        setPage(0);
        setDisplayPage(0);
      } catch (err) {
        console.error("Lỗi gọi API:", err);
      }
    };
    fetchRelated();
  }, [slug]);

  if (products.length === 0) return null;

  const totalPages = Math.ceil(products.length / pageSize);
  const paged = products.slice(
    displayPage * pageSize,
    (displayPage + 1) * pageSize,
  );

  const navigate = (dir: "next" | "prev") => {
    if (animating) return;
    const nextPage = dir === "next" ? page + 1 : page - 1;
    if (nextPage < 0 || nextPage >= totalPages) return;

    setDirection(dir);
    setAnimating(true);

    if (gridRef.current) {
      gridRef.current.style.transition =
        "transform 0.28s cubic-bezier(.4,0,.2,1), opacity 0.28s";
      gridRef.current.style.transform =
        dir === "next" ? "translateX(-32px)" : "translateX(32px)";
      gridRef.current.style.opacity = "0";
    }

    setTimeout(() => {
      setDisplayPage(nextPage);
      setPage(nextPage);

      if (gridRef.current) {
        gridRef.current.style.transition = "none";
        gridRef.current.style.transform =
          dir === "next" ? "translateX(32px)" : "translateX(-32px)";
        gridRef.current.style.opacity = "0";
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (gridRef.current) {
            gridRef.current.style.transition =
              "transform 0.28s cubic-bezier(.4,0,.2,1), opacity 0.28s";
            gridRef.current.style.transform = "translateX(0)";
            gridRef.current.style.opacity = "1";
          }
          setTimeout(() => setAnimating(false), 300);
        });
      });
    }, 280);
  };

  const DotIndicators = () => (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          onClick={() => {
            if (i === page || animating) return;
            navigate(i > page ? "next" : "prev");
          }}
          className={`rounded-full transition-all duration-300 ${
            i === page
              ? "w-5 h-2 bg-primary"
              : "w-2 h-2 bg-neutral-dark hover:bg-primary/50"
          }`}
          aria-label={`Trang ${i + 1}`}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full px-3 sm:px-6 lg:px-12 py-5 lg:py-10 bg-neutral-light rounded-xl">
      <h2 className="text-base sm:text-lg md:text-2xl font-semibold text-primary mb-4 sm:mb-6 md:mb-8">
        Sản phẩm liên quan
      </h2>

      {/* Product grid */}
      <div>
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4"
          style={{ willChange: "transform, opacity" }}
        >
          {paged.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* Footer row: page info + controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 sm:mt-6 md:mt-8">
          {/* Page info — hidden on mobile */}
          <p className="hidden sm:block text-xs text-neutral-darker">
            Trang {page + 1} / {totalPages} &nbsp;·&nbsp; {products.length} sản
            phẩm
          </p>

          {/* Mobile: dots centered + arrows */}
          <div className="flex sm:hidden items-center justify-between w-full">
            <button
              onClick={() => navigate("prev")}
              disabled={page === 0 || animating}
              className={`
                w-8 h-8 flex items-center justify-center rounded-full border
                transition-all duration-200
                ${
                  page === 0 || animating
                    ? "border-neutral text-neutral-dark opacity-40 cursor-not-allowed"
                    : "border-neutral-dark text-primary hover:border-primary hover:bg-primary hover:text-neutral-light cursor-pointer"
                }
              `}
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <DotIndicators />

            <button
              onClick={() => navigate("next")}
              disabled={page === totalPages - 1 || animating}
              className={`
                w-8 h-8 flex items-center justify-center rounded-full border
                transition-all duration-200
                ${
                  page === totalPages - 1 || animating
                    ? "border-neutral text-neutral-dark opacity-40 cursor-not-allowed"
                    : "border-neutral-dark text-primary hover:border-primary hover:bg-primary hover:text-neutral-light cursor-pointer"
                }
              `}
              aria-label="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop: dots + arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <DotIndicators />
            </div>

            <button
              onClick={() => navigate("prev")}
              disabled={page === 0 || animating}
              className={`
                group w-9 h-9 sm:w-10 sm:h-10
                flex items-center justify-center
                rounded-full border transition-all duration-200
                ${
                  page === 0 || animating
                    ? "border-neutral text-neutral-dark opacity-40 cursor-not-allowed"
                    : "border-neutral-dark text-primary hover:border-primary hover:bg-primary hover:text-neutral-light cursor-pointer shadow-sm hover:shadow-md"
                }
              `}
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </button>

            <button
              onClick={() => navigate("next")}
              disabled={page === totalPages - 1 || animating}
              className={`
                group w-9 h-9 sm:w-10 sm:h-10
                flex items-center justify-center
                rounded-full border transition-all duration-200
                ${
                  page === totalPages - 1 || animating
                    ? "border-neutral text-neutral-dark opacity-40 cursor-not-allowed"
                    : "border-neutral-dark text-primary hover:border-primary hover:bg-primary hover:text-neutral-light cursor-pointer shadow-sm hover:shadow-md"
                }
              `}
              aria-label="Trang sau"
            >
              <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
