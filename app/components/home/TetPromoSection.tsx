"use client";

import { salebanner } from "@/data/salebanner";
import SaleBannerCard from "./SaleBannerCard";

export default function TetPromoSection() {
  return (
    <section className="py-10 bg-[#f6f6f6]">
      <div className="container mx-auto px-4">

        <div className="bg-[#fff5f0] rounded-3xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* LEFT – 2 ảnh */}
            <div className="md:col-span-3 grid grid-rows-2 gap-6">
              <SaleBannerCard
                item={salebanner[0]}
                className="aspect-4/3"
              />
              <SaleBannerCard
                item={salebanner[1]}
                className="aspect-4/3"
              />
            </div>

            {/* CENTER – CAO BẰNG 2 ẢNH */}
            <div className="md:col-span-6">
              <SaleBannerCard
                item={salebanner[2]}
                className="aspect-4/3 h-full"
              />
            </div>

            {/* RIGHT – 2 ảnh */}
            <div className="md:col-span-3 grid grid-rows-2 gap-6">
              <SaleBannerCard
                item={salebanner[3]}
                className="aspect-4/3"
              />
              <SaleBannerCard
                item={salebanner[4]}
                className="aspect-4/3"
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
