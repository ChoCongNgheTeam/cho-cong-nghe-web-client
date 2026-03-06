export default function About() {
   return (
      <div className="text-primary leading-relaxed mb-10 w-full">
         <h1 className="text-[24px] font-bold text-primary text-center mb-7">
            Giới thiệu về ChoCongNghe Shop
         </h1>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">1. Về chúng tôi</h2>
            <p className="mb-2 text-primary">
               ChoCongNghe Shop là chuỗi chuyên bán lẻ các sản phẩm kỹ thuật số
               di động...
            </p>
            <p className="text-primary">
               ChoCongNghe Shop là hệ thống bán lẻ đầu tiên ở Việt Nam được cấp
               chứng chỉ ISO 9001:2000...
            </p>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">2. Sứ mệnh</h2>
            <p className="text-primary">
               Hệ thống ChoCongNghe Shop kỳ vọng mang đến cho khách hàng những
               trải nghiệm mua sắm tốt nhất...
            </p>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-3">3. Giá trị cốt lõi</h2>
            <ul className="space-y-3">
               {[
                  {
                     title: "Chất lượng và Uy tín",
                     desc: "ChoCongNghe Shop cam kết cung cấp các sản phẩm chính hãng, chất lượng cao...",
                  },
                  {
                     title: "Khách hàng là trọng tâm",
                     desc: "Phục vụ khách hàng luôn là ưu tiên số 1...",
                  },
                  {
                     title: "Đổi mới và phát triển",
                     desc: "ChoCongNghe Shop luôn cập nhật và đổi mới sản phẩm...",
                  },
                  {
                     title: "Đồng hành cùng cộng đồng",
                     desc: "ChoCongNghe Shop không chỉ tập trung vào phát triển kinh doanh...",
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
               ))}
            </ul>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">
               4. Định hướng phát triển
            </h2>
            <p className="text-primary">
               Với mục tiêu{" "}
               <span className="font-semibold text-primary">
                  "Tạo trải nghiệm xuất sắc cho khách hàng"
               </span>
               , ChoCongNghe Shop tiếp tục đẩy mạnh chuyển đổi số...
            </p>
         </section>

         <section>
            <h2 className="font-bold text-primary mb-4">
               5. Cột mốc phát triển
            </h2>
            <div className="relative border-l-2 border-accent-light-active ml-3">
               {[
                  {
                     year: "2013",
                     desc: "ChoCongNghe Shop chính thức đạt mốc 100 cửa hàng.",
                  },
                  {
                     year: "2014",
                     desc: "Trở thành nhà nhập khẩu trực tiếp của iPhone chính hãng.",
                  },
                  {
                     year: "2015",
                     desc: "Đạt mức tăng trưởng nhanh nhất so với các công ty trực thuộc.",
                  },
                  {
                     year: "2016",
                     desc: "Doanh thu online tăng gấp đôi. Khai trương 80 khu trải nghiệm Apple Corner.",
                  },
                  {
                     year: "08/2024",
                     desc: "Đồng loạt khai trương 10 cửa hàng điện máy trên toàn quốc.",
                  },
               ].map((item, i, arr) => (
                  <div
                     key={i}
                     className={`relative pl-6 ${i < arr.length - 1 ? "pb-5" : ""}`}
                  >
                     <span className="absolute -left-2.5 top-1 w-4 h-4 rounded-full bg-neutral-light border-2 border-accent ring-2 ring-accent-light" />
                     <p className="font-bold text-accent mb-0.5">{item.year}</p>
                     <p className="text-primary">{item.desc}</p>
                  </div>
               ))}
            </div>
         </section>
      </div>
   );
}
