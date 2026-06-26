"use client";

export default function DeliveryPolicy() {
   return (
      <>
         <h1 className="font-bold mb-5 text-primary text-center">
            Chính sách giao hàng & lắp đặt
         </h1>

         <p className="leading-relaxed mb-6 text-primary">
            Mua hàng tại ChoCongNghe, khách hàng sẽ được hỗ trợ giao hàng tại nhà hầu như trên toàn quốc. Với độ phủ trên khắp 63 tỉnh thành, Quý khách sẽ nhận được sản phẩm nhanh chóng mà không cần mất thời gian di chuyển tới cửa hàng.
         </p>

         <Section title="1. Giao hàng tại nhà">
            <ul className="space-y-2 mb-5">
               {[
                  "Áp dụng với tất cả các sản phẩm có áp dụng giao hàng tại nhà, không giới hạn giá trị.",
                  "Miễn phí giao hàng trong bán kính 20km có đặt shop (Đơn hàng giá trị dưới 100.000 VNĐ thu phí 10.000 VNĐ).",
                  "Với khoảng cách lớn hơn 20km, nhân viên ChoCongNghe sẽ tư vấn chi tiết về cách thức giao nhận thuận tiện nhất.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>
         </Section>

         <Divider />

         <Section title="2. Thanh toán khi giao hàng">
            <div className="space-y-2 mb-5">
               {[
                  { range: "Đơn từ 50 triệu trở lên", desc: "Quý khách phải thanh toán trước 100% giá trị đơn hàng nếu muốn giao hàng tại nhà." },
                  { range: "Đơn dưới 50 triệu", desc: "Quý khách có thể nhận hàng và thanh toán tại nhà khi đồng ý mua hàng." },
               ].map((item, i) => (
                  <div key={i} className="flex flex-wrap items-start gap-2 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                     <span className="font-bold px-2.5 py-1 rounded-full shrink-0 bg-accent-light text-accent">
                        {item.range}
                     </span>
                     <span className="text-primary leading-relaxed">{item.desc}</span>
                  </div>
               ))}
            </div>
         </Section>

         <Divider />

         <Section title="3. Hỗ trợ lắp đặt">
            <p className="leading-relaxed mb-3 text-primary">
               Đối với các sản phẩm có chính sách lắp đặt tại nhà (TV, Điều hòa,...) sau khi sản phẩm được giao tới nơi, ChoCongNghe sẽ hỗ trợ <strong>tư vấn, lắp đặt và hướng dẫn sử dụng miễn phí</strong> cho khách hàng.
            </p>
         </Section>

         <Divider />

         <Section title="4. Quy định riêng đối với sản phẩm chỉ bán Online">
            <div className="rounded-lg p-4 bg-neutral-light-active border border-neutral mb-4">
               <p className="font-semibold mb-3 text-primary">Quý khách lưu ý khi nhận hàng:</p>
               <ul className="space-y-2">
                  {[
                     "Khi nhận hàng, Quý khách không đồng kiểm chi tiết với nhà vận chuyển (chỉ kiểm tra ngoại quan kiện hàng, không bóc và kiểm tra chi tiết sản phẩm bên trong). Trường hợp Quý khách không nhận sản phẩm, kiện hàng sẽ được nhà vận chuyển chuyển hoàn về nơi gửi.",
                     "Quý khách cần quay video khi nhận hàng mở kiện để được thực hiện đổi trả nếu hàng hoá có phát sinh vấn đề.",
                     "Quý khách có 01 ngày để gọi lên tổng đài khiếu nại trong trường hợp phát sinh vấn đề đến hàng hoá.",
                  ].map((item, i) => (
                     <li key={i} className="flex gap-2 leading-relaxed text-neutral-darker">
                        <span className="mt-1 shrink-0">•</span>
                        <span>{item}</span>
                     </li>
                  ))}
               </ul>
            </div>
            <div className="rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
               <p className="text-neutral-darker">
                  Mọi thắc mắc về giao hàng, vui lòng liên hệ hotline <strong className="text-primary">1800.6060</strong> hoặc <strong className="text-primary">1800.6626</strong> để được hỗ trợ.
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