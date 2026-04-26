"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import OptionValues from "@/(client)/products/components/OptionValues/OptionValues";
import {
  FaStar,
  FaGift,
  FaCog,
  FaTruck,
  FaPlus,
  FaMinus,
  FaUndoAlt,
} from "react-icons/fa";
import { FaUserCog, FaShippingFast } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { Gift } from "lucide-react";
import { ProductDetail } from "@/lib/types/product";
import Link from "next/link";
import AddToCartButton from "@/(client)/cart/components/AddToCartButton";
import { useToasty } from "@/components/Toast";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { HighlightIcon } from "@/components/product/HighlightIcon";
import type {
  ProductVariant,
  VariantOption,
  VariantOptionValue,
  ProductPrice,
} from "../../types";
import type { Highlight } from "@/lib/types/product";

const TYPE_LABELS: Record<string, string> = {
  color: "Màu sắc",
  storage: "Dung lượng",
  bundle: "Phiên bản",
  ram: "RAM",
};

interface ProductDetailRightProps {
  product?: ProductDetail;
  selectedOptions?: Record<string, string>;
  onOptionChange?: (type: string, value: string) => void;
  onReviewClick?: () => void;
  onSpecificationClick?: () => void;
  selectedVariant?: ProductVariant;
  selectedPrice?: ProductPrice;
  availableOptions?: VariantOption[];
}

