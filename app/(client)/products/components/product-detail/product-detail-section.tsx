"use client";

import { useState, useRef } from "react";
import { SpecificationGroup, SpecificationItem, ProductDetail } from "@/lib/types/product";
import ProductSpecsModal, { type ProductSpecsModalRef } from "./ProductSpecsModal";
import { getProductBySpecifications } from "../../_lib/get-product-by-specifications";

interface ProductDetailSectionProps {
  slug?: string;
  product?: ProductDetail;
}

export default function ProductDetailSection({ slug, product }: ProductDetailSectionProps) {
  const [modalSpecs, setModalSpecs] = useState<SpecificationGroup[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  const modalRef = useRef<ProductSpecsModalRef>(null);

  const specifications: SpecificationGroup[] = product?.highlightGroups ?? [];

  const openDialog = async () => {
    if (!slug) return;
    modalRef.current?.open();

    if (modalSpecs.length > 0) return;

    try {
      setLoadingModal(true);
      const data = await getProductBySpecifications(slug);
      setModalSpecs(data?.specifications || []);
    } catch (err) {
      console.error("Error fetching specifications:", err);
    } finally {
      setLoadingModal(false);
    }
  };

  const formatSpecValue = (item: SpecificationItem) =>
    item.unit ? `${item.value} ${item.unit}` : item.value;

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:gap-12">
        <div className="w-full bg-neutral-light rounded-xl px-4 py-4 sm:px-6 sm:py-6 shadow-sm border border-neutral">

          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base sm:text-xl font-semibold text-primary">
              Thông số kỹ thuật
            </h3>

            {specifications.length > 0 && (
              <button
                onClick={openDialog}
                className="text-xs sm:text-sm font-medium text-primary hover:text-primary hover:underline underline-offset-2 transition-all active:scale-95 cursor-pointer"
              >
                Xem tất cả
              </button>
            )}
          </div>

          {/* Content */}
          <div className="space-y-6 w-full lg:w-[95%] xl:w-[90%] mx-auto">

            {specifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-dark gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10 opacity-30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm opacity-50">
                  Chưa có thông số kỹ thuật
                </p>
              </div>
            ) : (
              specifications.slice(0, 3).map((group) => (
                <div key={group.groupName}>

                  {/* Group title */}
                  <h3 className="text-sm sm:text-base font-semibold text-primary mb-3">
                    {group.groupName}
                  </h3>

                  {/* Table wrapper (fix mobile) */}
                  <div className="border border-neutral rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px] text-xs sm:text-sm">
                        <tbody>
                          {group.items.map((item, index) => (
                            <tr
                              key={item.id}
                              className={`
                                ${index % 2 === 0 ? "bg-neutral-light" : "bg-neutral/60"}
                                hover:bg-neutral-dark/10 transition-colors
                                border-b border-neutral last:border-none
                              `}
                            >
                              {/* Name */}
                              <td className="px-3 sm:px-4 py-2 text-neutral-darker w-1/2">
                                {item.name}
                              </td>

                              {/* Value */}
                              <td className="px-3 sm:px-4 py-2 text-primary font-medium">
                                {formatSpecValue(item)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ProductSpecsModal
        ref={modalRef}
        specifications={modalSpecs}
        isLoading={loadingModal}
      />
    </>
  );
}