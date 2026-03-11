"use client";

import { ChevronLeft, ChevronRight, Gpu, Package, Cpu } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { ProductDetail, CurrentVariant } from "@/lib/types/product";
import { MdVerified } from "react-icons/md";
import { FaUserCog, FaShippingFast } from "react-icons/fa";
import Image from "next/image";
import apiRequest from "@/lib/api";

interface ProductDetailLeftProps {
  product: ProductDetail;
  selectedVariant?: CurrentVariant;
  slug: string;
  images: {
    id: string;
    imageUrl: string;
    altText?: string;
    position?: number;
  }[];
}

type GalleryImage = {
  id: string;
  imageUrl: string;
  altText?: string;
  isUnbox?: boolean;
  isPlaceholder?: boolean;
};

export default function ProductDetailBanner({
  product,
  images,
  slug,
  selectedVariant,
}: ProductDetailLeftProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [unboxImages, setUnboxImages] = useState<GalleryImage[]>([]);
  const [isLoadingUnbox, setIsLoadingUnbox] = useState(false);
  const [unboxLoaded, setUnboxLoaded] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const thumbRef = useRef<HTMLDivElement>(null);
  const swipeStartX = useRef<number | null>(null);

  useEffect(() => {
    setCurrentImageIndex(0);
    setUnboxImages([]);
    setUnboxLoaded(false);
  }, [images]);

  const productImages: GalleryImage[] = (images || []).map((img) => ({
    ...img,
    isUnbox: false,
  }));

  const gallery: GalleryImage[] = [
    ...productImages,
    ...unboxImages,
    ...(!unboxLoaded
      ? [
          {
            id: "__unbox_placeholder__",
            imageUrl: "",
            isUnbox: true,
            isPlaceholder: true,
          },
        ]
      : []),
  ];

  const currentImageObj = gallery[currentImageIndex];
  const currentImage = currentImageObj?.imageUrl || "";
  const totalImages = gallery.length;
  const isCurrentUnbox = currentImageObj?.isUnbox === true;
  const isCurrentPlaceholder = currentImageObj?.isPlaceholder === true;

  /* ============================================================================
   * STOCK & AVAILABILITY
   * ========================================================================== */
  const maxStock = selectedVariant?.quantity ?? 0;
  const isOutOfStock =
    selectedVariant?.stockStatus === "out_of_stock" || maxStock === 0;
  const isInStock = !isOutOfStock && maxStock > 0;

  /* ============================================================================
   * THUMBNAIL SCROLL
   * ========================================================================== */
  const checkScroll = useCallback(() => {
    const el = thumbRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = thumbRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, productImages.length]);

  // Auto focus active thumbnail
  useEffect(() => {
    const el = thumbRef.current;
    if (!el) return;
    const thumbIndex = isCurrentUnbox
      ? productImages.length
      : currentImageIndex;
    const child = el.children[thumbIndex] as HTMLElement;
    if (child) {
      child.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentImageIndex, isCurrentUnbox]);

  const scrollThumbs = (dir: "left" | "right") => {
    const el = thumbRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  /* ============================================================================
   * MAIN IMAGE SWIPE (touch)
   * ========================================================================== */
  const onMainTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
  };

  const onMainTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null) return;
    const diff = swipeStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goToNext();
      else goToPrevious();
    }
    swipeStartX.current = null;
  };

  /* ============================================================================
   * FETCH UNBOX
   * ========================================================================== */
  const fetchUnbox = async () => {
    if (unboxLoaded || isLoadingUnbox) return;
    setIsLoadingUnbox(true);
    try {
      const data = await apiRequest.get<{ data: any[] }>(
        `/products/slug/${slug}/gallery`,
        { noAuth: true },
      );
      const allImages: GalleryImage[] = (data.data || []).map((img: any) => ({
        ...img,
        isUnbox: true,
        isPlaceholder: false,
      }));
      setUnboxImages(allImages);
      setUnboxLoaded(true);
    } catch (error) {
      console.error("Không thể tải ảnh mở hộp:", error);
    } finally {
      setIsLoadingUnbox(false);
    }
  };

  /* ============================================================================
   * NAVIGATION
   * ========================================================================== */
  const goToImage = (index: number) => setCurrentImageIndex(index);

  const goToPrevious = () => {
    const prevIndex =
      currentImageIndex === 0 ? gallery.length - 1 : currentImageIndex - 1;
    if (prevIndex >= productImages.length && !unboxLoaded) fetchUnbox();
    setCurrentImageIndex(prevIndex);
  };

  const goToNext = () => {
    const nextIndex =
      currentImageIndex === gallery.length - 1 ? 0 : currentImageIndex + 1;
    if (nextIndex >= productImages.length && !unboxLoaded) fetchUnbox();
    setCurrentImageIndex(nextIndex);
  };

  const handleUnboxClick = async () => {
    if (!unboxLoaded) await fetchUnbox();
    setCurrentImageIndex(productImages.length);
  };

  /* ============================================================================
   * MISC
   * ========================================================================== */
  const highlights = product.highlights || [];
  const iconMap: Record<string, any> = { gpu: Gpu, storage: Package, cpu: Cpu };

  const NoImagePlaceholder = () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-neutral-dark bg-neutral rounded-lg">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10 opacity-40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 7h2l2-3h10l2 3h2a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z"
        />
        <circle cx="12" cy="13" r="3" strokeWidth={1.5} />
      </svg>
      <span className="text-[10px] opacity-50">No image</span>
    </div>
  );

  return (
    <div>
      {/* =====================================================================
          MAIN CAROUSEL
      ===================================================================== */}
      <div
        className="relative w-full h-64 sm:h-80 lg:h-96 bg-neutral-light rounded-lg shadow-xl transition-colors duration-300 py-6 select-none"
        onTouchStart={onMainTouchStart}
        onTouchEnd={onMainTouchEnd}
      >
        {isCurrentUnbox && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-blue-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
            <Package size={12} />
            Ảnh mở hộp
          </div>
        )}

        <div className="relative w-full h-full flex items-center justify-center">
          {isCurrentPlaceholder || (isCurrentUnbox && isLoadingUnbox) ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-neutral-dark opacity-60">
                Đang tải ảnh mở hộp...
              </span>
            </div>
          ) : currentImage ? (
            <Image
              src={currentImage}
              className="max-w-full max-h-full object-contain transition-opacity duration-500"
              alt={currentImageObj?.altText || "Product image"}
              fill
            />
          ) : (
            <NoImagePlaceholder />
          )}
          <div className="absolute inset-0 pointer-events-none" />
        </div>

        <button
          onClick={goToPrevious}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-neutral-light/90 hover:bg-neutral-light text-primary rounded-full p-1.5 sm:p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10 cursor-pointer"
          aria-label="Ảnh trước"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-neutral-light/90 hover:bg-neutral-light text-primary rounded-full p-1.5 sm:p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10 cursor-pointer"
          aria-label="Ảnh sau"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-primary-dark/80 text-neutral-light px-2 sm:px-3 py-1 sm:py-2 rounded-lg backdrop-blur-sm z-10">
          <div className="text-xs text-neutral mt-1">
            {currentImageIndex + 1}/{totalImages}
          </div>
        </div>
      </div>

      {/* =====================================================================
          THUMBNAILS
      ===================================================================== */}
      <div className="mt-4 relative">
        {/* Prev button */}
        {canScrollLeft && (
          <button
            onClick={() => scrollThumbs("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-neutral-light border border-neutral rounded-full p-1.5 shadow-md hover:bg-neutral transition-all duration-200 hover:scale-110 cursor-pointer"
            aria-label="Cuộn trái"
          >
            <ChevronLeft className="w-4 h-4 text-primary" />
          </button>
        )}

        {/* Next button */}
        {canScrollRight && (
          <button
            onClick={() => scrollThumbs("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-neutral-light border border-neutral rounded-full p-1.5 shadow-md hover:bg-neutral transition-all duration-200 hover:scale-110 cursor-pointer"
            aria-label="Cuộn phải"
          >
            <ChevronRight className="w-4 h-4 text-primary" />
          </button>
        )}

        {/* Fade edges */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/80 to-transparent z-[5] pointer-events-none rounded-l-xl" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent z-[5] pointer-events-none rounded-r-xl" />
        )}

        {/* Scrollable row */}
        <div
          ref={thumbRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto py-2 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Product thumbnails */}
          {productImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToImage(index)}
              className={`relative group rounded-xl transition-all duration-300 ease-out flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 cursor-pointer ${
                !isCurrentUnbox && index === currentImageIndex
                  ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20 scale-105"
                  : "ring-1 ring-black/10 hover:ring-2 hover:ring-blue-500 hover:shadow-lg hover:scale-105"
              }`}
              aria-label={`Xem ảnh ${index + 1}`}
              draggable={false}
            >
              <div className="relative w-full h-full bg-white rounded-xl overflow-hidden">
                {image.imageUrl ? (
                  <Image
                    src={image.imageUrl}
                    alt={image.altText || `Product image ${index + 1}`}
                    fill
                    sizes="80px"
                    className={`object-contain transition-all duration-300 p-2 pointer-events-none ${
                      !isCurrentUnbox && index === currentImageIndex
                        ? "opacity-100 scale-100"
                        : "opacity-60 scale-95 group-hover:opacity-100 group-hover:scale-100"
                    }`}
                    draggable={false}
                  />
                ) : (
                  <NoImagePlaceholder />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              <div
                className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium backdrop-blur-md transition-all duration-300 ${
                  !isCurrentUnbox && index === currentImageIndex
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-black/40 text-white/90 group-hover:bg-blue-500 group-hover:text-white"
                }`}
              >
                {index + 1}
              </div>
            </button>
          ))}

          {/* Unbox button */}
          <button
            onClick={handleUnboxClick}
            className={`relative group rounded-xl transition-all duration-300 ease-out flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 cursor-pointer ${
              isCurrentUnbox
                ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20 scale-105"
                : "ring-1 ring-black/10 hover:ring-2 hover:ring-blue-500 hover:shadow-lg hover:scale-105"
            }`}
            aria-label="Xem ảnh mở hộp"
            draggable={false}
          >
            <div
              className={`relative w-full h-full rounded-xl overflow-hidden flex flex-col items-center justify-center gap-1 transition-colors duration-300 ${
                isCurrentUnbox ? "bg-blue-50" : "bg-white "
              }`}
            >
              {isLoadingUnbox ? (
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Package
                    size={20}
                    className={`transition-colors duration-300 pointer-events-none ${
                      isCurrentUnbox
                        ? "text-blue-500"
                        : "text-neutral-dark group-hover:text-blue-500"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-semibold transition-colors duration-300 pointer-events-none ${
                      isCurrentUnbox
                        ? "text-blue-600"
                        : "text-neutral-dark group-hover:text-blue-600"
                    }`}
                  >
                    Mở hộp
                  </span>
                </>
              )}
              <div className="absolute top-1 right-1 flex gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-1 rounded-full bg-blue-300 opacity-60"
                  />
                ))}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* =====================================================================
          PRODUCT HIGHLIGHTS
      ===================================================================== */}
      {isInStock && (
        <div className="mt-8 space-y-8">
          <div className="text-base flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="font-semibold text-primary">Thông số nổi bật</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8 border-b border-neutral-dark pb-6 transition-colors duration-300">
            {highlights.map((highlight, index) => {
              const IconComponent = highlight?.icon
                ? iconMap[highlight.icon]
                : null;
              return (
                <div className="flex-1" key={index}>
                  <span className="text-sm">{highlight?.name || "N/A"}</span>
                  <div className="flex items-center gap-2 mt-2">
                    {IconComponent && <IconComponent size={28} />}
                    <span className="text-base font-semibold text-primary">
                      {highlight?.value || "N/A"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          PRODUCT POLICIES
      ===================================================================== */}
      {isInStock && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between mt-6 items-start sm:items-center gap-2">
            <h2 className="text-base font-semibold text-primary">
              Chính sách sản phẩm
            </h2>
            <button className="text-sm text-promotion hover:text-accent-hover hover:underline cursor-pointer transition-colors duration-200">
              Tìm hiểu thêm
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap mt-4">
            <div className="flex items-center gap-2 sm:mr-12">
              <MdVerified size={28} />
              <p className="text-sm text-primary">
                Hàng chính hãng - Bảo hành 18 tháng
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FaShippingFast size={28} />
              <p className="text-sm text-primary">
                Miễn phí giao hàng toàn quốc
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FaUserCog size={28} />
              <p className="text-sm text-primary">
                Kỹ thuật viên hỗ trợ trực tuyến
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
