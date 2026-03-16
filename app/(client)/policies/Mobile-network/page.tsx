"use client";

export default function MobileNetworkPolicy() {
   return (
      <>
         <h1 className="font-bold mb-5 text-primary text-center">
            Chính sách mạng di động ChoCongNghe
         </h1>

         {/* A */}
         <Section title="A. MỤC ĐÍCH VÀ PHẠM VI ÁP DỤNG">
            <SubSection title="I. Mục đích">
               <p className="leading-relaxed text-primary">
                  Quy định chính sách giá cước dịch vụ viễn thông di động mạng di động ChoCongNghe.
               </p>
            </SubSection>
            <SubSection title="II. Phạm vi áp dụng">
               <p className="leading-relaxed text-primary">
                  Chuỗi cửa hàng ChoCongNghe và các chuỗi Branded Store (F.Studio, S.Studio,…) theo danh sách thông báo từ Ngành hàng.
               </p>
            </SubSection>
         </Section>

         <Divider />

         {/* B */}
         <Section title="B. QUY ĐỊNH CHÍNH SÁCH GIÁ CƯỚC DỊCH VỤ">

            <SubSection title="I. Loại thuê bao">
               <p className="leading-relaxed text-primary">Áp dụng với thuê bao trả trước.</p>
            </SubSection>

            <SubSection title="II. Thời hạn sử dụng">
               <ul className="space-y-2">
                  {[
                     "Ngay khi kích hoạt, thuê bao có thời hạn sử dụng là 60 ngày.",
                     "Khi thực hiện các giao dịch có phát sinh cước, nạp tiền thì thời hạn sử dụng sẽ tăng lên là 90 ngày tính từ ngày phát sinh giao dịch.",
                     "Trong trường hợp kết thúc thời hạn sử dụng 90 ngày mà thuê bao không thực hiện một trong các giao dịch có phát sinh cước, nạp tiền, thì sẽ chuyển sang trạng thái khóa 1 chiều (khóa chiều đi: thực hiện cuộc gọi, nhắn tin đi và truy cập Internet).",
                     "Thời hạn khóa 1 chiều là 10 ngày. Hết thời hạn này, nếu thuê bao không nạp tiền thì sẽ chuyển sang trạng thái khóa 2 chiều (chiều đi và chiều đến).",
                     "Thời hạn khóa 2 chiều (giữ số) là 30 ngày. Hết thời hạn này, nếu thuê bao không nạp tiền thì thuê bao sẽ bị cắt hủy khỏi hệ thống.",
                  ].map((item, i) => (
                     <li key={i} className="flex gap-2 leading-relaxed text-primary">
                        <span className="mt-1 shrink-0">•</span>
                        <span>{item}</span>
                     </li>
                  ))}
               </ul>
            </SubSection>

            <SubSection title="III. Giá cước">
               <p className="font-semibold mb-2 text-primary">1. Giá cước hòa mạng</p>
               <p className="leading-relaxed mb-4 text-primary">
                  Cước hòa mạng thuê bao trả trước: <strong>25.000 đồng/thuê bao</strong> (theo quy định tại Thông tư 14/2012/TT-BTTTT ngày 12 tháng 10 năm 2012 của Bộ Thông tin và Truyền thông).
               </p>

               <p className="font-semibold mb-2 text-primary">2. Giá cước thông tin</p>
               <p className="font-semibold mb-2 text-primary">2.1. Giá cước Thoại và SMS</p>

               <div className="rounded-lg overflow-hidden border border-neutral mb-4">
                  <div className="grid grid-cols-4 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                     <span>Nội dung</span>
                     <span>InZone</span>
                     <span>OutZone</span>
                     <span>Ghi chú</span>
                  </div>
                  {[
                     {
                        nd: "Gọi nội mạng/liên mạng trong nước",
                        inzone: "690đ/phút (6s đầu: 69đ, 1s tiếp: 11,5đ)",
                        outzone: "1.880đ/phút (6s đầu: 188đ, 1s tiếp: 31,33đ)",
                        note: "Block 6s + 1s",
                     },
                     {
                        nd: "Nhắn tin SMS nội mạng/liên mạng",
                        inzone: "250đ/SMS",
                        outzone: "250đ/SMS",
                        note: "Áp dụng trong nước",
                     },
                  ].map((row, i) => (
                     <div key={i} className="grid grid-cols-4 px-4 py-3 border-b border-neutral last:border-b-0 gap-2">
                        <span className="text-primary">{row.nd}</span>
                        <span className="text-primary">{row.inzone}</span>
                        <span className="text-primary">{row.outzone}</span>
                        <span className="text-neutral-darker">{row.note}</span>
                     </div>
                  ))}
               </div>

               <div className="rounded-lg p-4 bg-neutral-light-active border border-neutral mb-4">
                  <p className="font-semibold mb-2 text-primary">Giải thích InZone / OutZone</p>
                  <ul className="space-y-1">
                     {[
                        "InZone: Thuê bao liên lạc với số thuê bao phát sinh cuộc gọi và thuê bao nhận cuộc gọi trong vùng đăng ký của thuê bao gọi đi.",
                        "OutZone: Với các trường hợp còn lại (bao gồm chuyển vùng trong nước với VinaPhone, gọi video call, số tắt như taxi, Vietnam Airlines...).",
                        "Phạm vi Zone tính trong phạm vi 1 tỉnh/thành phố với 63/63 tỉnh thành tại Việt Nam.",
                     ].map((item, i) => (
                        <li key={i} className="flex gap-2 leading-relaxed text-neutral-darker">
                           <span className="mt-1 shrink-0">•</span>
                           <span>{item}</span>
                        </li>
                     ))}
                  </ul>
               </div>

               <p className="font-semibold mb-2 text-primary">Cú pháp đăng ký / kiểm tra / thay đổi vùng Zone:</p>
               <div className="rounded-lg overflow-hidden border border-neutral mb-4">
                  <div className="grid grid-cols-4 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                     <span>Nghiệp vụ</span>
                     <span>Cú pháp</span>
                     <span>Đầu số</span>
                     <span>Cước phí</span>
                  </div>
                  {[
                     { nv: "Đăng ký vùng", cp: "DK_FPT_Tên tỉnh", ds: "9199", fee: "Miễn phí" },
                     { nv: "Kiểm tra vùng", cp: "KT_FPT", ds: "9199", fee: "Miễn phí" },
                     { nv: "Chuyển vùng lần đầu sau kích hoạt", cp: "DOI_FPT_Tên tỉnh", ds: "9199", fee: "Miễn phí" },
                     { nv: "Chuyển vùng từ lần 2 trở đi", cp: "DOI_FPT_Tên tỉnh", ds: "9199", fee: "20.000đ/lần" },
                  ].map((row, i) => (
                     <div key={i} className="grid grid-cols-4 px-4 py-3 border-b border-neutral last:border-b-0">
                        <span className="text-primary">{row.nv}</span>
                        <span className="font-semibold text-promotion">{row.cp}</span>
                        <span className="text-primary">{row.ds}</span>
                        <span className="text-primary">{row.fee}</span>
                     </div>
                  ))}
               </div>

               <p className="font-semibold mb-2 text-primary">2.2. Giá cước Data</p>
               <p className="leading-relaxed mb-4 text-primary">
                  Giá cước đối với thuê bao không có gói cước hoặc gói cước hết thời gian sử dụng: <strong>75 đồng/50KB</strong>. Trường hợp thuê bao đăng ký gói cước, áp dụng theo quy định cụ thể của từng gói cước. Để xem chi tiết các gói cước, vui lòng liên hệ hotline <strong>1800.6060</strong> hoặc <strong>1800.6626</strong>.
               </p>

               <p className="font-semibold mb-2 text-primary">3. Nguyên tắc tính cước</p>
               <div className="space-y-3">
                  <SubSection title="3.1. Nguyên tắc tính cước Thoại">
                     <ul className="space-y-1">
                        {[
                           "Tính cước cuộc gọi theo block 6 giây + block 1 giây, bắt đầu từ giây đầu tiên.",
                           "Cuộc gọi nội mạng: khi thuê bao di động ChoCongNghe gọi đến thuê bao khác cũng thuộc mạng ChoCongNghe và mạng MobiFone.",
                           "Cuộc gọi liên mạng: khi thuê bao di động ChoCongNghe gọi đến thuê bao di động, cố định thuộc các mạng viễn thông khác.",
                           "Nguyên tắc làm tròn: phần lẻ <5 làm tròn xuống 0; ≥5 làm tròn lên 1. Cước phát sinh làm tròn theo tổng số tiền của từng cuộc gọi/tin nhắn/giao dịch.",
                        ].map((item, i) => (
                           <li key={i} className="flex gap-2 leading-relaxed text-neutral-darker">
                              <span className="mt-1 shrink-0">•</span>
                              <span>{item}</span>
                           </li>
                        ))}
                     </ul>
                  </SubSection>
                  <SubSection title="3.2. Nguyên tắc tính cước SMS">
                     <ul className="space-y-1">
                        {[
                           "Khi tin nhắn gửi thành công đến trung tâm tin nhắn của nhà mạng (SMSC), thuê bao trừ tiền vào tài khoản thưởng trước (nếu có), sau đó trừ tài khoản chính.",
                           "SMS nội mạng: áp dụng cho tin nhắn từ thuê bao mạng ChoCongNghe đến thuê bao thuộc mạng ChoCongNghe, MobiFone, Saymee và các mạng MVNO hợp tác với MobiFone.",
                           "SMS liên mạng: áp dụng cho tin nhắn đến thuê bao các mạng điện thoại khác.",
                        ].map((item, i) => (
                           <li key={i} className="flex gap-2 leading-relaxed text-neutral-darker">
                              <span className="mt-1 shrink-0">•</span>
                              <span>{item}</span>
                           </li>
                        ))}
                     </ul>
                  </SubSection>
                  <SubSection title="3.3. Nguyên tắc tính cước Data">
                     <ul className="space-y-1">
                        {[
                           "Thuê bao truy nhập Internet trừ tiền vào tài khoản chính theo dung lượng sử dụng và theo quy định của từng gói cước.",
                           "Dung lượng sử dụng được tính trên tổng dung lượng download và upload.",
                        ].map((item, i) => (
                           <li key={i} className="flex gap-2 leading-relaxed text-neutral-darker">
                              <span className="mt-1 shrink-0">•</span>
                              <span>{item}</span>
                           </li>
                        ))}
                     </ul>
                  </SubSection>
               </div>
            </SubSection>

            <SubSection title="IV. Quy định các gói cước">
               <p className="leading-relaxed text-primary">
                  Để xem chi tiết danh sách các gói cước hiện hành, Quý khách vui lòng liên hệ nhân viên tại cửa hàng ChoCongNghe hoặc gọi hotline <strong>1800.6060</strong>.
               </p>
            </SubSection>

            <SubSection title="V. Các dịch vụ giá trị gia tăng">
               <p className="font-semibold mb-2 text-primary">1. Dịch vụ Nhạc chuông chờ – Funring</p>
               <p className="leading-relaxed mb-3 text-primary">
                  FunRing là dịch vụ nhạc chờ dành cho thuê bao ChoCongNghe. Khi thuê bao khác gọi đến, thuê bao gọi đến sẽ được nghe những bản nhạc chờ do khách hàng lựa chọn.
               </p>
               <div className="rounded-lg overflow-hidden border border-neutral mb-5">
                  <div className="grid grid-cols-3 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                     <span>Thực hiện</span>
                     <span>Cách đăng ký</span>
                     <span>Lưu ý</span>
                  </div>
                  {[
                     { action: "Đăng ký", syntax: "Soạn DK gửi 9224 (12.000đ/30 ngày)\nhoặc DKY 1 gửi 9224 (1.000đ/ngày)", note: "Được miễn phí 1 bản nhạc chờ mặc định do hệ thống lựa chọn (nhạc không lời)" },
                     { action: "Tải nhạc chờ", syntax: "Soạn CHON_<Mã bài hát> gửi 9224", note: "Nhạc chờ được phát mặc định là nhạc chờ cuối cùng tải về" },
                     { action: "Hủy dịch vụ", syntax: "Soạn HUY gửi 9224", note: "Dịch vụ Funring hủy, tất cả bài hát trong thư viện nhạc chờ tự động xóa" },
                  ].map((row, i) => (
                     <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-neutral last:border-b-0 gap-2">
                        <span className="font-semibold text-primary">{row.action}</span>
                        <span className="font-semibold text-promotion whitespace-pre-line">{row.syntax}</span>
                        <span className="text-neutral-darker">{row.note}</span>
                     </div>
                  ))}
               </div>

               <p className="font-semibold mb-2 text-primary">2. Dịch vụ Thông báo cuộc gọi nhỡ – MCA</p>
               <p className="leading-relaxed mb-3 text-primary">
                  Dịch vụ MCA giúp khách hàng biết thông tin về các cuộc gọi nhỡ khi điện thoại đang tắt máy, hết pin hoặc ngoài vùng phủ sóng.
               </p>
               <div className="rounded-lg overflow-hidden border border-neutral mb-5">
                  <div className="grid grid-cols-4 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                     <span>Cách đăng ký</span>
                     <span>Mức cước</span>
                     <span>Thời gian</span>
                     <span>Cách hủy</span>
                  </div>
                  {[
                     { reg: "DK MCAP7 gửi 9232", fee: "2.500đ", time: "7 ngày", cancel: "HUY gửi 9232" },
                     { reg: "DK MCAP gửi 9232", fee: "9.000đ", time: "30 ngày", cancel: "HUY gửi 9232" },
                  ].map((row, i) => (
                     <div key={i} className="grid grid-cols-4 px-4 py-3 border-b border-neutral last:border-b-0">
                        <span className="font-semibold text-promotion">{row.reg}</span>
                        <span className="text-primary">{row.fee}</span>
                        <span className="text-primary">{row.time}</span>
                        <span className="font-semibold text-promotion">{row.cancel}</span>
                     </div>
                  ))}
               </div>
            </SubSection>

            <SubSection title="VI. Dịch vụ quốc tế">
               <p className="font-semibold mb-2 text-primary">1. Dịch vụ Thoại/SMS quốc tế</p>
               <ul className="space-y-2 mb-4">
                  {[
                     <>Gọi thoại quốc tế – Cách 1 (IDD): <strong>00 + Mã nước + Mã vùng + SĐT</strong></>,
                     <>Gọi thoại quốc tế – Cách 2 (VOIP 131): <strong>131 + 00 + Mã nước + Mã vùng + SĐT</strong></>,
                     <>Nhắn tin SMS quốc tế: <strong>00 + Mã nước + Mã vùng + SĐT</strong> (tối đa 160 ký tự không dấu / 70 ký tự có dấu, giá 2.500đ/SMS)</>,
                  ].map((item, i) => (
                     <li key={i} className="flex gap-2 leading-relaxed text-primary">
                        <span className="mt-1 shrink-0">•</span>
                        <span>{item}</span>
                     </li>
                  ))}
               </ul>

               <p className="font-semibold mb-2 text-primary">2. Dịch vụ chuyển vùng quốc tế (CVQT)</p>
               <div className="space-y-3 mb-4">
                  <div className="pl-4 border-l-[3px] border-promotion">
                     <p className="font-semibold mb-1 text-neutral-darker">Bước 1: Đăng ký CVQT</p>
                     <p className="text-primary">→ Chỉ Thoại & SMS: <strong>DK CVQT</strong> gửi 9199 hoặc bấm <strong>*093*1*1#</strong></p>
                     <p className="text-primary">→ Thoại, SMS & Data: <strong>DK CVQT ALL</strong> gửi 9199 hoặc bấm <strong>*093*2*1#</strong></p>
                  </div>
                  <div className="pl-4 border-l-[3px] border-promotion">
                     <p className="font-semibold mb-1 text-neutral-darker">Bước 2: Bật Data Roaming trên điện thoại</p>
                     <p className="text-primary">→ iOS: Settings → Cellular Data Option → Roaming ON → Data Roaming ON</p>
                     <p className="text-primary">→ Android: Settings → Connections → Mobile Networks → Access Point Names → Roaming ON</p>
                  </div>
                  <div className="pl-4 border-l-[3px] border-promotion">
                     <p className="font-semibold mb-1 text-neutral-darker">Bước 3: Đăng ký gói cước quốc tế</p>
                     <p className="text-primary">→ Soạn <strong>DK [Tên gói]</strong> gửi 9199. Để xem danh sách gói cước CVQT, vui lòng liên hệ hotline <strong>1800.6060</strong>.</p>
                  </div>
                  <div className="pl-4 border-l-[3px] border-promotion">
                     <p className="font-semibold mb-1 text-neutral-darker">Hủy dịch vụ CVQT</p>
                     <p className="text-primary">→ Hủy Data: <strong>HUY CVQT DATA</strong> gửi 9199</p>
                     <p className="text-primary">→ Hủy toàn bộ: <strong>HUY CVQT ALL</strong> gửi 9199 hoặc bấm <strong>*093*2*2#</strong></p>
                  </div>
               </div>
            </SubSection>
         </Section>

         <Divider />

         {/* C */}
         <Section title="C. CÔNG BỐ CHẤT LƯỢNG DỊCH VỤ">
            <SubSection title="I. Dịch vụ được cung cấp">
               <div className="rounded-lg overflow-hidden border border-neutral mb-4">
                  <div className="grid grid-cols-3 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                     <span>STT</span>
                     <span>Dịch vụ</span>
                     <span>Địa bàn</span>
                  </div>
                  {[
                     "Dịch vụ điện thoại trên mạng viễn thông di động mặt đất",
                     "Dịch vụ tin nhắn ngắn trên mạng viễn thông di động mặt đất",
                     "Dịch vụ truy cập Internet trên mạng viễn thông di động mặt đất",
                  ].map((dv, i) => (
                     <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-neutral last:border-b-0">
                        <span className="text-primary">{i + 1}</span>
                        <span className="text-primary">{dv}</span>
                        <span className="text-primary">Toàn Quốc</span>
                     </div>
                  ))}
               </div>
            </SubSection>

            <SubSection title="II. Quy chuẩn kỹ thuật áp dụng">
               <ul className="space-y-2">
                  {[
                     "QCVN 36:2022/BTTTT – Quy chuẩn kỹ thuật quốc gia về dịch vụ điện thoại trên mạng thông tin di động mặt đất.",
                     "QCVN 81:2019/BTTTT – Quy chuẩn kỹ thuật quốc gia về dịch vụ truy nhập Internet trên mạng viễn thông di động mặt đất.",
                     "QCVN 82:2014/BTTTT – Quy chuẩn kỹ thuật quốc gia về dịch vụ tin nhắn ngắn trên mạng thông tin di động mặt đất.",
                  ].map((item, i) => (
                     <li key={i} className="flex gap-2 leading-relaxed text-primary">
                        <span className="mt-1 shrink-0">•</span>
                        <span>{item}</span>
                     </li>
                  ))}
               </ul>
            </SubSection>

            <SubSection title="III. Báo cáo định kỳ về chất lượng">
               <p className="leading-relaxed mb-3 text-primary">
                  Để xem báo cáo định kỳ chất lượng dịch vụ thoại và Internet, Quý khách vui lòng liên hệ trực tiếp tại cửa hàng ChoCongNghe gần nhất hoặc gọi hotline <strong>1800.6060</strong> để được cung cấp thông tin chi tiết theo từng quý.
               </p>
               <div className="rounded-lg p-4 bg-neutral-light-active border border-neutral">
                  <p className="font-semibold mb-2 text-primary">Các quý có sẵn báo cáo:</p>
                  <p className="text-neutral-darker">Quý I, II, III, IV năm 2024 và Quý I, II, III, IV năm 2025 (Dịch vụ thoại & Dịch vụ Internet).</p>
               </div>
            </SubSection>
         </Section>

         <Divider />

         {/* D */}
         <Section title="D. QUY TRÌNH GIAO KẾT HỢP ĐỒNG THEO MẪU">
            <SubSection title="I. Thủ tục đăng ký thông tin thuê bao trả trước">
               <p className="font-semibold mb-2 text-primary">1. Thuê bao là cá nhân</p>
               <ul className="space-y-2 mb-4">
                  {[
                     "Giấy tờ tùy thân bản chính (CMND, CCCD hoặc Hộ chiếu còn hiệu lực đối với người Việt Nam; Hộ chiếu còn hiệu lực lưu hành tại Việt Nam đối với người nước ngoài).",
                     "Đối với người dưới 14 tuổi hoặc người được giám hộ, việc giao kết hợp đồng phải do cha, mẹ hoặc người giám hộ thực hiện.",
                     "Lưu ý: Mỗi cá nhân được hòa mạng tối đa 09 thuê bao/giấy tờ.",
                  ].map((item, i) => (
                     <li key={i} className="flex gap-2 leading-relaxed text-primary">
                        <span className="mt-1 shrink-0">•</span>
                        <span>{item}</span>
                     </li>
                  ))}
               </ul>
               <p className="font-semibold mb-2 text-primary">2. Thuê bao là tổ chức</p>
               <ul className="space-y-2">
                  {[
                     "Giấy tờ chứng nhận pháp nhân (bản chính hoặc bản sao chứng thực): Quyết định thành lập, Giấy chứng nhận đăng ký kinh doanh, Giấy phép đầu tư hoặc Giấy chứng nhận đăng ký doanh nghiệp.",
                     "Danh sách các cá nhân thuộc tổ chức được phép sử dụng dịch vụ (có xác nhận hợp pháp, ký bởi Người đại diện theo pháp luật và đóng dấu của tổ chức), kèm theo bản chính giấy tờ tùy thân của từng cá nhân.",
                     "Văn bản ủy quyền hợp pháp và giấy tờ tùy thân của người đại diện (nếu người đến giao kết không phải Người đại diện theo pháp luật).",
                  ].map((item, i) => (
                     <li key={i} className="flex gap-2 leading-relaxed text-primary">
                        <span className="mt-1 shrink-0">•</span>
                        <span>{item}</span>
                     </li>
                  ))}
               </ul>
            </SubSection>

            <SubSection title="II. Quy trình giao kết">
               <ol className="space-y-3">
                  {[
                     "Khách hàng đến Điểm cung cấp dịch vụ viễn thông (ĐCCDV), cung cấp các giấy tờ cần thiết.",
                     "ĐCCDV kiểm tra, đối chiếu giấy tờ và nhập đầy đủ, chính xác thông tin thuê bao theo quy định.",
                     "ĐCCDV chụp và lưu bản số hóa toàn bộ giấy tờ và ảnh chụp người đến giao kết.",
                     "Khách hàng ký xác nhận vào Hợp đồng cung cấp và sử dụng dịch vụ viễn thông di động mặt đất hình thức trả trước.",
                     "ĐCCDV đăng ký thông tin thuê bao lên hệ thống và truyền hồ sơ số hóa về cơ sở dữ liệu tập trung.",
                     "Kích hoạt thuê bao.",
                  ].map((step, i) => (
                     <li key={i} className="flex items-start gap-3 text-primary">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-promotion text-white mt-0.5">
                           {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                     </li>
                  ))}
               </ol>
            </SubSection>
         </Section>

         <Divider />

         {/* E */}
         <Section title="E. QUY TRÌNH TIẾP NHẬN VÀ GIẢI QUYẾT KHIẾU NẠI">
            <SubSection title="Điều 1: Cơ chế giải quyết">
               <p className="leading-relaxed text-primary">
                  Trong trường hợp xảy ra sự cố do lỗi, chúng tôi sẽ ngay lập tức áp dụng các biện pháp cần thiết để đảm bảo quyền lợi cho khách hàng.
               </p>
            </SubSection>
            <SubSection title="Điều 2: Phương thức gửi phản ánh">
               <ul className="space-y-2">
                  {[
                     <>Gọi điện thoại tới hotline: <strong>1800.6060</strong> hoặc <strong>1800.6626</strong></>,
                     <>Gửi email tới: <strong>chocongnghe@chocongnghe.vn</strong></>,
                     <>Qua website: <strong>chocongnghe.vn</strong></>,
                     "Văn bản, đơn thư gửi trực tiếp tại cửa hàng ChoCongNghe gần nhất.",
                  ].map((item, i) => (
                     <li key={i} className="flex gap-2 leading-relaxed text-primary">
                        <span className="mt-1 shrink-0">•</span>
                        <span>{item}</span>
                     </li>
                  ))}
               </ul>
            </SubSection>
            <SubSection title="Điều 3: Trình tự thực hiện">
               <ol className="space-y-3">
                  {[
                     { title: "Gửi phản ánh", desc: "Khách hàng gửi phản ánh về dịch vụ hoặc quyền lợi chưa được đảm bảo đầy đủ tới ChoCongNghe qua các phương thức nêu trên." },
                     { title: "Tiếp nhận và xử lý", desc: "ChoCongNghe sẽ tiếp nhận phản ánh và tiến hành xác minh thông tin." },
                     { title: "Phản hồi tới khách hàng", desc: "ChoCongNghe sẽ phản hồi kết quả xử lý trong thời hạn 7 – 10 ngày làm việc kể từ ngày xác minh, xử lý thông tin được hoàn thành." },
                  ].map((step, i) => (
                     <li key={i} className="flex items-start gap-3 text-primary">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-promotion text-white mt-0.5">
                           {i + 1}
                        </span>
                        <div>
                           <p className="font-semibold">{step.title}</p>
                           <p className="leading-relaxed text-neutral-darker">{step.desc}</p>
                        </div>
                     </li>
                  ))}
               </ol>
            </SubSection>
         </Section>

         <Divider />

         {/* F & G */}
         <Section title="F. DANH SÁCH ĐIỂM CUNG CẤP DỊCH VỤ VIỄN THÔNG">
            <p className="leading-relaxed text-primary">
               Quý khách có thể tìm cửa hàng ChoCongNghe gần nhất bằng cách liên hệ hotline <strong>1800.6060</strong> hoặc truy cập website <strong>chocongnghe.vn</strong> mục "Hệ thống cửa hàng".
            </p>
         </Section>

         <Divider />

         <Section title="G. ĐIỀU KIỆN GIAO DỊCH CHUNG">
            <p className="leading-relaxed text-primary">
               Điều kiện giao dịch chung đối với dịch vụ viễn thông di động mặt đất hình thức trả trước được cung cấp tại cửa hàng ChoCongNghe và trên website <strong>chocongnghe.vn</strong>. Quý khách vui lòng liên hệ hotline <strong>1800.6060</strong> hoặc nhân viên cửa hàng để được tư vấn chi tiết.
            </p>
         </Section>
      </>
   );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
   return (
      <section className="mb-6">
         <h2 className="font-bold mb-4 text-primary">{title}</h2>
         <div className="space-y-4">{children}</div>
      </section>
   );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
   return (
      <div className="mb-4">
         <h3 className="font-semibold mb-3 text-primary">{title}</h3>
         {children}
      </div>
   );
}

function Divider() {
   return <hr className="my-6 border-neutral" />;
}