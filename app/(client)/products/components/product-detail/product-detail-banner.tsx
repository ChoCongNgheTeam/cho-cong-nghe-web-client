"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { mockProduct, type Product } from "../../_lib/mockProduct";
import { MdPhoneIphone } from "react-icons/md";
import { IoRadioButtonOn } from "react-icons/io5";
import { MdMemory, MdVerified } from "react-icons/md";
import { FaUserCog, FaShippingFast } from "react-icons/fa";

interface ProductDetailleftProps {
  product?: Product;
}

export default function ImageCarouselBanner({
  product = mockProduct,
}: ProductDetailleftProps = {}) {
  // Mỗi thumbnail chứa một nhóm ảnh

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentGroup = product.variants[currentGroupIndex];
  const currentImageObj = currentGroup.images[currentImageIndex];
  const currentImage = Array.isArray(currentImageObj.imgUrl)
    ? currentImageObj.imgUrl[0]
    : currentImageObj.imgUrl;
  const totalImagesInGroup = currentGroup.images.length;
  // Chuyển đến nhóm ảnh bất kỳ khi click thumbnail
  const goToGroup = (index: number) => {
    setCurrentGroupIndex(index);
    setCurrentImageIndex(0); // Khi chọn nhóm mới → reset về ảnh đầu tiên
  };

  // Logic chuyển về nhóm trước
  const goToPrevious = () => {
    setCurrentGroupIndex((prevGroup) => {
      let newGroup = prevGroup;
      let newImage = currentImageIndex;

      if (currentImageIndex > 0) {
        newImage = currentImageIndex - 1;
      } else {
        newGroup =
          prevGroup === 0 ? product.variants.length - 1 : prevGroup - 1;
        newImage = product.variants[newGroup].images.length - 1;
      }

      setCurrentImageIndex(newImage);
      return newGroup;
    });
  };

  //logic chuyển nhóm tiếp theo
  const goToNext = () => {
    setCurrentGroupIndex((prevGroup) => {
      let newGroup = prevGroup;
      let newImage = currentImageIndex;

      if (currentImageIndex < totalImagesInGroup - 1) {
        newImage = currentImageIndex + 1;
      } else {
        newGroup =
          prevGroup === product.variants.length - 1 ? 0 : prevGroup + 1;
        newImage = 0;
      }

      setCurrentImageIndex(newImage);
      return newGroup;
    });
  };

  // Tính tổng số ảnh và vị trí hiện tại
  const getTotalImagesBefore = (groupIndex: number) => {
    let total = 0;
    for (let i = 0; i < groupIndex; i++) {
      total += product.variants[i].images.length;
    }
    return total;
  };

  const currentAbsoluteIndex =
    getTotalImagesBefore(currentGroupIndex) + currentImageIndex + 1;
  const totalImages = product.variants.reduce(
    (sum, group) => sum + group.images.length,
    0
  );

  return (
    <div>
      {/* Banner chính */}
      <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-white rounded-lg overflow-hidden shadow-2xl">
        {/* Ảnh hiện tại */}
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={currentImage}
            className="max-w-full max-h-full object-contain transition-opacity duration-500"
            alt="Product image"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
        </div>

        {/* Nút Previous */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 sm:p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Nút Next */}
        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 sm:p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Chỉ số ảnh */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-gray-800 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg backdrop-blur-sm z-10">
          <div className="text-xs text-gray-300 mt-1">
            {currentAbsoluteIndex}/{totalImages}
          </div>
        </div>
      </div>

      {/* Thumbnail nhóm ảnh ở dưới */}
      <div className="mt-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 lg:gap-6">
          {product.variants.map((group, index) => {
            const firstImage = group.images[0];
            const thumbnailUrl = Array.isArray(firstImage.imgUrl)
              ? firstImage.imgUrl[0]
              : firstImage.imgUrl;

            return (
              <button
                key={group.id}
                onClick={() => goToGroup(index)}
                className={`relative group rounded-lg overflow-hidden transition-all duration-300 ${
                  index === currentGroupIndex
                    ? "ring-1 ring-blue-500 scale-105"
                    : "ring-2 ring-gray-300 hover:ring-blue-300 hover:scale-105"
                }`}
              >
                {/* Thumbnail image */}
                <div className="relative h-16 sm:h-20 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={thumbnailUrl}
                    alt={group.code}
                    className={`max-w-full max-h-full object-contain transition-opacity duration-300 p-2 ${
                      index === currentGroupIndex
                        ? "opacity-100"
                        : "opacity-70 group-hover:opacity-100"
                    }`}
                  />
                </div>

                {/* Tên và số lượng ảnh */}
                {/* <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2">
                  <div className="text-white text-xs font-medium truncate">
                    {group.code}
                  </div>
                  <div className="text-white/80 text-xs">
                    {group.images.length} ảnh
                  </div>
                </div> */}

                {/* Badge số thứ tự */}
                <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-black/60 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded backdrop-blur-sm">
                  {index + 1}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-6">
          <div className="text-base flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <h2 className="font-semibold">Thông số nổi bật</h2>
            <button className="border border-red-500 px-4 sm:px-6 py-1 rounded-full text-sm sm:text-base text-red-500 cursor-pointer hover:bg-red-500 hover:text-white transition-colors duration-200">
              Xem tất cả thông số
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-12 border-b border-gray-300 pb-6">
            <div className="flex-1">
              <span className="text-sm opacity-70">Kích thước màn hình</span>
              <div className="flex items-center gap-2 mt-3 sm:mt-6">
                <MdPhoneIphone size={28} className="opacity-50"></MdPhoneIphone>
                <span className="text-base font-semibold">6.75 inch</span>
              </div>
            </div>
            <div className="flex-1 sm:border-l sm:border-r sm:px-6 lg:px-12 border-gray-300">
              <span className="text-sm opacity-70">Camera</span>
              <div className="flex items-center gap-2 mt-3 sm:mt-6">
                <IoRadioButtonOn
                  size={28}
                  className="opacity-50"
                ></IoRadioButtonOn>
                <span className="text-base font-semibold">50.0 MP</span>
              </div>
            </div>
            <div className="flex-1">
              <span className="text-sm opacity-70">RAM</span>
              <div className="flex items-center gap-2 mt-3 sm:mt-6">
                <MdMemory size={28} className="opacity-50"></MdMemory>
                <span className="text-base font-semibold">4 GB</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex flex-col sm:flex-row justify-between mt-4 items-start sm:items-center gap-2">
            <h2 className="text-base font-semibold">Chính sách sản phẩm</h2>
            <button className="text-sm text-blue-500 cursor-pointer hover:text-blue-700 font-bold">
              Tìm hiểu thêm
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap mt-6">
            <div className="flex items-center gap-2 sm:mr-12">
              <MdVerified size={28} className="opacity-50"></MdVerified>
              <p className="text-sm">Hàng chính hãng - Bảo hành 18 tháng</p>
            </div>
            <div className="flex items-center gap-2">
              <FaShippingFast
                size={28}
                className="opacity-50"
              ></FaShippingFast>
              <p className="text-sm">Miễn phí giao hàng toàn quốc</p>
            </div>
            <div className="flex items-center gap-2">
              <FaUserCog size={28} className="opacity-50"></FaUserCog>
              <p className="text-sm">Kỹ thuật viên hỗ trợ trực tuyến</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}