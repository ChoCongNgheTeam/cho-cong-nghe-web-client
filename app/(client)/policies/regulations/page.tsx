export default function OperatingRegulations() {
   return (
      <div className="text-primary leading-relaxed mb-10 w-full">
         <h1 className="text-[1.385em] font-bold text-primary text-center mb-7">
            Quy chế Hoạt động của ChoCongNghe Shop
         </h1>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">
               1. Mục đích và Phạm vi Hoạt động
            </h2>
            <p>
               ChoCongNghe Shop cung cấp các sản phẩm công nghệ chính hãng như
               điện thoại di động, máy tính bảng, laptop, phụ kiện và các mặt
               hàng điện máy, gia dụng. Website được xây dựng nhằm hỗ trợ khách
               hàng tìm kiếm thông tin sản phẩm, đặt hàng trực tuyến và sử dụng
               các dịch vụ hậu mãi một cách thuận tiện và nhanh chóng.
            </p>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">
               2. Đăng ký Tài khoản
            </h2>
            <ul className="space-y-2">
               {[
                  "Người dùng có thể đăng ký tài khoản để thực hiện các giao dịch mua sắm và sử dụng đầy đủ tiện ích trên website.",
                  "Thông tin cá nhân cung cấp phải chính xác, đầy đủ và được cập nhật khi có thay đổi.",
                  "Người dùng chịu trách nhiệm bảo mật thông tin đăng nhập của mình.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>{item}</p>
                  </li>
               ))}
            </ul>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">
               3. Quy trình Mua hàng
            </h2>
            <p className="mb-3">
               Khách hàng có thể thực hiện mua sắm theo các bước:
            </p>
            <ol className="space-y-2 mb-4">
               {[
                  "Duyệt và lựa chọn sản phẩm.",
                  "Thêm sản phẩm vào giỏ hàng.",
                  "Điền thông tin nhận hàng.",
                  "Chọn phương thức thanh toán và xác nhận đơn hàng.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2.5">
                     <span className="shrink-0 font-semibold text-accent">
                        {i + 1}.
                     </span>
                     <p>{item}</p>
                  </li>
               ))}
            </ol>
            <p className="mb-3">Các hình thức thanh toán có thể bao gồm:</p>
            <ul className="space-y-2">
               {[
                  "Thanh toán khi nhận hàng (COD)",
                  "Chuyển khoản ngân hàng",
                  "Thanh toán qua cổng thanh toán trực tuyến (nếu có)",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>{item}</p>
                  </li>
               ))}
            </ul>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">
               4. Chính sách Hoàn trả và Đổi hàng
            </h2>
            <ul className="space-y-2">
               {[
                  "Khách hàng có quyền yêu cầu đổi hoặc trả sản phẩm theo chính sách hiện hành của ChoCongNghe Shop.",
                  "Sản phẩm được chấp nhận đổi/trả khi còn nguyên vẹn, đầy đủ phụ kiện và trong thời gian quy định.",
                  "Trường hợp sản phẩm lỗi kỹ thuật, ChoCongNghe Shop sẽ hỗ trợ xử lý theo chính sách bảo hành.",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>{item}</p>
                  </li>
               ))}
            </ul>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">
               5. Bảo mật Thông tin
            </h2>
            <p className="mb-3">
               ChoCongNghe Shop cam kết bảo mật thông tin cá nhân của khách hàng
               theo quy định pháp luật. Các biện pháp bảo mật bao gồm nhưng
               không giới hạn:
            </p>
            <ul className="space-y-2 mb-3">
               {[
                  "Mã hóa dữ liệu",
                  "Kiểm soát truy cập hệ thống",
                  "Bảo vệ thông tin thanh toán",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>{item}</p>
                  </li>
               ))}
            </ul>
            <p>
               Thông tin khách hàng chỉ được sử dụng nhằm mục đích phục vụ giao
               dịch và nâng cao chất lượng dịch vụ.
            </p>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">
               6. Hỗ trợ Khách hàng
            </h2>
            <p className="mb-3">ChoCongNghe Shop cung cấp các kênh hỗ trợ:</p>
            <ul className="space-y-2 mb-3">
               {[
                  "Email chăm sóc khách hàng",
                  "Hotline",
                  "Chat trực tuyến trên website",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>{item}</p>
                  </li>
               ))}
            </ul>
            <p>
               Ngoài ra, website có thể cung cấp tài liệu hướng dẫn và nội dung
               hỗ trợ sử dụng sản phẩm khi cần thiết.
            </p>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-3">
               7. Quyền và Nghĩa vụ của Người dùng
            </h2>
            <p className="font-semibold text-primary mb-2">
               Quyền của người dùng:
            </p>
            <ul className="space-y-2 mb-4">
               {[
                  "Được mua và sử dụng sản phẩm hợp pháp",
                  "Được hỗ trợ theo chính sách của ChoCongNghe Shop",
                  "Được bảo mật thông tin cá nhân",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>{item}</p>
                  </li>
               ))}
            </ul>
            <p className="font-semibold text-primary mb-2">
               Nghĩa vụ của người dùng:
            </p>
            <ul className="space-y-2">
               {[
                  "Cung cấp thông tin trung thực",
                  "Tuân thủ quy định của website",
                  "Không sử dụng website cho mục đích gian lận hoặc trái pháp luật",
               ].map((item, i) => (
                  <li key={i} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>{item}</p>
                  </li>
               ))}
            </ul>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">
               8. Điều khoản Sử dụng
            </h2>
            <p>
               Mọi nội dung trên website, bao gồm hình ảnh, văn bản, thiết kế và
               thương hiệu, đều thuộc quyền sở hữu của ChoCongNghe Shop hoặc đối
               tác hợp pháp. Nghiêm cấm sao chép, phát tán hoặc sử dụng cho mục
               đích thương mại khi chưa được cho phép bằng văn bản.
            </p>
         </section>

         <section className="mb-6">
            <h2 className="font-bold text-primary mb-2">9. Thay đổi Quy chế</h2>
            <p>
               ChoCongNghe Shop có quyền điều chỉnh, cập nhật Quy chế hoạt động
               bất cứ lúc nào nhằm phù hợp với tình hình thực tế và quy định
               pháp luật. Các thay đổi sẽ được thông báo trên website và có hiệu
               lực kể từ thời điểm đăng tải.
            </p>
         </section>

         <section>
            <h2 className="font-bold text-primary mb-3">10. Liên hệ</h2>
            <p className="mb-3">
               Mọi thắc mắc hoặc phản hồi, khách hàng vui lòng liên hệ
               ChoCongNghe Shop qua:
            </p>
            <ul className="space-y-2">
               {[
                  { label: "Hotline", value: "(cập nhật)" },
                  { label: "Email", value: "(cập nhật)" },
                  { label: "Địa chỉ", value: "(cập nhật)" },
               ].map((item, i) => (
                  <li key={i} className="flex gap-2.5">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>
                        <span className="font-semibold text-primary">
                           {item.label}:
                        </span>{" "}
                        {item.value}
                     </p>
                  </li>
               ))}
            </ul>
         </section>
      </div>
   );
}
