// app/(client)/cart/components/VariantDropdown.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

// ============ Types based on ERD ============
interface ProductVariant {
   id: number;
   product_id: number;
   code: string; // UNIQUE code (SKU)
   price: number;
   stock_count: number;
   weight?: number;
   is_default?: boolean;
   is_active: boolean;
}

interface VariantAttribute {
   product_variant_id: number;
   attributes_option_id: number;
   attributes_option?: {
      id: number;
      attribute_id: number;
      value: string;
      attribute?: {
         id: number;
         name: string;
         description?: string;
      };
   };
}

interface VariantWithAttributes extends ProductVariant {
   variants_attributes?: VariantAttribute[];
   product_variant_images?: Array<{
      img_url: string;
   }>;
}

interface VariantDropdownProps {
   cartItemId: number;
   productId: number;
   currentVariantId: number;
   currentVariantName: string;
   onVariantChange: (
      cartItemId: number,
      variantId: number,
      variantName: string,
      price: number,
   ) => void;
}

// ============ Mock Data based on ERD ============
const MOCK_VARIANTS_BY_PRODUCT: Record<number, VariantWithAttributes[]> = {
   // Product 1: IPHONE 16 PRO MAX
   1: [
      {
         id: 101,
         product_id: 1,
         code: "IP16PM-TIT-NAT",
         price: 250000,
         stock_count: 15,
         is_active: true,
         variants_attributes: [
            {
               product_variant_id: 101,
               attributes_option_id: 1,
               attributes_option: {
                  id: 1,
                  attribute_id: 1,
                  value: "Titan Tự Nhiên",
                  attribute: {
                     id: 1,
                     name: "Màu sắc",
                  },
               },
            },
         ],
      },
      {
         id: 102,
         product_id: 1,
         code: "IP16PM-TIT-BLK",
         price: 250000,
         stock_count: 10,
         is_active: true,
         variants_attributes: [
            {
               product_variant_id: 102,
               attributes_option_id: 2,
               attributes_option: {
                  id: 2,
                  attribute_id: 1,
                  value: "Titan Đen",
                  attribute: {
                     id: 1,
                     name: "Màu sắc",
                  },
               },
            },
         ],
      },
      {
         id: 103,
         product_id: 1,
         code: "IP16PM-TIT-WHT",
         price: 255000,
         stock_count: 0, // Out of stock
         is_active: true,
         variants_attributes: [
            {
               product_variant_id: 103,
               attributes_option_id: 3,
               attributes_option: {
                  id: 3,
                  attribute_id: 1,
                  value: "Titan Trắng",
                  attribute: {
                     id: 1,
                     name: "Màu sắc",
                  },
               },
            },
         ],
      },
      {
         id: 104,
         product_id: 1,
         code: "IP16PM-TIT-BLU",
         price: 260000,
         stock_count: 8,
         is_active: true,
         variants_attributes: [
            {
               product_variant_id: 104,
               attributes_option_id: 4,
               attributes_option: {
                  id: 4,
                  attribute_id: 1,
                  value: "Titan Xanh",
                  attribute: {
                     id: 1,
                     name: "Màu sắc",
                  },
               },
            },
         ],
      },
   ],

   // Product 2: MacBook Pro
   2: [
      {
         id: 201,
         product_id: 2,
         code: "MBP14-SG-16GB",
         price: 45000000,
         stock_count: 5,
         is_active: true,
         variants_attributes: [
            {
               product_variant_id: 201,
               attributes_option_id: 5,
               attributes_option: {
                  id: 5,
                  attribute_id: 1,
                  value: "Space Gray",
                  attribute: {
                     id: 1,
                     name: "Màu sắc",
                  },
               },
            },
            {
               product_variant_id: 201,
               attributes_option_id: 6,
               attributes_option: {
                  id: 6,
                  attribute_id: 2,
                  value: "16GB",
                  attribute: {
                     id: 2,
                     name: "RAM",
                  },
               },
            },
         ],
      },
      {
         id: 202,
         product_id: 2,
         code: "MBP14-SG-32GB",
         price: 52000000,
         stock_count: 3,
         is_active: true,
         variants_attributes: [
            {
               product_variant_id: 202,
               attributes_option_id: 5,
               attributes_option: {
                  id: 5,
                  attribute_id: 1,
                  value: "Space Gray",
                  attribute: {
                     id: 1,
                     name: "Màu sắc",
                  },
               },
            },
            {
               product_variant_id: 202,
               attributes_option_id: 7,
               attributes_option: {
                  id: 7,
                  attribute_id: 2,
                  value: "32GB",
                  attribute: {
                     id: 2,
                     name: "RAM",
                  },
               },
            },
         ],
      },
      {
         id: 203,
         product_id: 2,
         code: "MBP14-SLV-16GB",
         price: 45000000,
         stock_count: 4,
         is_active: true,
         variants_attributes: [
            {
               product_variant_id: 203,
               attributes_option_id: 8,
               attributes_option: {
                  id: 8,
                  attribute_id: 1,
                  value: "Silver",
                  attribute: {
                     id: 1,
                     name: "Màu sắc",
                  },
               },
            },
            {
               product_variant_id: 203,
               attributes_option_id: 6,
               attributes_option: {
                  id: 6,
                  attribute_id: 2,
                  value: "16GB",
                  attribute: {
                     id: 2,
                     name: "RAM",
                  },
               },
            },
         ],
      },
   ],

   // Product 3: AirPods Pro
   3: [
      {
         id: 301,
         product_id: 3,
         code: "APP-GEN2-WHT",
         price: 6490000,
         stock_count: 20,
         is_active: true,
         variants_attributes: [
            {
               product_variant_id: 301,
               attributes_option_id: 9,
               attributes_option: {
                  id: 9,
                  attribute_id: 1,
                  value: "Trắng",
                  attribute: {
                     id: 1,
                     name: "Màu sắc",
                  },
               },
            },
         ],
      },
   ],
};

