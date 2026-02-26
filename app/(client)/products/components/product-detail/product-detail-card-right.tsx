"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FaStar,
  FaGift,
  FaCog,
  FaTruck,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { ProductDetail } from "@/lib/types/product";
import Link from "next/link";
import AddToCartButton from "@/(client)/cart/components/AddToCartButton";
import { useToasty } from "@/components/Toast";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";

interface ProductDetailRightProps {
  product?: ProductDetail;
  selectedColor?: string;
  selectedStorage?: string;
  onColorChange?: (color: string) => void;
  onStorageChange?: (storage: string) => void;
  onReviewClick?: () => void;
  onSpecificationClick?: () => void;
  selectedVariant?: ProductVariant;
  selectedPrice?: Price;
  availableOptions?: any[];
}

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
}

type Price = {
  base: number;
  final: number;
  discountPercentage: number;
  hasPromotion: boolean;
};

type ColorOption = {
  value: string;
  image?: string;
  label?: string;
  enabled?: boolean;
};

type StorageOption = {
  value: string;
  label?: string;
  type?: string;
};

export default function ProductDetailRight({
  product,
  selectedColor: propSelectedColor,
  selectedVariant,
  selectedPrice,
  selectedStorage: propSelectedStorage,
  onColorChange,
  onStorageChange,
  onReviewClick,
  onSpecificationClick,
  availableOptions,
}: ProductDetailRightProps = {}) {
  /* ============================================================================
   * GUARD
   * ========================================================================== */
  if (!product) {
    return <div className="text-primary">Loading...</div>;
  }

  const toasty = useToasty();
  const { addToCart } = useCart();
  const router = useRouter();

  /* ============================================================================
   * PRODUCT DATA
   * ========================================================================== */
  const price = selectedPrice || product.price;
  const displayPrice = price?.hasPromotion ? price?.final : price?.base;

  const storages: StorageOption[] = (() => {
    const storageOption = availableOptions?.find(
      (opt) => opt.type === "storage",
    );
    return (
      storageOption?.values
        ?.filter((val: any) => val.enabled)
        ?.map((val: any) => ({
          label: val.label,
          value: val.value,
          enabled: val.enabled,
        })) || []
    );
  })();

  const colors: ColorOption[] = (() => {
    const colorOption = availableOptions?.find((opt) => opt.type === "color");
    if (!colorOption?.values) return [];

    return colorOption.values.map((val: any) => ({
      value: val.value,
      label: val.label,
      enabled: val.enabled,
      image: val.image?.imageUrl,
    }));
  })();

  /* ============================================================================
   * STATE
   * ========================================================================== */
  const selectedColor = propSelectedColor || colors[0]?.value || "";
  const selectedStorage = propSelectedStorage || storages[0]?.value || "";

  const [quantity, setQuantity] = useState(1);

  /* ============================================================================
   * STOCK & AVAILABILITY
   * ========================================================================== */
  const maxStock = selectedVariant?.quantity || 999;
  const isInStock = maxStock > 0;

  /* ============================================================================
   * HANDLERS
   * ========================================================================== */
  const handleQuantityChange = (newQuantity: number) => {
    const validQuantity = Math.min(Math.max(1, newQuantity), maxStock);
    setQuantity(validQuantity);
  };

  const handleIncrement = () => {
    if (quantity < maxStock) setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
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
        price: selectedVariant.price ?? 0,
        originalPrice:
          selectedVariant.originalPrice ?? selectedVariant.price ?? 0,
        imageUrl:
          selectedVariant.image ?? selectedVariant.images?.[0]?.imageUrl ?? "",
        availableQuantity:
          selectedVariant.availableQuantity ?? selectedVariant.stock ?? 0,
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
    // TODO: navigate to installment checkout
    toasty.info("Đang chuyển đến trang đăng ký trả góp...");
  };

  /* ============================================================================
   * EFFECTS
   * ========================================================================== */
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant?.id]);

  return (
    <div className="w-full">
      {/* Badges */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
        <span className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 px-3 py-1.5 shadow-md flex items-center justify-center sm:justify-start">
          <FaTruck className="mr-2 text-white text-sm sm:text-base" />
          <p className="text-xs sm:text-sm font-semibold text-white">
            Free ship toàn quốc
          </p>
        </span>
        <span className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-500 px-3 py-1.5 shadow-md flex items-center justify-center sm:justify-start">
          <FaStar className="mr-2 text-yellow-300 text-sm sm:text-base" />
          <p className="text-xs sm:text-sm font-semibold text-white">
            Độc quyền tại ChoCongNghe
          </p>
        </span>
      </div>

      {/* Product Title */}
      <h2 className="my-3 sm:my-4 text-lg sm:text-xl lg:text-2xl font-bold text-primary transition-colors duration-300">
        {product.name}
      </h2>

      {/* Rating & Links */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <span className="transition-colors duration-300">
          {product.currentVariant?.code}
        </span>
        <div className="flex items-center gap-1">
          <FaStar className="text-accent text-xs sm:text-sm" />
          <span className="text-primary">
            {product.rating.average.toFixed(1)}
          </span>
        </div>
        <button
          onClick={onReviewClick}
          className="text-accent hover:underline hover:text-accent-hover transition-colors cursor-pointer"
        >
          {product.rating.total} đánh giá
        </button>
        <span>|</span>
        <button
          type="button"
          onClick={onSpecificationClick}
          className="text-accent hover:underline hover:text-accent-hover transition-colors cursor-pointer"
        >
          Thông số kỹ thuật
        </button>
      </div>

      <div className="grid grid-cols-[90px_1fr] sm:grid-cols-[100px_1fr] gap-y-4 sm:gap-y-5 gap-x-4 mt-6">
        {/* Storage Selection */}
        <span className="font-medium text-primary text-xs sm:text-sm flex items-center">
          Dung lượng:
        </span>

        <div className="flex flex-wrap gap-2">
          {storages.map((storage) => {
            const isActive = selectedStorage === storage.value;
            return (
              <span
                key={storage.value}
                onClick={() => onStorageChange?.(storage.value)}
                className={`border rounded-sm px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold cursor-pointer relative overflow-hidden transition-colors duration-300
                  ${isActive ? "border-promotion text-promotion bg-neutral-light" : "text-primary bg-neutral-light"}
                `}
              >
                {storage.label}
                {isActive && (
                  <div className="absolute -top-1 -right-2 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-promotion">
                    <span className="absolute -top-[28px] -right-[-7px] text-white text-xs font-bold">
                      ✓
                    </span>
                  </div>
                )}
              </span>
            );
          })}
        </div>

        {/* Color Selection */}
        <span className="font-medium text-primary text-xs sm:text-sm flex mt-4">
          Màu sắc:
        </span>

        <div className="flex flex-wrap gap-2">
          {colors
            .filter((color) => color.enabled)
            .map((color) => {
              const isActive = selectedColor === color.value;
              return (
                <span
                  key={color.value}
                  onClick={() => onColorChange?.(color.value)}
                  className={`px-3 py-2 sm:px-4 sm:py-3 rounded-sm text-xs sm:text-sm font-bold cursor-pointer border relative overflow-hidden flex items-center gap-2 transition-colors duration-300
                    ${isActive ? "border-promotion text-promotion bg-promotion-light" : "bg-neutral-light"}
                    hover:bg-promotion-light
                  `}
                >
                  {color.image && (
                    <Image
                      src={color.image}
                      alt={color.value}
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  )}
                  {color.label}
                  {isActive && (
                    <div className="absolute -top-1 -right-2 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-promotion">
                      <span className="absolute -top-[28px] -right-[-7px] text-white text-xs font-bold">
                        ✓
                      </span>
                    </div>
                  )}
                </span>
              );
            })}
        </div>

        {/* Quantity Selector */}
        <span className="font-medium text-primary text-xs sm:text-sm flex items-center mt-4">
          Số lượng:
        </span>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-neutral rounded-lg overflow-hidden">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1 || !isInStock}
              className="w-10 h-10 flex items-center justify-center bg-neutral-light hover:bg-neutral transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaMinus className="text-primary text-sm" />
            </button>
            <input
              type="number"
              min="1"
              max={maxStock}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                handleQuantityChange(val);
              }}
              disabled={!isInStock}
              className="w-16 h-10 text-center border-x border-neutral focus:outline-none bg-neutral-light text-primary font-medium disabled:opacity-50"
            />
            <button
              onClick={handleIncrement}
              disabled={quantity >= maxStock || !isInStock}
              className="w-10 h-10 flex items-center justify-center bg-neutral-light hover:bg-neutral transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlus className="text-primary text-sm" />
            </button>
          </div>
          <span className="text-xs sm:text-sm text-neutral-dark">
            {isInStock ? `Còn ${maxStock} sản phẩm` : "Hết hàng"}
          </span>
        </div>
      </div>

      {/* Banner Image */}
      <div className="py-4 sm:py-6 rounded-lg">
        <Image
          src="https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/507x85_6_f64d62e323.png"
          alt="Banner"
          width={507}
          height={85}
          className="w-full h-auto rounded-lg"
        />
      </div>

      {/* Price Section */}
      <div className="bg-accent-light p-3 sm:p-4 rounded-lg mb-4 border border-accent transition-colors duration-300">
        {/* Main Price */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-primary transition-colors duration-300">
                {(displayPrice || 0).toLocaleString("vi-VN")}₫
              </h3>
              {price?.hasPromotion && (
                <div className="flex gap-2 items-center">
                  <span className="text-xs sm:text-sm line-through">
                    {(price.base || 0).toLocaleString("vi-VN")}₫
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-promotion">
                    {price.discountPercentage}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Promotions */}
        <div className="mt-3 sm:mt-4">
          <p className="font-semibold mb-2 text-xs sm:text-sm text-primary transition-colors duration-300">
            Chọn 1 trong các khuyến mãi sau:
          </p>
          <div className="border rounded-lg p-3 bg-neutral-light transition-colors duration-300">
            <p className="font-semibold text-xs sm:text-sm mb-2 text-primary transition-colors duration-300">
              Khuyến mãi 1
            </p>
            <ul className="text-xs sm:text-sm space-y-2 transition-colors duration-300">
              <li>✓ Giảm ngay 200.000đ áp dụng đến 25/12</li>
              <li>
                ✓ AirPods/Ốp Lưng phụ kiện nhập khẩu giảm đến 500.000đ khi mua
                kèm iPhone
              </li>
              <li>✓ Trả góp 0%</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Gifts & Benefits */}
      <div className="flex flex-col border border-neutral rounded-lg mb-4 transition-colors duration-300">
        <div className="flex justify-between items-center px-3 sm:px-4 py-3 sm:py-4 bg-neutral rounded-t-lg transition-colors duration-300">
          <p className="text-sm sm:text-base font-semibold text-primary transition-colors duration-300">
            Quà tặng và ưu đãi khác
          </p>
        </div>
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm transition-colors duration-300">
          <div className="flex items-start gap-3 my-3">
            <FaGift className="text-promotion text-base sm:text-lg flex-shrink-0 mt-0.5" />
            <div className="flex flex-col min-w-0">
              <span className="break-words text-primary transition-colors duration-300">
                Tặng phiếu mua hàng 50,000đ khi mua sim FPT kèm máy
              </span>
              <Link
                href="#"
                className="text-promotion hover:text-promotion-hover hover:underline transition-colors"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <p className="whitespace-nowrap text-xs sm:text-sm transition-colors duration-300">
              Ưu đãi
            </p>
            <span className="border border-neutral w-full"></span>
          </div>
          <div className="flex items-start gap-3 mb-3">
            <FaCog className="text-base sm:text-lg flex-shrink-0 mt-0.5 transition-colors duration-300" />
            <span className="break-words text-primary transition-colors duration-300">
              Giảm 5% mua camera cho đơn hàng Điện thoại/ Tablet từ 1 triệu{" "}
              <Link
                href="#"
                className="text-promotion hover:text-promotion-hover hover:underline transition-colors"
              >
                Xem chi tiết
              </Link>
            </span>
          </div>
          <div className="flex items-start gap-3 mb-3">
            <FaCog className="text-base sm:text-lg flex-shrink-0 mt-0.5 transition-colors duration-300" />
            <span className="break-words text-primary transition-colors duration-300">
              Giảm 5% mua camera cho đơn hàng Điện thoại/ Tablet từ 1 triệu{" "}
              <Link
                href="#"
                className="text-promotion hover:text-promotion-hover hover:underline transition-colors"
              >
                Xem chi tiết
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {/* Add to Cart Button */}
        <AddToCartButton
          productVariantId={selectedVariant?.id || ""}
          quantity={quantity}
          disabled={!isInStock || !selectedVariant?.id}
          meta={{
            productName: product.name,
            productId: product.id,
            productSlug: product.slug,
            brandName: product.brand.name,
            variantName: selectedVariant?.sku ?? "",
            price: selectedVariant?.price ?? 0,
            originalPrice:
              selectedVariant?.originalPrice ?? selectedVariant?.price ?? 0,
            imageUrl:
              selectedVariant?.image ??
              selectedVariant?.images?.[0]?.imageUrl ??
              "",
            availableQuantity:
              selectedVariant?.availableQuantity ?? selectedVariant?.stock ?? 0,
            color: selectedVariant?.color ?? "",
            colorValue: selectedVariant?.colorValue ?? "",
          }}
          label=""
          iconSize={28}
          className="!w-full sm:!w-auto sm:flex-1 !text-promotion !py-3 !rounded-lg !transition-colors hover:!bg-promotion-light !border !border-promotion !bg-neutral-light !px-0"
        />

        {/* Buy Now Button */}
        <button
          onClick={handleBuyNow}
          disabled={!isInStock}
          className="flex-1 sm:flex-[2] bg-promotion hover:bg-promotion-hover text-neutral-light py-3 rounded-lg transition-colors text-sm sm:text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInStock ? "Mua ngay" : "Hết hàng"}
        </button>

        {/* Installment Button */}
        <button
          onClick={handleInstallment}
          disabled={!isInStock}
          className="flex-1 sm:flex-[2] bg-primary-dark hover:bg-primary-hover text-neutral-light py-3 rounded-lg transition-colors text-sm sm:text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Trả góp 0%
        </button>
      </div>

      {/* Out of Stock Warning */}
      {!isInStock && (
        <div className="mt-4 p-4 bg-promotion-light border border-promotion rounded-lg">
          <p className="text-sm text-promotion font-medium text-center">
            ⚠️ Sản phẩm này hiện đang hết hàng
          </p>
        </div>
      )}
    </div>
  );
}
