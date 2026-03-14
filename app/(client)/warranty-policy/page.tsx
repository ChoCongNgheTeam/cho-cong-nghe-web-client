"use client";

import Link from "next/link";
import { useState } from "react";

export default function WarrantyPolicyPage() {
   const [fontSize, setFontSize] = useState<"small" | "large">("small");
   const contentStyle = { fontSize: fontSize === "small" ? "14px" : "16px" };

   return (
      <div
         className="min-h-screen"
         style={{ backgroundColor: "rgb(var(--neutral-light-active))" }}
      >
         <div
            className="border-b"
            style={{
               backgroundColor: "rgb(var(--neutral-light))",
               borderColor: "rgb(var(--neutral))",
            }}
         >
            <div className="container py-2.5">
               <nav className="flex items-center gap-1.5 text-sm">
                  <Link
                     href="/"
                     className="transition-colors"
                     style={{ color: "rgb(var(--promotion))" }}
                  >
                     Trang chủ
                  </Link>
                  <span style={{ color: "rgb(var(--neutral-dark))" }}>/</span>
                  <Link
                     href="/policies"
                     className="transition-colors"
                     style={{ color: "rgb(var(--promotion))" }}
                  >
                     Chính sách
                  </Link>
                  <span style={{ color: "rgb(var(--neutral-dark))" }}>/</span>
                  <span style={{ color: "rgb(var(--primary-light))" }}>
                     Chính sách bảo hành
                  </span>
               </nav>
            </div>
         </div>

         <div className="container py-5">
            <div className="flex gap-5">
               <main
                  className="flex-1 rounded-lg p-6 md:p-8"
                  style={{
                     backgroundColor: "rgb(var(--neutral-light))",
                     border: "1px solid rgb(var(--neutral))",
                  }}
               >
                  <div className="flex items-center gap-2 mb-5">
                     <button
                        onClick={() => setFontSize("small")}
                        className="px-4 py-1.5 rounded-full transition-colors"
                        style={{
                           backgroundColor:
                              fontSize === "small"
                                 ? "rgb(var(--primary))"
                                 : "transparent",
                           color:
                              fontSize === "small"
                                 ? "rgb(var(--neutral-light))"
                                 : "rgb(var(--primary-light))",
                           border:
                              fontSize === "small"
                                 ? "none"
                                 : "1px solid rgb(var(--neutral))",
                           fontSize: "13px",
                           fontWeight: fontSize === "small" ? 600 : 400,
                        }}
                     >
                        Cỡ chữ nhỏ
                     </button>
                     <button
                        onClick={() => setFontSize("large")}
                        className="px-4 py-1.5 rounded-full transition-colors"
                        style={{
                           backgroundColor:
                              fontSize === "large"
                                 ? "rgb(var(--primary))"
                                 : "transparent",
                           color:
                              fontSize === "large"
                                 ? "rgb(var(--neutral-light))"
                                 : "rgb(var(--primary-light))",
                           border:
                              fontSize === "large"
                                 ? "none"
                                 : "1px solid rgb(var(--neutral))",
                           fontSize: "13px",
                           fontWeight: fontSize === "large" ? 600 : 400,
                        }}
                     >
                        Cỡ chữ lớn
                     </button>
                  </div>

                  <h1
                     className="text-2xl md:text-3xl font-bold mb-5"
                     style={{ color: "rgb(var(--primary))" }}
                  >
                     Chính sách bảo hành
                  </h1>

                  <p
                     className="leading-relaxed mb-4"
                     style={{ color: "rgb(var(--primary))", ...contentStyle }}
                  >
                     Tất cả sản phẩm bán tại ChoCongNghe đều là hàng chính hãng
                     và được bảo hành theo quy định của nhà sản xuất. Chúng tôi
                     hỗ trợ khách hàng xử lý bảo hành tại các trung tâm ủy quyền.
                  </p>

                  <p
                     className="leading-relaxed mb-4"
                     style={{ color: "rgb(var(--primary))", ...contentStyle }}
                  >
                     Khi mua hàng tại ChoCongNghe, khách hàng nhận được các quyền
                     lợi sau:
                  </p>

                  <ul className="mb-6 space-y-2">
                     {[
                        "Đổi mới 1-1 trong 30 ngày nếu lỗi nhà sản xuất (áp dụng điều kiện).",
                        "Miễn phí gửi sản phẩm đến trung tâm bảo hành ủy quyền.",
                        "Tra cứu tình trạng bảo hành qua hotline hoặc online.",
                        "Hỗ trợ phối hợp với hãng khi phát sinh vấn đề.",
                     ].map((item, i) => (
                        <li
                           key={i}
                           className="flex gap-2 leading-relaxed"
                           style={{
                              color: "rgb(var(--primary))",
                              ...contentStyle,
                           }}
                        >
                           <span className="mt-1 shrink-0">•</span>
                           <span>{item}</span>
                        </li>
                     ))}
                  </ul>

                  <p
                     className="leading-relaxed mb-4"
                     style={{ color: "rgb(var(--primary))", ...contentStyle }}
                  >
                     Các trường hợp thường không được bảo hành:
                  </p>

                  <ul className="mb-6 space-y-2">
                     {[
                        "Hết thời hạn bảo hành (có thể tra cứu online).",
                        "Tự ý sửa chữa hoặc can thiệp phần cứng.",
                        "Hư hỏng do sử dụng sai cách, vào nước, va đập hoặc oxy hóa.",
                        "Móp méo, nứt vỡ hoặc trầy xước nặng.",
                        "Thiết bị bị khóa tài khoản (iCloud, Google, ...).",
                        "Cài đặt phần mềm không chính hãng hoặc can thiệp hệ thống.",
                     ].map((item, i) => (
                        <li
                           key={i}
                           className="flex gap-2 leading-relaxed"
                           style={{
                              color: "rgb(var(--primary))",
                              ...contentStyle,
                           }}
                        >
                           <span className="mt-1 shrink-0">•</span>
                           <span>{item}</span>
                        </li>
                     ))}
                  </ul>

                  <p
                     className="font-semibold mb-3"
                     style={{ color: "rgb(var(--primary))", ...contentStyle }}
                  >
                     Ghi chú:
                  </p>
                  <ul className="mb-6 space-y-2">
                     {[
                        "Bảo hành được tính từ ngày xuất hóa đơn.",
                        "Thời hạn bảo hành tùy theo nhóm sản phẩm và hãng.",
                        "Sao lưu dữ liệu trước khi gửi bảo hành.",
                        "Tắt khóa thiết bị trước khi gửi bảo hành.",
                     ].map((item, i) => (
                        <li
                           key={i}
                           className="flex gap-2 leading-relaxed"
                           style={{
                              color: "rgb(var(--primary))",
                              ...contentStyle,
                           }}
                        >
                           <span className="mt-1 shrink-0">•</span>
                           <span>{item}</span>
                        </li>
                     ))}
                  </ul>

                  <div
                     className="pt-4 space-y-1.5"
                     style={{ borderTop: "1px solid rgb(var(--neutral))" }}
                  >
                     {[
                        "(*) Áp dụng cho sản phẩm mới hoặc còn trong thời hạn bảo hành hãng.",
                        "(**) Đổi mới 30 ngày áp dụng cho sản phẩm đủ điều kiện và xác nhận lỗi.",
                        "(***) Không áp dụng cho sản phẩm bảo hành tại nhà hoặc hàng cồng kềnh.",
                     ].map((note, i) => (
                        <p
                           key={i}
                           className="leading-relaxed"
                           style={{
                              color: "rgb(var(--primary-light))",
                              fontSize: fontSize === "small" ? "12px" : "14px",
                           }}
                        >
                           {note}
                        </p>
                     ))}
                  </div>
               </main>
            </div>
         </div>
      </div>
   );
}
