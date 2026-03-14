"use client";

import PolicyHero from "../components/PolicyHero";
import PolicySection from "../components/PolicySection";
import PolicyFAQ from "../components/PolicyFAQ";
import { Award, Gift } from "lucide-react";

const appleData = {
  hero: {
    title: "Đại lý ủy quyền Apple",
    subtitle: "Sản phẩm Apple chính hãng, bảo hành toàn quốc",
    image: "https://images.unsplash.com/photo-1592899679769-2c459f7b7f35?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  sections: [
    {
      title: "Ủy quyền và chứng nhận",
      content: "Đại lý ủy quyền chính thức của Apple, bảo hành tiêu chuẩn 12 tháng, sản phẩm niêm phong.",
      number: 1,
      IconComponent: Award
    },
    {
      title: "Quyền lợi độc quyền",
      content: "Quà tặng phụ kiện Apple, trả góp 0%, và gia hạn bảo hành đến 24 tháng.",
      number: 2,
      IconComponent: Gift
    }
  ],
  faqs: [
    { q: "Sản phẩm iPhone có bảo hành quốc tế không?", a: "Có, áp dụng bảo hành toàn cầu của Apple tại trung tâm ủy quyền." },
    { q: "Phụ kiện Apple có chính hãng không?", a: "Có, 100% chính hãng và đầy đủ tem niêm phong." }
  ]
};

export default function AppleAuthorized() {
  return (
    <>
      <PolicyHero {...appleData.hero} />
      <div className="container mx-auto px-6 -mt-12 pb-20 max-w-4xl">
        <div className="grid gap-8 mb-20">
          {appleData.sections.map((section, i) => (
            <PolicySection
              key={i}
              title={section.title}
              content={section.content}
              number={section.number}
              IconComponent={section.IconComponent}
            />
          ))}
        </div>
        <PolicyFAQ title="Câu hỏi về Apple" faqs={appleData.faqs} />
      </div>
    </>
  );
}
