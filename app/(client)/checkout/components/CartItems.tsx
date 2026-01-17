import React from 'react';

interface CartItem {
  id: number;
  name: string;
  variant: string;
  quantity: number;
  unit_price: number;
  discount_value: number;
  image?: string;
}

interface CartItemsProps {
  items: CartItem[];
}

export default function CartItems({ items }: CartItemsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[rgb(var(--neutral))]">
        <h2
          className="text-base sm:text-lg font-semibold"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          Sản phẩm trong đơn ({items.length})
        </h2>
      </div>

      {/* Items List */}
      <div className="divide-y divide-[rgb(var(--neutral))]">
        {items.map((item) => {
          const finalPrice = item.unit_price - item.discount_value;

          return (
            <div
              key={item.id}
              className="p-4 sm:p-5 bg-[rgb(var(--neutral-light))]"
            >
              <div className="flex gap-3 sm:gap-4">
                {/* Product Image */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[rgb(var(--neutral))] rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[rgb(var(--neutral-darker))] text-xl sm:text-2xl">
                      📦
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-medium text-sm sm:text-base mb-1 line-clamp-2 leading-tight text-[rgb(var(--blue))]"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                  >
                    {item.name}
                  </h3>

                  <p
                    className="text-xs mb-2 text-[rgb(var(--neutral-darker))]"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                  >
                    {item.variant}
                  </p>

                  {/* Price Section */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="font-bold text-base sm:text-lg"
                      style={{
                        fontFamily: 'var(--font-poppins)',
                        color: 'rgb(var(--red))',
                      }}
                    >
                      {formatPrice(finalPrice)}
                    </span>

                    {item.discount_value > 0 && (
                      <span
                        className="text-xs line-through text-[rgb(var(--neutral-darker))]"
                        style={{ fontFamily: 'var(--font-poppins)' }}
                      >
                        {formatPrice(item.unit_price)}
                      </span>
                    )}

                    {/* Quantity */}
                    <span
                      className="ml-auto text-sm font-medium text-[rgb(var(--neutral-darker))]"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      x{item.quantity}
                    </span>
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
