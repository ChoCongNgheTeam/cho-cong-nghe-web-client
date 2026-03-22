"use client";

export default function InstallmentPolicy() {
   return (
      <>
         <h1 className="font-bold mb-5 text-primary text-center">
            Chính sách trả góp
         </h1>

         <p className="leading-relaxed mb-6 text-primary">
            Nhằm mang tới sự thuận tiện trong quá trình mua hàng, CHOCONGNGHE cung cấp dịch vụ trả góp đa dạng bao gồm: trả góp qua thẻ tín dụng, Kredivo, Home PayLater và Công ty tài chính.
         </p>

         <Section title="1. Trả góp qua thẻ tín dụng">
            <ul className="mb-5 space-y-2">
               {[
                  "Hiệu lực còn lại của thẻ phải lớn hơn kỳ hạn trả góp, riêng MB, Kiên Long Bank phải lớn hơn ít nhất (01) tháng.",
                  "Số dư thẻ phải lớn hơn hoặc bằng tổng giá trị trả góp.",
                  "Khách hàng phải nhập đúng số thẻ, ngày hết hạn và số CVV khi thực hiện giao dịch.",
                  "Thời gian trả góp 3, 6, 9, 12, 15, 18, 24, 36 tháng (tuỳ từng ngân hàng).",
                  "Số lần mua trả góp tuỳ thuộc vào hạn mức thẻ tín dụng.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>

            <p className="font-semibold mb-3 text-primary">
               Giá trị thanh toán phải đạt số tiền trả góp tối thiểu:
            </p>
            <div className="space-y-2 mb-5">
               {[
                  { amount: "Từ 500.000đ", bank: "Muadee by HDBank" },
                  { amount: "Từ 1.000.000đ", bank: "NCB, Sacombank" },
                  { amount: "Từ 2.000.000đ", bank: "Techcombank, VIB, Home Credit và Lotte Finance" },
                  { amount: "Từ 3.000.000đ", bank: "Các ngân hàng còn lại" },
               ].map((row, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                     <span className="font-bold px-2.5 py-1 rounded-full shrink-0 bg-accent-light text-accent">
                        {row.amount}
                     </span>
                     <span className="text-primary">{row.bank}</span>
                  </div>
               ))}
            </div>

            <p className="font-semibold mb-3 text-primary">Ngân hàng – Cách thức chuyển đổi trả góp:</p>
            <div className="space-y-3 mb-5">
               <SubSection label="Vietcombank, MB, SHB, LPBank, HDBank, PVcomBank, TPBank, SVFC, Mcredit, Woori Bank, Lotte Finance, Home Credit, Standard Chartered, Vietbank" content="Ngân hàng sẽ không hỗ trợ chuyển đổi trả góp sau khi giao dịch đã lên sao kê." />
               <SubSection label="Các ngân hàng còn lại" content="Sau 7–10 ngày làm việc hệ thống tự chuyển đổi. Một số ngân hàng hỗ trợ chuyển đổi sau kỳ sao kê, thời gian cụ thể phụ thuộc vào chính sách từng ngân hàng." />
            </div>

            <div className="rounded-lg p-4 bg-neutral-light-active border border-neutral">
               <p className="font-semibold mb-2 text-primary">Lưu ý</p>
               <ul className="space-y-2">
                  {[
                     "Không nên giao dịch cận ngày sao kê.",
                     "Trong thời gian khóa, vui lòng sử dụng thẻ của các ngân hàng còn lại để thực hiện giao dịch trả góp.",
                     "Chương trình không áp dụng cho thẻ phụ, thẻ Debit và thẻ tín dụng phát hành tại nước ngoài.",
                  ].map((item, i) => (
                     <li key={i} className="flex gap-2 leading-relaxed text-neutral-darker">
                        <span className="mt-1 shrink-0">•</span>
                        <span>{item}</span>
                     </li>
                  ))}
               </ul>
            </div>
         </Section>

         <Divider />

         <Section title="2. Trả góp qua nhà tài chính">
            <p className="leading-relaxed mb-4 text-primary">
               Khách hàng mang hồ sơ được yêu cầu tới CHOCONGNGHE gần nhất để đăng ký và hoàn tất thủ tục trả góp qua nhà tài chính.
            </p>
            {/* Mobile card */}
            <div className="md:hidden space-y-3">
               <div className="rounded-lg border border-neutral overflow-hidden">
                  <div className="bg-neutral-light-active px-4 py-2 font-semibold text-accent">HDS, HOME CREDIT, SHINHAN FINANCE, FE CREDIT, MIRAE ASSET, SAMSUNG FINANCE PLUS</div>
                  <div className="px-4 py-3 space-y-2">
                     <div><span className="font-semibold text-primary">Độ tuổi: </span><span className="text-neutral-darker">18–60 (Nam SHINHAN: 21–60)</span></div>
                     <div><span className="font-semibold text-primary">Hồ sơ: </span><span className="text-neutral-darker">Căn cước/CMND, Bằng lái xe/Sổ hộ khẩu, Email, SIM chính chủ</span></div>
                     <div><span className="font-semibold text-primary">Yêu cầu: </span><span className="text-neutral-darker">Hồ sơ được duyệt, Thu nhập từ 4.000.000đ/tháng, Có tài khoản Kredivo</span></div>
                  </div>
               </div>
            </div>
            {/* Desktop table */}
            <div className="hidden md:block rounded-lg overflow-hidden border border-neutral">
               <div className="grid grid-cols-4 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                  <span>Công ty tài chính</span>
                  <span>Độ tuổi</span>
                  <span>Hồ sơ</span>
                  <span>Yêu cầu khác</span>
               </div>
               <div className="grid grid-cols-4 px-4 py-3 gap-2 text-primary">
                  <div className="space-y-1">
                     {["HDS", "HOME CREDIT", "SHINHAN FINANCE", "FE CREDIT", "MIRAE ASSET", "SAMSUNG FINANCE PLUS"].map((c, i) => (
                        <span key={i} className="block font-semibold text-accent">{c}</span>
                     ))}
                  </div>
                  <div className="space-y-1">
                     <span className="block">18 - 60</span>
                     <span className="block">18 - 60</span>
                     <span className="block">Nam: 21-60 / Nữ: 18-60</span>
                     <span className="block">18 - 60</span>
                  </div>
                  <ul className="space-y-1">
                     {["Căn cước/CMND", "Bằng lái xe/Sổ hộ khẩu", "Email", "SIM chính chủ"].map((d, i) => (
                        <li key={i} className="flex gap-1 text-primary"><span className="shrink-0">•</span><span>{d}</span></li>
                     ))}
                  </ul>
                  <ul className="space-y-1">
                     {["Hồ sơ được đơn vị trả góp duyệt", "Thu nhập từ 4.000.000đ/tháng", "Có tài khoản Kredivo"].map((r, i) => (
                        <li key={i} className="flex gap-1 text-primary"><span className="shrink-0">•</span><span>{r}</span></li>
                     ))}
                  </ul>
               </div>
            </div>
         </Section>

         <Divider />

         <Section title="3. Trả góp qua Kredivo">
            <div className="rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
               <p className="italic text-neutral-darker">Chính sách đang được cập nhật.</p>
            </div>
         </Section>

         <Divider />

         <Section title="4. Trả góp qua Home PayLater">
            <div className="rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
               <p className="italic text-neutral-darker">Chính sách đang được cập nhật.</p>
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

function SubSection({ label, content }: { label: string; content: string }) {
   return (
      <div className="rounded-lg p-4 bg-neutral-light-active border border-neutral">
         <p className="font-semibold mb-1.5 text-neutral-darker">{label}</p>
         <p className="leading-relaxed text-primary">→ {content}</p>
      </div>
   );
}

function Divider() {
   return <hr className="my-6 border-neutral" />;
}