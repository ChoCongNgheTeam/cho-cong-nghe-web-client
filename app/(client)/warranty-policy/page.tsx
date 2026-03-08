import Link from "next/link";

// TODO: Import SidebarMenu component here when ready
// import SidebarMenu from "@/components/SidebarMenu";

export default function ChinhSachBaoHanhPage() {
   return (
      <div
         className="min-h-screen"
         style={{ backgroundColor: "rgb(var(--neutral-light-active))" }}
      >
         {/* Breadcrumb */}
         <div
            className="border-b"
            style={{
               backgroundColor: "rgb(var(--neutral-light))",
               borderColor: "rgb(var(--neutral))",
            }}
         >
            <div className="container py-2.5">
               <nav className="flex items-center gap-1.5 text-sm">
                  <Link
                     href="/"
                     className="transition-colors"
                     style={{ color: "rgb(var(--promotion))" }}
                  >
                     Trang chủ
                  </Link>
                  <span style={{ color: "rgb(var(--neutral-dark))" }}>/</span>
                  <span style={{ color: "rgb(var(--primary-light))" }}>
                     Chính sách bảo hành
                  </span>
               </nav>
            </div>
         </div>

         {/* Main Content */}
         <div className="container py-5">
            <div className="flex gap-5">
               {/* Sidebar Slot — gắn <SidebarMenu /> vào đây khi có */}
               <aside className="hidden md:block w-[260px] shrink-0">
                  {/* <SidebarMenu activeItem="Danh mục chính sách" /> */}
               </aside>

               {/* Article */}
               <main
                  className="flex-1 rounded-lg p-6 md:p-8"
                  style={{
                     backgroundColor: "rgb(var(--neutral-light))",
                     border: "1px solid rgb(var(--neutral))",
                  }}
               >
                  {/* Font size toggle */}
                  <div className="flex items-center gap-2 mb-5">
                     <button
                        className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
                        style={{
                           backgroundColor: "rgb(var(--primary))",
                           color: "rgb(var(--neutral-light))",
                           fontSize: "13px",
                        }}
                     >
                        Cỡ chữ nhỏ
                     </button>
                     <button
                        className="px-4 py-1.5 rounded-full text-sm transition-colors"
                        style={{
                           border: "1px solid rgb(var(--neutral))",
                           color: "rgb(var(--primary-light))",
                           fontSize: "13px",
                        }}
                     >
                        Cỡ chữ lớn
                     </button>
                  </div>

                  {/* Heading */}
                  <h1
                     className="text-2xl md:text-3xl font-bold mb-5"
                     style={{ color: "rgb(var(--primary))" }}
                  >
                     Chính sách bảo hành
                  </h1>

                  {/* Intro paragraph */}
                  <p
                     className="text-sm leading-relaxed mb-4"
                     style={{ color: "rgb(var(--primary))" }}
                  >
                     Tất cả sản phẩm tại ChoCongNghe kinh doanh đều là sản phẩm
                     chính hãng và được bảo hành theo đúng chính sách của nhà
                     sản xuất(*). Ngoài ra ChoCongNghe cũng hỗ trợ gửi bảo hành
                     miễn phí giúp khách hàng đối với cả sản phẩm do ChoCongNghe
                     bán ra và sản phẩm Quý khách mua tại các chuỗi bán lẻ khác.
                  </p>

                  <p
                     className="text-sm leading-relaxed mb-4"
                     style={{ color: "rgb(var(--primary))" }}
                  >
                     Mua hàng tại ChoCongNghe, Quý khách sẽ được hưởng những đặc
                     quyền sau:
                  </p>

                  {/* Privileges list */}
                  <ul className="mb-6 space-y-2">
                     {[
                        <>
                           Bảo hành đổi sản phẩm mới ngay tại shop trong 30 ngày
                           nếu có lỗi NSX.(**)
                        </>,
                        <>
                           Gửi bảo hành chính hãng không mất phí vận
                           chuyển.(***)
                        </>,
                        <>
                           Theo dõi tiến độ bảo hành nhanh chóng qua kênh
                           hotline hoặc tự tra cứu{" "}
                           <Link
                              href="#"
                              className="font-medium transition-colors"
                              style={{ color: "rgb(var(--promotion))" }}
                           >
                              Tại đây
                           </Link>
                           .
                        </>,
                        <>
                           Hỗ trợ làm việc với hãng để xử lý phát sinh trong quá
                           trình bảo hành.
                        </>,
                     ].map((item, i) => (
                        <li
                           key={i}
                           className="flex gap-2 text-sm leading-relaxed"
                           style={{ color: "rgb(var(--primary))" }}
                        >
                           <span className="mt-1 shrink-0">•</span>
                           <span>{item}</span>
                        </li>
                     ))}
                  </ul>

                  {/* Out-of-warranty intro */}
                  <p
                     className="text-sm leading-relaxed mb-4"
                     style={{ color: "rgb(var(--primary))" }}
                  >
                     Bên cạnh đó Quý khách có thể tham khảo một số các trường
                     hợp thường gặp nằm ngoài chính sách bảo hành sau để xác
                     định sơ bộ máy có đủ điều kiện bảo hành hãng:
                  </p>

                  {/* Out-of-warranty list */}
                  <ul className="mb-6 space-y-2">
                     {[
                        <>
                           Sản phẩm hết hạn bảo hành (Vui lòng tra cứu thời hạn
                           bảo hành sản phẩm{" "}
                           <Link
                              href="#"
                              className="font-medium"
                              style={{ color: "rgb(var(--promotion))" }}
                           >
                              Tại đây
                           </Link>
                           ).
                        </>,
                        "Sản phẩm đã bị thay đổi, sửa chữa không thuộc các Trung Tâm Bảo Hành Ủy Quyền của Hãng.",
                        "Sản phẩm lắp đặt, bảo trì, sử dụng không đúng theo hướng dẫn của Nhà sản xuất gây ra hư hỏng.",
                        "Sản phẩm lỗi do ngấm nước, chất lỏng và bụi bẩn. Quy định này áp dụng cho cả những thiết bị đạt chứng nhận kháng nước/kháng bụi cao nhất là IP68.",
                        "Sản phẩm bị biến dạng, nứt vỡ, cấn móp, trầy xước nặng do tác động nhiệt, tác động bên ngoài.",
                        "Sản phẩm có vết mốc, rỉ sét hoặc bị ăn mòn, oxy hóa bởi hóa chất.",
                        "Sản phẩm bị hư hại do thiên tai, hỏa hoạn, lụt lội, sét đánh, côn trùng, động vật vào.",
                        "Sản phẩm trong tình trạng bị khóa tài khoản cá nhân như: Tài khoản khóa máy/màn hình, khóa tài khoản trực tuyến Xiaomi Cloud, Samsung Cloud, iCloud, Gmail...",
                        "Khách hàng sử dụng phần mềm, ứng dụng không chính hãng, không bản quyền.",
                        "Màn hình có bốn (04) điểm chết trở xuống.",
                     ].map((item, i) => (
                        <li
                           key={i}
                           className="flex gap-2 text-sm leading-relaxed"
                           style={{ color: "rgb(var(--primary))" }}
                        >
                           <span className="mt-1 shrink-0">•</span>
                           <span>{item}</span>
                        </li>
                     ))}
                  </ul>

                  {/* Notes section */}
                  <p
                     className="text-sm font-semibold mb-3"
                     style={{ color: "rgb(var(--primary))" }}
                  >
                     Lưu ý:
                  </p>
                  <ul className="mb-6 space-y-2">
                     {[
                        "Chương trình bảo hành bắt đầu có hiệu lực từ thời điểm ChoCongNghe xuất hóa đơn cho Quý khách.",
                        "Với mỗi dòng sản phẩm khác nhau sẽ có chính sách bảo hành khác nhau tùy theo chính sách của Hãng/Nhà cung cấp.",
                        <>
                           Để tìm hiểu thông tin chi tiết về chính sách bảo hành
                           cho sản phẩm cụ thể, xin liên hệ bộ phận Chăm sóc
                           Khách hàng của ChoCongNghe{" "}
                           <span className="font-semibold">1800 6616</span>.
                        </>,
                        <>
                           Tra cứu tình trạng máy gửi bảo hành bất cứ lúc nào{" "}
                           <Link
                              href="#"
                              className="font-medium"
                              style={{ color: "rgb(var(--promotion))" }}
                           >
                              Tại đây
                           </Link>
                           .
                        </>,
                        "Trong quá trình thực hiện dịch vụ bảo hành, các nội dung lưu trữ trên sản phẩm của Quý khách sẽ bị xóa và định dạng lại. Do đó, Quý khách vui lòng tự sao lưu toàn bộ dữ liệu trong sản phẩm, đồng thời gỡ bỏ tất cả các thông tin cá nhân mà Quý khách muốn bảo mật. ChoCongNghe không chịu trách nhiệm đối với bất kỳ mất mát nào liên quan tới các chương trình phần mềm, dữ liệu hoặc thông tin nào khác lưu trữ trên sản phẩm bảo hành.",
                        "Vui lòng tắt tất cả các mật khẩu bảo vệ, ChoCongNghe sẽ từ chối tiếp nhận bảo hành nếu thiết bị của bạn bị khóa bởi bất cứ phương pháp nào.",
                     ].map((item, i) => (
                        <li
                           key={i}
                           className="flex gap-2 text-sm leading-relaxed"
                           style={{ color: "rgb(var(--primary))" }}
                        >
                           <span className="mt-1 shrink-0">•</span>
                           <span>{item}</span>
                        </li>
                     ))}
                  </ul>

                  {/* Footnotes */}
                  <div
                     className="pt-4 space-y-1.5"
                     style={{ borderTop: "1px solid rgb(var(--neutral))" }}
                  >
                     {[
                        "(*) Áp dụng với các sản phẩm bán mới hoặc còn hạn bảo hành mặc định nếu đã qua sử dụng.",
                        "(**) Áp dụng với các sản phẩm thuộc diện đổi mới trong 30 ngày nếu có lỗi NSX được công bố trên website Chính sách đổi trả.",
                        "(***) Trừ các sản phẩm có chính sách bảo hành tại nhà, sản phẩm thuộc diện cồng kềnh.",
                     ].map((note, i) => (
                        <p
                           key={i}
                           className="text-xs leading-relaxed"
                           style={{ color: "rgb(var(--primary-light))" }}
                        >
                           {note}
                        </p>
                     ))}
                  </div>
               </main>
            </div>
         </div>
      </div>
   );
}