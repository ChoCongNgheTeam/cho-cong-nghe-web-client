export default function ExchangeIntro() {
   const steps = [
      {
         step: "01",
         title: "Mang máy đến cửa hàng",
         desc: "Khách hàng mang thiết bị cũ đến bất kỳ cửa hàng ChoCongNghe Shop nào trên toàn quốc.",
      },
      {
         step: "02",
         title: "Kiểm tra & định giá",
         desc: "Nhân viên kiểm tra tình trạng máy và đưa ra mức giá thu mua tốt nhất theo bảng giá hiện hành.",
      },
      {
         step: "03",
         title: "Chọn máy mới",
         desc: "Khách hàng chọn sản phẩm mới muốn đổi và được trừ thẳng giá trị máy cũ vào hóa đơn.",
      },
      {
         step: "04",
         title: "Thanh toán & nhận máy",
         desc: "Thanh toán phần chênh lệch và nhận máy mới ngay tại cửa hàng, kèm hóa đơn và bảo hành đầy đủ.",
      },
   ];

   const conditions = [
      "Máy còn hoạt động, màn hình không vỡ, không bể nát.",
      "Không dính nước nặng, không bị bẻ cong biến dạng.",
      "Còn đầy đủ thông tin IMEI, không bị khóa tài khoản iCloud / Google.",
      "Máy không phải hàng nhái, hàng giả, hàng không rõ nguồn gốc.",
      "Khách hàng phải là chủ sở hữu hợp pháp của thiết bị.",
   ];

   const devices = [
      { icon: "📱", label: "Điện thoại" },
      { icon: "💻", label: "Laptop" },
      { icon: "📱", label: "Máy tính bảng" },
      { icon: "⌚", label: "Đồng hồ thông minh" },
      { icon: "🎧", label: "Tai nghe" },
      { icon: "📷", label: "Máy ảnh" },
   ];

   const faqs = [
      {
         q: "Tôi có thể đổi máy online không?",
         a: "Hiện tại chương trình đổi máy chỉ áp dụng trực tiếp tại cửa hàng để nhân viên kiểm tra thiết bị và định giá chính xác.",
      },
      {
         q: "Máy bị trầy xước nhẹ có được đổi không?",
         a: "Có. Trầy xước nhẹ vẫn được chấp nhận nhưng sẽ ảnh hưởng đến mức giá định giá. Nhân viên sẽ tư vấn cụ thể sau khi kiểm tra.",
      },
      {
         q: "Giá trị máy cũ được trừ vào hóa đơn như thế nào?",
         a: "Giá trị máy cũ sẽ được khấu trừ trực tiếp vào giá bán của sản phẩm mới. Khách hàng chỉ cần thanh toán phần chênh lệch còn lại.",
      },
      {
         q: "Có thể đổi máy cũ lấy tiền mặt không?",
         a: "ChoCongNghe Shop chỉ áp dụng hình thức đổi máy cũ lấy máy mới, không thu mua thiết bị để trả tiền mặt trực tiếp.",
      },
   ];

   const qualityChecks = [
      "Kiểm tra chức năng đầy đủ",
      "Đánh giá ngoại hình minh bạch",
      "Vệ sinh và tối ưu lại thiết bị",
      "Cập nhật phần mềm (nếu cần)",
      "Niêm phong và dán tem bảo hành",
   ];

   return (
      <div className="text-primary leading-relaxed mb-10 w-full">
         <h1 className="font-bold text-primary text-center mb-2">
            Giới thiệu máy đổi trả
         </h1>
         <p className="text-center text-primary mb-10">
            Đổi máy cũ – Lên đời máy mới dễ dàng tại ChoCongNghe Shop
         </p>

         {/* Banner intro */}
         <div className="rounded-xl bg-accent-light border border-accent-light-active px-6 py-5 mb-10 flex gap-4 items-start">
            <div className="shrink-0">🔄</div>
            <div>
               <p className="font-bold text-primary mb-1">
                  Chương trình thu cũ đổi mới
               </p>
               <p>
                  ChoCongNghe Shop triển khai chương trình{" "}
                  <span className="font-semibold text-accent">
                     Thu cũ – Đổi mới
                  </span>{" "}
                  giúp khách hàng dễ dàng nâng cấp thiết bị công nghệ với chi
                  phí tối ưu. Giá trị máy cũ được định giá minh bạch, khấu trừ
                  trực tiếp vào hóa đơn sản phẩm mới.
               </p>
            </div>
         </div>

         {/* Máy cũ kinh doanh */}
         <section className="mb-10">
            <h2 className="font-bold text-primary mb-4">
               1. Máy cũ kinh doanh tại Shop
            </h2>
            <p className="mb-4">
               Máy cũ kinh doanh tại Shop là các sản phẩm có nguồn gốc tin cậy,
               còn đủ điều kiện bảo hành và đã được Shop kiểm tra kỹ lưỡng trước
               khi đưa ra thị trường, bao gồm:
            </p>
            <div className="grid grid-cols-2 gap-4">
               <div className="rounded-xl border border-neutral p-5">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-xl">🖥️</span>
                     <p className="font-bold text-primary">
                        Máy trưng bày (Demo)
                     </p>
                  </div>
                  <p className="">
                     Là các sản phẩm được sử dụng để trưng bày tại cửa hàng nhằm
                     phục vụ nhu cầu trải nghiệm của khách hàng. Sau khi kết
                     thúc thời gian trưng bày, máy được kiểm định lại toàn diện
                     và điều chuyển sang kinh doanh.
                  </p>
               </div>
               <div className="rounded-xl border border-neutral p-5">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-xl">📦</span>
                     <p className="font-bold text-primary">
                        Máy đã qua sử dụng
                     </p>
                  </div>
                  <p className="">
                     Là các sản phẩm được thu lại từ khách hàng theo chính sách
                     thu cũ đổi mới hoặc đổi trả/bảo hành. Các máy này đã được
                     bảo hành chính hãng (nếu có) và được Shop kiểm tra chất
                     lượng nghiêm ngặt trước khi bán ra.
                  </p>
               </div>
            </div>
         </section>

         {/* Quy trình */}
         <section className="mb-10">
            <h2 className="font-bold text-primary mb-6">
               2. Quy trình đổi máy
            </h2>
            <div className="grid grid-cols-2 gap-4">
               {steps.map((item) => (
                  <div
                     key={item.step}
                     className="flex gap-4 p-5 rounded-xl border border-neutral"
                  >
                     <div className="shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-neutral-light font-bold ">
                        {item.step}
                     </div>
                     <div>
                        <p className="font-bold text-primary mb-1">
                           {item.title}
                        </p>
                        <p className="">{item.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* Thiết bị được thu */}
         <section className="mb-10">
            <h2 className="font-bold text-primary mb-4">
               3. Thiết bị được thu mua
            </h2>
            <div className="grid grid-cols-3 gap-3">
               {devices.map((d) => (
                  <div
                     key={d.label}
                     className="flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral"
                  >
                     <span className="text-2xl">{d.icon}</span>
                     <span className="font-medium text-primary">{d.label}</span>
                  </div>
               ))}
            </div>
            <p className="mt-3 ">
               * Áp dụng cho các thương hiệu: Apple, Samsung, Xiaomi, OPPO,
               vivo, realme, Huawei, Dell, HP, Asus, Lenovo và nhiều thương hiệu
               khác.
            </p>
         </section>

         {/* Điều kiện */}
         <section className="mb-10">
            <h2 className="font-bold text-primary mb-4">
               4. Điều kiện máy được thu
            </h2>
            <ul className="space-y-2.5">
               {conditions.map((item, i) => (
                  <li key={i} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>{item}</p>
                  </li>
               ))}
            </ul>
         </section>

         {/* Bảo hành */}
         <section className="mb-10">
            <h2 className="font-bold text-primary mb-4">🛡️ Chế độ bảo hành</h2>
            <div className="space-y-3">
               <div className="flex gap-2.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <div>
                     <p>
                        <span className="font-semibold text-primary">
                           1 đổi 1 trong 30 ngày
                        </span>{" "}
                        nếu phát sinh lỗi do nhà sản xuất (*). Trong trường hợp
                        không còn máy tương đương, khách hàng có thể:
                     </p>
                     <ul className="mt-2 space-y-1.5 ml-4">
                        <li className="flex gap-2">
                           <span className="mt-1.5 w-1 h-1 rounded-full bg-primary-light shrink-0" />
                           <p>
                              Đổi sang sản phẩm khác có giá trị cao hơn (bù
                              chênh lệch), hoặc
                           </p>
                        </li>
                        <li className="flex gap-2">
                           <span className="mt-1.5 w-1 h-1 rounded-full bg-primary-light shrink-0" />
                           <p>
                              Shop thu hồi lại máy theo chính sách hiện hành.
                           </p>
                        </li>
                     </ul>
                  </div>
               </div>
               {[
                  "Bảo hành theo hãng nếu sản phẩm còn thời hạn bảo hành mặc định của hãng.",
                  "Bảo hành tại Shop từ 1–12 tháng đối với sản phẩm đã hết bảo hành hãng, tùy theo từng loại sản phẩm (**).",
                  "Tiếp nhận bảo hành toàn quốc tại tất cả cửa hàng của Shop.",
               ].map((item, i) => (
                  <div key={i} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>{item}</p>
                  </div>
               ))}
            </div>
         </section>

         {/* Cam kết chất lượng */}
         <section className="mb-10">
            <h2 className="font-bold text-primary mb-4">
               ✅ Cam kết chất lượng
            </h2>
            <p className="mb-4">
               Với mẫu mã đa dạng, mức giá hợp lý và quy trình kiểm định nghiêm
               ngặt, khách hàng hoàn toàn có thể yên tâm khi lựa chọn các sản
               phẩm máy cũ tại Shop. Tất cả sản phẩm trước khi bán ra đều được:
            </p>
            <div className="grid grid-cols-2 gap-3">
               {qualityChecks.map((item, i) => (
                  <div
                     key={i}
                     className="flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral bg-neutral-light-active"
                  >
                     <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <svg
                           width="10"
                           height="10"
                           viewBox="0 0 10 10"
                           fill="none"
                        >
                           <path
                              d="M2 5l2 2 4-4"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                           />
                        </svg>
                     </span>
                     <span className=" font-medium text-primary">{item}</span>
                  </div>
               ))}
            </div>
         </section>

         {/* Hướng dẫn mua hàng */}
         <section className="mb-10">
            <h2 className="font-bold text-primary mb-4">
               🛒 Hướng dẫn mua hàng
            </h2>
            <p className="mb-3">Quý khách có thể:</p>
            <div className="space-y-3">
               {[
                  {
                     icon: "🏪",
                     title: "Đến trực tiếp cửa hàng",
                     desc: "Ghé Shop để xem và mua máy, được nhân viên tư vấn tận tình.",
                  },
                  {
                     icon: "🌐",
                     title: "Tìm kiếm trên Website",
                     desc: "Duyệt danh sách sản phẩm máy cũ trực tuyến, lọc theo nhu cầu và ngân sách.",
                  },
                  {
                     icon: "⏱️",
                     title: "Đặt giữ hàng 24 giờ",
                     desc: "Khi tìm được sản phẩm ưng ý, đặt giữ hàng trong 24 giờ để đến lấy trực tiếp.",
                  },
               ].map((item) => (
                  <div
                     key={item.title}
                     className="flex gap-4 px-5 py-4 rounded-xl border border-neutral"
                  >
                     <span className="text-2xl shrink-0">{item.icon}</span>
                     <div>
                        <p className="font-bold text-primary mb-0.5">
                           {item.title}
                        </p>
                        <p className="">{item.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* Lợi ích */}
         <section className="mb-10">
            <h2 className="font-bold text-primary mb-4">5. Lợi ích nổi bật</h2>
            <div className="grid grid-cols-3 gap-4">
               {[
                  {
                     icon: "💰",
                     title: "Giá thu tốt nhất",
                     desc: "Định giá minh bạch theo thị trường, cam kết giá cao nhất khu vực.",
                  },
                  {
                     icon: "⚡",
                     title: "Xử lý nhanh chóng",
                     desc: "Kiểm tra và định giá ngay tại chỗ, không cần chờ đợi lâu.",
                  },
                  {
                     icon: "🛡️",
                     title: "An toàn dữ liệu",
                     desc: "Hỗ trợ xóa sạch dữ liệu cá nhân trước khi bàn giao máy cũ.",
                  },
               ].map((item) => (
                  <div
                     key={item.title}
                     className="p-5 rounded-xl border border-neutral text-center"
                  >
                     <div className="mb-3">{item.icon}</div>
                     <p className="font-bold text-primary mb-1.5">
                        {item.title}
                     </p>
                     <p className="">{item.desc}</p>
                  </div>
               ))}
            </div>
         </section>

         {/* FAQ */}
         <section className="mb-10">
            <h2 className="font-bold text-primary mb-4">
               6. Câu hỏi thường gặp
            </h2>
            <div className="space-y-3">
               {faqs.map((item, i) => (
                  <div
                     key={i}
                     className="rounded-lg border border-neutral overflow-hidden"
                  >
                     <div className="px-5 py-3.5 bg-neutral-light-active flex items-start gap-2">
                        <span className="text-accent font-bold shrink-0">
                           Q.
                        </span>
                        <p className="font-semibold text-primary">{item.q}</p>
                     </div>
                     <div className="px-5 py-3.5 flex items-start gap-2">
                        <span className="text-promotion font-bold shrink-0">
                           A.
                        </span>
                        <p>{item.a}</p>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* CTA */}
         <div className="rounded-xl bg-accent px-6 py-6 text-center">
            <p className="font-bold text-neutral-light text-[16px] mb-1">
               Sẵn sàng đổi máy?
            </p>
            <p className="text-accent-light mb-4 ">
               Ghé ngay cửa hàng ChoCongNghe Shop gần nhất để được tư vấn và
               định giá miễn phí.
            </p>
            <a
               href="/store-locator"
               className="inline-block bg-neutral-light text-accent font-bold px-6 py-2.5 rounded-lg hover:bg-accent-light transition-colors"
            >
               Tìm cửa hàng gần nhất
            </a>
         </div>
      </div>
   );
}
