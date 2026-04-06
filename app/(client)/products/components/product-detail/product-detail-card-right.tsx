"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import { FaStar, FaGift, FaCog, FaTruck, FaPlus, FaMinus } from "react-icons/fa";
import { FaUserCog, FaShippingFast } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { Gift, Gpu, Package, Cpu } from "lucide-react";
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

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const count = Math.floor(Math.random() * 20) + 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  // Highlights (dùng cho mobile)
  const highlights = product.highlights || [];
  const iconMap: Record<string, any> = {
    gpu: Gpu,
    storage: Package,
    cpu: Cpu,
  };

  // ── Shared blocks ──────────────────────────────────────────────────────────

  /** Khối Thông số nổi bật — dùng lại ở mobile */
  const HighlightsBlock = () =>
    highlights.length > 0 ? (
      <div className="mt-6">
        <h2 className="font-semibold text-primary text-sm sm:text-base mb-3">Thông số nổi bật</h2>
        <div className="grid grid-cols-3 sm:flex sm:flex-row sm:items-center gap-4 sm:gap-6 border-b border-neutral-dark pb-5">
          {highlights.map((highlight, index) => {
            const IconComponent = highlight?.icon ? iconMap[highlight.icon] : null;
            return (
              <div className="flex flex-col" key={index}>
                <span className="text-xs text-neutral-dark">{highlight?.name || "N/A"}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  {IconComponent && <IconComponent size={18} className="shrink-0" />}
                  <span className="text-sm font-semibold text-primary leading-tight">{highlight?.value || "N/A"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ) : null;

  /** Khối Chính sách sản phẩm — dùng lại ở mobile */
  const PoliciesBlock = () => (
    <div className="mt-5">
      <div className="flex justify-between items-center gap-2 mb-3">
        <h2 className="text-sm sm:text-base font-semibold text-primary">Chính sách sản phẩm</h2>
        <button className="text-xs sm:text-sm font-medium text-accent underline underline-offset-2 hover:opacity-75 transition-opacity active:scale-95 cursor-pointer">Tìm hiểu thêm</button>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <MdVerified size={20} />
          <p className="text-xs sm:text-sm text-primary">Hàng chính hãng - Bảo hành 18 tháng</p>
        </div>
        <div className="flex items-center gap-2">
          <FaShippingFast size={20} />
          <p className="text-xs sm:text-sm text-primary">Miễn phí giao hàng toàn quốc</p>
        </div>
        <div className="flex items-center gap-2">
          <FaUserCog size={20} />
          <p className="text-xs sm:text-sm text-primary">Kỹ thuật viên hỗ trợ trực tuyến</p>
        </div>
      </div>
    </div>
  );

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
        @keyframes shimmer {
          0%   { left: -60%; }
          100% { left: 160%; }
        }
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 0 1px rgba(22,163,74,0.4), 0 2px 8px rgba(5,150,105,0.35); }
          50%       { box-shadow: 0 0 0 3px rgba(22,163,74,0.25), 0 4px 16px rgba(5,150,105,0.45); }
        }
        @keyframes pulseAmber {
          0%, 100% { box-shadow: 0 0 0 1px rgba(217,119,6,0.4), 0 2px 8px rgba(234,88,12,0.35); }
          50%       { box-shadow: 0 0 0 3px rgba(217,119,6,0.25), 0 4px 16px rgba(234,88,12,0.45); }
        }
      `}</style>

      {/* ── Badges ──────────────────────────────────────────────────────── */}
      <div className="hidden xl:flex flex-row gap-4 w-fit">
        <span
          className="badge-shimmer relative overflow-hidden rounded-lg px-3 py-1.5 flex items-center gap-2"
          style={{
            background: "linear-gradient(135deg, #16a34a, #059669)",
            animation: "pulseGreen 2.8s ease-in-out infinite",
          }}
        >
          <FaTruck className="text-white text-sm flex-shrink-0" />
          <p className="text-xs sm:text-sm font-semibold text-white">Free ship toàn quốc</p>
        </span>
        <span
          className="badge-shimmer relative overflow-hidden rounded-lg px-3 py-1.5 flex items-center gap-2"
          style={{
            background: "linear-gradient(135deg, #d97706, #ea580c)",
            animation: "pulseAmber 2.8s ease-in-out infinite 0.6s",
          }}
        >
          <FaStar className="text-yellow-300 text-sm flex-shrink-0" />
          <p className="text-xs sm:text-sm font-semibold text-white">Độc quyền tại ChoCongNghe</p>
        </span>
      </div>

      {/* ── Title ───────────────────────────────────────────────────────── */}
      <h2 className="my-3 sm:my-4 text-lg sm:text-xl lg:text-2xl font-bold text-primary">{selectedVariant?.name || product.name}</h2>

      {/* ── Rating & Links ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <span>{product.currentVariant?.code}</span>
        <div className="flex items-center gap-1">
          <FaStar className="text-yellow-400 text-xs sm:text-sm" />
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

      {/* ── Options + Quantity ───────────────────────────────────────────── */}
      <div className="grid grid-cols-[90px_1fr] sm:grid-cols-[100px_1fr] gap-y-4 sm:gap-y-5 mt-6">
        {availableOptions.map((option) => (
          <Fragment key={option.type}>
            <span className="font-medium text-primary text-xs sm:text-sm flex items-center">{TYPE_LABELS[option.type] ?? option.type}:</span>
            <div className="flex flex-wrap gap-2">
              {option.values?.map((val: any) => {
                const active = selectedOptions[option.type] === val.value;
                const disabled = !val.enabled;
                return (
                  <span
                    key={val.value}
                    onClick={() => !disabled && onOptionChange?.(option.type, val.value)}
                    className={`border rounded-sm px-3 py-2 sm:px-4 sm:py-3
                      text-xs sm:text-sm font-bold
                      relative overflow-hidden
                      transition-colors duration-300
                      flex items-center gap-2
                      hover:border-accent
                      ${
                        disabled
                          ? "border-neutral text-primary bg-neutral opacity-40 cursor-not-allowed"
                          : active
                            ? "border-accent text-primary bg-accent-light cursor-pointer"
                            : "border-neutral-dark text-primary bg-neutral-light cursor-pointer hover:border-accent hover:bg-accent-light"
                      }`}
                  >
                    {val.image?.imageUrl && <Image src={val.image.imageUrl} alt={val.label} width={14} height={14} className="object-contain" />}
                    {val.label}
                    {active && !disabled && (
                      <div className="absolute -top-1 -right-2 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-accent">
                        <span className="absolute -top-[28px] -right-[-7px] text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </span>
                );
              })}
            </div>
          </Fragment>
        ))}

        {isInStock && (
          <>
            <span className="font-medium text-primary text-xs sm:text-sm flex items-center">Số lượng:</span>
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
          {/* ── Price ───────────────────────────────────────────────────── */}
          <div className="bg-neutral/40 p-4 sm:py-6 rounded-lg mt-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-promotion">{displayPrice.toLocaleString("vi-VN")}₫</h3>
              {activePrice?.hasPromotion && (
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-xs sm:text-sm line-through text-neutral-500">{basePrice.toLocaleString("vi-VN")}₫</span>
                  <span className="text-xs font-bold text-white bg-promotion px-2 py-0.5 rounded">-{activePrice.discountPercentage}%</span>
                </div>
              )}
            </div>

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

          {/* ── Highlights + Policies: chỉ hiện trên MOBILE (lg ẩn đi vì Banner đã show) ── */}
          <div className="lg:hidden">
            <HighlightsBlock />
            <PoliciesBlock />
          </div>

          {/* ── Banner ──────────────────────────────────────────────────── */}
          <div className="py-4 sm:py-6 rounded-lg">
            <Image src="https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/507x85_6_f64d62e323.png" alt="Banner" width={507} height={85} className="w-full h-auto rounded-lg" />
          </div>

          {/* ── Gifts ───────────────────────────────────────────────────── */}
          <div className="flex flex-col border border-neutral rounded-lg mb-4">
            <div className="flex justify-between items-center px-3 sm:px-4 py-3 sm:py-4 bg-neutral rounded-t-lg">
              <p className="text-sm sm:text-base font-semibold text-primary">Quà tặng và ưu đãi khác</p>
            </div>
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 my-3">
                <FaGift className="text-primary text-base sm:text-lg shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="break-words text-primary">Tặng phiếu mua hàng 50,000đ khi mua sim FPT kèm máy</span>
                  <Link
                    href="#"
                    className="text-xs sm:text-sm font-medium text-primary hover:text-primary underline underline-offset-2 transition-all active:scale-95 cursor-pointer inline-block w-fit"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <p className="whitespace-nowrap text-xs sm:text-sm text-primary">Ưu đãi</p>
                <span className="border border-neutral w-full" />
              </div>
              <div className="flex items-start gap-3 mb-3">
                <FaCog className="text-primary text-base sm:text-lg shrink-0 mt-0.5" />
                <span className="break-words text-primary">
                  Giảm 5% mua camera cho đơn hàng Điện thoại/ Tablet từ 1 triệu{" "}
                  <Link href="#" className="text-xs sm:text-sm font-medium text-primary hover:text-primary underline underline-offset-2 transition-all active:scale-95 cursor-pointer">
                    Xem chi tiết
                  </Link>
                </span>
              </div>
            </div>
          </div>

          {/* ── Action Buttons (desktop only — mobile dùng sticky footer) ── */}
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
                imageUrl: selectedVariant?.image ?? selectedVariant?.images?.[0]?.imageUrl ?? "",
                availableQuantity: maxStock ?? 0,
                color: selectedVariant?.color ?? "",
                storageLabel: availableOptions.find((opt) => opt.type === "storage")?.values?.find((v: any) => v.value === selectedOptions.storage)?.label,
                colorValue: selectedVariant?.colorValue ?? "",
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

          {/* Padding bottom mobile (sticky footer) */}
        </>
      ) : (
        /* ── Out of stock ─────────────────────────────────────────────────── */
        <div className="mt-6 rounded-2xl overflow-hidden border border-neutral shadow-sm hover:shadow-lg transition-all duration-300 animate-fadeUp">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl animate-bounceSlow">📦</div>
            <div className="flex-1">
              <p className="text-primary font-bold text-sm sm:text-base">Tạm hết hàng</p>
              <p className="text-neutral-dark text-xs">Sản phẩm sẽ sớm quay lại, bạn vui lòng quay lại sau</p>
            </div>
            {/* <span className="text-[11px] bg-promotion/10 text-promotion px-2 py-1 rounded-full">🔥 {count} người đang chờ</span> */}
          </div>

          {/* <div className="bg-neutral-light px-5 py-4 space-y-3">
            <p className="text-xs text-neutral-dark font-medium flex items-center gap-1.5">
              <span className="text-primary text-sm">🔔</span>
              Nhận thông báo khi có hàng
            </p>
            {success ? (
              <div className="text-sm font-semibold" style={{ color: "rgb(22 163 74)" }}>
                Đăng ký thành công! Chúng tôi sẽ thông báo cho bạn.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark">📧</span>
                  <input
                    type="text"
                    placeholder="Nhập email hoặc số điện thoại"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-neutral rounded-xl bg-neutral-light-active placeholder:text-neutral-dark text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-neutral-light px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? "Đang gửi..." : "Đăng ký"}
                </button>
              </form>
            )}
            <div className="flex flex-wrap gap-3 text-[11px] text-neutral-dark pt-1">
              <span>⚡ Thông báo sớm nhất</span>
              <span>🎁 Có thể kèm ưu đãi</span>
              <span>🔒 Không spam</span>
            </div>
          </div> */}

          <div className="border-t border-neutral bg-neutral-light px-5 py-4 space-y-3">
            <a
              href="/category/dien-thoai"
              className="block w-full text-center bg-primary hover:bg-primary-hover text-neutral-light font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md"
            >
              🔍 Xem sản phẩm tương tự
            </a>
            <div className="flex justify-between items-center text-xs">
              <a href="tel:18006601" className="flex items-center gap-1.5 text-neutral-dark hover:text-promotion transition-colors">
                <span className="text-promotion">📞</span>
                1800-6601
              </a>
              <span className="text-neutral-dark opacity-70">Hỗ trợ miễn phí 24/7</span>
            </div>
          </div>

          <div className="h-20 lg:hidden" />

          <style>{`
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(12px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes bounceSlow {
              0%, 100% { transform: translateY(0); }
              50%       { transform: translateY(-5px); }
            }
            .animate-fadeUp     { animation: fadeUp 0.5s ease; }
            .animate-bounceSlow { animation: bounceSlow 2s infinite; }
          `}</style>
        </div>
      )}
    </div>
  );
}
