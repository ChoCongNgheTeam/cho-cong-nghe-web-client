"use client";

import { useState, useRef, useEffect } from "react";
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
    const wasExpanded = expanded;
    setExpanded((prev) => !prev);

    // Chỉ scroll khi đang thu gọn lại
    if (wasExpanded && descriptionRef.current) {
      const y =
        descriptionRef.current.getBoundingClientRect().top +
        window.pageYOffset -
        80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="" ref={descriptionRef}>
      <div className="flex flex-col lg:flex-row lg:gap-6">
        {/* LEFT - MÔ TẢ */}
        <div className="lg:w-[70%] bg-neutral-light py-6 sm:py-4 lg:py-6 rounded-lg px-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-4">
            Mô tả sản phẩm
          </h2>

          {/* CONTENT */}
          <div
            className={`
      relative transition-all duration-300 overflow-hidden
      ${expanded ? "max-h-none" : "max-h-[600px]"}
    `}
          >
            <div
              className="
        product-description
        space-y-4
        text-sm sm:text-base
        text-neutral-darker

        [&_p]:leading-7
        [&_p]:text-left lg:[&_p]:text-justify

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
        [&_figcaption]:text-center
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
            className="block mx-auto mt-4 font-semibold text-primary text-sm sm:text-base hover:text-primary-light hover:underline transition active:scale-95 cursor-pointer"
          >
            {expanded ? "Thu gọn ▲" : "Xem thêm ▼"}
          </button>
        </div>

        {/* RIGHT - THÔNG TIN HAY - STICKY */}
        <div className="lg:w-[30%] bg-neutral-light py-6 sm:py-4 lg:py-6 rounded-lg px-6">
          <div
            className={`flex flex-col gap-4 ${
              expanded ? "lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]" : ""
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-primary">
              Thông tin hay
            </h2>

            {/* Tabs */}
            <div className="flex bg-neutral rounded-full p-1 gap-1">
              <button
                onClick={() => setActiveTab("baiviet")}
                className={`flex-1 text-center px-1 sm:px-2 py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === "baiviet"
                    ? "bg-neutral-light text-primary shadow-sm"
                    : "text-neutral-darker hover:bg-neutral-active"
                }`}
              >
                Bài viết liên quan
              </button>

              <button
                onClick={() => setActiveTab("meohay")}
                className={`flex-1 text-center px-1 sm:px-2 py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === "meohay"
                    ? "bg-neutral-light text-primary shadow-sm"
                    : "text-neutral-darker hover:bg-neutral-active"
                }`}
              >
                Xem nhanh
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="text-sm sm:text-base overflow-y-auto pr-1">
              {activeTab === "baiviet" && (
                <div className="w-full aspect-video rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/NmF82mn0oS8"
                    title="Video sản phẩm"
                    allowFullScreen
                  />
                </div>
              )}

              {activeTab === "meohay" && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-base sm:text-lg text-primary">
                    Mẹo hay
                  </h3>
                  <p className="text-neutral-darker leading-relaxed">
                    Đây là nội dung các mẹo hay nhanh chóng...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
