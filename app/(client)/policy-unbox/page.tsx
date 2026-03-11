import Link from "next/link";

export default function ChinhSachKhuiHopPage() {
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
                  <span style={{ color: "rgb(var(--primary-light))" }}>
                     Chính sách khui hộp sản phẩm
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
                  {/* Font toggle */}
                  <div className="flex items-center gap-2 mb-5">
                     <button
                        className="px-4 py-1.5 rounded-full text-sm font-semibold"
                        style={{
                           backgroundColor: "rgb(var(--primary))",
                           color: "rgb(var(--neutral-light))",
                           fontSize: "13px",
                        }}
                     >
                        Cỡ chữ nhỏ
                     </button>

                     <button
                        className="px-4 py-1.5 rounded-full text-sm"
                        style={{
                           border: "1px solid rgb(var(--neutral))",
                           color: "rgb(var(--primary-light))",
                           fontSize: "13px",
                        }}
                     >
                        Cỡ chữ lớn
                     </button>
                  </div>

                  {/* Heading */}
                  <h1
                     className="text-2xl md:text-3xl font-bold mb-5"
                     style={{ color: "rgb(var(--primary))" }}
                  >
                     Chính sách khui hộp sản phẩm
                  </h1>

                  {/* Intro */}
                  <p
                     className="text-sm leading-relaxed mb-6"
                     style={{ color: "rgb(var(--primary))" }}
                  >
                     Áp dụng cho các sản phẩm bán ra tại Shop bao gồm:
                     Điện thoại, Máy tính bảng, Laptop và Đồng hồ thông minh.
                  </p>

                  {/* Section 1 */}
                  <Section title="1. Quy định khui hộp sản phẩm">
                     <ul className="space-y-2">
                        {[
                           "Sản phẩm bắt buộc phải khui seal / mở hộp để kiểm tra trước khi kích hoạt bảo hành điện tử.",
                           "Việc khui hộp có thể thực hiện trực tiếp tại cửa hàng hoặc khi nhân viên giao hàng bàn giao sản phẩm.",
                           "Khách hàng cần kiểm tra đầy đủ phụ kiện, ngoại quan và tình trạng sản phẩm ngay khi mở hộp.",
                        ].map((item, i) => (
                           <li
                              key={i}
                              className="flex gap-2 text-sm leading-relaxed"
                              style={{ color: "rgb(var(--primary))" }}
                           >
                              <span className="mt-1 shrink-0">•</span>
                              <span>{item}</span>
                           </li>
                        ))}
                     </ul>
                  </Section>

                  <Divider />

                  {/* Section 2 */}
                  <Section title="2. Điều kiện đối với sản phẩm nguyên seal">
                     <p
                        className="text-sm leading-relaxed mb-3"
                        style={{ color: "rgb(var(--primary))" }}
                     >
                        Đối với các sản phẩm bán nguyên seal, khách hàng cần
                        thanh toán trước 100% giá trị đơn hàng trước khi tiến
                        hành khui hộp sản phẩm.
                     </p>

                     <p
                        className="text-sm leading-relaxed"
                        style={{ color: "rgb(var(--primary))" }}
                     >
                        Sau khi thanh toán và khui seal, sản phẩm sẽ được kiểm
                        tra và kích hoạt bảo hành theo quy định của hãng.
                     </p>
                  </Section>

                  <Divider />

                  {/* Section 3 */}
                  <Section title="3. Kiểm tra sản phẩm trước khi kích hoạt bảo hành">
                     <ul className="space-y-2">
                        {[
                           "Khách hàng cần kiểm tra các lỗi ngoại quan như thân máy, màn hình, camera, viền máy.",
                           "Kiểm tra các phụ kiện đi kèm trong hộp sản phẩm.",
                           "Kiểm tra khả năng khởi động và các chức năng cơ bản của thiết bị.",
                        ].map((item, i) => (
                           <li
                              key={i}
                              className="flex gap-2 text-sm leading-relaxed"
                              style={{ color: "rgb(var(--primary))" }}
                           >
                              <span className="mt-1 shrink-0">•</span>
                              <span>{item}</span>
                           </li>
                        ))}
                     </ul>
                  </Section>

                  <Divider />

                  {/* Section 4 */}
                  <Section title="4. Xử lý khi phát hiện lỗi">
                     <p
                        className="text-sm leading-relaxed mb-3"
                        style={{ color: "rgb(var(--primary))" }}
                     >
                        Nếu phát hiện lỗi ngoại quan hoặc lỗi kỹ thuật từ nhà
                        sản xuất trước khi kích hoạt bảo hành điện tử, khách
                        hàng sẽ được hỗ trợ đổi sản phẩm khác tương đương hoặc
                        hoàn tiền theo chính sách của Shop.
                     </p>

                     <p
                        className="text-sm leading-relaxed"
                        style={{ color: "rgb(var(--primary))" }}
                     >
                        Sau khi đã kích hoạt bảo hành điện tử (Active), các lỗi
                        phát sinh sẽ được xử lý theo chính sách bảo hành của
                        hãng sản xuất.
                     </p>
                  </Section>

                  <Divider />

                  {/* Section 5 */}
                  <Section title="5. Lưu ý quan trọng">
                     <p
                        className="text-sm leading-relaxed"
                        style={{ color: "rgb(var(--primary))" }}
                     >
                        Nếu khách hàng báo lỗi ngoại quan sau khi đã kích hoạt
                        bảo hành điện tử hoặc sau khi nhân viên giao hàng đã
                        rời đi, Shop sẽ hỗ trợ chuyển sản phẩm đến trung tâm
                        bảo hành chính hãng để kiểm tra và xử lý.
                     </p>
                  </Section>
               </main>
            </div>
         </div>
      </div>
   );
}

/* COMPONENTS */

function Section({
   title,
   children,
}: {
   title: string;
   children: React.ReactNode;
}) {
   return (
      <section className="mb-6">
         <h2
            className="text-base font-bold mb-3"
            style={{ color: "rgb(var(--primary))" }}
         >
            {title}
         </h2>
         {children}
      </section>
   );
}

function Divider() {
   return (
      <hr className="my-6" style={{ borderColor: "rgb(var(--neutral))" }} />
   );
}