"use client";

import { useState, useEffect, Fragment } from "react"; // ✅ thêm Fragment
import Image from "next/image";
import { FaStar, FaGift, FaCog, FaTruck, FaPlus, FaMinus } from "react-icons/fa";
import { Gift } from "lucide-react";
import { ProductDetail } from "@/lib/types/product";
import Link from "next/link";
import AddToCartButton from "@/(client)/cart/components/AddToCartButton";
import { useToasty } from "@/components/Toast";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";

const TYPE_LABELS: Record<string, string> = {
  color: "Màu sắc",
  storage: "Dung lượng",
  bundle: "Phiên bản",
  ram: "RAM",
};

interface ProductVariant {
  id: string;
  price: number;
  images?: { imageUrl: string }[];
  sku?: string;
  originalPrice?: number;
  image?: string;
  color?: string;
  colorValue?: string;
  name?: string;
  availableQuantity?: number;
  stock?: number;
  quantity?: number;
  stockStatus?: "in_stock" | "out_of_stock";
}

type Price = {
  base: number;
  final: number;
  discountPercentage: number;
  hasPromotion: boolean;
};

interface ProductDetailRightProps {
  product?: ProductDetail;
  selectedOptions?: Record<string, string>;
  onOptionChange?: (type: string, value: string) => void;
  onReviewClick?: () => void;
  onSpecificationClick?: () => void;
  selectedVariant?: ProductVariant;
  selectedPrice?: Price;
  availableOptions?: any[];
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
  if (!product) return <div className="text-primary">Loading...</div>;

  const toasty = useToasty();
  const { addToCart } = useCart();
  const router = useRouter();

  const activePrice = selectedPrice || product.price;
  const displayPrice = activePrice?.hasPromotion ? activePrice.final : (activePrice?.base ?? 0);
  const finalPrice = activePrice?.final ?? activePrice?.base ?? 0;
  const basePrice = activePrice?.base ?? 0;

