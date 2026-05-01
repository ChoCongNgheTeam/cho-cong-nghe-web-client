import StoreLocatorSection from "@/(client)/stores/page";
import Image from "next/image";

export default function About() {
   return (
      <div className="text-primary leading-relaxed mb-10 w-full">
         <div className="mb-8 text-center">
            <p className="text-[12px] uppercase tracking-[0.3em] text-accent mb-2">
               ChoCongNghe
            </p>
            <h1 className="text-[24px] font-bold text-primary mb-3">
               Giới thiệu về ChoCongNghe Shop
            </h1>
            <p className="text-primary max-w-2xl mx-auto">
               ChoCongNghe là nền tảng thương mại điện tử chuyên biệt về thiết kế
               và phân phối các sản phẩm công nghệ thông minh, tối ưu cho trải
               nghiệm mua sắm trực tuyến trong kỷ nguyên số.
            </p>
         </div>

         <section className="mb-8">
            <h2 className="font-bold text-primary mb-4 text-center">
               Nhận diện thương hiệu
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
               <div className="rounded-lg border border-neutral-light bg-neutral-light p-4 flex items-center justify-center">
                  <Image
                     src="/logo.png"
                     alt="Logo ChoCongNghe"
                     width={140}
                     height={140}
                     className="h-auto w-28 sm:w-32"
                     priority
                  />
               </div>
               <div className="rounded-lg border border-neutral-light bg-neutral-light p-4">
                  <Image
                     src="/welcome.png"
                     alt="Hình ảnh mẫu 1"
                     width={360}
                     height={240}
                     className="h-auto w-full rounded-md"
                  />
               </div>
               <div className="rounded-lg border border-neutral-light bg-neutral-light p-4">
                  <Image
                     src="/images/avatar.png"
                     alt="Hình ảnh mẫu 2"
                     width={360}
                     height={240}
                     className="h-auto w-full rounded-md"
                  />
               </div>
            </div>
         </section>

         <section className="mb-8">
            <h2 className="font-bold text-primary mb-2">1. Tổng quan</h2>
            <p className="mb-3 text-primary">
               Với mục tiêu xây dựng một hệ sinh thái mua sắm hiện đại, tiện lợi
               và đáng tin cậy, ChoCongNghe mang đến cho khách hàng cơ hội tiếp
               cận những thiết kế công nghệ tiên tiến nhất thông qua giao diện
               trực quan và quy trình thanh toán tối giản.
            </p>
            <p className="text-primary">
               Dự án được phát triển theo định hướng lấy người dùng làm trung
               tâm, đồng thời đảm bảo khả năng mở rộng linh hoạt để đáp ứng nhu
               cầu tăng trưởng dài hạn.
            </p>
         </section>

         <section className="mb-8">
            <h2 className="font-bold text-primary mb-4">2. Điểm nổi bật</h2>
            <div className="grid gap-4 md:grid-cols-2">
               {
                  [
                     {
                        title: "Danh mục thông minh",
                        desc: "Hệ thống quản lý danh mục sản phẩm linh hoạt, giúp phân loại và hiển thị chính xác theo nhu cầu.",
                     },
                     {
                        title: "Tìm kiếm tối ưu",
                        desc: "Bộ lọc nhanh và chính xác giúp người dùng tìm được thiết bị phù hợp chỉ trong vài thao tác.",
                     },
                     {
                        title: "Thanh toán đa phương thức",
                        desc: "Tích hợp nhiều lựa chọn thanh toán an toàn, tối giản hóa quy trình mua sắm.",
                     },
                     {
                        title: "Theo dõi đơn hàng thời gian thực",
                        desc: "Cập nhật trạng thái đơn hàng minh bạch, giúp khách hàng chủ động trong mọi bước.",
                     },
                  ].map((item) => (
                     <div
                        key={item.title}
                        className="rounded-lg border border-neutral-light bg-neutral-light/20 p-4"
                     >
                        <p className="font-semibold text-primary mb-1">{item.title}</p>
                        <p className="text-primary">{item.desc}</p>
                     </div>
                  ))
               }
            </div>
         </section>

         <section className="mb-8">
            <h2 className="font-bold text-primary mb-4">
               3. Dành cho khách hàng & quản trị viên
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
               <div className="rounded-lg border border-neutral-light bg-neutral-light p-4">
                  <p className="font-semibold text-primary mb-2">Khách hàng</p>
                  <ul className="space-y-2">
                     {
                        [
                           "Khám phá nhanh các thiết bị công nghệ thông minh.",
                           "So sánh lựa chọn rõ ràng với thông tin minh bạch.",
                           "Trải nghiệm thanh toán gọn gàng và bảo mật.",
                        ].map((item) => (
                           <li key={item} className="flex gap-2">
                              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                              <p className="text-primary">{item}</p>
                           </li>
                        ))
                     }
                  </ul>
               </div>
               <div className="rounded-lg border border-neutral-light bg-neutral-light p-4">
                  <p className="font-semibold text-primary mb-2">Quản trị viên</p>
                  <ul className="space-y-2">
                     {
                        [
                           "Quản lý kho hàng và danh mục hiệu quả.",
                           "Theo dõi doanh thu và dữ liệu khách hàng khoa học.",
                           "Vận hành linh hoạt với hệ thống báo cáo rõ ràng.",
                        ].map((item) => (
                           <li key={item} className="flex gap-2">
                              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                              <p className="text-primary">{item}</p>
                           </li>
                        ))
                     }
                  </ul>
               </div>
            </div>
         </section>

         <section className="mb-8">
            <h2 className="font-bold text-primary mb-3">4. Cam kết vận hành</h2>
            <ul className="space-y-3">
               {
                  [
                     {
                        title: "Bảo mật",
                        desc: "Ưu tiên an toàn dữ liệu khách hàng và tuân thủ các tiêu chuẩn bảo mật.",
                     },
                     {
                        title: "Hiệu năng",
                        desc: "Tối ưu tốc độ tải trang, bảo đảm trải nghiệm mượt mà khi truy cập.",
                     },
                     {
                        title: "Mở rộng",
                        desc: "Kiến trúc linh hoạt giúp nền tảng sẵn sàng phục vụ lượng truy cập lớn.",
                     },
                     {
                        title: "Chuẩn SEO",
                        desc: "Cấu trúc thân thiện tìm kiếm giúp nội dung dễ tiếp cận và phát triển bền vững.",
                     },
                  ].map((item) => (
                     <li key={item.title} className="flex gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                        <p className="text-primary">
                           <span className="font-semibold text-primary">
                              {item.title}:
                           </span>{" "}
                           {item.desc}
                        </p>
                     </li>
                  ))
               }
            </ul>
         </section>

         <section>
            <h2 className="font-bold text-primary mb-2">5. Sứ mệnh</h2>
            <p className="text-primary">
               ChoCongNghe hướng tới việc trở thành nền tảng mua sắm thông minh,
               nơi kết nối giữa giá trị sản phẩm và nhu cầu thực tế của người
               tiêu dùng, đồng thời thúc đẩy sự phát triển của thương mại điện
               tử trong ngành công nghệ.
            </p>
         </section>

         <StoreLocatorSection
            className="mt-10"
            title="6. Showroom & liên hệ"
            description="Khách hàng có thể ghé showroom để trải nghiệm dịch vụ, nhận hỗ trợ trực tiếp và tìm đường nhanh qua Google Maps."
         />
      </div>
   );
}