// ============ Helper Functions ============
function formatVariantName(variants_attributes?: VariantAttribute[]): string {
   if (!variants_attributes || variants_attributes.length === 0) return "";

   return variants_attributes
      .map((attr) => {
         const attrName = attr.attributes_option?.attribute?.name || "";
         const attrValue = attr.attributes_option?.value || "";
         return `${attrName}: ${attrValue}`;
      })
      .join(", ");
}

function formatPrice(price: number): string {
   return new Intl.NumberFormat("vi-VN").format(price) + "₫";
}

// ============ Main Component ============
export default function VariantDropdown({
   cartItemId,
   productId,
   currentVariantId,
   currentVariantName,
   onVariantChange,
}: VariantDropdownProps) {
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   // Get variants for this product
   const variants = MOCK_VARIANTS_BY_PRODUCT[productId] || [];

   // Close dropdown when clicking outside
   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
         ) {
            setIsOpen(false);
         }
      }

      if (isOpen) {
         document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [isOpen]);

   const handleSelect = (variant: VariantWithAttributes) => {
      const variantName = formatVariantName(variant.variants_attributes);
      onVariantChange(cartItemId, variant.id, variantName, variant.price);
      setIsOpen(false);
   };

   // If no variants or only one variant, don't show dropdown
   if (variants.length <= 1) {
      return (
         <div className="text-xs text-neutral-darker mb-2">
            {currentVariantName}
         </div>
      );
   }

   return (
      <div className="relative inline-block mb-2" ref={dropdownRef}>
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-neutral rounded hover:border-accent transition-colors bg-neutral-light"
         >
            <span className="font-medium text-neutral-darker">
               {currentVariantName}
            </span>
            <ChevronDown
               className={`h-3 w-3 text-neutral-dark transition-transform ${
                  isOpen ? "rotate-180" : ""
               }`}
            />
         </button>

         {isOpen && (
            <div className="absolute left-0 top-full mt-1 bg-neutral-light border border-neutral rounded-lg shadow-lg z-50 min-w-[220px] max-w-[300px]">
               <div className="py-1 max-h-[280px] overflow-y-auto">
                  {variants.map((variant) => {
                     const variantName = formatVariantName(
                        variant.variants_attributes,
                     );
                     const isSelected = variant.id === currentVariantId;
                     const isOutOfStock = variant.stock_count === 0;

                     return (
                        <button
                           key={variant.id}
                           onClick={() =>
                              !isOutOfStock && handleSelect(variant)
                           }
                           disabled={isOutOfStock}
                           className={`w-full px-3 py-2.5 text-left text-sm transition-colors ${
                              isSelected
                                 ? "bg-accent/10 text-primary"
                                 : isOutOfStock
                                   ? "text-neutral-dark cursor-not-allowed opacity-50 bg-neutral-light/30"
                                   : "hover:bg-neutral-light text-neutral-darker"
                           }`}
                        >
                           <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                 <div className="font-medium line-clamp-1">
                                    {variantName}
                                 </div>
                                 <div className="text-xs text-neutral-dark mt-0.5">
                                    {formatPrice(variant.price)}
                                 </div>
                              </div>

                              <div className="flex items-center gap-1 flex-shrink-0">
                                 {isOutOfStock && (
                                    <span className="text-xs text-red-600 font-medium">
                                       Hết hàng
                                    </span>
                                 )}
                                 {isSelected && !isOutOfStock && (
                                    <Check className="h-4 w-4 text-accent" />
                                 )}
                              </div>
                           </div>
                        </button>
                     );
                  })}
               </div>
            </div>
         )}
      </div>
   );
}
