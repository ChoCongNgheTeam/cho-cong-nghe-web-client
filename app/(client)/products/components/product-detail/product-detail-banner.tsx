"use client";

import { ChevronLeft, ChevronRight, Images, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { ProductDetail, CurrentVariant } from "@/lib/types/product";
import { MdVerified } from "react-icons/md";
import { FaUserCog, FaShippingFast } from "react-icons/fa";
import Image from "next/image";
import WishlistHeart from "@/components/shared/WishlistHeart";
import clsx from "clsx";
import { GitCompareArrows } from "lucide-react";
import { useCompareStore } from "@/(client)/compare/compareStore";
import { useToasty } from "@/components/Toast";
import { HighlightIcon } from "@/components/product/HighlightIcon";
import { useIsMobile } from "@/(client)/compare/Useismobile";
import { getProductGallery } from "../../_lib";
import type { GalleryImage } from "../../types";
import { heroUrl, thumbnailUrl } from "@/helpers/resizeImage";

interface ProductDetailLeftProps {
  product: ProductDetail;
  selectedVariant?: {
    id?: string;
    quantity?: number;
    stockStatus?: "in_stock" | "out_of_stock";
    code?: string;
    [key: string]: unknown;
  };
  images: Array<{ imageUrl: string; id?: string; altText?: string; position?: number; color?: string; variantId?: string }>;
  onColorChange?: (variantId: string) => void;
}

interface ThumbnailCellProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  isExpand?: boolean;
}

