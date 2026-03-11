"use client";

import Link from "next/link";
import { useState } from "react";

export default function ChinhSachDoiTraPage() {
   const [fontSize, setFontSize] = useState<"small" | "large">("small");
   const contentStyle = { fontSize: fontSize === "small" ? "14px" : "16px" };

   return (
      <div
         className="min-h-screen"
         style={{ backgroundColor: "rgb(var(--neutral-light-active))" }}
      >
         {/* Breadcrumb */}
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
                     Chính sách đổi trả
                  </span>
               </nav>
            </div>
         </div>

         {/* Main Content */}
         <div className="container py-5">
            <div className="flex gap-5">
               {/* Article */}
               <main
                  className="flex-1 rounded-lg p-6 md:p-8"
                  style={{
                     backgroundColor: "rgb(var(--neutral-light))",
                     border: "1px solid rgb(var(--neutral))",
                  }}
               >
                  {/* Font size toggle */}
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

                  {/* Heading */}
                  <h1
                     className="text-2xl md:text-3xl font-bold mb-6"
                     style={{ color: "rgb(var(--primary))" }}
                  >
                     Chính sách đổi trả
                  </h1>

                  {/* Section: Khung chính sách đổi trả */}
                  <Section title="Khung chính sách đổi trả" contentStyle={contentStyle}>
                     <p
                        className="leading-relaxed mb-3"
                        style={{ color: "rgb(var(--primary))", ...contentStyle }}
                     >
                        ChoCongNghe cung cấp các hướng dẫn thiết yếu cho việc
                        tạo chính sách hoàn tiền và đổi trả hiệu quả, bao gồm
                        các chủ đề như tầm quan trọng của việc có chính sách rõ
                        ràng, ghi chú về các sản phẩm có thể hoặc không thể hoàn
                        tiền, quyết định ai sẽ trả phí vận chuyển đổi trả, và
                        thiết lập kỳ vọng của khách hàng về thời gian hoàn tiền.
                     </p>
                     <p
                        className="leading-relaxed mb-3"
                        style={{ color: "rgb(var(--primary))", ...contentStyle }}
                     >
                        Tính năng quản lý RMA (Return Merchandise
                        Authorization): Việc thêm chính sách bảo hành và đổi trả
                        vừa đơn giản vừa phức tạp. Hệ thống quản lý quy trình
                        RMA, thêm bảo hành cho sản phẩm, và cho phép khách hàng
                        yêu cầu và quản lý đổi trả/hoàn tiền từ tài khoản của
                        họ.
                     </p>

                     <div className="mt-4 space-y-4">
                        <SubSection title="1. Thời gian đổi trả" contentStyle={contentStyle}>
                           <p
                              className="leading-relaxed"
                              style={{ color: "rgb(var(--primary))", ...contentStyle }}
                           >
                              Thiết lập số ngày tối đa cho phép đổi trả và chọn
                              trạng thái đơn hàng mà chính sách RMA được áp
                              dụng.
                           </p>
                        </SubSection>

                        <SubSection title="2. Quy trình đổi trả" contentStyle={contentStyle}>
                           <p
                              className="leading-relaxed"
                              style={{ color: "rgb(var(--primary))", ...contentStyle }}
                           >
                              Quản lý quy trình hoàn tiền trong cửa hàng một
                              cách dễ dàng. Kích hoạt biểu mẫu hoàn tiền, cho
                              phép đổi trả tự động, tắt biểu mẫu hoàn tiền sau
                              một thời gian cụ thể, và quản lý hoàn tiền trực
                              tiếp từ đơn hàng.
                           </p>
                        </SubSection>

                        <SubSection title="3. Yêu cầu đổi trả không cần đăng nhập" contentStyle={contentStyle}>
                           <p
                              className="leading-relaxed"
                              style={{ color: "rgb(var(--primary))", ...contentStyle }}
                           >
                              Tính năng mới cho phép khách hàng yêu cầu hoàn
                              tiền mà không cần đăng nhập tài khoản.
                           </p>
                        </SubSection>
                     </div>

                     <div
                        className="mt-5 rounded-lg p-4"
                        style={{
                           backgroundColor: "rgb(var(--neutral-light-active))",
                           border: "1px solid rgb(var(--neutral))",
                        }}
                     >
                        <p
                           className="font-semibold mb-2"
                           style={{ color: "rgb(var(--primary))", ...contentStyle }}
                        >
                           Chính sách bảo hành điển hình — Sản phẩm điện tử
                        </p>
                        <p
                           className="leading-relaxed"
                           style={{ color: "rgb(var(--primary-light))", ...contentStyle }}
                        >
                           Đa số sản phẩm có bảo hành của nhà sản xuất{" "}
                           <strong style={{ color: "rgb(var(--primary))" }}>
                              1 năm
                           </strong>
                           . Bảo hành mở rộng có sẵn cho hầu hết các sản phẩm
                           với mức phí nhỏ.
                        </p>
                     </div>
                  </Section>

                  <Divider />

                  <Section title="Điều kiện bảo hành" contentStyle={contentStyle}>
                     <p
                        className="leading-relaxed"
                        style={{ color: "rgb(var(--primary))", ...contentStyle }}
                     >
                        Chúng tôi sẽ chấp nhận đổi trả bất kỳ sản phẩm mới chưa
                        qua sử dụng của đại lý nếu sản phẩm không hoạt động do
                        lỗi vật liệu hoặc lỗi sản xuất trong thời gian{" "}
                        <strong>một năm</strong> kể từ ngày mua.
                     </p>
                  </Section>

                  <Divider />

                  <Section title="Thời gian đổi trả phổ biến" contentStyle={contentStyle}>
                     <div className="space-y-2">
                        {[
                           { range: "7 – 14 ngày", desc: "Đổi trả do không hài lòng" },
                           { range: "30 ngày", desc: "Đổi trả do lỗi sản phẩm" },
                           { range: "1 năm", desc: "Bảo hành chính hãng" },
                        ].map((item, i) => (
                           <div
                              key={i}
                              className="flex items-center gap-3 rounded-lg px-4 py-3"
                              style={{
                                 backgroundColor: "rgb(var(--neutral-light-active))",
                                 border: "1px solid rgb(var(--neutral))",
                                 ...contentStyle,
                              }}
                           >
                              <span
                                 className="font-bold px-2.5 py-1 rounded-full shrink-0"
                                 style={{
                                    backgroundColor: "rgb(var(--promotion-light))",
                                    color: "rgb(var(--promotion))",
                                    fontSize: "12px",
                                 }}
                              >
                                 {item.range}
                              </span>
                              <span style={{ color: "rgb(var(--primary))" }}>
                                 {item.desc}
                              </span>
                           </div>
                        ))}
                     </div>
                  </Section>

                  <Divider />

                  <Section title="Điều kiện đổi trả" contentStyle={contentStyle}>
                     <ul className="space-y-2">
                        {[
                           "Sản phẩm còn nguyên vẹn, chưa qua sử dụng",
                           "Có đầy đủ phụ kiện, hộp, sách hướng dẫn",
                           "Tem bảo hành còn nguyên vẹn",
                           "Có hóa đơn mua hàng",
                        ].map((item, i) => (
                           <li
                              key={i}
                              className="flex gap-2 leading-relaxed"
                              style={{ color: "rgb(var(--primary))", ...contentStyle }}
                           >
                              <span
                                 className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 font-bold"
                                 style={{
                                    backgroundColor: "rgb(var(--promotion-light))",
                                    color: "rgb(var(--promotion))",
                                    fontSize: "11px",
                                 }}
                              >
                                 ✓
                              </span>
                              {item}
                           </li>
                        ))}
                     </ul>
                  </Section>

                  <Divider />

                  <Section title="Quy trình đổi trả" contentStyle={contentStyle}>
                     <ol className="space-y-3">
                        {[
                           "Khách hàng tạo yêu cầu đổi trả",
                           "Cung cấp lý do đổi trả",
                           "Đóng gói và gửi sản phẩm",
                           "Kiểm tra sản phẩm",
                           "Xử lý đổi trả / hoàn tiền",
                        ].map((step, i) => (
                           <li
                              key={i}
                              className="flex items-center gap-3"
                              style={{ color: "rgb(var(--primary))", ...contentStyle }}
                           >
                              <span
                                 className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold"
                                 style={{
                                    backgroundColor: "rgb(var(--promotion))",
                                    color: "#fff",
                                    fontSize: "12px",
                                 }}
                              >
                                 {i + 1}
                              </span>
                              {step}
                              {i < 4 && (
                                 <span
                                    className="ml-auto text-xs"
                                    style={{ color: "rgb(var(--neutral-dark))" }}
                                 >
                                    →
                                 </span>
                              )}
                           </li>
                        ))}
                     </ol>
                  </Section>

                  <Divider />

                  <Section title="Phí đổi trả" contentStyle={contentStyle}>
                     <div className="space-y-2">
                        {[
                           { label: "Lỗi do nhà sản xuất", fee: "Miễn phí", highlight: true },
                           { label: "Khách hàng đổi ý", fee: "Khách hàng chịu phí vận chuyển", highlight: false },
                           { label: "Đổi size / mẫu", fee: "Tùy chính sách cụ thể", highlight: false },
                        ].map((row, i) => (
                           <div
                              key={i}
                              className="flex items-center justify-between rounded-lg px-4 py-3"
                              style={{
                                 backgroundColor: "rgb(var(--neutral-light-active))",
                                 border: "1px solid rgb(var(--neutral))",
                                 ...contentStyle,
                              }}
                           >
                              <span style={{ color: "rgb(var(--primary))" }}>{row.label}</span>
                              <span
                                 className="font-semibold"
                                 style={{
                                    color: row.highlight
                                       ? "rgb(var(--promotion))"
                                       : "rgb(var(--primary-light))",
                                 }}
                              >
                                 {row.fee}
                              </span>
                           </div>
                        ))}
                     </div>

                     <p
                        className="mt-4 leading-relaxed"
                        style={{ color: "rgb(var(--primary-light))", ...contentStyle }}
                     >
                        Quy trình hoàn tiền và đổi trả được thực hiện đơn giản.
                        Cho phép khách hàng yêu cầu hoàn tiền và đổi trả sản
                        phẩm trực tiếp từ trang{" "}
                        <Link
                           href="#"
                           className="font-medium"
                           style={{ color: "rgb(var(--promotion))" }}
                        >
                           Tài khoản của tôi
                        </Link>
                        .
                     </p>
                  </Section>
               </main>
            </div>
         </div>
      </div>
   );
}

/* ── Reusable sub-components ── */

function Section({
   title,
   children,
   contentStyle,
}: {
   title: string;
   children: React.ReactNode;
   contentStyle?: React.CSSProperties;
}) {
   return (
      <section className="mb-6">
         <h2
            className="font-bold mb-3"
            style={{ color: "rgb(var(--primary))", fontSize: "15px" }}
         >
            {title}
         </h2>
         {children}
      </section>
   );
}

function SubSection({
   title,
   children,
   contentStyle,
}: {
   title: string;
   children: React.ReactNode;
   contentStyle?: React.CSSProperties;
}) {
   return (
      <div
         className="pl-4"
         style={{ borderLeft: "3px solid rgb(var(--promotion))" }}
      >
         <p
            className="font-semibold mb-1"
            style={{ color: "rgb(var(--primary))", ...contentStyle }}
         >
            {title}
         </p>
         {children}
      </div>
   );
}

function Divider() {
   return (
      <hr className="my-6" style={{ borderColor: "rgb(var(--neutral))" }} />
   );
}