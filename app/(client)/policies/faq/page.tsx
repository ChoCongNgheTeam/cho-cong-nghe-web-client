const faqSections = [
   {
      title: "1. Mua hàng & đặt hàng",
      items: [
         {
            q: "Làm thế nào để đặt hàng online?",
            a: "Bạn chọn sản phẩm, thêm vào giỏ hàng và tiến hành thanh toán theo hướng dẫn. Hệ thống sẽ gửi xác nhận sau khi đặt hàng thành công.",
         },
         {
            q: "Tôi có thể thay đổi đơn hàng sau khi đặt không?",
            a: "Bạn có thể liên hệ tổng đài hoặc chat với CSKH để hỗ trợ thay đổi thông tin đơn hàng trước khi đơn được giao cho đơn vị vận chuyển.",
         },
      ],
   },
   {
      title: "2. Thanh toán",
      items: [
         {
            q: "Có những phương thức thanh toán nào?",
            a: "ChoCongNghe hỗ trợ COD, chuyển khoản, thẻ ngân hàng và các cổng thanh toán trực tuyến tùy theo thời điểm.",
         },
         {
            q: "Thanh toán online có an toàn không?",
            a: "Chúng tôi áp dụng các tiêu chuẩn bảo mật thông tin và chỉ làm việc với các cổng thanh toán uy tín.",
         },
      ],
   },
   {
      title: "3. Giao hàng",
      items: [
         {
            q: "Thời gian giao hàng dự kiến là bao lâu?",
            a: "Thời gian giao hàng phụ thuộc khu vực và trạng thái kho. CSKH sẽ thông báo cụ thể khi xác nhận đơn.",
         },
         {
            q: "Tôi có thể kiểm tra hàng trước khi nhận không?",
            a: "Bạn có thể kiểm tra ngoại quan sản phẩm và phụ kiện theo chính sách hiện hành trước khi thanh toán.",
         },
      ],
   },
   {
      title: "4. Bảo hành & đổi trả",
      items: [
         {
            q: "Bảo hành bắt đầu từ khi nào?",
            a: "Thời gian bảo hành được tính từ ngày xuất hóa đơn của đơn hàng.",
         },
         {
            q: "Điều kiện đổi trả là gì?",
            a: "Sản phẩm cần còn nguyên vẹn, đầy đủ phụ kiện và đáp ứng điều kiện đổi trả theo chính sách hiện hành.",
         },
      ],
   },
   {
      title: "5. Hóa đơn điện tử",
      items: [
         {
            q: "Tôi có thể tra cứu hóa đơn ở đâu?",
            a: "Bạn có thể tra cứu tại trang Tra cứu hóa đơn điện tử bằng mã đơn hàng hoặc số điện thoại.",
         },
      ],
   },
];

export default function FaqPage() {
   return (
      <div className="text-primary leading-relaxed mb-10 w-full">
         <h1 className="text-[24px] font-bold text-primary text-center mb-7">
            Câu hỏi thường gặp
         </h1>
         <p className="mb-6 text-primary">
            Tổng hợp các câu hỏi phổ biến về mua hàng, thanh toán, giao hàng và
            bảo hành tại ChoCongNghe.
         </p>

         {faqSections.map((section) => (
            <section key={section.title} className="mb-6">
               <h2 className="font-bold text-primary mb-3">{section.title}</h2>
               <ul className="space-y-3">
                  {section.items.map((item, index) => (
                     <li
                        key={`${section.title}-${index}`}
                        className="p-3 rounded-lg bg-neutral-light-active border border-neutral-light"
                     >
                        <p className="font-semibold text-primary mb-1">
                           Hỏi: {item.q}
                        </p>
                        <p className="text-primary">Đáp: {item.a}</p>
                     </li>
                  ))}
               </ul>
            </section>
         ))}
      </div>
   );
}
