import Link from "next/link";

// TODO: Import SidebarMenu component here when ready
// import SidebarMenu from "@/components/SidebarMenu";

export default function ChinhSachBaoMatPage() {
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
                     Chính sách bảo mật
                  </span>
               </nav>
            </div>
         </div>

         {/* Main Content */}
         <div className="container py-5">
            <div className="flex gap-5">
               {/* Sidebar Slot — gắn <SidebarMenu /> vào đây khi có */}
               <aside className="hidden md:block w-[260px] shrink-0">
                  {/* <SidebarMenu activeItem="Chính sách bảo mật" /> */}
               </aside>

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
                        className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
                        style={{
                           backgroundColor: "rgb(var(--primary))",
                           color: "rgb(var(--neutral-light))",
                           fontSize: "13px",
                        }}
                     >
                        Cỡ chữ nhỏ
                     </button>
                     <button
                        className="px-4 py-1.5 rounded-full text-sm transition-colors"
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
                     Chính sách bảo mật
                  </h1>

                  {/* Intro */}
                  <p
                     className="text-sm leading-relaxed mb-6"
                     style={{ color: "rgb(var(--primary))" }}
                  >
                     Shop cam kết sẽ bảo mật những thông tin mang tính riêng tư
                     của bạn. Bạn vui lòng đọc bản "Chính sách bảo mật" dưới
                     đây để hiểu hơn những cam kết mà chúng tôi thực hiện, nhằm
                     tôn trọng và bảo vệ quyền lợi của người truy cập.
                  </p>

                  {/* Section 1 */}
                  <Section title="1. Mục đích và phạm vi thu thập">
                     <p
                        className="text-sm leading-relaxed mb-3"
                        style={{ color: "rgb(var(--primary))" }}
                     >
                        Để truy cập và sử dụng một số dịch vụ tại, bạn có thể
                        sẽ được yêu cầu đăng ký với chúng tôi thông tin cá nhân
                        (Email, Họ tên, Số ĐT liên lạc…). Mọi thông tin khai
                        báo phải đảm bảo tính chính xác và hợp pháp. Không chịu
                        mọi trách nhiệm liên quan đến pháp luật của thông tin
                        khai báo.
                     </p>
                     <p
                        className="text-sm leading-relaxed mb-3"
                        style={{ color: "rgb(var(--primary))" }}
                     >
                        Chúng tôi cũng có thể thu thập thông tin về số lần viếng
                        thăm, bao gồm số trang bạn xem, số links (liên kết) bạn
                        click và những thông tin khác liên quan đến việc kết nối
                        đến site.
                     </p>
                     <p
                        className="text-sm leading-relaxed"
                        style={{ color: "rgb(var(--primary))" }}
                     >
                        Chúng tôi cũng thu thập các thông tin mà trình duyệt Web
                        (Browser) bạn sử dụng mỗi khi truy cập vào, bao gồm:
                        địa chỉ IP, loại Browser, ngôn ngữ sử dụng, thời gian
                        và những địa chỉ mà Browser truy xuất đến.
                     </p>
                  </Section>

                  <Divider />

                  {/* Section 2 */}
                  <Section title="2. Phạm vi sử dụng thông tin">
                     <p
                        className="text-sm leading-relaxed"
                        style={{ color: "rgb(var(--primary))" }}
                     >
                        Thu thập và sử dụng thông tin cá nhân bạn với mục đích
                        phù hợp và hoàn toàn tuân thủ nội dung của "Chính sách
                        bảo mật" này. Khi cần thiết, chúng tôi có thể sử dụng
                        những thông tin này để liên hệ trực tiếp với bạn dưới
                        các hình thức như: gởi thư ngỏ, đơn đặt hàng, thư cảm
                        ơn, sms, thông tin về kỹ thuật và bảo mật…
                     </p>
                  </Section>

                  <Divider />

                  {/* Section 3 */}
                  <Section title="3. Thời gian lưu trữ thông tin">
                     <p
                        className="text-sm leading-relaxed"
                        style={{ color: "rgb(var(--primary))" }}
                     >
                        Dữ liệu cá nhân của Thành viên sẽ được lưu trữ cho đến
                        khi có yêu cầu hủy bỏ hoặc tự thành viên đăng nhập và
                        thực hiện hủy bỏ. Còn lại trong mọi trường hợp thông
                        tin cá nhân thành viên sẽ được bảo mật.
                     </p>
                  </Section>

                  <Divider />

                  {/* Section 4 */}
                  <Section title="4. Quy định bảo mật">
                     <p
                        className="text-sm leading-relaxed mb-4"
                        style={{ color: "rgb(var(--primary))" }}
                     >
                        Chính sách giao dịch thanh toán bằng thẻ quốc tế và thẻ
                        nội địa (internet banking) đảm bảo tuân thủ các tiêu
                        chuẩn bảo mật của các Đối Tác Cổng Thanh Toán:
                     </p>

                     <ul className="mb-5 space-y-2">
                        {[
                           "Thông tin tài chính của Khách hàng sẽ được bảo vệ trong suốt quá trình giao dịch bằng giao thức SSL 256-bit (Secure Sockets Layer).",
                           "Mật khẩu sử dụng một lần (OTP) được gửi qua SMS để đảm bảo việc truy cập tài khoản được xác thực.",
                           "Các nguyên tắc và quy định bảo mật thông tin trong ngành tài chính ngân hàng theo quy định của Ngân hàng nhà nước Việt Nam.",
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

                     {/* Highlight box */}
                     <div
                        className="rounded-lg p-4 mb-4"
                        style={{
                           backgroundColor: "rgb(var(--neutral-light-active))",
                           border: "1px solid rgb(var(--neutral))",
                        }}
                     >
                        <p
                           className="text-sm font-semibold mb-2"
                           style={{ color: "rgb(var(--primary))" }}
                        >
                           Chính sách bảo mật giao dịch thanh toán áp dụng với
                           Khách hàng:
                        </p>
                        <ul className="space-y-2">
                           {[
                              "Thông tin thẻ thanh toán của Khách hàng mà có khả năng sử dụng để xác lập giao dịch KHÔNG được lưu trên hệ thống của Shop. Đối Tác Cổng Thanh Toán sẽ lưu giữ và bảo mật theo tiêu chuẩn quốc tế PCI DSS.",
                              "Đối với thẻ nội địa (internet banking), Shop chỉ lưu trữ mã đơn hàng, mã giao dịch và tên ngân hàng.",
                              "Shop cam kết đảm bảo thực hiện nghiêm túc các biện pháp bảo mật cần thiết cho mọi hoạt động thanh toán thực hiện trên trang.",
                           ].map((item, i) => (
                              <li
                                 key={i}
                                 className="flex gap-2 text-sm leading-relaxed"
                                 style={{ color: "rgb(var(--primary-light))" }}
                              >
                                 <span className="mt-1 shrink-0">•</span>
                                 <span>{item}</span>
                              </li>
                           ))}
                        </ul>
                     </div>
                  </Section>

                  <Divider />

                  {/* Section 5 */}
                  <Section title="5. Làm cách nào để yêu cầu xóa dữ liệu?">
                     <p
                        className="text-sm leading-relaxed mb-3"
                        style={{ color: "rgb(var(--primary))" }}
                     >
                        Bạn có thể gửi yêu cầu xóa dữ liệu qua email Trung tâm
                        hỗ trợ của chúng tôi. Vui lòng cung cấp càng nhiều
                        thông tin càng tốt về dữ liệu nào bạn muốn xóa.
                     </p>
                     <p
                        className="text-sm leading-relaxed"
                        style={{ color: "rgb(var(--primary))" }}
                     >
                        Yêu cầu sẽ được chuyển đến nhóm thích hợp để đánh giá
                        và xử lý. Chúng tôi sẽ liên hệ từng bước để cập nhật
                        cho bạn về tiến trình xóa.
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