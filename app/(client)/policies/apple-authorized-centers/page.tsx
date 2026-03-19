const recognitionTips = [
   "Niêm yết thông tin đơn vị ủy quyền rõ ràng tại cửa hàng hoặc trên website.",
   "Có khu vực tiếp nhận bảo hành và quy trình xử lý minh bạch.",
   "Xuất hóa đơn và phiếu tiếp nhận bảo hành theo đúng quy định.",
   "Tư vấn đúng chính sách bảo hành của hãng và hỗ trợ kiểm tra tình trạng.",
];

const services = [
   "Tiếp nhận và kiểm tra tình trạng thiết bị.",
   "Tư vấn quy trình bảo hành và thời gian dự kiến.",
   "Bảo hành theo tiêu chuẩn của hãng (đối với sản phẩm đủ điều kiện).",
   "Hỗ trợ cập nhật tiến độ và bàn giao sau khi hoàn tất.",
];

export default function AppleAuthorizedCenters() {
   return (
      <div className="text-primary leading-relaxed mb-10 w-full">
         <h1 className="text-[24px] font-bold text-primary text-center mb-7">
            Đại lý ủy quyền và TTBH ủy quyền của Apple
         </h1>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">1. Thông tin chung</h2>
            <p className="text-primary">
               Trang này cung cấp thông tin tham khảo về các điểm bán và trung tâm
               bảo hành ủy quyền. Danh sách chi tiết sẽ được cập nhật định kỳ để
               đảm bảo độ chính xác.
            </p>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">2. Cách nhận biết</h2>
            <ul className="space-y-2">
               {recognitionTips.map((item, index) => (
                  <li key={index} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p className="text-primary">{item}</p>
                  </li>
               ))}
            </ul>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">
               3. Dịch vụ tại TTBH ủy quyền
            </h2>
            <ul className="space-y-2">
               {services.map((item, index) => (
                  <li key={index} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p className="text-primary">{item}</p>
                  </li>
               ))}
            </ul>
         </section>

         <section>
            <h2 className="font-bold text-primary mb-2">4. Lưu ý khi đến bảo hành</h2>
            <p className="text-primary">
               Quý khách vui lòng mang theo hóa đơn, phụ kiện đi kèm (nếu có) và
               sao lưu dữ liệu trước khi gửi bảo hành. Tình trạng tiếp nhận sẽ
               được xác định dựa trên kiểm tra thực tế tại trung tâm.
            </p>
         </section>
      </div>
   );
}
