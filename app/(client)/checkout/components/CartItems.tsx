import React from "react";

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
      return new Intl.NumberFormat("vi-VN").format(price) + "đ";
   };

   return (
      <div className="bg-neutral-light rounded-lg">
         {/* Header */}
         <div className="p-4 sm:p-5 border border-neutral border-b-0 rounded">
            <h2 className="text-base text-primary">
               Sản phẩm trong đơn ({items.length})
            </h2>
         </div>

         {/* Items List */}
         <div className="divide-y divide-neutral border border-neutral rounded">
            {items.map((item) => {
               const finalPrice = item.unit_price - item.discount_value;

               return (
                  <div key={item.id} className="p-4 sm:p-5 bg-neutral-light">
                     <div className="flex gap-3 sm:gap-4">
                        {/* Product Image */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-neutral rounded shrink-0 flex items-center justify-center overflow-hidden">
                           {item.image ? (
                              <img
                                 src={item.image}
                                 alt={item.name}
                                 className="w-full h-full object-cover"
                              />
                           ) : (
                              <span className="text-neutral-darker text-xl sm:text-2xl">
                                 📦
                              </span>
                           )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                           <h3 className="text-sm font-medium mb-1 line-clamp-2 leading-tight text-primary">
                              {item.name}
                           </h3>

                           <p className="text-xs mb-2 text-neutral-darker">
                              {item.variant}
                           </p>

                           {/* Price Section */}
                           <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm text-promotion">
                                 {formatPrice(finalPrice)}
                              </span>

                              {item.discount_value > 0 && (
                                 <span className="text-xs line-through text-neutral-darker ">
                                    {formatPrice(item.unit_price)}
                                 </span>
                              )}

                              {/* Quantity */}
                              <span className="ml-auto text-sm font-medium text-neutral-darker ">
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
