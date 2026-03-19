"use client";

export default function ReturnPolicy() {
   return (
      <>
         <h1 className="font-bold mb-6 text-primary text-center ">
            Chính sách đổi trả
         </h1>

         <Section title="Khung chính sách đổi trả">
            <p className="leading-relaxed mb-3 text-primary">
               ChoCongNghe cung cấp các hướng dẫn thiết yếu cho việc tạo chính
               sách hoàn tiền và đổi trả hiệu quả, bao gồm các chủ đề như tầm
               quan trọng của việc có chính sách rõ ràng, ghi chú về các sản
               phẩm có thể hoặc không thể hoàn tiền, quyết định ai sẽ trả phí
               vận chuyển đổi trả, và thiết lập kỳ vọng của khách hàng về thời
               gian hoàn tiền.
            </p>
            <p className="leading-relaxed mb-3 text-primary">
               Tính năng quản lý RMA (Return Merchandise Authorization): Việc
               thêm chính sách bảo hành và đổi trả vừa đơn giản vừa phức tạp. Hệ
               thống quản lý quy trình RMA, thêm bảo hành cho sản phẩm, và cho
               phép khách hàng yêu cầu và quản lý đổi trả/hoàn tiền từ tài khoản
               của họ.
            </p>

            <div className="mt-4 space-y-4">
               <SubSection title="1. Thời gian đổi trả">
                  <p className="leading-relaxed text-primary">
                     Thiết lập số ngày tối đa cho phép đổi trả và chọn trạng
                     thái đơn hàng mà chính sách RMA được áp dụng.
                  </p>
               </SubSection>
               <SubSection title="2. Quy trình đổi trả">
                  <p className="leading-relaxed text-primary">
                     Quản lý quy trình hoàn tiền trong cửa hàng một cách dễ
                     dàng. Kích hoạt biểu mẫu hoàn tiền, cho phép đổi trả tự
                     động, tắt biểu mẫu hoàn tiền sau một thời gian cụ thể, và
                     quản lý hoàn tiền trực tiếp từ đơn hàng.
                  </p>
               </SubSection>
               <SubSection title="3. Yêu cầu đổi trả không cần đăng nhập">
                  <p className="leading-relaxed text-primary">
                     Tính năng mới cho phép khách hàng yêu cầu hoàn tiền mà
                     không cần đăng nhập tài khoản.
                  </p>
               </SubSection>
            </div>

            <div className="mt-5 rounded-lg p-4 bg-neutral-light-active border border-neutral">
               <p className="font-semibold mb-2 text-primary">
                  Chính sách bảo hành điển hình — Sản phẩm điện tử
               </p>
               <p className="leading-relaxed text-neutral-darker">
                  Đa số sản phẩm có bảo hành của nhà sản xuất{" "}
                  <strong className="text-primary">1 năm</strong>. Bảo hành mở
                  rộng có sẵn cho hầu hết các sản phẩm với mức phí nhỏ.
               </p>
            </div>
         </Section>

         <Divider />

         <Section title="Điều kiện bảo hành">
            <p className="leading-relaxed text-primary">
               Chúng tôi sẽ chấp nhận đổi trả bất kỳ sản phẩm mới chưa qua sử
               dụng của đại lý nếu sản phẩm không hoạt động do lỗi vật liệu hoặc
               lỗi sản xuất trong thời gian <strong>một năm</strong> kể từ ngày
               mua.
            </p>
         </Section>

         <Divider />

         <Section title="Thời gian đổi trả phổ biến">
            <div className="space-y-2">
               {[
                  { range: "7 – 14 ngày", desc: "Đổi trả do không hài lòng" },
                  { range: "30 ngày", desc: "Đổi trả do lỗi sản phẩm" },
                  { range: "1 năm", desc: "Bảo hành chính hãng" },
               ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                     <span className="font-bold px-2.5 py-1 rounded-full shrink-0 bg-accent-light text-accent ">
                        {item.range}
                     </span>
                     <span className="text-primary">{item.desc}</span>
                  </div>
               ))}
            </div>
         </Section>

         <Divider />

         <Section title="Điều kiện đổi trả">
            <ul className="space-y-2">
               {[
                  "Sản phẩm còn nguyên vẹn, chưa qua sử dụng",
                  "Có đầy đủ phụ kiện, hộp, sách hướng dẫn",
                  "Tem bảo hành còn nguyên vẹn",
                  "Có hóa đơn mua hàng",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent">
                        ✓
                     </span>
                     {item}
                  </li>
               ))}
            </ul>
         </Section>

         <Divider />

         <Section title="Quy trình đổi trả">
            <ol className="space-y-3">
               {[
                  "Khách hàng tạo yêu cầu đổi trả",
                  "Cung cấp lý do đổi trả",
                  "Đóng gói và gửi sản phẩm",
                  "Kiểm tra sản phẩm",
                  "Xử lý đổi trả / hoàn tiền",
               ].map((step, i) => (
                  <li key={i} className="flex items-center gap-3 text-primary">
                     <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white ">
                        {i + 1}
                     </span>
                     {step}
                     {i < 4 && <span className="ml-auto text-neutral-dark ">→</span>}
                  </li>
               ))}
            </ol>
         </Section>

         <Divider />

         <Section title="Phí đổi trả">
            <div className="space-y-2">
               {[
                  {
                     label: "Lỗi do nhà sản xuất",
                     fee: "Miễn phí",
                     highlight: true,
                  },
                  {
                     label: "Khách hàng đổi ý",
                     fee: "Khách hàng chịu phí vận chuyển",
                     highlight: false,
                  },
                  {
                     label: "Đổi size / mẫu",
                     fee: "Tùy chính sách cụ thể",
                     highlight: false,
                  },
               ].map((row, i) => (
                  <div
                     key={i}
                     className="flex items-center justify-between rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral"
                  >
                     <span className="text-primary">{row.label}</span>
                     <span className={`font-semibold ${row.highlight ? "text-accent" : "text-neutral-darker"}`}>
                        {row.fee}
                     </span>
                  </div>
               ))}
            </div>
            <p className="mt-4 leading-relaxed text-neutral-darker">
               Quy trình hoàn tiền và đổi trả được thực hiện đơn giản. Khách hàng có thể liên hệ hotline <strong className="text-primary">1800.6060</strong> hoặc <strong className="text-primary">1800.6626</strong> để được hỗ trợ trực tiếp.
            </p>
         </Section>
      </>
   );
}

function Section({
   title,
   children,
}: {
   title: string;
   children: React.ReactNode;
}) {
   return (
      <section className="mb-6">
         <h2 className="font-bold mb-3 text-primary ">{title}</h2>
         {children}
      </section>
   );
}

function SubSection({
   title,
   children,
}: {
   title: string;
   children: React.ReactNode;
}) {
   return (
      <div className="pl-4 border-l-[3px] border-accent">
         <p className="font-semibold mb-1 text-primary">{title}</p>
         {children}
      </div>
   );
}

function Divider() {
   return <hr className="my-6 border-neutral" />;
}
