import Link from "next/link";

export default function ChinhSachGiaoHangLapDatPage() {
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
                     Chính sách giao hàng & lắp đặt Điện máy, Gia dụng
                  </span>
               </nav>
            </div>
         </div>

         {/* Content */}
         <div className="container py-5">
            <div className="flex gap-5">

               {/* Sidebar */}
               <aside className="hidden md:block w-65 shrink-0">
                  {/* <SidebarMenu activeItem="Chính sách giao hàng & lắp đặt Điện máy, Gia dụng" /> */}
               </aside>

               {/* Article */}
               <main
                  className="flex-1 rounded-lg p-6 md:p-8"
                  style={{
                     backgroundColor: "rgb(var(--neutral-light))",
                     border: "1px solid rgb(var(--neutral))",
                  }}
               >

                  {/* Font size */}
                  <div className="flex gap-2 mb-5">
                     <button
                        className="px-4 py-1.5 rounded-full text-sm font-semibold"
                        style={{
                           backgroundColor: "rgb(var(--primary))",
                           color: "rgb(var(--neutral-light))",
                        }}
                     >
                        Cỡ chữ nhỏ
                     </button>

                     <button
                        className="px-4 py-1.5 rounded-full text-sm"
                        style={{
                           border: "1px solid rgb(var(--neutral))",
                           color: "rgb(var(--primary-light))",
                        }}
                     >
                        Cỡ chữ lớn
                     </button>
                  </div>

                  <h1
                     className="text-2xl md:text-3xl font-bold mb-6"
                     style={{ color: "rgb(var(--primary))" }}
                  >
                     Chính sách giao hàng & lắp đặt Điện máy, Gia dụng
                  </h1>

                  {/* Section 1 */}
                  <Section title="1. Một số định nghĩa">
                     <p className="text-sm mb-3" style={{ color: "rgb(var(--primary))" }}>
                        Khoảng cách giao hàng: Là khoảng cách tính từ nơi mua hàng
                        (cửa hàng) đến địa chỉ nhận hàng của khách hàng.
                     </p>

                     <p className="text-sm" style={{ color: "rgb(var(--primary))" }}>
                        Khoảng cách lắp đặt: Là khoảng cách từ vị trí đặt thiết bị
                        so với các nguồn cấp điện, cấp nước, đường thoát nước,
                        vị trí treo/khoan bắt vít (đối với thiết bị cần lắp đặt
                        cố định như máy lạnh, máy nước nóng, máy giặt...).
                     </p>
                  </Section>

                  <Divider />

                  {/* Section 2 */}
                  <Section title="2. Chính sách giao hàng">
                     <ul className="space-y-2">
                        {[
                           "Shop hỗ trợ giao hàng tận nơi trên toàn quốc đối với các sản phẩm điện máy và gia dụng.",
                           "Thời gian giao hàng từ 1 – 3 ngày làm việc tùy khu vực và tình trạng hàng trong kho.",
                           "Miễn phí giao hàng trong phạm vi bán kính 10km đối với các đơn hàng có giá trị theo quy định của Shop.",
                           "Đối với khu vực ngoài phạm vi miễn phí, phí vận chuyển sẽ được thông báo cụ thể trước khi xác nhận đơn hàng.",
                        ].map((item, i) => (
                           <li
                              key={i}
                              className="flex gap-2 text-sm"
                              style={{ color: "rgb(var(--primary))" }}
                           >
                              <span>•</span>
                              <span>{item}</span>
                           </li>
                        ))}
                     </ul>
                  </Section>

                  <Divider />

                  {/* Section 3 */}
                  <Section title="3. Chính sách lắp đặt">
                     <p className="text-sm mb-3" style={{ color: "rgb(var(--primary))" }}>
                        Thời gian lắp đặt: 24 – 48 tiếng tính từ lúc khách nhận
                        hàng (hoặc theo thời gian thỏa thuận với khách hàng).
                     </p>

                     <p className="text-sm mb-4" style={{ color: "rgb(var(--primary))" }}>
                        Thời gian hoàn tất trang sau lắp đặt: trong vòng 48 tiếng
                        sau khi hoàn tất lắp đặt (chi phí phát sinh sau thời
                        gian này sẽ do hai bên thỏa thuận).
                     </p>

                     <h3
                        className="text-sm font-semibold mb-2"
                        style={{ color: "rgb(var(--primary))" }}
                     >
                        3.1 Chính sách lắp đặt sản phẩm điện máy
                     </h3>

                     <ul className="space-y-2 mb-4">
                        {[
                           "Đội ngũ kỹ thuật viên sẽ liên hệ khách hàng để hẹn lịch lắp đặt.",
                           "Thiết bị sẽ được kiểm tra kỹ trước khi tiến hành lắp đặt.",
                           "Kỹ thuật viên hướng dẫn khách hàng sử dụng và bảo quản sản phẩm sau khi lắp đặt.",
                        ].map((item, i) => (
                           <li
                              key={i}
                              className="flex gap-2 text-sm"
                              style={{ color: "rgb(var(--primary))" }}
                           >
                              <span>•</span>
                              <span>{item}</span>
                           </li>
                        ))}
                     </ul>

                     <h3
                        className="text-sm font-semibold mb-2"
                        style={{ color: "rgb(var(--primary))" }}
                     >
                        3.2 Chính sách lắp đặt sản phẩm gia dụng
                     </h3>

                     <ul className="space-y-2">
                        {[
                           "Các sản phẩm gia dụng nhỏ sẽ được giao nguyên kiện đến khách hàng.",
                           "Nhân viên giao hàng hỗ trợ kiểm tra sản phẩm trước khi bàn giao.",
                           "Khách hàng được hướng dẫn sử dụng cơ bản khi nhận sản phẩm.",
                        ].map((item, i) => (
                           <li
                              key={i}
                              className="flex gap-2 text-sm"
                              style={{ color: "rgb(var(--primary))" }}
                           >
                              <span>•</span>
                              <span>{item}</span>
                           </li>
                        ))}
                     </ul>
                  </Section>

               </main>
            </div>
         </div>
      </div>
   );
}

/* Components */

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