export default function ProductDetailBanner({ product, images, selectedVariant, onColorChange }: ProductDetailLeftProps) {
  const validImages = images.filter((img) => !!img?.imageUrl);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [colorVariantMap, setColorVariantMap] = useState<Record<string, string>>({});
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const lastSyncedVariantId = useRef<string | null>(null);

  const EXPAND_INDEX = validImages.length;
  const isExpandSlot = currentImageIndex === EXPAND_INDEX;
  const totalVariantSlots = validImages.length + 1;

  const { add, remove, isInCompare } = useCompareStore();
  const { success, error, warning, info } = useToasty();
  const inCompare = isInCompare(product.id);
  const isMobile = useIsMobile();

  const handleToggleCompare = () => {
    if (inCompare) {
      remove(product.id);
      info("Đã bỏ khỏi danh sách so sánh");
      return;
    }
    const result = add(product);
    if (!result.success) {
      switch (result.reason) {
        case "full":
          warning(isMobile ? "Chỉ được so sánh tối đa 2 sản phẩm trên điện thoại" : "Chỉ được so sánh tối đa 3 sản phẩm");
          break;
        case "duplicate":
          info("Sản phẩm đã có trong danh sách");
          break;
        case "wrong_category":
          error("Chỉ có thể so sánh các sản phẩm cùng danh mục sản phẩm đầu tiên trong trang so sánh !!");
          break;
      }
    } else {
      success("Đã thêm vào so sánh");
    }
  };

  useEffect(() => {
    setCurrentImageIndex(0);
    setGalleryIndex(0);
  }, [images]);

  useEffect(() => {
    if (selectedVariant?.id) {
      lastSyncedVariantId.current = selectedVariant.id;
    }
  }, [selectedVariant?.id]);

  const maxStock = selectedVariant?.quantity ?? 0;
  const isOutOfStock = selectedVariant?.stockStatus === "out_of_stock" || maxStock === 0;
  const isInStock = !isOutOfStock && maxStock > 0;

  const fetchGallery = useCallback(async () => {
    if (galleryLoaded || galleryLoading) return;
    setGalleryLoading(true);
    try {
      const data = await getProductGallery(product.slug);
      setGalleryImages((data?.images ?? []).filter((img) => !!img?.imageUrl));
      setColorVariantMap(data?.colorVariantMap ?? {});
      setGalleryLoaded(true);
      setGalleryIndex(0);
    } catch (err) {
      console.error("Error fetching gallery:", err);
    } finally {
      setGalleryLoading(false);
    }
  }, [product.slug, galleryLoaded, galleryLoading]);

  const syncColorFromGalleryIndex = useCallback(
    (index: number) => {
      if (!onColorChange || !galleryLoaded) return;
      const img = galleryImages[index];
      if (!img?.color) return;
      const variantId = colorVariantMap[img.color];
      if (!variantId) return;
      if (variantId !== lastSyncedVariantId.current) {
        lastSyncedVariantId.current = variantId;
        onColorChange(variantId);
      }
    },
    [galleryImages, colorVariantMap, galleryLoaded, onColorChange],
  );

  const goToPrevious = () => {
    if (isExpandSlot) {
      if (galleryLoaded && galleryImages.length > 0) {
        if (galleryIndex === 0) {
          setCurrentImageIndex(validImages.length - 1);
        } else {
          const newIdx = galleryIndex - 1;
          setGalleryIndex(newIdx);
          syncColorFromGalleryIndex(newIdx);
        }
      } else {
        setCurrentImageIndex(validImages.length - 1);
      }
      return;
    }
    if (currentImageIndex === 0) {
      setCurrentImageIndex(EXPAND_INDEX);
      const lastIdx = galleryImages.length > 0 ? galleryImages.length - 1 : 0;
      setGalleryIndex(lastIdx);
      fetchGallery().then(() => syncColorFromGalleryIndex(lastIdx));
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
          const newIdx = galleryIndex + 1;
          setGalleryIndex(newIdx);
          syncColorFromGalleryIndex(newIdx);
        }
      } else {
        setCurrentImageIndex(0);
      }
      return;
    }
    if (currentImageIndex === validImages.length - 1) {
      setCurrentImageIndex(EXPAND_INDEX);
      setGalleryIndex(0);
      fetchGallery();
    } else {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const goToGalleryIndex = (index: number) => {
    setGalleryIndex(index);
    syncColorFromGalleryIndex(index);
  };

  const rawMainUrl = isExpandSlot
    ? (galleryImages[galleryIndex]?.imageUrl ?? "")
    : (validImages[currentImageIndex]?.imageUrl ?? "");

  const mainImageUrl = rawMainUrl ? heroUrl(rawMainUrl, 800) : "";
  const mainImageAlt = isExpandSlot
    ? (galleryImages[galleryIndex]?.altText ?? "Gallery image")
    : (validImages[currentImageIndex]?.altText ?? "Product image");

  const counterCurrent = isExpandSlot ? (galleryLoaded && galleryImages.length > 0 ? `G${galleryIndex + 1}` : "▶") : currentImageIndex + 1;
  const counterTotal = isExpandSlot ? (galleryLoaded && galleryImages.length > 0 ? `G${galleryImages.length}` : totalVariantSlots) : totalVariantSlots;

  const allThumbs = [...validImages.map((img, i) => ({ type: "variant" as const, index: i })), { type: "expand" as const, index: EXPAND_INDEX }];

  const thumbRowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = thumbRowRef.current;
    if (!row) return;
    const activeIndex = isExpandSlot ? allThumbs.length - 1 : currentImageIndex;
    const activeEl = row.children[activeIndex] as HTMLElement | undefined;
    if (activeEl) activeEl.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [currentImageIndex, isExpandSlot]);

  const highlights = product.highlights || [];

  return (
    <div>
      {/* Main Image */}
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
          {!isExpandSlot && !mainImageUrl && (
            <div className="flex flex-col items-center justify-center gap-3 text-neutral-darker">
              <Images className="w-16 h-16 opacity-20" />
              <p className="text-sm opacity-40">Chưa có ảnh sản phẩm</p>
            </div>
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
          <WishlistHeart productId={product.id} absolute={true} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleCompare();
            }}
            className={clsx(
              "absolute top-2 left-2 z-10 p-2 rounded-full shadow transition-colors duration-200",
              inCompare ? "bg-primary text-white" : "bg-neutral-light/90 text-neutral-darker hover:bg-neutral-light hover:text-primary cursor-pointer",
            )}
            aria-label={inCompare ? "Bỏ so sánh" : "Thêm vào so sánh"}
            title={inCompare ? "Bỏ so sánh" : "Thêm vào so sánh"}
          >
            <GitCompareArrows className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={goToPrevious}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-neutral-light/90 hover:bg-neutral-light text-primary rounded-full p-1.5 sm:p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10 cursor-pointer"
          aria-label="Ảnh trước"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          type="button"
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

      {/* Thumbnails */}
      <div className="mt-4">
        <div ref={thumbRowRef} className="flex gap-2 sm:gap-3 lg:gap-4 scroll-smooth scrollbar-hide py-1.5 px-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {allThumbs.map((thumb) => {
            if (thumb.type === "expand") {
              return (
                <ThumbnailCell
                  key="expand"
                  isActive={isExpandSlot}
                  onClick={() => {
                    setCurrentImageIndex(EXPAND_INDEX);
                    setGalleryIndex(0);
                    fetchGallery();
                  }}
                  isExpand
                >
                  <div className="flex flex-col items-center justify-center h-full gap-1">
                    {galleryLoading ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-primary" />
                    ) : galleryLoaded ? (
                      <>
                        <Images className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <span className="text-[9px] sm:text-[10px] text-primary font-medium">+{galleryImages.length}</span>
                      </>
                    ) : (
                      <>
                        <Images className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-darker" />
                        <span className="text-[9px] sm:text-[10px] text-neutral-darker">Xem thêm</span>
                      </>
                    )}
                  </div>
                </ThumbnailCell>
              );
            }
            const image = validImages[thumb.index];
            if (!image?.imageUrl) return null;
            return (
              <ThumbnailCell
                key={image.imageUrl || `variant-${thumb.index}`}
                isActive={!isExpandSlot && currentImageIndex === thumb.index}
                onClick={() => setCurrentImageIndex(thumb.index)}
              >
                <Image
                  src={thumbnailUrl(image.imageUrl, 96)}
                  alt={image.altText || `Product image ${thumb.index + 1}`}
                  fill
                  sizes="(max-width: 640px) 56px, (max-width: 1024px) 72px, 96px"
                  className={clsx(
                    "object-contain transition-all duration-300 p-1.5 sm:p-2 lg:p-3",
                    !isExpandSlot && currentImageIndex === thumb.index ? "opacity-100 scale-100" : "opacity-60 scale-95 group-hover:opacity-100 group-hover:scale-100",
                  )}
                />
              </ThumbnailCell>
            );
          })}
        </div>

        {isExpandSlot && galleryLoaded && galleryImages.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-6 px-1 py-1 scrollbar-hide md:scrollbar-thin md:scrollbar-thumb-gray-300 md:hover:scrollbar-thumb-gray-400 scroll-smooth">
            {galleryImages.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => goToGalleryIndex(idx)}
                className={clsx(
                  "relative group flex-shrink-0 w-14 h-14 rounded-xl transition-all duration-200 ease-out cursor-pointer",
                  galleryIndex === idx
                    ? "ring-[1.5px] ring-accent shadow-md shadow-accent/20 scale-105"
                    : "ring-1 ring-black/10 hover:ring-[1.5px] hover:ring-accent hover:shadow-md hover:shadow-accent/10 hover:scale-105",
                )}
              >
                <div className="relative w-full h-full bg-white rounded-xl overflow-hidden">
                  <Image
                    src={thumbnailUrl(img.imageUrl, 56)}
                    alt={img.altText || `Gallery ${idx + 1}`}
                    fill
                    sizes="56px"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    className={clsx(
                      "object-contain p-1.5 transition-all duration-300",
                      galleryIndex === idx ? "opacity-100 scale-100" : "opacity-60 scale-95 group-hover:opacity-100 group-hover:scale-100",
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                </div>
              </button>
            ))}
          </div>
        )}

        {isInStock && (
          <div className="hidden lg:block">
            {highlights.length > 0 && (
              <div className="mt-8">
                <div className="text-base flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <h2 className="font-semibold text-primary">Thông số nổi bật</h2>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8 border-b border-neutral-dark pb-6 transition-colors duration-300">
                  {highlights.map((highlight, index) => (
                    <div className="flex-1" key={index}>
                      <span className="text-sm">{highlight?.name || "N/A"}</span>
                      <div className="flex items-center gap-2 mt-2">
                        <HighlightIcon icon={highlight?.icon ?? "default"} />
                        <span className="text-sm font-semibold text-primary">{highlight?.value || "N/A"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="flex flex-col sm:flex-row justify-between mt-6 items-start sm:items-center gap-2">
                <h2 className="text-base font-semibold text-primary">Chính sách sản phẩm</h2>
                <button type="button" className="text-xs sm:text-sm font-medium text-accent underline underline-offset-2 hover:opacity-75 transition-opacity active:scale-95 cursor-pointer">
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
          </div>
        )}
      </div>
    </div>
  );
}

function ThumbnailCell({ isActive, onClick, children, isExpand }: ThumbnailCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "relative group flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 lg:w-24 lg:h-24",
        "rounded-xl overflow-hidden transition-all duration-200 ease-out cursor-pointer",
        isActive ? "ring-[1.5px] ring-accent shadow-md shadow-accent/20 scale-105" : "ring-1 ring-black/10 hover:ring-[1.5px] hover:ring-accent hover:shadow-md hover:shadow-accent/10 hover:scale-105",
      )}
    >
      <div className="relative w-full h-full bg-white rounded-xl overflow-hidden">
        {children}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>
    </button>
  );
}