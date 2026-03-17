"use client";

import { ChevronLeft, ChevronRight, Gpu, Package, Cpu, Images, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { ProductDetail, CurrentVariant } from "@/lib/types/product";
import { MdVerified } from "react-icons/md";
import { FaUserCog, FaShippingFast } from "react-icons/fa";
import Image from "next/image";
import WishlistHeart from "@/components/shared/WishlistHeart";
import apiRequest from "@/lib/api";

interface GalleryImage {
  id: string;
  imageUrl: string;
  altText?: string;
  position?: number;
}

interface ProductDetailLeftProps {
  product: ProductDetail;
  selectedVariant?: CurrentVariant;
  images: GalleryImage[];
}

export default function ProductDetailBanner({
  product,
  images,
  selectedVariant,
}: ProductDetailLeftProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ── Gallery state ──────────────────────────────────────────────────────────
  const [galleryImages, setGalleryImages]   = useState<GalleryImage[]>([]);
  const [galleryLoaded, setGalleryLoaded]   = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryIndex, setGalleryIndex]     = useState(0);

  const EXPAND_INDEX = images.length;
  const isExpandSlot = currentImageIndex === EXPAND_INDEX;
  const totalVariantSlots = images.length + 1;
  

  useEffect(() => {
    if (images && images.length > 0) {
      setCurrentImageIndex(0);
      setGalleryIndex(0);
    }
  }, [images]);

  // ── Stock ──────────────────────────────────────────────────────────────────
  const maxStock     = selectedVariant?.quantity ?? 0;
  const isOutOfStock = selectedVariant?.stockStatus === "out_of_stock" || maxStock === 0;
  const isInStock    = !isOutOfStock && maxStock > 0;

  // ── Fetch gallery ──────────────────────────────────────────────────────────
  const fetchGallery = useCallback(async () => {
    if (galleryLoaded || galleryLoading) return;
    setGalleryLoading(true);
    try {
      const res = await apiRequest.get<{ data: GalleryImage[] }>(
        `/products/slug/${product.slug}/gallery`,
        { noAuth: true },
      );
      setGalleryImages(res?.data ?? []);
      setGalleryLoaded(true);
      setGalleryIndex(0);
    } catch (err) {
      console.error("Error fetching gallery:", err);
    } finally {
      setGalleryLoading(false);
    }
  }, [product.slug, galleryLoaded, galleryLoading]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goToPrevious = () => {
    if (isExpandSlot) {
      if (galleryLoaded && galleryImages.length > 0) {
        if (galleryIndex === 0) {
          setCurrentImageIndex(images.length - 1);
        } else {
          setGalleryIndex((prev) => prev - 1);
        }
      } else {
        setCurrentImageIndex(images.length - 1);
      }
      return;
    }
    if (currentImageIndex === 0) {
      setCurrentImageIndex(EXPAND_INDEX);
      setGalleryIndex(galleryImages.length > 0 ? galleryImages.length - 1 : 0);
      fetchGallery();
    } else {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  const goToNext = () => {
    if (isExpandSlot) {
      if (galleryLoaded && galleryImages.length > 0) {
        if (galleryIndex === galleryImages.length - 1) {
          setCurrentImageIndex(0);
        } else {
          setGalleryIndex((prev) => prev + 1);
        }
      } else {
        setCurrentImageIndex(0);
      }
      return;
    }
    if (currentImageIndex === images.length - 1) {
      setCurrentImageIndex(EXPAND_INDEX);
      setGalleryIndex(0);
      fetchGallery();
    } else {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const goToVariantIndex = (index: number) => {
    setCurrentImageIndex(index);
  };

  const goToExpand = () => {
    setCurrentImageIndex(EXPAND_INDEX);
    setGalleryIndex(0);
    fetchGallery();
  };

  // ── Current main image ─────────────────────────────────────────────────────
  const mainImageUrl = isExpandSlot
    ? (galleryImages[galleryIndex]?.imageUrl ?? "")
    : (images[currentImageIndex]?.imageUrl ?? "");
  const mainImageAlt = isExpandSlot
    ? (galleryImages[galleryIndex]?.altText ?? "Gallery image")
    : (images[currentImageIndex]?.altText ?? "Product image");

  const counterCurrent = isExpandSlot
    ? (galleryLoaded && galleryImages.length > 0 ? `G${galleryIndex + 1}` : "▶")
    : currentImageIndex + 1;
  const counterTotal = isExpandSlot
    ? (galleryLoaded && galleryImages.length > 0 ? `G${galleryImages.length}` : totalVariantSlots)
    : totalVariantSlots;

  // ── Thumbnail window (hiện tối đa 6) ─────────────────────────────────────
  const THUMB_WINDOW = 6;
  const allThumbs = [
    ...images.map((img, i) => ({ type: "variant" as const, index: i })),
    { type: "expand" as const, index: EXPAND_INDEX },
  ];
  const totalThumbs = allThumbs.length;

  // activeThumbIndex: vị trí trong allThumbs của slot đang active
  const activeThumbIndex = isExpandSlot ? EXPAND_INDEX : currentImageIndex;

  // windowStart: đảm bảo active luôn nằm trong window
  const windowStart = Math.min(
    Math.max(0, activeThumbIndex - Math.floor(THUMB_WINDOW / 2)),
    Math.max(0, totalThumbs - THUMB_WINDOW),
  );
  const visibleThumbs = allThumbs.slice(windowStart, windowStart + THUMB_WINDOW);
  const highlights = product.highlights || [];
  const iconMap: Record<string, any> = {
    gpu:     Gpu,
    storage: Package,
    cpu:     Cpu,
  };

  return (
    <>
      <div>
        {/* ── MAIN IMAGE ──────────────────────────────────────────────────── */}
        <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-neutral-light rounded-lg transition-colors duration-300 py-6">
          <div className="relative w-full h-full flex items-center justify-center">
            {!isExpandSlot && mainImageUrl && (
              <Image
                src={mainImageUrl}
                className="max-w-full max-h-full object-contain transition-opacity duration-500"
                alt={mainImageAlt}
                fill
              />
            )}
            {isExpandSlot && galleryLoading && (
              <div className="flex flex-col items-center justify-center gap-3 text-neutral-darker">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm opacity-60">Đang tải ảnh...</p>
              </div>
            )}
            {isExpandSlot && !galleryLoading && mainImageUrl && (
              <Image
                src={mainImageUrl}
                className="max-w-full max-h-full object-contain transition-opacity duration-500"
                alt={mainImageAlt}
                fill
              />
            )}
            {isExpandSlot && !galleryLoading && !mainImageUrl && (
              <div className="flex flex-col items-center justify-center gap-3 text-neutral-darker">
                <Images className="w-10 h-10 opacity-30" />
                <p className="text-sm opacity-50">Chưa có ảnh</p>
              </div>
            )}
            <WishlistHeart productId={product.id} />
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

          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-primary-dark/80 text-neutral-light px-2 sm:px-3 py-1 sm:py-2 rounded-lg backdrop-blur-sm z-10 transition-colors duration-300">
            <div className="text-xs text-neutral mt-1">
              {counterCurrent}/{counterTotal}
            </div>
          </div>
        </div>

        {/* ── THUMBNAILS ──────────────────────────────────────────────────── */}
        <div className="mt-4">
          <div className="grid grid-cols-6 gap-3 sm:gap-4">
            {visibleThumbs.map((thumb) => {
              if (thumb.type === "expand") {
                return (
                  <ThumbnailCell
                    key="expand"
                    isActive={isExpandSlot}
                    onClick={goToExpand}
                    isExpand
                  >
                    <div className="flex flex-col items-center justify-center h-full gap-1">
                      {galleryLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      ) : galleryLoaded ? (
                        <>
                          <Images className="w-5 h-5 text-primary" />
                          <span className="text-[10px] text-primary font-medium">
                            +{galleryImages.length}
                          </span>
                        </>
                      ) : (
                        <>
                          <Images className="w-5 h-5 text-neutral-darker" />
                          <span className="text-[10px] text-neutral-darker">Xem thêm</span>
                        </>
                      )}
                    </div>
                  </ThumbnailCell>
                );
              }

              const image = images[thumb.index];
              if (!image?.imageUrl) return null;
              return (
                <ThumbnailCell
                  key={image.id}
                  isActive={!isExpandSlot && currentImageIndex === thumb.index}
                  onClick={() => goToVariantIndex(thumb.index)}
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.altText || `Product image ${thumb.index + 1}`}
                    fill
                    sizes="120px"
                    className={`object-contain transition-all duration-300 p-2.5 sm:p-3 ${
                      !isExpandSlot && currentImageIndex === thumb.index
                        ? "opacity-100 scale-100"
                        : "opacity-60 scale-95 group-hover:opacity-100 group-hover:scale-100"
                    }`}
                  />
                </ThumbnailCell>
              );
            })}
          </div>

          {/* PRODUCT HIGHLIGHTS */}
          {isInStock && (
            <div className="mt-8 space-y-8">
              <div className="text-base flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="font-semibold text-primary">Thông số nổi bật</h2>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8 border-b border-neutral-dark pb-6 transition-colors duration-300">
                {highlights.map((highlight, index) => {
                  const IconComponent = highlight?.icon ? iconMap[highlight.icon] : null;
                  return (
                    <div className="flex-1" key={index}>
                      <span className="text-sm">{highlight?.name || "N/A"}</span>
                      <div className="flex items-center gap-2 mt-2">
                        {IconComponent && <IconComponent size={28} />}
                        <span className="text-sm font-semibold text-primary">
                          {highlight?.value || "N/A"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PRODUCT POLICIES */}
          {isInStock && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between mt-6 items-start sm:items-center gap-2">
                <h2 className="text-base font-semibold text-primary">Chính sách sản phẩm</h2>
                <button className="text-sm text-promotion hover:text-accent-hover hover:underline cursor-pointer transition-colors duration-200">
                  Tìm hiểu thêm
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap mt-4">
                <div className="flex items-center gap-2 sm:mr-12">
                  <MdVerified size={28} />
                  <p className="text-sm text-primary">Hàng chính hãng - Bảo hành 18 tháng</p>
                </div>
                <div className="flex items-center gap-2">
                  <FaShippingFast size={28} />
                  <p className="text-sm text-primary">Miễn phí giao hàng toàn quốc</p>
                </div>
                <div className="flex items-center gap-2">
                  <FaUserCog size={28} />
                  <p className="text-sm text-primary">Kỹ thuật viên hỗ trợ trực tuyến</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── ThumbnailCell ──────────────────────────────────────────────────────────
function ThumbnailCell({
  isActive,
  onClick,
  isExpand = false,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  isExpand?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative group rounded-xl overflow-hidden transition-all duration-300 ease-out ${
        isActive
          ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20 scale-105 cursor-pointer"
          : "ring-1 ring-black/10 hover:ring-2 hover:ring-blue-500 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105 cursor-pointer"
      } ${isExpand ? " border-neutral-dark" : ""}`}
    >
      <div className="relative aspect-square bg-white rounded-xl overflow-hidden">
        {children}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </button>
  );
}