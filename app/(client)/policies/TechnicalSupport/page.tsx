"use client";

export default function TechnicalSupportPolicy() {
   return (
      <div className="min-h-screen">
         <div className="container py-5">
            <main className="p-6 md:p-8">
               <h1 className="font-bold mb-5 text-primary text-center" style={{ fontSize: "24px" }}>
                  Quy định hỗ trợ kỹ thuật và sao lưu dữ liệu
               </h1>

               <div className="rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral mb-6">
                  <p className="text-primary">
                     <strong>Đối tượng áp dụng:</strong> Khách hàng có nhu cầu hỗ trợ phần mềm bảo hành sửa chữa sản phẩm tại ChoCongNghe.
                  </p>
               </div>

               <p className="leading-relaxed mb-6 text-primary">
                  Nhằm đảm bảo đầy đủ quyền lợi của khách hàng khi cài đặt, bảo hành sửa chữa sản phẩm, ChoCongNghe xin thông báo quy định như sau:
               </p>

               <ul className="space-y-3">
                  {[
                     <>Để bảo vệ dữ liệu cá nhân, Quý khách vui lòng sao lưu và <strong>XOÁ các dữ liệu cá nhân</strong> trước khi bàn giao sản phẩm cho nhân viên ChoCongNghe.</>,
                     "ChoCongNghe không chịu trách nhiệm về việc mất dữ liệu của Quý khách trong quá trình cài đặt, bảo hành sửa chữa.",
                     "Để đảm bảo quyền lợi, Quý khách vui lòng ký xác nhận để thông tin bàn giao thiết bị của Quý khách được ghi nhận trên hệ thống ChoCongNghe.",
                     "ChoCongNghe không hỗ trợ cài đặt phần mềm không có bản quyền trên máy tính của Quý khách.",
                     "Quý khách vui lòng kiểm tra tài khoản iCloud / Google và các tài khoản xã hội khác trên máy trước khi rời cửa hàng.",
                     "Tài khoản cài đặt trên máy phải là tài khoản cá nhân của Quý khách (chủ sở hữu máy).",
                     <>Nếu chưa có tài khoản iCloud, Quý khách liên hệ nhân viên kỹ thuật để được hỗ trợ tạo <strong>Tài khoản iCloud (Apple ID) / Google</strong> và các tài khoản khác <strong>miễn phí</strong> tại cửa hàng. Đồng thời yêu cầu nhân viên cung cấp thông tin, mật khẩu tài khoản vừa được tạo trước khi rời cửa hàng.</>,
                  ].map((item, i) => (
                     <li key={i} className="flex gap-3 leading-relaxed text-primary">
                        <span
                           className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-promotion-light text-promotion mt-0.5"
                           style={{ fontSize: "11px" }}
                        >
                           {i + 1}
                        </span>
                        <span>{item}</span>
                     </li>
                  ))}
               </ul>
            </main>
         </div>
      </div>
   );
}