function HighlightsBlock({ highlights }: { highlights: Highlight[] }) {
  if (!highlights?.length) return null;
  return (
    <div className="mt-6">
      <h2 className="font-semibold text-primary text-sm sm:text-base mb-3">
        Thông số nổi bật
      </h2>
      <div className="grid grid-cols-3 sm:flex sm:flex-row sm:items-start gap-4 sm:gap-6 border-b border-neutral-dark pb-5">
        {highlights.map((highlight, index) => (
          <div className="flex flex-col gap-1" key={index}>
            <span className="text-xs text-neutral-dark leading-tight line-clamp-2 min-h-[32px]">
              {highlight?.name || "N/A"}
            </span>
            <div className="flex items-start gap-1.5">
              <div className="flex-shrink-0 mt-0.5">
                <HighlightIcon icon={highlight?.icon ?? "default"} />
              </div>
              <span className="text-sm font-semibold text-primary leading-tight">
                {highlight?.value || "N/A"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PoliciesBlock() {
  return (
    <div className="mt-5">
      <div className="flex justify-between items-center gap-2 mb-3">
        <h2 className="text-sm sm:text-base font-semibold text-primary">
          Chính sách sản phẩm
        </h2>
        {/* <button className="text-xs sm:text-sm font-medium text-accent underline underline-offset-2 hover:opacity-75 transition-opacity active:scale-95 cursor-pointer">Tìm hiểu thêm</button> */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <MdVerified size={20} />
          <p className="text-xs sm:text-sm text-primary">
            Hàng chính hãng - Bảo hành 18 tháng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FaShippingFast size={20} />
          <p className="text-xs sm:text-sm text-primary">
            Miễn phí giao hàng toàn quốc
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FaUserCog size={20} />
          <p className="text-xs sm:text-sm text-primary">
            Kỹ thuật viên hỗ trợ trực tuyến
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FaUndoAlt size={20} />
          <p className="text-xs sm:text-sm text-primary">
            Đổi trả dễ dàng trong 7 ngày
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailRight({
  product,
  selectedOptions = {},
  onOptionChange,
  selectedVariant,
  selectedPrice,
  onReviewClick,
  onSpecificationClick,
  availableOptions = [],
}: ProductDetailRightProps = {}) {
  const toasty = useToasty();
  const { addToCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  // useEffect(() => {
  //   setQuantity(1);
  // }, [selectedVariant?.id]);

  if (!product) return <div className="text-primary">Loading...</div>;

  const activePrice = selectedPrice || product.price;
  const displayPrice = activePrice?.hasPromotion
    ? activePrice.final
    : (activePrice?.base ?? 0);
  const finalPrice = activePrice?.final ?? activePrice?.base ?? 0;
  const basePrice = activePrice?.base ?? 0;

  const maxStock = selectedVariant?.quantity ?? 0;
  const isOutOfStock =
    selectedVariant?.stockStatus === "out_of_stock" || maxStock === 0;
  const isInStock = !isOutOfStock && maxStock > 0;

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.min(Math.max(1, newQuantity), maxStock));
  };

  const getStorageLabel = () =>
    availableOptions
      .find((opt) => opt.type === "storage")
      ?.values?.find(
        (v: VariantOptionValue) => v.value === selectedOptions?.storage,
      )?.label ?? "";

  const handleBuyNow = async () => {
    if (!selectedVariant?.id) {
      toasty.warning("Vui lòng chọn phiên bản sản phẩm");
      return;
    }

    const availQty =
      selectedVariant.availableQuantity ??
      selectedVariant.stock ??
      selectedVariant.quantity ??
      0;

    try {
      await addToCart(selectedVariant.id, 1, {
        productName: product.name,
        productId: product.id,
        productSlug: product.slug,
        brandName: product.brand.name,
        variantName: selectedVariant.sku ?? "",
        price: finalPrice,
        originalPrice: basePrice,
        imageUrl:
          selectedVariant.image ?? selectedVariant.images?.[0]?.imageUrl ?? "",
        availableQuantity: availQty,
        color: selectedVariant.color ?? "",
        colorValue: selectedVariant.colorValue ?? "",
        storageLabel: getStorageLabel(),
      });
      router.push("/cart");
    } catch {
      toasty.error("Không thể thêm vào giỏ hàng, vui lòng thử lại");
    }
  };

  const highlights = product.highlights || [];

  return (
    <div className="w-full">
      <style>{`
        .badge-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 2.4s infinite;
        }
        @keyframes shimmer { 0% { left: -60%; } 100% { left: 160%; } }
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 0 1px rgba(22,163,74,0.4), 0 2px 8px rgba(5,150,105,0.35); }
          50%       { box-shadow: 0 0 0 3px rgba(22,163,74,0.25), 0 4px 16px rgba(5,150,105,0.45); }
        }
        @keyframes pulseAmber {
          0%, 100% { box-shadow: 0 0 0 1px rgba(217,119,6,0.4), 0 2px 8px rgba(234,88,12,0.35); }
          50%       { box-shadow: 0 0 0 3px rgba(217,119,6,0.25), 0 4px 16px rgba(234,88,12,0.45); }
        }
      `}</style>

      {/* Badges */}
      <div className="hidden xl:flex flex-row gap-4 w-fit">
        <span
          className="badge-shimmer relative overflow-hidden rounded-lg px-3 py-1.5 flex items-center gap-2"
          style={{
            background: "linear-gradient(135deg, #16a34a, #059669)",
            animation: "pulseGreen 2.8s ease-in-out infinite",
          }}
        >
          <FaTruck className="text-white text-sm flex-shrink-0" />
          <p className="text-xs sm:text-sm font-semibold text-white">
            Free ship toàn quốc
          </p>
        </span>
        <span
          className="badge-shimmer relative overflow-hidden rounded-lg px-3 py-1.5 flex items-center gap-2"
          style={{
            background: "linear-gradient(135deg, #d97706, #ea580c)",
            animation: "pulseAmber 2.8s ease-in-out infinite 0.6s",
          }}
        >
          <FaStar className="text-yellow-300 text-sm flex-shrink-0" />
          <p className="text-xs sm:text-sm font-semibold text-white">
            Độc quyền tại ChoCongNghe
          </p>
        </span>
      </div>

      {/* Title */}
      <h2 className="my-3 sm:my-4 text-lg sm:text-xl lg:text-2xl font-bold text-primary">
        {selectedVariant?.name || product.name}
      </h2>

      {/* Rating & Links */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <span>{product.currentVariant?.code}</span>
        <div className="flex items-center gap-1">
          <FaStar className="text-yellow-400 text-xs sm:text-sm" />
          <span className="text-primary">
            {product.rating.average.toFixed(1)}
          </span>
        </div>
        <button
          onClick={onReviewClick}
          className="text-accent hover:underline cursor-pointer"
        >
          {product.rating.total} đánh giá
        </button>
        <span>|</span>
        <button
          onClick={onSpecificationClick}
          className="text-accent hover:underline cursor-pointer"
        >
          Thông số kỹ thuật
        </button>
      </div>

      {/* Options + Quantity */}
     <div className="flex flex-col gap-y-4 sm:gap-y-5 mt-6">
  {availableOptions.map((option) => (
    <div key={option.type} className="flex flex-col gap-2">
      <span className="font-medium text-primary text-xs sm:text-sm">
        {TYPE_LABELS[option.type] ?? option.type}:
      </span>
      <OptionValues
        option={option}
        selectedOptions={selectedOptions}
        onOptionChange={onOptionChange}
      />
    </div>
  ))}

        {isInStock && (
          <>
            <span className="font-medium text-primary text-xs sm:text-sm flex items-center">
              Số lượng:
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-neutral rounded-lg overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center bg-neutral-light hover:bg-neutral transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FaMinus className="text-primary text-sm" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={maxStock}
                  value={quantity}
                  onChange={(e) =>
                    handleQuantityChange(parseInt(e.target.value) || 1)
                  }
                  className="w-16 h-10 text-center border-x border-neutral focus:outline-none bg-neutral-light text-primary font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= maxStock}
                  className="w-10 h-10 flex items-center justify-center bg-neutral-light hover:bg-neutral transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FaPlus className="text-primary text-sm" />
                </button>
              </div>
              <span className="text-xs sm:text-sm text-neutral-dark">
                Còn {maxStock} sản phẩm
              </span>
            </div>
          </>
        )}
      </div>

      {isInStock ? (
        <>
          {/* Price */}
          <div className="bg-neutral/40 p-4 sm:py-6 rounded-lg mt-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-promotion">
              {displayPrice.toLocaleString("vi-VN")}₫
            </h3>
            {activePrice?.hasPromotion && (
              <div className="flex gap-2 items-center mt-1">
                <span className="text-xs sm:text-sm line-through text-neutral-500">
                  {basePrice.toLocaleString("vi-VN")}₫
                </span>
                <span className="text-xs font-bold text-white bg-promotion px-2 py-0.5 rounded">
                  -{activePrice.discountPercentage}%
                </span>
              </div>
            )}
            {product.availablePromotions &&
              product.availablePromotions.length > 0 && (
                <div className="mt-3 sm:mt-4">
                  <p className="font-semibold mb-2 text-xs sm:text-sm text-primary">
                    Chọn 1 trong các khuyến mãi sau:
                  </p>
                  <div className="border border-promotion/30 rounded-lg overflow-hidden bg-neutral-light">
                    {product.availablePromotions.map((promo, index) => (
                      <div
                        key={promo.id}
                        className={`flex items-start gap-2 px-3 py-2 text-xs sm:text-sm ${index !== product.availablePromotions!.length - 1 ? "border-b border-neutral" : ""}`}
                      >
                        <Gift className="w-4 h-4 text-promotion mt-0.5 shrink-0" />
                        <span className="text-primary">
                          {promo.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Highlights + Policies: mobile only */}
          <div className="lg:hidden mt-6">
            <HighlightsBlock highlights={highlights} />
            <PoliciesBlock />
          </div>

          {/* Banner */}
          <div className="py-4 sm:py-6 rounded-lg">
            <Image
              src="https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/507x85_6_f64d62e323.png"
              alt="Banner"
              width={507}
              height={85}
              className="w-full h-auto rounded-lg"
            />
          </div>

          {/* Gifts */}
          <div className="flex flex-col border border-neutral rounded-lg mb-4">
            <div className="flex justify-between items-center px-3 sm:px-4 py-3 sm:py-4 bg-neutral rounded-t-lg">
              <p className="text-sm sm:text-base font-semibold text-primary">
                Quà tặng và ưu đãi khác
              </p>
            </div>
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 my-3">
                <FaGift className="text-primary text-base sm:text-lg shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="break-words text-primary">
                    Tặng phiếu mua hàng 50,000đ khi mua sim FPT kèm máy
                  </span>
                  {/* <Link
                    href="#"
                    className="text-xs sm:text-sm font-medium text-primary hover:text-primary underline underline-offset-2 transition-all active:scale-95 cursor-pointer inline-block w-fit"
                  >
                    Xem chi tiết
                  </Link> */}
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <p className="whitespace-nowrap text-xs sm:text-sm text-primary">
                  Ưu đãi
                </p>
                <span className="border border-neutral w-full" />
              </div>
              <div className="flex items-start gap-3 mb-3">
                <FaCog className="text-primary text-base sm:text-lg shrink-0 mt-0.5" />
                <span className="break-words text-primary">
                  Giảm 5% mua camera cho đơn hàng Điện thoại/ Tablet từ 1 triệu{" "}
                  {/* <Link href="#" className="text-xs sm:text-sm font-medium text-primary hover:text-primary underline underline-offset-2 transition-all active:scale-95 cursor-pointer">
                    Xem chi tiết
                  </Link> */}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons — desktop only */}
          <div className="hidden lg:flex gap-2 sm:gap-3">
            <AddToCartButton
              productVariantId={selectedVariant?.id || ""}
              quantity={quantity}
              disabled={!selectedVariant?.id}
              meta={{
                productName: product.name,
                productId: product.id,
                productSlug: product.slug,
                variantName: selectedVariant?.sku ?? "",
                price: finalPrice,
                originalPrice: basePrice,
                imageUrl:
                  selectedVariant?.image ??
                  selectedVariant?.images?.[0]?.imageUrl ??
                  "",
                availableQuantity: maxStock ?? 0,
                color: selectedVariant?.color ?? "",
                storageLabel: getStorageLabel(),
                colorValue: selectedVariant?.colorValue ?? "",
                brandName: product.brand.name,
              }}
              label=""
              iconSize={26}
              className={`
                !flex-1 !py-3 !rounded-lg
                !border !border-neutral-dark
                !bg-neutral-light !text-primary
                hover:!bg-neutral active:scale-95
                transition-all duration-200
                disabled:!opacity-50 disabled:!cursor-not-allowed
              `}
            />
            <button
              onClick={handleBuyNow}
              disabled={!selectedVariant?.id}
              className="flex-[2] bg-primary text-neutral-light py-3 rounded-lg hover:bg-primary-hover active:scale-95 transition-all duration-200 text-sm sm:text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mua ngay
            </button>
          </div>
        </>
      ) : (
        /* Out of stock */
        <div className="mt-6 rounded-2xl overflow-hidden border border-neutral shadow-sm hover:shadow-lg transition-all duration-300 animate-fadeUp">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl animate-bounceSlow">
              📦
            </div>
            <div className="flex-1">
              <p className="text-primary font-bold text-sm sm:text-base">
                Tạm hết hàng
              </p>
              <p className="text-neutral-dark text-xs">
                Sản phẩm sẽ sớm quay lại, bạn vui lòng quay lại sau
              </p>
            </div>
          </div>
          <div className="border-t border-neutral bg-neutral-light px-5 py-4 space-y-3">
            <Link
              href="/category/dien-thoai"
              className="block w-full text-center bg-primary hover:bg-primary-hover text-neutral-light font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md"
            >
              🔍 Xem sản phẩm tương tự
            </Link>
            <div className="flex justify-between items-center text-xs">
              <a
                href="tel:18006601"
                className="flex items-center gap-1.5 text-neutral-dark hover:text-promotion transition-colors"
              >
                <span className="text-promotion">📞</span>
                1800-6601
              </a>
              <span className="text-neutral-dark opacity-70">
                Hỗ trợ miễn phí 24/7
              </span>
            </div>
          </div>
          <div className="h-20 lg:hidden" />
          <style>{`
            @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
            .animate-fadeUp     { animation: fadeUp 0.5s ease; }
            .animate-bounceSlow { animation: bounceSlow 2s infinite; }
          `}</style>
        </div>
      )}
    </div>
  );
}
