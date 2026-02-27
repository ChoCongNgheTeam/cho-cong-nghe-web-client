import { ChevronLeft, ChevronRight, Gpu, Package, Cpu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ProductDetail, CurrentVariant } from "@/lib/types/product";
import { MdPhoneIphone, MdMemory, MdVerified } from "react-icons/md";
import { IoRadioButtonOn } from "react-icons/io5";
import { FaUserCog, FaShippingFast } from "react-icons/fa";

interface ProductDetailLeftProps {
  product: ProductDetail;
  selectedVariant?: CurrentVariant;
  images: {
    id: string;
    imageUrl: string;
    altText?: string;
    position?: number;
  }[];
}

export default function ProductDetailBanner({
  product,
  images,
  selectedVariant,
}: ProductDetailLeftProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images && images.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [images]);

  const gallery = images || [];
  const currentImageObj = gallery[currentImageIndex];
  const currentImage = currentImageObj?.imageUrl || "";
  const totalImages = gallery.length;

  /* ============================================================================
   * STOCK & AVAILABILITY
   * ========================================================================== */
  const maxStock = selectedVariant?.quantity ?? 0;
  const isOutOfStock =
    selectedVariant?.stockStatus === "out_of_stock" || maxStock === 0;
  const isInStock = !isOutOfStock && maxStock > 0;

  const goToImage = (index: number) => setCurrentImageIndex(index);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? gallery.length - 1 : prev - 1,
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev === gallery.length - 1 ? 0 : prev + 1,
    );
  };

  const highlights = product.highlights || [];

  const iconMap: Record<string, any> = {
    gpu: Gpu,
    storage: Package,
    cpu: Cpu,
  };

  return (
    <>
      <div>
        {/* IMAGE CAROUSEL */}
        <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-neutral-light rounded-lg shadow-xl transition-colors duration-300 py-6">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={currentImage}
              className="max-w-full max-h-full object-contain transition-opacity duration-500"
              alt={currentImageObj?.altText || "Product image"}
            />
            <div className="absolute inset-0 pointer-events-none"></div>
          </div>

          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-neutral-light/90 hover:bg-neutral-light text-primary rounded-full p-1.5 sm:p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-neutral-light/90 hover:bg-neutral-light text-primary rounded-full p-1.5 sm:p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
            aria-label="Ảnh sau"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-primary-dark/80 text-neutral-light px-2 sm:px-3 py-1 sm:py-2 rounded-lg backdrop-blur-sm z-10 transition-colors duration-300">
            <div className="text-xs text-neutral mt-1">
              {currentImageIndex + 1}/{totalImages}
            </div>
          </div>
        </div>

        {/* THUMBNAILS */}
        <div className="mt-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {gallery.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`relative group rounded-xl overflow-hidden transition-all duration-300 ease-out ${
                  index === currentImageIndex
                    ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20 scale-105"
                    : "ring-1 ring-black/10 hover:ring-2 hover:ring-blue-500 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105"
                }`}
                aria-label={`Xem ảnh ${index + 1}`}
              >
                <div className="relative aspect-square bg-white rounded-xl overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.altText || `Product image ${index + 1}`}
                    className={`w-full h-full object-contain transition-all duration-300 p-2.5 sm:p-3 ${
                      index === currentImageIndex
                        ? "opacity-100 scale-100"
                        : "opacity-60 scale-95 group-hover:opacity-100 group-hover:scale-100"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                <div
                  className={`absolute top-1.5 sm:top-2 left-1.5 sm:left-2 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium backdrop-blur-md transition-all duration-300 ${
                    index === currentImageIndex
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-black/40 text-white/90 group-hover:bg-blue-500 group-hover:text-white"
                  }`}
                >
                  {index + 1}
                </div>
              </button>
            ))}
          </div>

          {/* PRODUCT HIGHLIGHTS — chỉ hiển thị khi còn hàng */}
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
                      <span className="text-sm">
                        {highlight?.name || "N/A"}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        {IconComponent && (
                          <IconComponent size={28} className="" />
                        )}
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

          {/* PRODUCT POLICIES — chỉ hiển thị khi còn hàng */}
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
                  <MdVerified size={28} className="" />
                  <p className="text-sm text-primary">
                    Hàng chính hãng - Bảo hành 18 tháng
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <FaShippingFast size={28} className="" />
                  <p className="text-sm text-primary">
                    Miễn phí giao hàng toàn quốc
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <FaUserCog size={28} className="" />
                  <p className="text-sm text-primary">
                    Kỹ thuật viên hỗ trợ trực tuyến
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
