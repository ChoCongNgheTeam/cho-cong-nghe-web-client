"use client";
import { memo, useState } from "react";
import { ShoppingCart, ExternalLink, Tag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToasty } from "@/components/toast";
import { logError } from "@/lib/monitoring/log-error";
import type { Product, ProductCard as ProductCardType, Variant } from "@/types/chat";

function StructuredProductCardImpl({ product }: { product: Product }) {
  const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(price);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]?.id || product.defaultVariantId || "");

  const { addToCart } = useCart();
  const { toast } = useToasty();

  const priceDisplay = product.priceMin === product.priceMax ? formatPrice(product.priceMin) : `${formatPrice(product.priceMin)} - ${formatPrice(product.priceMax)}`;

  const originalPriceDisplay = product.originalPriceMin ? formatPrice(product.originalPriceMin) : "";
  const hasDiscount = !!(product.originalPriceMin && product.originalPriceMin > product.priceMin);
  const discountPercent = hasDiscount && product.originalPriceMin ? Math.round(((product.originalPriceMin - product.priceMin) / product.originalPriceMin) * 100) : 0;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    try {
      await addToCart(selectedVariant, 1, {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug || "",
        price: product.priceMin,
        originalPrice: product.originalPriceMin || product.priceMin,
        imageUrl: product.thumbnail,
      });
      toast({
        type: "success",
        title: "Thành công",
        description: `Đã thêm "${product.name}" vào giỏ hàng`,
      });
    } catch (error) {
      logError("ChatButton: addToCart failed", error, { productId: product.id, variantId: selectedVariant });
      const errorMsg = error instanceof Error ? error.message : "Không thể thêm vào giỏ hàng";
      toast({
        type: "error",
        title: "Lỗi",
        description: errorMsg,
      });
    }
  };

  return (
    <div className="bg-white border border-neutral rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="flex gap-2.5 p-2.5">
        <div className="w-[76px] shrink-0 bg-neutral-50 rounded-lg flex items-center justify-center p-1.5 relative border border-black/5">
          {hasDiscount && <div className="absolute -top-1 -left-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg rounded-tl-lg z-10 shadow-sm">-{discountPercent}%</div>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.thumbnail} alt={product.name} className="w-full h-[64px] object-contain mix-blend-multiply" loading="lazy" />
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
              <span className="bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Hết hàng</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <p className="text-[12px] font-semibold text-neutral-800 leading-snug line-clamp-2 mb-1">{product.name}</p>
            <div className="flex items-baseline gap-1.5 mb-0.5">
              <p className="text-[13.5px] font-bold text-accent">{priceDisplay}</p>
              {hasDiscount && <p className="text-[10.5px] text-neutral-400 line-through">{originalPriceDisplay}</p>}
            </div>
            {product.promotionLabel && (
              <p className="text-[10.5px] text-emerald-600 font-medium line-clamp-1 flex items-center gap-1">
                <Tag size={11} /> {product.promotionLabel}
              </p>
            )}
          </div>

          {product.variants && product.variants.length > 0 ? (
            <div className="flex flex-col gap-1.5 mt-2">
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full text-[11.5px] font-medium px-2.5 py-1.5 rounded-lg border border-neutral bg-neutral-50 text-gray-900 focus:outline-none focus:border-accent appearance-none cursor-pointer shadow-sm"
                style={{
                  backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px top 50%",
                  backgroundSize: "8px auto",
                }}
              >
                {product.variants.map((v: Variant) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11.5px] px-2 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors active:scale-95 shadow-sm"
                >
                  <ShoppingCart size={13} strokeWidth={2.5} />
                </button>
                {product.productUrl && (
                  <a
                    href={product.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[30px] h-[30px] flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors shrink-0 shadow-sm"
                  >
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </div>
          ) : product.defaultVariantId ? (
            <div className="flex items-center gap-1.5 mt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-1 text-[11.5px] px-2 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 font-semibold hover:bg-sky-100 transition-colors active:scale-95 shadow-sm"
              >
                <ShoppingCart size={13} /> Mua ngay
              </button>
              {product.productUrl && (
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[30px] h-[30px] flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors shrink-0 shadow-sm"
                >
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-2">
              {product.productUrl && (
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 text-[11.5px] px-2 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent font-semibold hover:bg-accent/20 transition-colors shadow-sm"
                >
                  Xem tuỳ chọn
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Memo hoá vì list sản phẩm re-render theo mỗi lần ChatButton re-render (gõ input, v.v.)
// trong khi props product hầu như không đổi.
export const StructuredProductCard = memo(StructuredProductCardImpl);

function ProductCardGridImpl({ cards }: { cards: ProductCardType[] }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {cards.map((card, i) => (
        <div key={i} className="bg-white border border-neutral rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex gap-0">
            {card.image && (
              <div className="w-[68px] shrink-0 bg-neutral-50 flex items-center justify-center p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt={card.imageAlt ?? card.name ?? "Product"}
                  className="w-full h-[60px] object-contain"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="flex-1 p-2 min-w-0">
              {card.name && <p className="text-[11.5px] font-semibold text-neutral-800 leading-tight line-clamp-2 mb-1">{card.name}</p>}
              {card.price && <p className="text-[12px] font-bold text-accent mb-1">{card.price}</p>}

              {card.highlights.length > 0 && (
                <ul className="flex flex-col gap-0.5 mb-1">
                  {card.highlights.slice(0, 3).map((h, j) => (
                    <li key={j} className="text-[10.5px] text-neutral-600 flex items-start gap-1">
                      <span className="mt-0.5 shrink-0 text-accent">•</span>
                      <span className="line-clamp-1">{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between gap-2 mt-1.5">
                {card.promo ? (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-medium shrink-0">{card.promo}</span>
                ) : (
                  <span></span>
                )}
                {card.link && (
                  <a
                    href={card.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-[10.5px] px-2.5 py-1 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors whitespace-nowrap shrink-0"
                  >
                    {card.linkLabel ?? "Xem chi tiết"}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export const ProductCardGrid = memo(ProductCardGridImpl);
