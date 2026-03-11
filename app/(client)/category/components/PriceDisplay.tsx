import { ProductPrice } from "@/components/product/types";
import { formatVND } from "@/helpers";

interface PriceDisplayProps {
   price: ProductPrice;
}

export default function PriceDisplay({ price }: PriceDisplayProps) {
   return (
      <div className="space-y-1">
         <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-red-600">
               {formatVND(price.final)}
            </span>
            {price.hasPromotion && price.discountPercentage > 0 && (
               <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded">
                  -{price.discountPercentage}%
               </span>
            )}
         </div>

         {price.hasPromotion && price.base > price.final && (
            <div className="flex items-center gap-2">
               <span className="text-sm text-gray-500 line-through">
                  {formatVND(price.base)}
               </span>
               <span className="text-xs text-green-600 font-medium">
                  Giảm {formatVND(price.discountAmount)}
               </span>
            </div>
         )}
      </div>
   );
}
