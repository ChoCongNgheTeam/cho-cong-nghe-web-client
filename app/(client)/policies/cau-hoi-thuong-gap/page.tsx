"use client";

import PolicyHero from "../components/PolicyHero";
import PolicyFAQ from "../components/PolicyFAQ";
import PolicySection from "../components/PolicySection";
import { Headphones } from "lucide-react";

const faqData = {
  hero: {
    title: "Câu hỏi thường gặp",
    subtitle: "Giải đáp các thắc mắc phổ biến về đặt hàng, giao hàng và bảo hành",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  sections: [
    {
      title: "Liên hệ hỗ trợ",
      content: "Hotline 1800-6601 (miễn phí). Chat trực tuyến 24/7. Email support@chocongnghe.vn",
      number: 1,
      IconComponent: Headphones
    }
  ],
  faqs: [
    { q: "Làm sao để đặt hàng?", a: "Thêm vào giỏ, nhập thông tin nhận hàng, chọn thanh toán và xác nhận." },
    { q: "Hỗ trợ những phương thức thanh toán nào?", a: "COD, thẻ ngân hàng, ví điện tử và trả góp 0%." },
    { q: "Thời gian giao hàng bao lâu?", a: "Nội thành trong 2 giờ, liên tỉnh 1-3 ngày." },
    { q: "Chính sách đổi trả thế nào?", a: "Đổi trả trong 30 ngày với lỗi từ nhà sản xuất, đầy đủ phụ kiện." },
    { q: "Bảo hành bao lâu?", a: "Tùy dòng sản phẩm: điện thoại 12 tháng, laptop 24 tháng." },
    { q: "Sản phẩm có chính hãng không?", a: "Có, 100% chính hãng, đầy đủ tem niêm phong và hóa đơn VAT." },
    { q: "Có được mở hộp kiểm tra không?", a: "Có, được kiểm tra IMEI và chức năng trước khi nhận." }
  ]
};

export default function FAQ() {
  return (
    <>
      <PolicyHero {...faqData.hero} />
      <div className="container mx-auto px-6 -mt-12 pb-20 max-w-4xl">
        <div className="grid gap-8 mb-20">
          {faqData.sections.map((section, i) => (
            <PolicySection
              key={i}
              title={section.title}
              content={section.content}
              number={section.number}
              IconComponent={section.IconComponent}
            />
          ))}
        </div>
        <PolicyFAQ title="Câu hỏi chi tiết" faqs={faqData.faqs} />
      </div>
    </>
  );
}
