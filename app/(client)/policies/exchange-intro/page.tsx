"use client";

import PolicyHero from "../components/PolicyHero";
import PolicySection from "../components/PolicySection";
import PolicyFAQ from "../components/PolicyFAQ";
import { RotateCcw, Smartphone } from "lucide-react";

const exchangeData = {
  hero: {
    title: "Giới thiệu Máy Đổi Trả",
    subtitle: "Sản phẩm đã qua kiểm định chất lượng - Giá tốt nhất",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  sections: [
    {
      title: "Nguồn gốc sản phẩm",
      content: "Lỗi đổi trả từ khách, kiểm tra OK, fullbox 95% như mới.",
      number: 1,
      IconComponent: RotateCcw
    },
    {
      title: "Cam kết chất lượng",
      content: "Test 100% chức năng, pin >90%, bảo hành 6 tháng.",
      number: 2,
      IconComponent: Smartphone
    }
  ],
  faqs: [
    { q: "Máy đổi trả có khác máy mới?", a: "Chỉ khác hộp, sản phẩm 95% như mới." },
    { q: "Bảo hành bao lâu?", a: "6 tháng chính hãng từ ngày mua." }
  ]
};

export default function ExchangeIntro() {
  return (
    <>
      <PolicyHero {...exchangeData.hero} />
      <div className="container mx-auto px-6 -mt-12 pb-20 max-w-4xl">
        <div className="grid gap-8 mb-20">
          {exchangeData.sections.map((section, i) => (
            <PolicySection
              key={i}
              title={section.title}
              content={section.content}
              number={section.number}
              IconComponent={section.IconComponent}
            />
          ))}
        </div>
        <PolicyFAQ title="Câu hỏi đổi trả" faqs={exchangeData.faqs} />
      </div>
    </>
  );
}
