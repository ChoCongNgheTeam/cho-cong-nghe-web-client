"use client";
import { useState } from "react";
import { ProductDetail } from "@/lib/types/product";

interface ProductDetailSection1Props {
  product?: ProductDetail;
}

export default function ProductDetailSection1() {
  const [activeTab, setActiveTab] = useState("baiviet");

  return (
    <div className="container sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-neutral-light rounded-lg">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Left - Mô tả sản phẩm */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-[2]">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary">
            Mô tả sản phẩm
          </h2>

          <p className="font-semibold text-sm sm:text-base text-primary">
            Nubia A76 NFC được định vị là sản phẩm hướng đến nhóm người dùng phổ
            thông, đặc biệt là những ai tìm kiếm một chiếc điện thoại kết hợp
            hoàn hảo giữa thiết kế phong cách flagship, camera AI 50MP chuyên
            nghiệp và trải nghiệm Android 15 với Google Gemini tích hợp.
          </p>

          <p className="text-sm sm:text-base text-neutral-darker">
            ZTE Nubia A76 NFC không chỉ đáp ứng các nhu cầu cơ bản như liên lạc,
            giải trí mà còn mang đến trải nghiệm vượt trội với camera chính
            50MP, vi xử lý Unisoc T7250 tám nhân 1.8GHz và loạt tính năng cao
            cấp hiếm thấy trong phân khúc. ZTE nubia đặt mục tiêu "không chỉ đủ
            dùng mà còn vượt mong đợi" thông qua Nubia A76, định nghĩa lại trải
            nghiệm công nghệ phổ thông với cấu hình mạnh, thiết kế thời thượng
            và dung lượng cao trong mức giá hợp lý. Đây là lựa chọn lý tưởng cho
            giới trẻ năng động, người dùng sáng tạo nội dung hoặc bất kỳ ai muốn
            sở hữu một thiết bị công nghệ đáng giá.
          </p>

          <h2 className="text-sm sm:text-base font-semibold text-primary">
            Thiết kế mỏng nhẹ và hiện đại
          </h2>

          <p className="text-sm sm:text-base text-neutral-darker">
            Nubia A76 NFC sở hữu thiết kế mỏng nhẹ chỉ 8.5mm độ dày và trọng
            lượng 197g, mang lại cảm giác thoải mái khi cầm nắm và sử dụng trong
            thời gian dài. Kích thước tổng thể 167.3 x 77.3 x 8.3mm được tối ưu
            hóa để phù hợp với bàn tay người Việt, đặc biệt thuận tiện cho việc
            thao tác một tay và mang theo hàng ngày.
          </p>
        </div>

        {/* Right - Thông tin hay */}
        <div className="flex flex-col gap-3 lg:flex-1 mt-6 lg:mt-0">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary">
            Thông tin hay
          </h2>

          {/* Tab Buttons */}
          <div className="flex gap-2 mb-2 sm:mb-4">
            <button
              className={`border px-3 sm:px-4 py-2 w-[50%] rounded-full cursor-pointer text-sm sm:text-base transition-colors ${
                activeTab === "baiviet"
                  ? "border-promotion text-promotion bg-promotion-light"
                  : "border-neutral-dark text-neutral-darker hover:border-neutral-darker"
              }`}
              onClick={() => setActiveTab("baiviet")}
            >
              Bài viết liên quan
            </button>
            <button
              className={`border px-3 sm:px-4 py-2 w-[50%] rounded-full cursor-pointer text-sm sm:text-base transition-colors ${
                activeTab === "meohay"
                  ? "border-promotion text-promotion bg-promotion-light"
                  : "border-neutral-dark text-neutral-darker hover:border-neutral-darker"
              }`}
              onClick={() => setActiveTab("meohay")}
            >
              Xem nhanh
            </button>
          </div>

          {/* Nội dung hiển thị */}
          <div className="text-sm sm:text-base">
            {activeTab === "baiviet" && (
              <div className="w-full">
                <iframe
                  className="w-full aspect-video rounded-lg"
                  src="https://www.youtube.com/embed/NmF82mn0oS8"
                  title="Nubia A76 NFC"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}
            {activeTab === "meohay" && (
              <div className="space-y-3">
                <h3 className="font-semibold text-base sm:text-lg text-primary">
                  Mẹo hay
                </h3>
                <p className="text-neutral-darker">
                  Đây là nội dung các mẹo hay nhanh chóng...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
