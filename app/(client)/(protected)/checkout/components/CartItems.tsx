import { formatVND } from "../../../../../helpers";
import Image from "next/image";
import type { CartItem } from "../_lib";

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
          // unitPrice = final, chỉ check originalPrice để hiện gạch ngang
          const hasDiscount = item.originalPrice != null && item.originalPrice > item.unitPrice;

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
                    <span className="font-medium text-sm text-promotion">{formatVND(item.unitPrice)}</span>
                    {hasDiscount && <span className="text-xs line-through text-neutral-darker">{formatVND(item.originalPrice!)}</span>}
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
