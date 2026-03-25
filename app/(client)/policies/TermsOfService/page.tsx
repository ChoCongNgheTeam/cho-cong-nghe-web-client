"use client";

export default function TermsOfServicePage() {
   return (
      <>
         <h1 className="font-bold mb-5 text-primary text-center">
            Quy chế hoạt động website cung cấp dịch vụ thương mại điện tử ChoCongNghe
         </h1>

         <Section title="I. Nguyên tắc chung">
            <ul className="space-y-2">
               {[
                  "Website thương mại điện tử ChoCongNghe do Công ty Cổ Phần ChoCongNghe thực hiện hoạt động và vận hành. Đối tượng phục vụ là tất cả khách hàng trên 63 tỉnh thành Việt Nam có nhu cầu mua hàng nhưng không có thời gian đến shop hoặc đặt trước để khi đến shop là đảm bảo có hàng.",
                  "Sản phẩm được kinh doanh tại ChoCongNghe phải đáp ứng đầy đủ các quy định của pháp luật, không bán hàng nhái, hàng không rõ nguồn gốc, hàng xách tay.",
                  "Hoạt động mua bán tại ChoCongNghe phải được thực hiện công khai, minh bạch, đảm bảo quyền lợi của người tiêu dùng.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>
         </Section>

         <Divider />

         <Section title="II. Quy định chung">
            <div className="space-y-4">
               <div>
                  <p className="font-semibold mb-2 text-primary">Tên miền website thương mại điện tử:</p>
                  <p className="leading-relaxed text-primary">
                     Website thương mại điện tử ChoCongNghe do Công ty Cổ phần ChoCongNghe phát triển với tên miền giao dịch là: <strong>chocongnghe.vn</strong>
                  </p>
               </div>
               <div>
                  <p className="font-semibold mb-2 text-primary">Định nghĩa chung:</p>
                  <ul className="space-y-2">
                     {[
                        <><strong>Người bán</strong> là Công ty Cổ phần ChoCongNghe.</>,
                        <><strong>Người mua</strong> là công dân Việt Nam trên khắp 63 tỉnh thành. Người mua có quyền đăng ký tài khoản hoặc không cần đăng ký để thực hiện giao dịch.</>,
                        <><strong>Thành viên</strong> là bao gồm cả người mua và người tham khảo thông tin, thảo luận tại website.</>,
                        "Nội dung bản Quy chế này tuân thủ theo các quy định hiện hành của Việt Nam. Thành viên khi tham gia website phải tự tìm hiểu trách nhiệm pháp lý của mình đối với luật pháp hiện hành của Việt Nam và cam kết thực hiện đúng những nội dung trong Quy chế này.",
                     ].map((item, i) => (
                        <li key={i} className="flex gap-2 leading-relaxed text-primary">
                           <span className="mt-1 shrink-0">•</span>
                           <span>{item}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </Section>

         <Divider />

         <Section title="III. Quy trình giao dịch">
            <p className="font-semibold mb-3 text-primary">Dành cho người mua hàng tại website:</p>
            <ol className="space-y-3 mb-6">
               {[
                  "Tìm kiếm và chọn sản phẩm cần mua.",
                  <>Xem giá và thông tin chi tiết sản phẩm. Nếu đồng ý, ấn vào một trong các nút: <strong>Mua ngay</strong>, <strong>Trả góp 0%</strong>, hoặc <strong>Trả góp qua thẻ</strong>.</>,
                  <>Điền đầy đủ thông tin: Họ tên, Số điện thoại, Email. Chọn phương thức nhận hàng (tại cửa hàng hoặc giao hàng tận nơi). Chọn phương thức thanh toán (Tiền mặt, Thẻ ATM, Thẻ Quốc tế, Trả góp).</>,
                  <>Sau khi nhập đầy đủ thông tin, click <strong>"Đặt hàng"</strong> để hoàn tất.</>,
                  "Sau khi nhận đơn hàng, ChoCongNghe sẽ liên lạc với khách hàng qua số điện thoại đã cung cấp để xác thực thông tin đơn hàng.",
                  "ChoCongNghe giao hàng tận nhà hoặc khách hàng đến trực tiếp các cửa hàng trên toàn quốc để nhận hàng.",
               ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-primary">
                     <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent mt-0.5">
                        {i + 1}
                     </span>
                     <span className="leading-relaxed">{step}</span>
                  </li>
               ))}
            </ol>

            <p className="font-semibold mb-3 text-primary">Quy trình giao nhận vận chuyển:</p>
            <ul className="space-y-2 mb-5">
               {[
                  "ChoCongNghe thực hiện giao hàng trên toàn quốc sau khi xác nhận thông tin mua hàng qua điện thoại.",
                  "Giữ hàng tại các cửa hàng ChoCongNghe trên toàn quốc để khách đến nhận trực tiếp.",
                  "Giao hàng tận nơi trên toàn bộ 63 tỉnh thành.",
                  "Thời gian giao: trước 21h00 đối với Điện thoại, Máy tính bảng; trước 20h00 đối với Máy tính xách tay.",
                  "Miễn phí giao hàng trong bán kính 20km có đặt shop.",
                  "Với khoảng cách lớn hơn 20km, nhân viên ChoCongNghe sẽ tư vấn chi tiết về cách thức giao nhận thuận tiện nhất.",
                  "Đơn hàng giao tại nhà có giá trị từ 50 triệu đồng trở lên: Quý khách vui lòng thanh toán trước 100% giá trị đơn hàng.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>

            <p className="font-semibold mb-3 text-primary">Quy trình bảo hành / đổi trả sản phẩm:</p>

            <SubTitle>I. Sản phẩm mới: Apple, ĐTDĐ, MTB, MTXT, Smartwatch, Màn hình LCD Samsung</SubTitle>
            <div className="rounded-lg overflow-hidden border border-neutral overflow-x-auto">
               <div className="min-w-[520px]">
               <div className="grid grid-cols-3 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                  <span>Trường hợp</span>
                  <span>Tháng 1</span>
                  <span>Tháng 2–12</span>
               </div>
               {[
                  {
                     case: "Sản phẩm lỗi do NSX",
                     m1: "1 đổi 1 cùng model, màu, dung lượng. Nếu hết hàng: đổi sản phẩm tương đương/cao hơn hoặc trả hàng.",
                     m2: "Gửi bảo hành theo quy định hãng. Khách có thể đổi hoặc trả sản phẩm với mức phí thông báo tại cửa hàng.",
                  },
                  {
                     case: "Sản phẩm không lỗi",
                     m1: "Đổi sang sản phẩm khác hoặc trả hàng với phí thông báo tại cửa hàng.",
                     m2: "Không áp dụng đổi trả.",
                  },
                  {
                     case: "Lỗi do người sử dụng",
                     m1: "Không áp dụng đổi trả nếu máy bị va chạm, cấn móp, vào nước hoặc không đủ điều kiện BH hãng. ChoCongNghe hỗ trợ chuyển TTBH, khách chịu phí sửa chữa.",
                     m2: "Không áp dụng đổi trả.",
                  },
               ].map((row, i) => (
                  <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-neutral last:border-b-0 gap-2">
                     <span className="font-semibold text-accent">{row.case}</span>
                     <span className="text-neutral-darker leading-relaxed">{row.m1}</span>
                     <span className="text-neutral-darker leading-relaxed">{row.m2}</span>
                  </div>
               ))}
               </div>
            </div>

            <div className="rounded-lg p-4 bg-neutral-light-active border border-neutral mb-5">
               <p className="font-semibold mb-1 text-primary">Lưu ý với sản phẩm mua trả góp:</p>
               <ul className="space-y-1">
                  {[
                     "Trong 14 ngày đầu tiên: khách hàng huỷ hợp đồng và không phải chịu bất kỳ khoản chi phí trả góp nào.",
                     "Sau 14 ngày: khách hàng phải thanh lý hợp đồng và chịu phí theo từng công ty trả góp.",
                  ].map((item, i) => (
                     <li key={i} className="flex gap-2 leading-relaxed text-neutral-darker">
                        <span className="mt-1 shrink-0">•</span>
                        <span>{item}</span>
                     </li>
                  ))}
               </ul>
            </div>

            <SubTitle>II. Sản phẩm đã qua sử dụng: ĐTDĐ, MTB, MTXT, Smartwatch (bao gồm Apple)</SubTitle>
            <div className="rounded-lg overflow-hidden border border-neutral overflow-x-auto">
               <div className="min-w-[520px]">
               <div className="grid grid-cols-3 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                  <span>Trường hợp</span>
                  <span>Tháng 1</span>
                  <span>Tháng 2–12</span>
               </div>
               {[
                  {
                     case: "Lỗi do NSX",
                     m1: "Miễn phí đổi sản phẩm tương đương (cùng model, dung lượng, thời gian BH). Không có sản phẩm tương đương: hoàn tiền 100%.",
                     m2: "Gửi bảo hành theo chính sách hãng hoặc ChoCongNghe.",
                  },
                  {
                     case: "Sản phẩm không lỗi",
                     m1: "Không áp dụng đổi trả.",
                     m2: "Không áp dụng đổi trả.",
                  },
                  {
                     case: "Lỗi do người sử dụng",
                     m1: "Không áp dụng. ChoCongNghe hỗ trợ chuyển TTBH, khách chịu phí sửa chữa.",
                     m2: "Không áp dụng.",
                  },
               ].map((row, i) => (
                  <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-neutral last:border-b-0 gap-2">
                     <span className="font-semibold text-accent">{row.case}</span>
                     <span className="text-neutral-darker leading-relaxed">{row.m1}</span>
                     <span className="text-neutral-darker leading-relaxed">{row.m2}</span>
                  </div>
               ))}
               </div>
            </div>

            <SubTitle>III. Đồng hồ thời trang & Vòng đeo tay thông minh</SubTitle>
            <div className="rounded-lg overflow-hidden border border-neutral overflow-x-auto">
               <div className="min-w-[520px]">
               <div className="grid grid-cols-3 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                  <span>Trường hợp</span>
                  <span>Tháng 1</span>
                  <span>Từ tháng 2 đến hết BH</span>
               </div>
               {[
                  {
                     case: "Lỗi do NSX",
                     m1: "1 đổi 1 cùng model. Hoặc đổi model khác bằng/cao hơn, thanh toán thêm chênh lệch.",
                     m2: "Gửi BH theo hãng. Không sửa được / trễ hẹn (tối đa 30 ngày): đổi sản phẩm mới, thanh toán chênh lệch.",
                  },
                  {
                     case: "Sản phẩm không lỗi",
                     m1: "Không áp dụng.",
                     m2: "Không áp dụng.",
                  },
                  {
                     case: "Lỗi do người sử dụng",
                     m1: "ChoCongNghe hỗ trợ chuyển TTBH hãng sửa chữa (có tính phí).",
                     m2: "Có tính phí.",
                  },
               ].map((row, i) => (
                  <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-neutral last:border-b-0 gap-2">
                     <span className="font-semibold text-accent">{row.case}</span>
                     <span className="text-neutral-darker leading-relaxed">{row.m1}</span>
                     <span className="text-neutral-darker leading-relaxed">{row.m2}</span>
                  </div>
               ))}
               </div>
            </div>

            <p className="font-semibold mb-2 text-primary">Thời hạn bảo hành đồng hồ thời trang:</p>
            <div className="rounded-lg overflow-hidden border border-neutral overflow-x-auto">
               <div className="min-w-[520px]">
               <div className="grid grid-cols-3 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                  <span>Hãng</span>
                  <span>Bảo hành máy</span>
                  <span>Bảo hành pin</span>
               </div>
               {[
                  { brand: "Bulova", machine: "36 tháng", pin: "Trọn đời" },
                  { brand: "Ferrari, Tommy Hilfiger, Lascote, Daniel Klein, Free Look, Festina, Candino", machine: "24 tháng", pin: "Trọn đời" },
                  { brand: "Kitten-Kid, Nakzen, Rossini, SKmei, Sinobi, SK, Elle", machine: "12 tháng", pin: "Trọn đời" },
                  { brand: "Casio G-Shock, Casio Baby-G, Casio Cover", machine: "60 tháng", pin: "60 tháng" },
                  { brand: "Casio General, Casio Edifice", machine: "12 tháng", pin: "18 tháng" },
                  { brand: "Citizen", machine: "12 tháng", pin: "12 tháng" },
                  { brand: "Orient", machine: "12 tháng", pin: "Không bảo hành" },
               ].map((row, i) => (
                  <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-neutral last:border-b-0 gap-2">
                     <span className="text-primary">{row.brand}</span>
                     <span className="text-neutral-darker">{row.machine}</span>
                     <span className="text-neutral-darker">{row.pin}</span>
                  </div>
               ))}
               </div>
            </div>

            <SubTitle>IV. Máy in</SubTitle>
            <div className="rounded-lg overflow-hidden border border-neutral overflow-x-auto">
               <div className="min-w-[520px]">
               <div className="grid grid-cols-3 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                  <span>Trường hợp</span>
                  <span>Tháng 1</span>
                  <span>Từ tháng 2 đến hết BH</span>
               </div>
               {[
                  { case: "Lỗi do NSX", m1: "1 đổi 1 cùng mã (chỉ đổi máy, không đổi hộp mực).", m2: "Gửi bảo hành theo chính sách hãng." },
                  { case: "Sản phẩm không lỗi", m1: "Không áp dụng.", m2: "Không áp dụng." },
                  { case: "Lỗi do người sử dụng", m1: "Không áp dụng đổi trả/bảo hành. ChoCongNghe hỗ trợ chuyển TTBH hãng (có phí).", m2: "Không áp dụng." },
               ].map((row, i) => (
                  <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-neutral last:border-b-0 gap-2">
                     <span className="font-semibold text-accent">{row.case}</span>
                     <span className="text-neutral-darker leading-relaxed">{row.m1}</span>
                     <span className="text-neutral-darker leading-relaxed">{row.m2}</span>
                  </div>
               ))}
               </div>
            </div>
            <div className="rounded-lg p-4 bg-neutral-light-active border border-neutral mb-5">
               <p className="font-semibold mb-1 text-primary">Lưu ý máy in:</p>
               <li className="flex gap-2 leading-relaxed text-neutral-darker">
                  <span className="mt-1 shrink-0">•</span>
                  <span>Khi đổi máy in, KH phải trả cả vỏ hộp. Nếu thiếu vỏ hộp, chỉ áp dụng bảo hành, không đổi máy mới.</span>
               </li>
            </div>

            <SubTitle>V. Bảo hành phụ kiện</SubTitle>
            <div className="space-y-3 mb-5">
               {[
                  { label: "Bảo hành 1 năm 1 đổi 1", content: "Thẻ nhớ, USB, Chuột, Cáp, Sạc, Sạc dự phòng, Bàn phím, Đế tản nhiệt, Tai nghe (trừ Tai nghe JBL giá dưới 2,5 triệu), Thiết bị mạng, Ổ cứng, Loa (trừ Loa Harman Kardon), Loa Kéo-Karaoke, Loa JBL (trừ Loa JBL Studio BAR), Bộ phát wifi không dây, Đèn LED để bàn đa năng, Cân điện tử." },
                  { label: "Bảo hành 1 năm chính hãng", content: "Phụ kiện nhập khẩu chính hãng Apple, Loa JBL Studio BAR và Loa Harman Kardon." },
                  { label: "Bảo hành 6 tháng 1 đổi 1", content: "Mic hát karaoke, Quạt cầm tay, Tai nghe JBL giá dưới 2,5 triệu." },
                  { label: "Bảo hành 15 ngày 1 đổi 1", content: "Bao da và ốp lưng có giá từ 50.000đ (trừ Bao da, Ốp lưng chính hãng Samsung)." },
                  { label: "Không áp dụng bảo hành", content: "Ba lô, Túi xách, Túi chống sốc, Túi chống nước, Gậy chụp hình, Tay cầm chơi game, Bao da và ốp lưng nhập khẩu chính hãng Samsung." },
               ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                     <span className="font-bold shrink-0 text-accent">{item.label}:</span>
                     <span className="text-neutral-darker leading-relaxed">{item.content}</span>
                  </div>
               ))}
            </div>

            <SubTitle>VI. Đổi trả dịch vụ</SubTitle>
            <div className="space-y-2 mb-5">
               {[
                  { label: "Đầu thu kỹ thuật số FPT PlayBox", content: "30 ngày đầu: miễn phí 1 đổi 1 khi lỗi NSX. Tháng 2–12: chuyển TTBH NSX." },
                  { label: "Phần mềm dịch vụ (không bao gồm Microsoft)", content: "Hoàn tiền 100% trong 31 ngày đầu nếu không còn nhu cầu sử dụng." },
               ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                     <span className="font-bold shrink-0 text-accent">{item.label}:</span>
                     <span className="text-neutral-darker leading-relaxed">{item.content}</span>
                  </div>
               ))}
            </div>
            <div className="rounded-lg p-4 bg-neutral-light-active border border-neutral mb-5">
               <p className="font-semibold mb-2 text-primary">Phí đổi trả:</p>
               <ul className="space-y-1">
                  {[
                     "Mất vỏ hộp: thu phí 2% giá trên hóa đơn.",
                     "Mất phụ kiện đi kèm: thu phí 5% trên giá hóa đơn cho mỗi phụ kiện mất.",
                  ].map((item, i) => (
                     <li key={i} className="flex gap-2 leading-relaxed text-neutral-darker">
                        <span className="mt-1 shrink-0">•</span>
                        <span>{item}</span>
                     </li>
                  ))}
               </ul>
            </div>

            <p className="font-semibold mb-2 text-primary">Tiếp nhận khiếu nại:</p>
            <ul className="space-y-2">
               {[
                  <>Hotline: <strong>1800.6060</strong> hoặc <strong>1800.6626</strong></>,
                  "Tại website: mục liên hệ, bình luận khách hàng.",
                  "Email: chocongnghe@chocongnghe.vn",
                  "Trực tiếp tại các cửa hàng ChoCongNghe.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>
         </Section>

         <Divider />

         <Section title="IV. Quy trình thanh toán">
            <div className="space-y-4">
               {[
                  {
                     title: "Cách 1: Thanh toán trực tiếp tại cửa hàng",
                     steps: [
                        "Tìm hiểu thông tin về sản phẩm, dịch vụ.",
                        "Đến địa chỉ bán hàng là các cửa hàng ChoCongNghe.",
                        "Thanh toán bằng tiền mặt, thẻ ATM nội địa hoặc thẻ tín dụng và nhận hàng.",
                     ],
                  },
                  {
                     title: "Cách 2: Thanh toán sau – COD (giao hàng thu tiền tận nơi)",
                     steps: [
                        "Tìm hiểu thông tin sản phẩm.",
                        "Xác thực đơn hàng qua điện thoại, tin nhắn hoặc email.",
                        "ChoCongNghe xác nhận thông tin người mua.",
                        "ChoCongNghe chuyển hàng.",
                        "Người mua nhận hàng và thanh toán bằng tiền mặt hoặc thẻ.",
                     ],
                  },
                  {
                     title: "Cách 3: Thanh toán online qua thẻ tín dụng, chuyển khoản",
                     steps: [
                        "Tìm hiểu thông tin sản phẩm.",
                        "Xác thực đơn hàng qua điện thoại, tin nhắn hoặc email.",
                        "ChoCongNghe xác nhận thông tin người mua.",
                        "Người mua thanh toán online.",
                        "ChoCongNghe chuyển hàng.",
                        "Người mua nhận hàng.",
                     ],
                  },
               ].map((method, i) => (
                  <div key={i} className="pl-4 border-l-[3px] border-accent">
                     <p className="font-semibold mb-2 text-primary">{method.title}</p>
                     <ol className="space-y-1">
                        {method.steps.map((step, j) => (
                           <li key={j} className="flex items-start gap-2 text-neutral-darker">
                              <span className="shrink-0 font-semibold text-accent">–</span>
                              <span className="leading-relaxed">{step}</span>
                           </li>
                        ))}
                     </ol>
                  </div>
               ))}
            </div>
         </Section>

         <Divider />

         <Section title="V. Đảm bảo an toàn giao dịch">
            <ul className="space-y-2">
               {[
                  "Ban quản lý đã sử dụng các dịch vụ để bảo vệ thông tin nội dung đăng sản phẩm trên ChoCongNghe nhằm đảm bảo các giao dịch được tiến hành thành công, hạn chế tối đa rủi ro.",
                  "Người mua nên cung cấp thông tin đầy đủ (tên, địa chỉ, số điện thoại, email) để ChoCongNghe có thể liên hệ nhanh trong trường hợp xảy ra lỗi.",
                  "Với giao dịch nhận hàng tại nhà, người mua chỉ nên thanh toán sau khi đã kiểm tra hàng hoá chi tiết và hài lòng với sản phẩm.",
                  "Khi thanh toán trực tuyến bằng thẻ ATM nội địa, Visa, Master – người mua nên tự mình thực hiện và không để lộ thông tin thẻ. ChoCongNghe không lưu trữ thông tin thẻ sau khi thanh toán.",
                  "Trong trường hợp lỗi xảy ra trong quá trình thanh toán trực tuyến, ChoCongNghe sẽ giải quyết cho khách hàng trong vòng 1 giờ làm việc từ khi tiếp nhận thông tin.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>
         </Section>

         <Divider />

         <Section title="VI. Bảo vệ thông tin cá nhân khách hàng">
            <p className="leading-relaxed mb-4 text-primary">
               ChoCongNghe cam kết bảo mật thông tin riêng tư của Quý khách. Vui lòng đọc Chính sách bảo mật để hiểu hơn về các cam kết nhằm tôn trọng và bảo vệ quyền lợi của người truy cập.
            </p>
            <ul className="space-y-3">
               {[
                  { title: "Mục đích và phạm vi thu thập", content: "Thu thập thông tin cá nhân (Email, Họ tên, Số điện thoại) khi đăng ký dịch vụ. Thu thập số lần viếng thăm, số trang xem, địa chỉ IP, loại trình duyệt, ngôn ngữ sử dụng." },
                  { title: "Phạm vi sử dụng thông tin", content: "Sử dụng để liên hệ trực tiếp: gửi thư ngỏ, đơn đặt hàng, thư cảm ơn, SMS, thông tin kỹ thuật và bảo mật." },
                  { title: "Thời gian lưu trữ thông tin", content: "Dữ liệu cá nhân được lưu trữ cho đến khi có yêu cầu hủy bỏ hoặc thành viên tự đăng nhập và thực hiện hủy bỏ." },
                  { title: "Cam kết bảo mật", content: "Không sử dụng, chuyển giao, cung cấp hay tiết lộ cho bên thứ ba về thông tin cá nhân thành viên khi không có sự cho phép. Bảo mật tuyệt đối thông tin giao dịch trực tuyến." },
               ].map((item, i) => (
                  <li key={i} className="rounded-lg p-4 bg-neutral-light-active border border-neutral">
                     <p className="font-semibold mb-1 text-primary">{item.title}</p>
                     <p className="leading-relaxed text-neutral-darker">{item.content}</p>
                  </li>
               ))}
            </ul>
         </Section>

         <Divider />

         <Section title="VII. Quản lý thông tin">
            <ul className="space-y-2">
               {[
                  "Thành viên tự chịu trách nhiệm về bảo mật và lưu giữ mọi hoạt động sử dụng dịch vụ dưới tên đăng ký, mật khẩu của mình.",
                  "Thành viên có trách nhiệm thông báo kịp thời cho ChoCongNghe về những hành vi sử dụng trái phép, lạm dụng, vi phạm bảo mật.",
                  "Thành viên không được thay đổi, sao chép, phân phối các công cụ tương tự dịch vụ ChoCongNghe cung cấp cho bên thứ ba khi không được sự đồng ý.",
                  "Thành viên không được hành động gây mất uy tín của ChoCongNghe dưới mọi hình thức.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>
         </Section>

         <Divider />

         <Section title="VIII. Trách nhiệm khi phát sinh lỗi kỹ thuật">
            <ul className="space-y-2">
               {[
                  "ChoCongNghe cam kết nỗ lực đảm bảo sự an toàn và ổn định của toàn bộ hệ thống kỹ thuật.",
                  <>Khi phát sinh lỗi kỹ thuật, vui lòng thông báo qua hotline <strong>1800.6060</strong> hoặc <strong>1800.6626</strong> – chúng tôi sẽ khắc phục trong thời gian sớm nhất.</>,
                  "ChoCongNghe không chịu trách nhiệm trong trường hợp thông báo không đến được do lỗi kỹ thuật đường truyền nằm ngoài tầm kiểm soát.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>
         </Section>

         <Divider />

         <Section title="IX. Quyền và nghĩa vụ của Ban quản lý">
            <div className="space-y-4">
               <div>
                  <p className="font-semibold mb-2 text-primary">Quyền của Ban quản lý:</p>
                  <ul className="space-y-2">
                     {[
                        "Cung cấp các dịch vụ, sản phẩm cho khách hàng sau khi hoàn thành các thủ tục và điều kiện bắt buộc.",
                        "Xây dựng các chính sách dịch vụ và công bố trên ChoCongNghe.",
                        "Từ chối, tạm ngưng hoặc chấm dứt quyền sử dụng của thành viên khi có bằng chứng vi phạm hoặc cung cấp thông tin sai lệch.",
                        "Chấm dứt quyền thành viên nếu có hành vi lừa đảo, giả mạo, gây rối loạn thị trường hoặc vi phạm pháp luật.",
                     ].map((item, i) => (
                        <li key={i} className="flex gap-2 leading-relaxed text-primary">
                           <span className="mt-1 shrink-0">•</span>
                           <span>{item}</span>
                        </li>
                     ))}
                  </ul>
               </div>
               <div>
                  <p className="font-semibold mb-2 text-primary">Nghĩa vụ của Ban quản lý:</p>
                  <ul className="space-y-2">
                     {[
                        "Xây dựng và vận hành hệ thống dịch vụ đảm bảo an toàn, ổn định cho các giao dịch.",
                        "Không đăng tải thông tin sản phẩm thuộc danh mục hàng hóa cấm kinh doanh theo quy định pháp luật.",
                        "Cố gắng duy trì hoạt động bình thường và khắc phục các sự cố phát sinh trong phạm vi có thể.",
                     ].map((item, i) => (
                        <li key={i} className="flex gap-2 leading-relaxed text-primary">
                           <span className="mt-1 shrink-0">•</span>
                           <span>{item}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </Section>

         <Divider />

         <Section title="X. Quyền và trách nhiệm thành viên">
            <div className="space-y-4">
               <div>
                  <p className="font-semibold mb-2 text-primary">Quyền của thành viên:</p>
                  <ul className="space-y-2">
                     {[
                        "Được tham gia thảo luận, đánh giá sản phẩm, mua hàng tại ChoCongNghe.",
                        "Có quyền đóng góp ý kiến cho ChoCongNghe trong quá trình hoạt động.",
                     ].map((item, i) => (
                        <li key={i} className="flex gap-2 leading-relaxed text-primary">
                           <span className="mt-1 shrink-0">•</span>
                           <span>{item}</span>
                        </li>
                     ))}
                  </ul>
               </div>
               <div>
                  <p className="font-semibold mb-2 text-primary">Nghĩa vụ của thành viên:</p>
                  <ul className="space-y-2">
                     {[
                        "Tự chịu trách nhiệm về bảo mật tên đăng ký, mật khẩu và hộp thư điện tử của mình.",
                        "Cam kết thông tin cung cấp cho ChoCongNghe là chính xác.",
                        "Không sao chép, phân phối, tạo công cụ tương tự dịch vụ của ChoCongNghe khi chưa được phép.",
                        "Không hành động gây mất uy tín của ChoCongNghe dưới mọi hình thức.",
                     ].map((item, i) => (
                        <li key={i} className="flex gap-2 leading-relaxed text-primary">
                           <span className="mt-1 shrink-0">•</span>
                           <span>{item}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </Section>

         <Divider />

         <Section title="XI. Điều khoản áp dụng">
            <ul className="space-y-2">
               {[
                  "Mọi tranh chấp phát sinh giữa ChoCongNghe và thành viên sẽ được giải quyết trên cơ sở thương lượng. Trường hợp không đạt được thỏa thuận, một trong hai bên có quyền đưa vụ việc ra Tòa án nhân dân có thẩm quyền tại Thành phố Hồ Chí Minh.",
                  "Quy chế chính thức có hiệu lực kể từ ngày ký Quyết định ban hành. ChoCongNghe có quyền thay đổi Quy chế bằng cách thông báo lên website cho thành viên biết trước.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed text-primary">
                     <span className="mt-1 shrink-0">•</span>
                     <span>{item}</span>
                  </li>
               ))}
            </ul>
         </Section>

         <Divider />

         <Section title="XII. Thông tin liên hệ">
            <div className="space-y-2">
               {[
                  { label: "Công ty", value: "Công ty Cổ Phần ChoCongNghe" },
                  { label: "Website", value: "chocongnghe.vn" },
                  { label: "Hotline", value: "1800.6060 hoặc 1800.6626 (miễn phí)" },
                  { label: "Email", value: "chocongnghe@chocongnghe.vn" },
               ].map((row, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                     <span className="font-bold shrink-0 text-accent">{row.label}:</span>
                     <span className="text-primary">{row.value}</span>
                  </div>
               ))}
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