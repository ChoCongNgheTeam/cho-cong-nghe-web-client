"use client";

export default function LoyaltyPolicy() {
   return (
      <>
         <h1 className="font-bold mb-5 text-primary text-center ">
            Chính sách Chương trình Khách hàng thân thiết tại ChoCongNghe
         </h1>

         <p className="leading-relaxed mb-6 text-primary">
            Khách hàng khi mua hàng tại hệ sinh thái ChoCongNghe sẽ được tích lũy điểm và đổi thành ưu đãi.
         </p>

         <Section title="1. Tổng quan">
            <p className="leading-relaxed mb-3 text-primary">
               "Chương trình khách hàng thân thiết" là chương trình ưu đãi dành riêng cho Khách hàng thân thiết của chuỗi cửa hàng trực thuộc ChoCongNghe bao gồm:
            </p>
            <ul className="space-y-2">
               {[
                  "Chuỗi cửa hàng ChoCongNghe",
                  "Chuỗi cửa hàng thương hiệu (F.Studio, S.Studio, Garmin...)",
                  "Công ty Cổ phần Dược phẩm FPT Long Châu",
                  "Tiêm chủng Long Châu",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>
         </Section>

         <Divider />

         <Section title="2. Đối tượng áp dụng">
            <p className="leading-relaxed text-primary">
               Chỉ áp dụng cho các khách hàng cá nhân, không áp dụng cho khách hàng bán buôn hoặc mua số lượng lớn phục vụ cho doanh nghiệp hoặc đơn hàng nằm trong chương trình ưu đãi dành riêng cho đối tác/dự án/xuất hoá đơn công ty.
            </p>
         </Section>

         <Divider />

         <Section title="3. Phạm vi áp dụng">
            <p className="leading-relaxed mb-3 text-primary">
               Áp dụng cho khách hàng mua hàng trực tiếp tại hệ thống cửa hàng hoặc trên các kênh bán hàng trực tuyến chính thức của chuỗi cửa hàng trực thuộc ChoCongNghe bao gồm:
            </p>
            <ul className="space-y-2">
               {[
                  "Chuỗi cửa hàng ChoCongNghe",
                  "Chuỗi cửa hàng thương hiệu (F.Studio, S.Studio, Garmin...)",
                  "Công ty Cổ phần Dược phẩm FPT Long Châu",
                  "Tiêm chủng Long Châu",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>
         </Section>

         <Divider />

         <Section title="4. Thời gian diễn ra chương trình">
            <div className="rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
               <p className="text-primary">
                  Từ ngày <strong>05/01/2024</strong>
                  <span className="text-neutral-darker ml-2 ">
                     (*) Có thể thay đổi và sẽ cập nhật khi đang diễn ra chương trình.
                  </span>
               </p>
            </div>
         </Section>

         <Divider />

         <Section title="5. Chi tiết cách thức và thể lệ tham gia chương trình tại ChoCongNghe">

            <SubTitle>5.1. Thể lệ</SubTitle>
            <ul className="space-y-3 mb-5">
               {[
                  "Điểm thưởng được tích lũy dựa trên giá trị hóa đơn hàng hóa/dịch vụ của hệ thống bán lẻ ChoCongNghe (không bao gồm các dịch vụ thu hộ, dịch vụ ChoCongNghe bán hàng thay cho đối tác không ghi nhận doanh thu trực tiếp ChoCongNghe, đơn hàng nằm trong chương trình ưu đãi dành riêng cho đối tác/dự án/xuất hoá đơn công ty).",
                  <>Cứ mỗi <strong>4.000 đồng</strong> trên hóa đơn thanh toán, khách hàng sẽ được tích <strong>01 điểm thưởng</strong>. Số điểm thưởng được tích sẽ dựa vào giá trị cuối cùng của hóa đơn khách hàng thanh toán. <span className="text-neutral-darker">Ví dụ: Giá trị đơn hàng là 500.000đ, khách hàng áp dụng mã khuyến mãi 100.000đ → giá trị thanh toán 400.000đ → được tích 100 điểm.</span></>,
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>

            <p className="font-semibold mb-3 text-primary">Từ ngày 01/11/2024, khách hàng có thể quy đổi điểm thưởng thành ưu đãi giảm giá:</p>
            <div className="space-y-2 mb-5">
               {[
                  { range: "Đơn dưới 1.000.000đ", desc: "Giảm tối đa 200.000đ (tương đương 20.000 điểm)" },
                  { range: "Đơn từ 1.000.000đ trở lên", desc: "Quy đổi tối đa 20% giá trị đơn hàng" },
               ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                     <span className="font-bold px-2.5 py-1 rounded-full shrink-0 bg-accent-light text-accent ">
                        {item.range}
                     </span>
                     <span className="text-primary">{item.desc}</span>
                  </div>
               ))}
            </div>

            <div className="rounded-lg p-4 bg-neutral-light-active border border-neutral mb-6">
               <p className="font-semibold mb-2 text-primary">Ưu đãi được nhận khi tích đủ điểm</p>
               <ul className="space-y-2">
                  {[
                     "Khách hàng cần đổi tối thiểu từ 50 điểm để có thể quy đổi thành Voucher. 1 điểm thưởng = 10 đồng.",
                     "Khi tích đủ mức điểm, khách hàng có thể đổi suất mua đặc quyền với giá 1.000đ theo 4 mốc điểm: 1.000 / 3.000 / 8.000 / 15.000 điểm.",
                     "Mỗi suất mua đặc quyền có hạn sử dụng 30 ngày kể từ ngày đổi.",
                  ].map((item, i) => (
                     <li key={i} className="flex gap-2 leading-relaxed text-neutral-darker">
                        <span className="mt-1 shrink-0">•</span>
                        <span>{item}</span>
                     </li>
                  ))}
               </ul>
               <p className="mt-2 text-neutral-darker ">
                  Lưu ý: Điểm đã đổi thành suất mua đặc quyền khi hết hạn sẽ không được hoàn lại.
               </p>
            </div>

            <SubTitle>5.2. Cách thức</SubTitle>
            <ol className="space-y-3 mb-5">
               {[
                  <>Mua hàng tại chuỗi cửa hàng ChoCongNghe. Mỗi lần mua hàng với hóa đơn từ <strong>4.000đ</strong>, khách hàng tích lũy được 01 điểm thưởng tương ứng.</>,
                  <>Tìm kiếm từ khóa <strong>"ChoCongNghe"</strong> trên ứng dụng Zalo hoặc quét mã QR để theo dõi tài khoản Zalo chính thức của ChoCongNghe.</>,
                  "Nhấn quan tâm hoặc kết bạn trên ứng dụng Zalo.",
                  "Bấm tiếp tục ngay ở khung chat Zalo và nhập số điện thoại để đăng ký thành công khách hàng thân thiết.",
                  "Sau khi kết bạn thành công, khách hàng có thể đổi điểm thưởng thành ưu đãi giảm giá khi mua hàng trực tiếp trên website hoặc hệ thống cửa hàng ChoCongNghe trên toàn quốc.",
               ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-primary">
                     <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white mt-0.5 ">
                        {i + 1}
                     </span>
                     <span className="leading-relaxed">{step}</span>
                  </li>
               ))}
            </ol>

            <div className="rounded-lg p-4 bg-neutral-light-active border border-neutral">
               <p className="font-semibold mb-3 text-primary">Trường hợp đổi điểm khi mua hàng:</p>
               <div className="space-y-3">
                  <SubSection label="Mua trên website">
                     Chọn sản phẩm → thêm vào giỏ hàng → tại màn hình giỏ hàng bật toggle đổi điểm → điểm được quy đổi thành ưu đãi giảm giá → xác nhận và thanh toán.
                  </SubSection>
                  <SubSection label="Mua qua tổng đài hoặc tại cửa hàng">
                     Liên hệ nhân viên shop hoặc nhân viên tư vấn để được hỗ trợ trực tiếp.
                  </SubSection>
               </div>
            </div>
         </Section>

         <Divider />

         <Section title="6. Các quy định khác">

            <SubTitle>6.1. Quy định về số dư điểm / Hết hạn điểm</SubTitle>
            <ul className="space-y-2 mb-5">
               {[
                  "Khi điểm thưởng được sử dụng, số điểm có thời gian hết hạn gần nhất sẽ được tự động ưu tiên dùng trước để bảo toàn lợi ích cho khách hàng.",
                  "Khách hàng vui lòng kiểm tra thời hạn sử dụng của điểm thưởng để tránh trường hợp điểm hết hạn.",
                  <>Điểm thưởng có hạn sử dụng trong vòng <strong>12 tháng</strong> kể từ lúc tích điểm và hết hạn vào ngày cuối cùng của tháng. <span className="text-neutral-darker">Ví dụ: Điểm tích vào ngày 24/09/2023 sẽ hết hạn vào ngày 30/09/2024.</span></>,
                  "Điểm thưởng được tích tại mỗi thời điểm khác nhau sẽ có thời hạn sử dụng khác nhau.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>

            <SubTitle>6.2. Quy định về khấu trừ / Hủy điểm</SubTitle>
            <ul className="space-y-2 mb-5">
               {[
                  "Sau khi khách hàng tiến hành đổi điểm thưởng thành ưu đãi, ChoCongNghe sẽ khấu trừ các điểm thưởng đã được tích trong hệ thống.",
                  "Các trường hợp trả sản phẩm sau khi đã được tích điểm, với mỗi giá trị trả là 4.000đ, khách hàng sẽ bị giảm 01 điểm thưởng trong hệ thống.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>

            <SubTitle>6.3. Các quy định khác</SubTitle>
            <ul className="space-y-2">
               {[
                  "Khi tham gia chương trình, khách hàng hiểu rằng phía ChoCongNghe có quyền quyết định, hạn chế, tạm ngưng, thu hồi, thay đổi các quy định liên quan của một phần hoặc toàn bộ Chương trình hoặc chấm dứt Chương trình theo quy định của pháp luật.",
                  "Việc kết thúc chương trình sẽ có hiệu lực trong ngày ghi trong thông báo và khách hàng phải sử dụng điểm đã tích để đổi quà tặng trong thời hạn này. Sau thời gian này, toàn bộ điểm tích lũy chưa đổi sẽ không được giải quyết.",
                  "Thể lệ và thời gian diễn ra chương trình có thể được thay đổi mà không cần thông báo trước.",
                  <>Tất cả các thắc mắc và khiếu nại về chương trình, vui lòng liên hệ với chúng tôi qua hotline: <strong>1800.6060</strong> hoặc <strong>1800.6626</strong> (miễn phí).</>,
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>
         </Section>
      </>
   );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
   return (
      <section className="mb-6">
         <h2 className="font-bold mb-3 text-primary ">{title}</h2>
         {children}
      </section>
   );
}

function SubTitle({ children }: { children: React.ReactNode }) {
   return (
      <p className="font-semibold mb-3 text-primary ">{children}</p>
   );
}

function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
   return (
      <div className="pl-4 border-l-[3px] border-accent">
         <p className="font-semibold mb-1 text-neutral-darker ">{label}</p>
         <p className="leading-relaxed text-primary">→ {children}</p>
      </div>
   );
}

function Divider() {
   return <hr className="my-6 border-neutral" />;
}