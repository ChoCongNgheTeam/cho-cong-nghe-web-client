import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { SearchProduct } from "@/hooks/useProductSearch";
import { formatVND } from "@/helpers";

interface SearchDropdownProps {
   results: SearchProduct[];
   isLoading: boolean;
   query: string;
   onClose: () => void;
}

export default function SearchDropdown({
   results,
   isLoading,
   query,
   onClose,
}: SearchDropdownProps) {
   if (!query.trim()) return null;

   return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-light border border-neutral rounded-xl shadow-xl z-50 overflow-hidden max-h-105 overflow-y-auto">
         {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-neutral-darker text-sm">
               <Loader2 className="w-4 h-4 animate-spin" />
               <span>Đang tìm kiếm...</span>
            </div>
         ) : results.length === 0 ? (
            <div className="py-6 text-center text-neutral-darker text-sm">
               Không tìm thấy sản phẩm nào cho{" "}
               <span className="text-primary font-medium">"{query}"</span>
            </div>
         ) : (
            <ul>
               {results.map((product) => (
                  <li key={product.id}>
                     <Link
                        href={`/products/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-neutral transition-colors"
                     >
                        {/* Thumbnail */}
                        <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-neutral bg-white">
                           <Image
                              src={product.thumbnail}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-contain"
                           />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                           <p className="text-sm text-primary font-medium truncate">
                              {product.name}
                           </p>
                           <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm font-semibold text-primary">
                                 {formatVND(product.price)}
                              </span>
                              {product.discountPercent &&
                                 product.discountPercent > 0 && (
                                    <>
                                       <span className="text-xs text-promotion font-medium">
                                          -{product.discountPercent}%
                                       </span>
                                       {product.originalPrice && (
                                          <span className="text-xs text-neutral-darker line-through">
                                             {formatVND(product.originalPrice)}
                                          </span>
                                       )}
                                    </>
                                 )}
                           </div>
                        </div>
                     </Link>
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
}
