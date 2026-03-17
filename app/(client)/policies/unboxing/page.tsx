"use client";

export default function UnboxingPolicy() {
   return (
      <>
         <h1 className="font-bold mb-5 text-primary text-center">
            Chính sách khui hộp sản phẩm
         </h1>

         <div className="rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral mb-6">
            <p className="text-primary">
               <strong>Áp dụng cho:</strong> Các sản phẩm bán ra tại ChoCongNghe bao gồm Điện thoại di động, Máy tính, Máy tính bảng, Đồng hồ thông minh.
            </p>
         </div>

         <Section title="Nội dung chính sách">
            <ul className="space-y-3 mb-5">
               {[
                  "Sản phẩm bắt buộc phải khui seal/mở hộp và kích hoạt bảo hành điện tử (Active) ngay tại shop hoặc ngay tại thời điểm nhận hàng khi có nhân viên giao hàng tại nhà.",
                  "Đối với các sản phẩm bán nguyên seal, khách hàng cần phải thanh toán trước 100% giá trị đơn hàng trước khi khui seal sản phẩm.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>
         </Section>

         <Divider />

         <Section title="Lưu ý">
            <ul className="space-y-3">
               {[
                  <>
                     Trước khi kích hoạt bảo hành điện tử (Active), khách hàng cần kiểm tra các <strong>lỗi ngoại quan</strong> của sản phẩm (Cấn/Trầy thân máy, bụi trong camera, bụi màn hình, hở viền…). Nếu phát hiện các lỗi trên, khách hàng sẽ được <strong>đổi 1 sản phẩm khác hoặc hoàn tiền</strong>.
                  </>,
                  <>
                     Ngay sau khi kiểm tra lỗi ngoại quan, tiến hành bật nguồn để kiểm tra lỗi kỹ thuật; nếu sản phẩm có <strong>lỗi kỹ thuật của nhà sản xuất</strong>, khách hàng sẽ được <strong>đổi 1 sản phẩm mới tương đương</strong> tại ChoCongNghe.
                  </>,
                  "Nếu Quý khách báo lỗi ngoại quan sau khi sản phẩm đã được kích hoạt bảo hành điện tử (Active) hoặc sau khi nhân viên giao hàng rời đi, ChoCongNghe chỉ hỗ trợ chuyển sản phẩm của khách hàng đến hãng để thẩm định và xử lý.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-3 leading-relaxed text-primary">
                     <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent mt-0.5">
                        {i + 1}
                     </span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>
         </Section>

         <Divider />

         <Section title="Một số lỗi thẩm mỹ thường gặp">
            <div className="rounded-lg p-4 bg-neutral-light-active border border-neutral">
               <ul className="space-y-2">
                  {[
                     "Cấn, trầy thân máy – va chạm vật lý trong quá trình vận chuyển",
                     "Bụi lọt vào camera trước / sau",
                     "Bụi dưới màn hình (dead pixel vùng viền)",
                     "Hở viền giữa khung máy và màn hình",
                     "Xước mặt kính phía sau hoặc viền kim loại",
                  ].map((item, i) => (
                     <li key={i} className="flex gap-2 leading-relaxed text-neutral-darker">
                        <span className="mt-1 shrink-0">•</span>
                        <span>{item}</span>
                     </li>
                  ))}
               </ul>
               <p className="mt-3 text-neutral-darker">
                  Quý khách phát hiện bất kỳ lỗi nào trong danh sách trên trước khi Active, vui lòng thông báo ngay cho nhân viên ChoCongNghe để được hỗ trợ đổi sản phẩm hoặc hoàn tiền.
               </p>
            </div>
         </Section>
      </>
   );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
   return (
      <section className="mb-6">
         <h2 className="font-bold mb-3 text-primary">{title}</h2>
         {children}
      </section>
   );
}

function Divider() {
   return <hr className="my-6 border-neutral" />;
}