  const maxStock = selectedVariant?.quantity ?? 0;
  const isOutOfStock = selectedVariant?.stockStatus === "out_of_stock" || maxStock === 0;
  const isInStock = !isOutOfStock && maxStock > 0;

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant?.id]);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.min(Math.max(1, newQuantity), maxStock));
  };

  const handleBuyNow = async () => {
    if (!selectedVariant?.id) {
      toasty.warning("Vui lòng chọn phiên bản sản phẩm");
      return;
    }
    try {
      await addToCart(selectedVariant.id, 1, {
        productName: product.name,
        productId: product.id,
        productSlug: product.slug,
        brandName: product.brand.name,
        variantName: selectedVariant.sku ?? "",
        price: finalPrice,
        originalPrice: basePrice,
        imageUrl: selectedVariant.image ?? selectedVariant.images?.[0]?.imageUrl ?? "",
        availableQuantity: selectedVariant.availableQuantity ?? selectedVariant.stock ?? 0,
        color: selectedVariant.color ?? "",
        colorValue: selectedVariant.colorValue ?? "",
      });
      router.push("/cart");
    } catch {
      toasty.error("Không thể thêm vào giỏ hàng, vui lòng thử lại");
    }
  };

  const handleInstallment = () => {
    if (!selectedVariant?.id) {
      toasty.warning("Vui lòng chọn phiên bản sản phẩm");
      return;
    }
    toasty.info("Đang chuyển đến trang đăng ký trả góp...");
  };

  return (
    <div className="w-full">
      {/* Badges */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
        <span className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 px-3 py-1.5 shadow-md flex items-center justify-center sm:justify-start">
          <FaTruck className="mr-2 text-white text-sm sm:text-base" />
          <p className="text-xs sm:text-sm font-semibold text-white">Free ship toàn quốc</p>
        </span>
        <span className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-500 px-3 py-1.5 shadow-md flex items-center justify-center sm:justify-start">
          <FaStar className="mr-2 text-yellow-300 text-sm sm:text-base" />
          <p className="text-xs sm:text-sm font-semibold text-white">Độc quyền tại ChoCongNghe</p>
        </span>
      </div>

      {/* Product Title */}
      <h2 className="my-3 sm:my-4 text-lg sm:text-xl lg:text-2xl font-bold text-primary">{selectedVariant?.name || product.name}</h2>

      {/* Rating & Links */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <span>{product.currentVariant?.code}</span>
        <div className="flex items-center gap-1">
          <FaStar className="text-accent text-xs sm:text-sm" />
          <span className="text-primary">{product.rating.average.toFixed(1)}</span>
        </div>
        <button onClick={onReviewClick} className="text-accent hover:underline cursor-pointer">
          {product.rating.total} đánh giá
        </button>
        <span>|</span>
        <button onClick={onSpecificationClick} className="text-accent hover:underline cursor-pointer">
          Thông số kỹ thuật
        </button>
      </div>

      {/* Dynamic Options */}
      <div className="grid grid-cols-[90px_1fr] sm:grid-cols-[100px_1fr] gap-y-4 sm:gap-y-5 gap-x-4 mt-6">
        {availableOptions.map((option) => (
          <Fragment key={option.type}>
            {" "}
            {/* ✅ Fragment với key thay vì <> */}
            <span className="font-medium text-primary text-xs sm:text-sm flex items-center">{TYPE_LABELS[option.type] ?? option.type}:</span>
            <div className="flex flex-wrap gap-2">
              {option.values
                ?.filter((val: any) => val.enabled)
                .map((val: any) => {
                  const active = selectedOptions[option.type] === val.value;
                  return (
                    <span
                      key={val.value}
                      onClick={() => onOptionChange?.(option.type, val.value)}
                      className={`border rounded-sm px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold cursor-pointer relative overflow-hidden transition-colors duration-300 flex items-center gap-2
                        ${active ? "border-promotion text-promotion bg-neutral-light" : "text-primary bg-neutral-light hover:bg-promotion-light"}
                      `}
                    >
                      {val.image?.imageUrl && <Image src={val.image.imageUrl} alt={val.label} width={28} height={28} className="object-contain" />}
                      {val.label}
                      {active && (
                        <div className="absolute -top-1 -right-2 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-promotion">
                          <span className="absolute -top-[28px] -right-[-7px] text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </span>
                  );
                })}
            </div>
          </Fragment>
        ))}

        {/* Quantity */}
        {isInStock && (
          <>
            <span className="font-medium text-primary text-xs sm:text-sm flex items-center mt-4">Số lượng:</span>
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
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
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
              <span className="text-xs sm:text-sm text-neutral-dark">Còn {maxStock} sản phẩm</span>
            </div>
          </>
        )}
      </div>

      {isInStock ? (
        <>
          {/* Banner */}
          <div className="py-4 sm:py-6 rounded-lg">
            <Image src="https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/507x85_6_f64d62e323.png" alt="Banner" width={507} height={85} className="w-full h-auto rounded-lg" />
          </div>

          {/* Price */}
          <div className="bg-accent-light p-3 sm:p-4 rounded-lg mb-4 border border-accent">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-promotion">{displayPrice.toLocaleString("vi-VN")}₫</h3>
                  {activePrice?.hasPromotion && (
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-xs sm:text-sm line-through text-neutral-500">{basePrice.toLocaleString("vi-VN")}₫</span>
                      <span className="text-xs font-bold text-white bg-promotion px-2 py-0.5 rounded">-{activePrice.discountPercentage}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Promotions */}
            {product.availablePromotions && product.availablePromotions.length > 0 && (
              <div className="mt-3 sm:mt-4">
                <p className="font-semibold mb-2 text-xs sm:text-sm text-primary">Chọn 1 trong các khuyến mãi sau:</p>
                <div className="border border-promotion/30 rounded-lg overflow-hidden bg-neutral-light">
                  {product.availablePromotions.map((promo, index) => (
                    <div key={promo.id} className={`flex items-start gap-2 px-3 py-2 text-xs sm:text-sm ${index !== product.availablePromotions!.length - 1 ? "border-b border-neutral" : ""}`}>
                      <Gift className="w-4 h-4 text-promotion mt-0.5 shrink-0" />
                      <span className="text-primary">{promo.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Gifts */}
          <div className="flex flex-col border border-neutral rounded-lg mb-4">
            <div className="flex justify-between items-center px-3 sm:px-4 py-3 sm:py-4 bg-neutral rounded-t-lg">
              <p className="text-sm sm:text-base font-semibold text-primary">Quà tặng và ưu đãi khác</p>
            </div>
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 my-3">
                <FaGift className="text-promotion text-base sm:text-lg shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="break-words text-primary">Tặng phiếu mua hàng 50,000đ khi mua sim FPT kèm máy</span>
                  <Link href="#" className="text-promotion hover:underline">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <p className="whitespace-nowrap text-xs sm:text-sm">Ưu đãi</p>
                <span className="border border-neutral w-full"></span>
              </div>
              <div className="flex items-start gap-3 mb-3">
                <FaCog className="text-base sm:text-lg shrink-0 mt-0.5" />
                <span className="break-words text-primary">
                  Giảm 5% mua camera cho đơn hàng Điện thoại/ Tablet từ 1 triệu{" "}
                  <Link href="#" className="text-promotion hover:underline">
                    Xem chi tiết
                  </Link>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <AddToCartButton
              productVariantId={selectedVariant?.id || ""}
              quantity={quantity}
              disabled={!selectedVariant?.id}
              meta={{
                productName: product.name,
                productId: product.id,
                productSlug: product.slug,
                brandName: product.brand.name,
                variantName: selectedVariant?.sku ?? "",
                price: finalPrice,
                originalPrice: basePrice,
                imageUrl: selectedVariant?.image ?? selectedVariant?.images?.[0]?.imageUrl ?? "",
                availableQuantity: selectedVariant?.availableQuantity ?? selectedVariant?.stock ?? 0,
                color: selectedVariant?.color ?? "",
                colorValue: selectedVariant?.colorValue ?? "",
              }}
              label=""
              iconSize={28}
              className="!w-full sm:!w-auto sm:flex-1 !text-promotion !py-3 !rounded-lg !border !border-promotion !bg-neutral-light !px-0"
            />
            <button
              onClick={handleBuyNow}
              className="flex-1 sm:flex-[2] bg-promotion hover:bg-promotion-hover text-neutral-light py-3 rounded-lg transition-colors text-sm sm:text-base cursor-pointer"
            >
              Mua ngay
            </button>
            {/* <button
              onClick={handleInstallment}
              className="flex-1 sm:flex-[2] bg-primary-dark hover:bg-primary-hover text-neutral-light py-3 rounded-lg transition-colors text-sm sm:text-base cursor-pointer"
            >
              Trả góp 0%
            </button> */}
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-2xl overflow-hidden border border-neutral shadow-sm">
          <div className="bg-neutral px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-dark/20 flex items-center justify-center shrink-0 text-xl">📦</div>
            <div>
              <p className="text-primary font-bold text-sm sm:text-base">Sản phẩm tạm thời hết hàng</p>
              <p className="text-neutral-dark text-xs mt-0.5">Đăng ký để nhận thông báo ngay khi có hàng trở lại</p>
            </div>
          </div>
          <div className="bg-neutral-light px-5 py-4 space-y-3">
            <p className="text-xs text-neutral-dark font-medium flex items-center gap-1.5">
              <span className="text-primary-light text-sm">🔔</span>
              Nhận thông báo khi có hàng
            </p>
            <form className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập email hoặc số điện thoại"
                className="flex-1 border border-neutral rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-neutral-light placeholder:text-neutral-dark text-primary"
              />
              <button type="submit" className="bg-primary-dark hover:bg-primary-dark-hover text-neutral-light px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer">
                Đăng ký
              </button>
            </form>
          </div>
          <div className="border-t border-neutral bg-neutral-light-active px-5 py-3 flex flex-col items-center gap-3 w-full">
            <a href="/category/dien-thoai">
              <button className="w-full bg-primary hover:bg-primary-hover text-neutral-light font-semibold py-2.5 px-4 rounded-xl text-sm cursor-pointer">🔍 Khám phá sản phẩm khác</button>
            </a>
            <a href="tel:18006601" className="flex items-center gap-1.5 text-xs text-neutral-dark hover:text-promotion">
              <span className="text-promotion">📞</span>
              Gọi <span className="font-bold text-promotion tracking-wide">1800-6601</span> tư vấn miễn phí
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
