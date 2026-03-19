import { formatVND } from "@/helpers";
import Image from "next/image";
import React from "react";

interface CartItem {
  id: string | number;
  name: string;
  variant: string;
  color?: string;
  colorValue?: string;
  quantity: number;
  unit_price: number; // final price — đã tính sale
  original_price?: number; // giá gốc để gạch ngang
  image?: string;
}

interface CartItemsProps {
  items: CartItem[];
}

export default function CartItems({ items }: CartItemsProps) {
  return (
    <div className="bg-neutral-light rounded-lg">
      <div className="p-4 sm:p-5 border border-neutral border-b-0 rounded">
        <h2 className="text-base text-primary">Sản phẩm trong đơn ({items.length})</h2>
      </div>

      <div className="divide-y divide-neutral border border-neutral rounded">
        {items.map((item) => {
          // unit_price = final, chỉ check original để hiện gạch ngang
          const hasDiscount = item.original_price != null && item.original_price > item.unit_price;

          return (
            <div key={item.id} className="p-4 sm:p-5 bg-neutral-light">
              <div className="flex gap-3 sm:gap-4">
                {/* Product Image */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-neutral rounded shrink-0 overflow-hidden flex items-center justify-center">
                  {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" /> : <span className="text-neutral-darker text-xl sm:text-2xl">📦</span>}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium mb-1 line-clamp-2 leading-tight text-primary">{item.name}</h3>

                  <p className="text-xs mb-2 text-neutral-darker">{item.variant}</p>

                  {item.color && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="h-3 w-3 rounded-full border border-neutral shrink-0" style={{ backgroundColor: item.colorValue }} />
                      <span className="text-xs text-neutral-darker">{item.color}</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-promotion">{formatVND(item.unit_price)}</span>
                    {hasDiscount && <span className="text-xs line-through text-neutral-darker">{formatVND(item.original_price!)}</span>}
                    <span className="ml-auto text-sm font-medium text-neutral-darker">x{item.quantity}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
