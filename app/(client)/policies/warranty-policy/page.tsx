"use client";

export default function DeliveryInstallationPolicy() {
   return (
      <>
         <h1 className="font-bold mb-6 text-primary text-center">
            Chính sách giao hàng & lắp đặt Điện máy, Gia dụng
         </h1>

         <Section title="1. Một số định nghĩa">
            <ul className="space-y-2">
               {[
                  <><strong className="text-primary">Khoảng cách giao hàng:</strong> Là khoảng cách tính từ nơi mua hàng (cửa hàng) đến cửa nhà khách hàng.</>,
                  <><strong className="text-primary">Khoảng cách lắp đặt:</strong> Là khoảng cách từ vị trí đặt thiết bị so với các nguồn cấp điện, cấp nước, đường thoát nước, vị trí treo/khoan bắt vít (đối với thiết bị cần lắp đặt cố định như máy lạnh, máy nước nóng, máy giặt, v.v.).</>,
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>
         </Section>

         <Divider />

         <Section title="2. Chính sách giao hàng">
            <div className="rounded-lg overflow-hidden border border-neutral mb-4">
               <div className="grid grid-cols-3 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                  <span>Tiêu chí</span>
                  <span>Điều kiện</span>
                  <span>Chi phí</span>
               </div>
               <div className="divide-y divide-neutral">
                  <div className="grid grid-cols-3 px-4 py-3 gap-2">
                     <span className="text-primary font-medium">Thời gian giao hàng</span>
                     <span className="col-span-2 text-primary">24 - 48 tiếng tính từ lúc khách đặt hàng (hoặc theo thoả thuận với khách hàng).</span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-3 gap-2">
                     <span className="text-primary font-medium">Chi phí giao hàng</span>
                     <span className="text-primary">≤ 30km</span>
                     <span className="font-semibold text-promotion">Miễn phí</span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-3 gap-2">
                     <span></span>
                     <span className="text-primary">&gt; 30km</span>
                     <span className="text-primary">Mỗi km tiếp theo tính phí <strong>5.000đ/km</strong></span>
                  </div>
               </div>
            </div>
         </Section>

         <Divider />

         <Section title="3. Chính sách lắp đặt">
            <ul className="space-y-2 mb-5">
               {[
                  <><strong className="text-primary">Thời gian lắp đặt:</strong> 24 - 48 tiếng tính từ lúc khách nhận hàng (hoặc theo thời gian thoả thuận với khách hàng).</>,
                  <><strong className="text-primary">Thời gian phản ánh tình trạng sau lắp đặt:</strong> Trong vòng 48 tiếng sau khi hoàn tất lắp đặt (chi phí phát sinh sau thời gian này sẽ do 2 bên thỏa thuận).</>,
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>

            <SubTitle>3.1. Chính sách lắp đặt sản phẩm điện máy</SubTitle>

            <div className="rounded-lg overflow-hidden border border-neutral mb-4">
               <div className="grid grid-cols-4 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                  <span>Loại lắp đặt</span>
                  <span>Sản phẩm</span>
                  <span>Điều kiện</span>
                  <span>Chi phí</span>
               </div>

               <div className="divide-y divide-neutral">
                  {[
                     { product: "Máy giặt, máy sấy", condition: "Vị trí lắp đặt của KH có sẵn đường ống nước" },
                     { product: "Tủ lạnh, tủ đông, tủ mát", condition: "Đường điện không quá 2m" },
                     { product: "Máy lạnh", condition: "Vị trí lắp đặt không cao quá 4m (tính từ mặt sàn)" },
                  ].map((row, i) => (
                     <div key={i} className="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        {i === 0 ? (
                           <span className="font-semibold text-promotion">Lắp đặt tiêu chuẩn (miễn phí)</span>
                        ) : (
                           <span />
                        )}
                        <span className="text-primary">{row.product}</span>
                        <span className="text-neutral-darker">{row.condition}</span>
                        {i === 0 ? (
                           <span className="font-semibold text-promotion">Miễn phí</span>
                        ) : (
                           <span />
                        )}
                     </div>
                  ))}
               </div>

               <div className="border-t border-neutral divide-y divide-neutral">
                  {[
                     {
                        product: "Máy giặt, máy sấy",
                        conditions: ["Vị trí lắp đặt không thuận lợi, cần xe cẩu, giàn giáo để đưa vào", "Nguồn nước yếu cần lắp thêm bơm tăng áp."],
                     },
                     {
                        product: "Tủ lạnh",
                        conditions: ["Vị trí lắp đặt không thuận lợi cần xe cẩu, giàn giáo để đưa vào"],
                     },
                     {
                        product: "Máy lạnh",
                        conditions: ["Phát sinh vật tư (vật tư chính và phụ) thêm ngoài khuyến mãi.", "Vị trí đặt dàn nóng cao hơn 4m và cần thuê giàn giáo", "Thi công đường ống âm tường", "Vệ sinh đường ống cũ", "Tháo, lắp máy cũ", "Hàn ống đồng"],
                     },
                     {
                        product: "Tivi",
                        conditions: ["Lắp đặt giá treo di động"],
                     },
                  ].map((row, i) => (
                     <div key={i} className="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        {i === 0 ? (
                           <span className="font-semibold text-neutral-darker">Lắp đặt nâng cao (có tính phí)</span>
                        ) : (
                           <span />
                        )}
                        <span className="text-primary font-medium">{row.product}</span>
                        <ul className="space-y-1">
                           {row.conditions.map((c, j) => (
                              <li key={j} className="flex gap-1 text-neutral-darker">
                                 <span className="shrink-0">•</span>
                                 <span>{c}</span>
                              </li>
                           ))}
                        </ul>
                        {i === 0 ? (
                           <span className="text-neutral-darker">KH chịu phí phát sinh (thỏa thuận với đơn vị thi công)</span>
                        ) : (
                           <span />
                        )}
                     </div>
                  ))}
               </div>
            </div>

            <div className="rounded-lg p-4 bg-neutral-light-active border border-neutral mb-6">
               <p className="font-semibold mb-2 text-primary">Lưu ý</p>
               <p className="leading-relaxed text-neutral-darker">
                  TV từ 65inch khuyến cáo không treo tường. Nếu khách hàng yêu cầu thì cần ký biên bản miễn trừ trách nhiệm nếu bị rơi trong quá trình sử dụng.
               </p>
            </div>

            <SubTitle>3.2. Chính sách lắp đặt sản phẩm gia dụng</SubTitle>

            <div className="rounded-lg overflow-hidden border border-neutral">
               <div className="grid grid-cols-4 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                  <span>Loại lắp đặt</span>
                  <span>Sản phẩm</span>
                  <span>Điều kiện</span>
                  <span>Chi phí</span>
               </div>

               <div className="divide-y divide-neutral">
                  {[
                     { product: "Máy nước nóng gián tiếp/trực tiếp", condition: "Vị trí lắp đặt của KH có sẵn đường ống nước chờ tại vị trí lắp máy" },
                     { product: "Máy lọc nước", condition: "Vị trí lắp đặt của KH có sẵn đường ống nước chờ tại vị trí lắp máy" },
                     { product: "Máy rửa bát", condition: "Vị trí lắp đặt của KH có sẵn đường ống nước chờ tại vị trí lắp máy" },
                     { product: "Bếp từ/hồng ngoại đa, Máy hút mùi", condition: "Vị trí lắp vừa với kích thước Bếp/Hút mùi và có sẵn đường điện chờ (Loại trừ KG498, KG499, HS-I15521FG)" },
                  ].map((row, i) => (
                     <div key={i} className="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        {i === 0 ? (
                           <span className="font-semibold text-promotion">Lắp đặt tiêu chuẩn (miễn phí)</span>
                        ) : (
                           <span />
                        )}
                        <span className="text-primary">{row.product}</span>
                        <span className="text-neutral-darker">{row.condition}</span>
                        {i === 0 ? (
                           <span className="font-semibold text-promotion">Miễn phí</span>
                        ) : (
                           <span />
                        )}
                     </div>
                  ))}
               </div>

               <div className="border-t border-neutral divide-y divide-neutral">
                  {[
                     {
                        product: "Máy nước nóng gián tiếp/trực tiếp",
                        conditions: ["Có thêm vật tư phát sinh", "Thi công ống âm tường", "Tháo, lắp máy cũ"],
                     },
                     {
                        product: "Máy lọc nước",
                        conditions: ["Có thêm vật tư phát sinh", "Thi công ống âm tường", "Khoan/khoét lỗ tường gạch bê tông/Tủ gỗ"],
                     },
                     {
                        product: "Máy rửa bát",
                        conditions: ["Có thêm vật tư phát sinh", "Thi công ống âm tường"],
                     },
                     {
                        product: "Máy hút mùi, Bếp từ/hồng ngoại đa",
                        conditions: ["Có thêm vật tư phát sinh", "Khoan/cắt ghép đá, bê tông, gỗ (hãng Hafele, Pramie hỗ trợ khoan cắt đá miễn phí)"],
                     },
                  ].map((row, i) => (
                     <div key={i} className="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        {i === 0 ? (
                           <span className="font-semibold text-neutral-darker">Lắp đặt nâng cao (có tính phí)</span>
                        ) : (
                           <span />
                        )}
                        <span className="text-primary font-medium">{row.product}</span>
                        <ul className="space-y-1">
                           {row.conditions.map((c, j) => (
                              <li key={j} className="flex gap-1 text-neutral-darker">
                                 <span className="shrink-0">•</span>
                                 <span>{c}</span>
                              </li>
                           ))}
                        </ul>
                        {i === 0 ? (
                           <span className="text-neutral-darker">KH chịu phí phát sinh (thỏa thuận với đơn vị thi công)</span>
                        ) : (
                           <span />
                        )}
                     </div>
                  ))}
               </div>
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

function SubTitle({ children }: { children: React.ReactNode }) {
   return (
      <p className="font-semibold mb-3 text-primary">{children}</p>
   );
}

function Divider() {
   return <hr className="my-6 border-neutral" />;
}