const solutions = [
   "Cung cấp thiết bị số lượng lớn với chính sách giá riêng cho doanh nghiệp.",
   "Tư vấn cấu hình, tối ưu chi phí theo nhu cầu sử dụng thực tế.",
   "Hỗ trợ triển khai đồng bộ, cài đặt ban đầu và bàn giao kỹ thuật.",
   "Bảo hành, hậu mãi và hỗ trợ kỹ thuật theo SLA thỏa thuận.",
];

const workflowSteps = [
   "Tiếp nhận yêu cầu và khảo sát nhu cầu doanh nghiệp.",
   "Đề xuất giải pháp, cấu hình và báo giá chi tiết.",
   "Ký kết hợp đồng và kế hoạch triển khai.",
   "Giao hàng, lắp đặt và nghiệm thu.",
   "Hỗ trợ vận hành, bảo hành và bảo trì định kỳ.",
];

const requiredDocs = [
   "Thông tin doanh nghiệp và đầu mối liên hệ.",
   "Danh sách thiết bị, số lượng và cấu hình mong muốn.",
   "Địa điểm triển khai và thời gian dự kiến.",
   "Yêu cầu đặc thù (nếu có) về bảo mật hoặc tích hợp hệ thống.",
];

export default function EnterpriseProjects() {
   return (
      <div className="text-primary leading-relaxed mb-10 w-full">
         <h1 className="text-[24px] font-bold text-primary text-center mb-7">
            Dự án Doanh nghiệp
         </h1>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">1. Tổng quan</h2>
            <p className="text-primary">
               ChoCongNghe cung cấp giải pháp mua sắm và triển khai thiết bị cho
               doanh nghiệp, tổ chức giáo dục và đối tác dự án. Chúng tôi ưu tiên
               tối ưu chi phí, đảm bảo tiến độ và hỗ trợ kỹ thuật trong suốt vòng
               đời dự án.
            </p>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">
               2. Giải pháp & quyền lợi
            </h2>
            <ul className="space-y-2">
               {solutions.map((item, index) => (
                  <li key={index} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p className="text-primary">{item}</p>
                  </li>
               ))}
            </ul>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">3. Quy trình triển khai</h2>
            <ol className="space-y-2">
               {workflowSteps.map((item, index) => (
                  <li key={index} className="flex gap-2.5">
                     <span className="shrink-0 font-semibold text-accent">
                        {index + 1}.
                     </span>
                     <p className="text-primary">{item}</p>
                  </li>
               ))}
            </ol>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">4. Hồ sơ cần chuẩn bị</h2>
            <ul className="space-y-2">
               {requiredDocs.map((item, index) => (
                  <li key={index} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p className="text-primary">{item}</p>
                  </li>
               ))}
            </ul>
         </section>

         <section>
            <h2 className="font-bold text-primary mb-2">5. Liên hệ tư vấn</h2>
            <p className="text-primary">
               Vui lòng để lại nhu cầu dự án và thông tin liên hệ. Bộ phận phụ
               trách doanh nghiệp sẽ chủ động phản hồi trong thời gian sớm nhất.
            </p>
         </section>
      </div>
   );
}
