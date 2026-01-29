interface PriceDisplayProps {
   price: {
      base: number;
      final: number;
      discountAmount: number;
      discountPercentage: number;
      hasPromotion: boolean;
   };
}

export default function PriceDisplay({ price }: PriceDisplayProps) {
   const formatPrice = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
         style: "currency",
         currency: "VND",
      }).format(amount);
   };

   const formatPriceShort = (amount: number) => {
      return amount.toLocaleString("vi-VN") + "đ";
   };

   return (
      <div className="space-y-1">
         {/* Current Price */}
         <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-red-600">
               {formatPriceShort(price.final)}
            </span>
            {price.hasPromotion && price.discountPercentage > 0 && (
               <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded">
                  -{price.discountPercentage}%
               </span>
            )}
         </div>

         {/* Original Price (if discounted) */}
         {price.hasPromotion && price.base > price.final && (
            <div className="flex items-center gap-2">
               <span className="text-sm text-gray-500 line-through">
                  {formatPriceShort(price.base)}
               </span>
               <span className="text-xs text-green-600 font-medium">
                  Giảm {formatPriceShort(price.discountAmount)}
               </span>
            </div>
         )}
      </div>
   );
}
