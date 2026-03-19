const requiredInfo = [
   "Số IMEI/Serial của sản phẩm.",
   "Mã đơn hàng hoặc số hóa đơn mua hàng.",
   "Số điện thoại đặt hàng hoặc email nhận thông báo.",
];

const lookupMethods = [
   "Tra cứu trực tuyến tại cổng hỗ trợ (đang cập nhật).",
   "Liên hệ tổng đài CSKH để được hỗ trợ kiểm tra.",
   "Đến trực tiếp cửa hàng gần nhất để được hỗ trợ.",
];

const commonStatuses = [
   "Trong thời hạn bảo hành.",
   "Hết thời hạn bảo hành.",
   "Đang xử lý tại trung tâm bảo hành.",
   "Chờ linh kiện hoặc hẹn trả máy.",
];

export default function WarrantyLookup() {
   return (
      <div className="text-primary leading-relaxed mb-10 w-full">
         <h1 className="text-[24px] font-bold text-primary text-center mb-7">
            Tra cứu bảo hành
         </h1>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">1. Thông tin cần chuẩn bị</h2>
            <ul className="space-y-2">
               {requiredInfo.map((item, index) => (
                  <li key={index} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p className="text-primary">{item}</p>
                  </li>
               ))}
            </ul>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">2. Cách tra cứu</h2>
            <ul className="space-y-2">
               {lookupMethods.map((item, index) => (
                  <li key={index} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p className="text-primary">{item}</p>
                  </li>
               ))}
            </ul>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">
               3. Trạng thái bảo hành thường gặp
            </h2>
            <ul className="space-y-2">
               {commonStatuses.map((item, index) => (
                  <li key={index} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p className="text-primary">{item}</p>
                  </li>
               ))}
            </ul>
         </section>

         <section>
            <h2 className="font-bold text-primary mb-2">4. Lưu ý</h2>
            <p className="text-primary">
               Thời hạn bảo hành được tính từ ngày xuất hóa đơn. Điều kiện và
               thời gian xử lý phụ thuộc chính sách của từng hãng và tình trạng
               thực tế của thiết bị.
            </p>
         </section>
      </div>
   );
}
