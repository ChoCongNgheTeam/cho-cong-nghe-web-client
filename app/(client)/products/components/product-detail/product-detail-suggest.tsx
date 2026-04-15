"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/components/product/types";
import { getRelatedProducts } from "../../_lib";

function getPageSize() {
  if (typeof window === "undefined") return 4;
  if (window.innerWidth < 640) return 2;
  if (window.innerWidth < 768) return 2;
  return 4;
}

// ── Moved outside component to avoid "created during render" error ──────────
interface DotIndicatorsProps {
  totalPages: number;
  page: number;
  animating: boolean;
  onNavigate: (dir: "next" | "prev") => void;
}

function DotIndicators({ totalPages, page, animating, onNavigate }: DotIndicatorsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          onClick={() => {
            if (i === page || animating) return;
            onNavigate(i > page ? "next" : "prev");
          }}
          className={`rounded-full transition-all duration-300 ${i === page ? "w-5 h-2 bg-primary" : "w-2 h-2 bg-neutral-dark hover:bg-primary/50"}`}
          aria-label={`Trang ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ── Helper: map ProductDetail → Product safely ───────────────────────────────
function toProduct(item: Record<string, unknown>): Product {
  return {
    id: item.id as string,
    name: item.name as string,
    slug: item.slug as string,
    thumbnail: (item.thumbnail as string | null) ?? "",
    priceOrigin: (item.priceOrigin as number) ?? 0,
    inStock: (item.inStock as boolean) ?? true,
    rating: item.rating as Product["rating"],
    isFeatured: (item.isFeatured as boolean) ?? false,
    isNew: (item.isNew as boolean) ?? false,
    highlights: (item.highlights as Product["highlights"]) ?? [],
    price: item.price as Product["price"],
  };
}

export default function ProductDetailSuggest({ slug }: { slug: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(4);
  const [animating, setAnimating] = useState(false);
  const [displayPage, setDisplayPage] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      setPageSize(getPageSize());
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
        const data = await getRelatedProducts(slug);
        const raw = (data || []) as Record<string, unknown>[];
        const unique = Array.from(new Map(raw.map((item) => [item.id as string, item])).values()).map(toProduct);
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
  const paged = products.slice(displayPage * pageSize, (displayPage + 1) * pageSize);

  const navigate = (dir: "next" | "prev") => {
    if (animating) return;
    const nextPage = dir === "next" ? page + 1 : page - 1;
    if (nextPage < 0 || nextPage >= totalPages) return;

    setAnimating(true);
    if (gridRef.current) {
      gridRef.current.style.transition = "transform 0.28s cubic-bezier(.4,0,.2,1), opacity 0.28s";
      gridRef.current.style.transform = dir === "next" ? "translateX(-32px)" : "translateX(32px)";
      gridRef.current.style.opacity = "0";
    }

    setTimeout(() => {
      setDisplayPage(nextPage);
      setPage(nextPage);
      if (gridRef.current) {
        gridRef.current.style.transition = "none";
        gridRef.current.style.transform = dir === "next" ? "translateX(32px)" : "translateX(-32px)";
        gridRef.current.style.opacity = "0";
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (gridRef.current) {
            gridRef.current.style.transition = "transform 0.28s cubic-bezier(.4,0,.2,1), opacity 0.28s";
            gridRef.current.style.transform = "translateX(0)";
            gridRef.current.style.opacity = "1";
          }
          setTimeout(() => setAnimating(false), 300);
        });
      });
    }, 280);
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-12 py-5 lg:py-10 bg-neutral-light rounded-xl">
      <h2 className="text-base sm:text-lg md:text-2xl font-semibold text-primary mb-4 sm:mb-6 md:mb-8">Sản phẩm liên quan</h2>

      <div>
        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4" style={{ willChange: "transform, opacity" }}>
          {paged.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 sm:mt-6 md:mt-8">
          <p className="hidden sm:block text-xs text-neutral-darker">
            Trang {page + 1} / {totalPages} &nbsp;·&nbsp; {products.length} sản phẩm
          </p>

          {/* Mobile */}
          <div className="flex sm:hidden items-center justify-between w-full">
            <button
              onClick={() => navigate("prev")}
              disabled={page === 0 || animating}
              className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200
                ${
                  page === 0 || animating
                    ? "border-neutral text-neutral-dark opacity-40 cursor-not-allowed"
                    : "border-neutral-dark text-primary hover:border-primary hover:bg-primary hover:text-neutral-light cursor-pointer"
                }`}
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <DotIndicators totalPages={totalPages} page={page} animating={animating} onNavigate={navigate} />
            <button
              onClick={() => navigate("next")}
              disabled={page === totalPages - 1 || animating}
              className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200
                ${
                  page === totalPages - 1 || animating
                    ? "border-neutral text-neutral-dark opacity-40 cursor-not-allowed"
                    : "border-neutral-dark text-primary hover:border-primary hover:bg-primary hover:text-neutral-light cursor-pointer"
                }`}
              aria-label="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <DotIndicators totalPages={totalPages} page={page} animating={animating} onNavigate={navigate} />
            </div>
            <button
              onClick={() => navigate("prev")}
              disabled={page === 0 || animating}
              className={`group w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border transition-all duration-200
                ${
                  page === 0 || animating
                    ? "border-neutral text-neutral-dark opacity-40 cursor-not-allowed"
                    : "border-neutral-dark text-primary hover:border-primary hover:bg-primary hover:text-neutral-light cursor-pointer shadow-sm hover:shadow-md"
                }`}
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </button>
            <button
              onClick={() => navigate("next")}
              disabled={page === totalPages - 1 || animating}
              className={`group w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border transition-all duration-200
                ${
                  page === totalPages - 1 || animating
                    ? "border-neutral text-neutral-dark opacity-40 cursor-not-allowed"
                    : "border-neutral-dark text-primary hover:border-primary hover:bg-primary hover:text-neutral-light cursor-pointer shadow-sm hover:shadow-md"
                }`}
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
