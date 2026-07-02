import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatVND } from "@/helpers";
import { addSearchHistory } from "@/lib/api/header/search-history";
import { SearchProduct } from "../type";
import { calcDiscount } from "./utils/calcDiscount";

const SKELETON_COUNT = 4;

function SkeletonItem() {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="shrink-0 w-12 h-12 rounded-lg bg-neutral animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-3/4 rounded-full bg-neutral animate-pulse" />
        <div className="h-3 w-1/3 rounded-full bg-neutral animate-pulse" />
      </div>
    </li>
  );
}

interface DropdownContentProps {
  showSkeleton: boolean;
  isStale: boolean;
  isSearching: boolean;
  displayResults: SearchProduct[];
  activeIndex: number;
  query: string;
  listRef: React.RefObject<HTMLUListElement | null>;
  handleClose: () => void;
  navigateToSearch: (q?: string) => void;
  idPrefix: string;
}

export function DropdownContent({ showSkeleton, isStale, isSearching, displayResults, activeIndex, query, listRef, handleClose, navigateToSearch, idPrefix }: DropdownContentProps) {
  return (
    <div className={`transition-opacity duration-150 ${isStale ? "opacity-50" : "opacity-100"}`}>
      {showSkeleton ? (
        <ul aria-label="Đang tìm kiếm">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonItem key={i} />
          ))}
        </ul>
      ) : displayResults.length > 0 ? (
        <>
          <ul ref={listRef} className="max-h-[420px] overflow-y-auto scrollbar-thin">
            {displayResults.map((product, i) => {
              const salePrice = product.price.base;
              const originPrice = product.priceOrigin;
              const discount = calcDiscount(originPrice, salePrice);
              const isActive = i === activeIndex;

              return (
                <li
                  key={`${product.id}-${i}`}
                  id={`${idPrefix}-${i}`}
                  role="option"
                  aria-selected={isActive}
                  style={{ animationDelay: `${i * 25}ms` }}
                  className={`animate-in fade-in slide-in-from-bottom-1 duration-200 fill-mode-both ${isActive ? "search-item-active" : ""}`}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={() => {
                      addSearchHistory(query.trim());
                      handleClose();
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-neutral transition-colors group"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-neutral bg-white flex items-center justify-center">
                      {product.thumbnail ? (
                        <Image src={product.thumbnail} alt={product.name} width={48} height={48} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral rounded-lg text-neutral-dark">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h2l2-3h10l2 3h2a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z" />
                            <circle cx="12" cy="13" r="3" strokeWidth={1.5} />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-primary font-medium truncate group-hover:text-accent-hover transition-colors duration-150">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-semibold text-primary">{formatVND(salePrice)}</span>
                        {discount > 0 && (
                          <>
                            <span className="text-xs text-promotion font-medium">-{discount}%</span>
                            <span className="text-xs text-neutral-darker line-through">{formatVND(originPrice)}</span>
                          </>
                        )}
                        {!product.inStock && <span className="text-xs text-neutral-darker">Hết hàng</span>}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className={`border-t border-neutral ${activeIndex === displayResults.length ? "search-item-active" : ""}`}>
            <button
              id={`${idPrefix}-${displayResults.length}`}
              role="option"
              aria-selected={activeIndex === displayResults.length}
              onClick={() => navigateToSearch()}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-accent-hover hover:bg-neutral transition-colors cursor-pointer"
            >
              Xem tất cả kết quả cho &ldquo;{query}&rdquo;
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          </div>
        </>
      ) : !isSearching ? (
        <div className="py-6 text-center text-neutral-darker text-sm">
          Không tìm thấy sản phẩm nào cho <span className="text-primary font-medium">&ldquo;{query}&rdquo;</span>
        </div>
      ) : null}
    </div>
  );
}
