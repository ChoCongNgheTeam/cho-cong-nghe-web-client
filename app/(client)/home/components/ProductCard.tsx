'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ProductDTO } from '@/lib/api-demo';

interface ProductCardProps {
  product: ProductDTO;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Lấy data từ ProductDTO structure
  const originalPrice = product.original_price;
  const salePrice = product.sale_price;
  const hasDiscount = product.discount_percentage !== undefined && product.discount_percentage > 0;
  const discountPercent = product.discount_percentage || 0;
  const displayPrice = hasDiscount ? salePrice : originalPrice;

  return (
    <div className="w-full px-2 font-poppins">
      <Link
        href={`/product/${product.product.slug}`}
        className="
          group relative w-full min-h-[360px] pc:min-h-[380px]
          rounded-xl bg-white hover:shadow-lg
          transition-all duration-300 flex flex-col
        "
      >
        {/* ================= IMAGE + SPECS ================= */}
        <div className="pt-3">
          <div className="relative h-[200px] pc:h-[220px] px-4">
            <div className="flex items-center h-full">
              {/* IMAGE */}
              <div className="flex-[8] h-full flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src={product.mainImage?.imagePath || '/placeholder-product.png'}
                    alt={product.product.name}
                    fill
                    className="object-contain transition duration-300 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* SPECS */}
              <div className="flex-[2] h-full flex flex-col items-center justify-center gap-2 ml-4">
                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center text-[7px] text-gray-500"
                  >
                    <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center mb-1">
                      <svg
                        className="w-3 h-3 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="leading-tight text-center whitespace-nowrap">
                      Độ phân giải<br />3MP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= FLASH SALE ⚡ ================= */}
          {hasDiscount && (
            <div className="px-4 mt-1">
              <div className="relative inline-flex items-center h-[18px] bg-promotion rounded pl-5 pr-3">
                {/* ICON SẤM SÉT */}
                <div className="absolute -left-[6px] top-1/2 -translate-y-1/2 z-10">
                  <svg width="14" height="18" viewBox="0 0 17 21" fill="none">
                    <path
                      d="M16.8332 6.59109C16.7524 6.41848 16.624 6.27249 16.4632 6.17024C16.3023 6.06798 16.1157 6.01371 15.9251 6.01377H11.533L13.8143 1.45032C13.8906 1.29755 13.9266 1.12781 13.919 0.957198C13.9113 0.786589 13.8601 0.620772 13.7704 0.475483C13.6806 0.330194 13.5552 0.210251 13.4061 0.127035C13.2569 0.0438192 13.089 0.000091179 12.9182 0H6.90444C6.72575 -0.00000735914 6.55032 0.0477518 6.3963 0.138332C6.24228 0.228912 6.11527 0.359019 6.02843 0.51518L1.01696 9.53584C0.932111 9.68841 0.888589 9.8605 0.890698 10.0351C0.892807 10.2096 0.940473 10.3806 1.02898 10.5311C1.11748 10.6816 1.24376 10.8063 1.3953 10.893C1.54684 10.9797 1.71839 11.0253 1.89296 11.0252H6.65687L4.9239 18.8261C4.87537 19.0454 4.90188 19.2746 4.99918 19.477C5.09648 19.6794 5.25892 19.8432 5.46047 19.9423C5.66202 20.0413 5.89099 20.0698 6.11066 20.0232C6.33033 19.9765 6.52798 19.8575 6.6719 19.6851L16.6949 7.65754C16.8168 7.51128 16.8946 7.3333 16.9191 7.14443C16.9436 6.95557 16.9138 6.76363 16.8332 6.59109Z"
                      fill="#FFD700"
                      stroke="#fff"
                      strokeWidth="0.6"
                    />
                  </svg>
                </div>

                <span className="font-semibold text-white text-[10px]">
                  Còn {product.variant.quantity}/10 suất
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ================= PRICE ================= */}
        <div className="px-4 mt-2">
          {hasDiscount ? (
            <div className="flex min-h-[45px] rounded-lg overflow-hidden shadow-md relative">
              {/* LEFT PRICE */}
              <div className="flex-[7] flex flex-col items-center justify-center bg-promotion">
                <div className="text-white font-black text-[17px] leading-none">
                  {formatPrice(displayPrice)}
                </div>
              </div>

              {/* ICON SẤM SÉT GIỮA */}
              <div className="absolute left-[70%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <svg width="28" height="55" viewBox="0 0 17 21" fill="#FFD700">
                  <path d="M16.8332 6.59109L11.533 6.01377L13.8143 1.45032L6.02843 0.51518L1.01696 9.53584H6.65687L4.9239 18.8261L16.6949 7.65754Z" />
                </svg>
              </div>

              {/* RIGHT DISCOUNT */}
              <div className="flex-[3] flex items-center justify-center bg-yellow">
                <span className="text-promotion font-black text-[10px]">
                  -{discountPercent}%
                </span>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[45px] rounded-lg bg-promotion items-center justify-center shadow-md">
              <div className="text-white font-black text-[17px]">
                {formatPrice(displayPrice)}
              </div>
            </div>
          )}
        </div>

        {/* ================= NAME ================= */}
        <div className="px-4 mt-2 pb-3">
          <div className="line-clamp-2 min-h-[10px]">
            <p className="text-center text-primary font-semibold text-sm leading-snug">
              {product.product.name}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price);
}