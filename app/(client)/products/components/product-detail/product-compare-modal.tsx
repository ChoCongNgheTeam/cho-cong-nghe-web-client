"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X } from "lucide-react";

interface Product {
   id: number;
   name: string;
   price: string;
   oldPrice?: string;
   image: string;
   screenSize?: string;
   battery?: string;
   status?: string;
   isFixed?: boolean;
   hasDetails?: boolean;
}

interface ProductCompareModalProps {
   isOpen: boolean;
   onClose: () => void;
   allProducts: Product[];
   currentProduct: Product;
   selectedProducts: Product[];
   onAddProduct: (product: Product) => void;
   onRemoveProduct: (productId: number) => void;
   onCompare: () => void;
}

export default function ProductCompareModal({
   isOpen,
   onClose,
   allProducts,
   currentProduct,
   selectedProducts,
   onAddProduct,
   onRemoveProduct,
   onCompare,
}: ProductCompareModalProps) {
   const [searchQuery, setSearchQuery] = useState("");

   // Ngăn scroll layout khi modal mở
   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "";
      }

      return () => {
         document.body.style.overflow = "";
      };
   }, [isOpen]);

   // Lọc sản phẩm gợi ý (cùng phân khúc, không phải sản phẩm hiện tại)
   const suggestedProducts = useMemo(() => {
      const filtered = allProducts.filter(
         (product) =>
            product.id !== currentProduct.id &&
            !selectedProducts.some((p) => p.id === product.id) &&
            product.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return filtered.slice(0, 5); // Hiển thị tối đa 5 sản phẩm gợi ý
   }, [allProducts, currentProduct, selectedProducts, searchQuery]);

   const isProductSelected = (productId: number) =>
      selectedProducts.some((p) => p.id === productId);

   if (!isOpen) return null;

   const maxCompareProducts = 3; // Tối đa so sánh 3 sản phẩm
   const canAddMore = selectedProducts.length < maxCompareProducts;

   return (
      <div className="fixed inset-0 bg-primary-darker/50 backdrop-blur-sm z-50 flex items-end sm:items-center sm:justify-end">
         <div className="bg-neutral-light rounded-t-2xl sm:rounded-lg w-full sm:max-w-2xl h-[100vh] sm:h-auto sm:max-h-[100vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-dark">
               <h2 className="text-xl sm:text-2xl font-bold text-primary">
                  Chọn sản phẩm so sánh
               </h2>
               <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral rounded-lg transition-colors"
               >
                  <X className="w-6 h-6 text-primary" />
               </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
               {/* Search Input */}
               <div className="mb-6">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-darker" />
                     <input
                        type="text"
                        placeholder="Nhập sản phẩm bạn muốn so sánh"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-neutral-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-neutral-light text-primary"
                     />
                  </div>
               </div>

               {/* Suggested Products */}
               <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-4 text-primary">
                     Gợi ý sản phẩm cùng phân khúc
                  </h3>
                  <div className="space-y-3 min-h-[80vh]">
                     {suggestedProducts.length > 0 ? (
                        suggestedProducts.map((product) => (
                           <div
                              key={product.id}
                              className="flex items-center gap-3 p-3 border border-neutral-dark rounded-lg hover:bg-neutral transition-colors"
                           >
                              {/* Product Image */}
                              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral rounded-lg shrink-0 overflow-hidden">
                                 <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                 />
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                 <h4 className="font-medium text-sm sm:text-base text-primary line-clamp-2">
                                    {product.name}
                                 </h4>
                                 <div className="flex items-center gap-2 mt-1">
                                    <span className="text-base sm:text-lg font-bold text-promotion">
                                       {product.price}
                                    </span>
                                    {product.oldPrice && (
                                       <span className="text-xs sm:text-sm text-neutral-darker line-through">
                                          {product.oldPrice}
                                       </span>
                                    )}
                                 </div>
                                 <div className="text-xs sm:text-sm text-neutral-darker mt-1">
                                    {product.screenSize} • {product.battery}
                                 </div>
                              </div>

                              {/* Add Button */}
                              <button
                                 onClick={() => onAddProduct(product)}
                                 disabled={
                                    !canAddMore &&
                                    !isProductSelected(product.id)
                                 }
                                 className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors shrink-0 ${
                                    isProductSelected(product.id)
                                       ? "bg-accent-light text-accent border border-accent"
                                       : canAddMore
                                         ? "bg-accent text-primary hover:bg-accent-hover"
                                         : "bg-neutral text-neutral-darker cursor-not-allowed"
                                 }`}
                              >
                                 {isProductSelected(product.id)
                                    ? "✓ Đã thêm"
                                    : "Thêm vào"}
                              </button>
                           </div>
                        ))
                     ) : (
                        <div className="text-center py-8 text-neutral-darker">
                           {searchQuery
                              ? "Không tìm thấy sản phẩm phù hợp"
                              : "Không có sản phẩm gợi ý"}
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Selected Products */}
            {selectedProducts.length > 0 && (
               <div className="border-t border-neutral-dark p-4 sm:p-6 bg-neutral">
                  <h3 className="text-base font-semibold mb-3 text-primary">
                     Sản phẩm đã chọn ({selectedProducts.length}/
                     {maxCompareProducts})
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                     {selectedProducts.map((product) => (
                        <div
                           key={product.id}
                           className="flex items-center gap-2 bg-neutral-light border border-neutral-dark rounded-lg px-3 py-2"
                        >
                           <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                           />
                           <span className="text-sm font-medium text-primary flex-1">
                              {product.name.substring(0, 20)}...
                           </span>
                           {/* Add Button */}
                           <button
                              onClick={() => onAddProduct(product)}
                              disabled={
                                 !canAddMore && !isProductSelected(product.id)
                              }
                              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors shrink-0 ${
                                 isProductSelected(product.id)
                                    ? "bg-accent-light text-accent border border-accent"
                                    : canAddMore
                                      ? "bg-accent text-primary hover:bg-accent-hover"
                                      : "bg-neutral text-neutral-darker cursor-not-allowed"
                              }`}
                           >
                              {isProductSelected(product.id)
                                 ? "✓ Đã thêm"
                                 : "Thêm vào"}
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Footer */}
            <div className="border-t border-neutral-dark p-4 sm:p-6 flex gap-3">
               <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-neutral-dark rounded-lg font-medium text-primary hover:bg-neutral transition-colors"
               >
                  Xóa tất cả
               </button>
               <button
                  onClick={onCompare}
                  disabled={selectedProducts.length === 0}
                  className="flex-1 px-4 py-2.5 bg-promotion text-white rounded-lg font-medium hover:bg-promotion-hover transition-colors disabled:bg-neutral disabled:cursor-not-allowed"
               >
                  So sánh ngay
               </button>
            </div>
         </div>
      </div>
   );
}
