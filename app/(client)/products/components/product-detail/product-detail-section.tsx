"use client";

import { useState, useEffect, useRef } from "react";
import { FaFire, FaShoppingCart } from "react-icons/fa";
import Image from "next/image";
import { getProductBySpecifications } from "../../_lib/get-product-by-specifications";
import { SpecificationGroup, SpecificationItem } from "@/lib/types/product";
import ProductSpecsModal, {
  type ProductSpecsModalRef,
} from "./ProductSpecsModal";

interface ProductDetailSectionProps {
  slug?: string;
}

export default function ProductDetailSection({
  slug,
}: ProductDetailSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [specifications, setSpecifications] = useState<SpecificationGroup[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<ProductSpecsModalRef>(null);

  // Gọi API khi component mount
  useEffect(() => {
    const fetchSpecifications = async () => {
      try {
        setLoading(true);
        setError(null);

        // Kiểm tra có slug không
        if (!slug) {
          throw new Error("Slug is required");
        }

        const data = await getProductBySpecifications(slug);

        // getProductBySpecifications đã return response.data rồi
        // Kiểm tra data.specifications
        if (data?.specifications) {
          setSpecifications(data.specifications);
        } else {
          // Nếu không có specifications, set array rỗng
          setSpecifications([]);
        }
      } catch (err: any) {
        console.error("Error fetching specifications:", err);
        setError(err.message || "Không thể tải thông số kỹ thuật");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchSpecifications();
    } else {
      setLoading(false);
      setError("Thiếu thông tin sản phẩm");
    }
  }, [slug]); // Chạy lại khi slug thay đổi

  

  // Dữ liệu combo - sau này sẽ fetch từ API
  const combos = [
    {
      id: 1,
      title: "Combo Sim TD149 kèm bảo hành",
      product: {
        name: "Dịch vụ bảo hành 1 đổi 1",
        image:
          "https://cdn2.fptshop.com.vn/unsafe/128x0/filters:format(webp):quality(75)/Loai_Bao_hanh_vip_Mau_do_No_38871ff60b.png",
        currentPrice: 0,
        originalPrice: 100000,
        savings: 100000,
      },
      totalPrice: 199000,
      totalOriginalPrice: 349000,
      totalSavings: 150000,
      discount: 43,
    },
    {
      id: 2,
      title: "Combo eSim TD149 kèm bảo hành",
      product: {
        name: "Dịch vụ bảo hành 1 đổi 1",
        image:
          "https://cdn2.fptshop.com.vn/unsafe/128x0/filters:format(webp):quality(75)/Loai_Bao_hanh_vip_Mau_do_No_38871ff60b.png",
        currentPrice: 0,
        originalPrice: 100000,
        savings: 100000,
      },
      totalPrice: 199000,
      totalOriginalPrice: 349000,
      totalSavings: 150000,
      discount: 43,
    },
  ];

  const openDialog = () => {
    if (!specifications.length) return;
    modalRef.current?.open();
  };

  // Dữ liệu thông số kỹ thuật - sẽ được fetch từ API
  // const specifications = [...]; // Đã chuyển sang state và fetch từ API

  const activeCombo = combos[activeIndex];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const formatSpecValue = (item: SpecificationItem) => {
    // Nếu có unit, ghép value + unit
    if (item.unit) {
      return `${item.value} ${item.unit}`;
    }
    return item.value;
  };

  return (
    <>
      <div className="container mx-auto px-4 py-2 !px-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 ">
          {/* Right: Thông số kỹ thuật */}
          <div className="lg:col-span-7 bg-neutral-light rounded-2xl p-6 lg:p-8 shadow-sm ">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-promotion mx-auto"></div>
                <p className="text-neutral-darker mt-4">Đang tải thông số...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">Không thể tải thông số kỹ thuật</p>
                <p className="text-sm text-neutral-darker mt-2">{error}</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold text-primary">
                    Thông số kỹ thuật
                  </h3>
                  <button
                    className="text-sm text-promotion hover:text-promotion-hover  cursor-pointer"
                    onClick={openDialog}
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="space-y-6">
                  {specifications.slice(0, 3).map((group) => (
                    <div key={group.groupName}>
                      <h3 className="block text-primary mb-2">
                        {group.groupName}
                      </h3>
                      <table className="w-full text-sm">
                        <tbody>
                          {group.items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-neutral-dark/20"
                            >
                              <td className="py-2 text-neutral-darker align-top">
                                {item.name}
                              </td>
                              <td className="py-2 text-primary align-top w-2/5">
                                {formatSpecValue(item)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          {/* Left: Combo khuyến mãi */}
          <div className="lg:col-span-5 bg-neutral-light rounded-2xl p-6 lg:p-8 shadow-sm  ">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <FaFire className="w-7 h-7 text-promotion" />
              <h2 className="text-xl lg:text-2xl font-bold text-primary">
                Giảm thêm khi mua kèm
              </h2>
            </div>

            {/* Tab buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              {combos.map((combo, index) => (
                <button
                  key={combo.id}
                  onClick={() => setActiveIndex(index)}
                  className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 border
                  ${
                    activeIndex === index
                      ? "bg-promotion text-white border-promotion shadow-md"
                      : "bg-transparent text-primary border-neutral-dark hover:bg-neutral hover:border-neutral-dark/70"
                  }`}
                >
                  {combo.title}
                </button>
              ))}
            </div>

            {/* Product card */}
            <div className="bg-neutral p-5 rounded-xl border border-neutral-dark/50 flex items-center gap-4">
              <Image
                src={activeCombo.product.image}
                alt={activeCombo.product.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-lg object-contain flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary line-clamp-2">
                  {activeCombo.product.name}
                </h3>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(activeCombo.product.currentPrice)}
                  </span>
                  <s className="text-neutral-darker opacity-60">
                    {formatPrice(activeCombo.product.originalPrice)}
                  </s>
                </div>
                <p className="text-accent font-medium mt-1">
                  Tiết kiệm {formatPrice(activeCombo.product.savings)}
                </p>
              </div>
            </div>

            {/* Footer - Tổng tiền + Action buttons */}
            <div className="mt-8 space-y-6">
              {/* Phần tổng tiền */}
              <div>
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-neutral-darker">Tổng tiền:</span>
                  <span className="text-xl font-bold text-promotion">
                    {formatPrice(activeCombo.totalPrice)}
                  </span>
                  
                  <s className="text-lg text-neutral-darker opacity-50">
                    {formatPrice(activeCombo.totalOriginalPrice)}
                  </s>
                  <span className="text-lg font-semibold text-accent">
                    -{activeCombo.discount}%
                  </span>
                </div>
                <p className="text-accent font-medium mt-2">
                  Tiết kiệm: {formatPrice(activeCombo.totalSavings)}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-20 justify-end">
                <button
                  className="p-4 rounded-full border-2 border-promotion hover:bg-promotion-light transition-all duration-200 flex items-center justify-center sm:w-auto"
                  aria-label="Thêm vào giỏ hàng"
                >
                  <FaShoppingCart className="w-6 h-6 text-promotion" />
                </button>

                <button className="px-6 py-4 rounded-full bg-promotion hover:bg-promotion-hover active:bg-promotion-active text-white font-semibold  transition-all duration-200 shadow-lg">
                  Chọn mua kèm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ProductSpecsModal ref={modalRef} specifications={specifications}/>
    </>
  );
}
