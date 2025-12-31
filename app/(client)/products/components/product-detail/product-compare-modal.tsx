"use client";

import React, { useState, useMemo } from "react";
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

  // Lọc sản phẩm gợi ý (cùng phân khúc, không phải sản phẩm hiện tại)
  const suggestedProducts = useMemo(() => {
    const filtered = allProducts.filter(
      (product) =>
        product.id !== currentProduct.id &&
        !selectedProducts.some((p) => p.id === product.id) &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.slice(0, 5); // Hiển thị tối đa 5 sản phẩm gợi ý
  }, [allProducts, currentProduct, selectedProducts, searchQuery]);

  const isProductSelected = (productId: number) =>
    selectedProducts.some((p) => p.id === productId);

  if (!isOpen) return null;

  const maxCompareProducts = 3; // Tối đa so sánh 3 sản phẩm
  const canAddMore = selectedProducts.length < maxCompareProducts;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-end sm:items-center sm:justify-end">
      <div className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-2xl h-[100vh] sm:h-auto sm:max-h-[100vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-xl sm:text-2xl font-bold">
            Chọn sản phẩm so sánh
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Search Input */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nhập sản phẩm bạn muốn so sánh"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Suggested Products */}
          <div className="mb-8">
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">
              Gợi ý sản phẩm cùng phân khúc
            </h3>
            <div className="space-y-3 min-h-[100vh]">
              {suggestedProducts.length > 0 ? (
                suggestedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base sm:text-lg font-bold text-red-600">
                          {product.price}
                        </span>
                        {product.oldPrice && (
                          <span className="text-xs sm:text-sm text-gray-400 line-through">
                            {product.oldPrice}
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {product.screenSize} • {product.battery}
                      </div>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={() => onAddProduct(product)}
                      disabled={!canAddMore && !isProductSelected(product.id)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex-shrink-0 ${
                        isProductSelected(product.id)
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : canAddMore
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isProductSelected(product.id) ? "✓ Đã thêm" : "Thêm vào"}
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
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
          <div className="border-t p-4 sm:p-6 bg-gray-50">
            <h3 className="text-base font-semibold mb-3 text-gray-800">
              Sản phẩm đã chọn ({selectedProducts.length}/{maxCompareProducts})
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <span className="text-sm font-medium text-gray-700 flex-1">
                    {product.name.substring(0, 20)}...
                  </span>
                  {/* Add Button */}
                  <button
                    onClick={() => onAddProduct(product)}
                    disabled={!canAddMore && !isProductSelected(product.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex-shrink-0 ${
                      isProductSelected(product.id)
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : canAddMore
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isProductSelected(product.id) ? "✓ Đã thêm" : "Thêm vào"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t p-4 sm:p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Xóa tất cả
          </button>
          <button
            onClick={onCompare}
            disabled={selectedProducts.length === 0}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            So sánh ngay
          </button>
        </div>
      </div>
    </div>
  );
}
