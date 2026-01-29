"use client";

import { useState, useRef } from "react";
import { ProductDetail } from "@/lib/types/product";

interface ProductDetailSection1Props {
  product?: ProductDetail;
}

export default function ProductDetailSection1({
  product,
}: ProductDetailSection1Props) {
  const [activeTab, setActiveTab] = useState<"baiviet" | "meohay">("baiviet");
  const [expanded, setExpanded] = useState(false);

  // Ref để scroll về đầu mô tả
  const descriptionRef = useRef<HTMLDivElement | null>(null);

  const handleToggleExpand = () => {
    if (expanded) {
      // Khi THU GỌN → scroll về đầu mô tả
      descriptionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Bù nếu có header sticky
      setTimeout(() => {
        window.scrollBy({ top: -80, behavior: "smooth" });
      }, 300);
    }

    setExpanded((prev) => !prev);
  };

  return (
    <div
      className="container sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-neutral-light rounded-lg"
      ref={descriptionRef}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT - MÔ TẢ */}
        <div className="flex flex-col gap-4 lg:flex-[2] ">
          <h2 className="text-xl sm:text-2xl font-semibold text-primary">
            Mô tả sản phẩm
          </h2>

          {/* CONTENT */}
          <div
            className={`
              relative
              transition-all
              duration-300
              overflow-hidden
              ${expanded ? "max-h-none" : "max-h-[600px]"}
            `}
          >
            <div
              className="
                product-description
                space-y-4
                text-sm sm:text-base
                text-neutral-darker
                leading-relaxed

                [&_h2]:mt-2
                [&_h2]:text-base
                [&_h2]:sm:text-xl
                [&_h2]:font-semibold
                [&_h2]:text-primary

                [&_h3]:mt-5
                [&_h3]:text-base
                [&_h3]:sm:text-lg
                [&_h3]:font-semibold
                [&_h3]:text-primary

                [&_p]:text-neutral-darker

                [&_strong]:font-semibold
                [&_strong]:text-primary

                [&_figure]:my-6
                [&_figure]:rounded-lg
                [&_figure]:overflow-hidden

                [&_img]:mx-auto
                [&_img]:rounded-lg
                [&_img]:max-w-full

                [&_figcaption]:mt-2
                [&_figcaption]:text-xs
                [&_figcaption]:text-neutral-dark
              "
              dangerouslySetInnerHTML={{
                __html: product?.description || "",
              }}
            />

            {!expanded && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-light to-transparent" />
            )}
          </div>

          {/* BUTTON */}
          <button
            onClick={handleToggleExpand}
            className="text-promotion font-semibold self-center text-primary text-sm sm:text-base hover:underline transition hover:cursor-pointer"
          >
            {expanded ? "Thu gọn ▲" : "Xem thêm ▼"}
          </button>
        </div>

        {/* RIGHT - THÔNG TIN HAY */}
        <div className="flex flex-col gap-3 lg:flex-1 mt-6 lg:mt-0 lg:self-start">
          <h2 className="text-xl sm:text-2xl font-semibold text-primary ">
            Thông tin hay
          </h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-2 sm:mb-4 ">
            <button
              onClick={() => setActiveTab("baiviet")}
              className={`border px-3 sm:px-4 py-2 w-1/2 rounded-full text-sm sm:text-base transition-colors ${
                activeTab === "baiviet"
                  ? "border-promotion text-promotion bg-promotion-light"
                  : "border-neutral-dark text-neutral-darker hover:border-neutral-darker"
              }`}
            >
              Bài viết liên quan
            </button>

            <button
              onClick={() => setActiveTab("meohay")}
              className={`border px-3 sm:px-4 py-2 w-1/2 rounded-full text-sm sm:text-base transition-colors ${
                activeTab === "meohay"
                  ? "border-promotion text-promotion bg-promotion-light"
                  : "border-neutral-dark text-neutral-darker hover:border-neutral-darker"
              }`}
            >
              Xem nhanh
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="text-sm sm:text-base min-h-[380px]">
            {activeTab === "baiviet" && (
              <iframe
                className="w-full aspect-video rounded-lg"
                src="https://www.youtube.com/embed/NmF82mn0oS8"
                title="Video sản phẩm"
                allowFullScreen
              />
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
