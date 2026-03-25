"use client";

export default function WarrantyPolicy() {
   return (
      <>
         <h1 className="font-bold mb-5 text-primary text-center ">
            Chính sách bảo hành
         </h1>

         <p className="leading-relaxed mb-4 text-primary">
            Tất cả sản phẩm tại ChoCongNghe kinh doanh đều là sản phẩm
            chính hãng và được bảo hành theo đúng chính sách của nhà
            sản xuất(*). Ngoài ra ChoCongNghe cũng hỗ trợ gửi bảo hành
            miễn phí giúp khách hàng đối với cả sản phẩm do ChoCongNghe
            bán ra và sản phẩm Quý khách mua tại các chuỗi bán lẻ khác.
         </p>

         <p className="leading-relaxed mb-4 text-primary">
            Mua hàng tại ChoCongNghe, Quý khách sẽ được hưởng những đặc quyền sau:
         </p>

         <ul className="mb-6 space-y-2">
            {[
               <>Bảo hành đổi sản phẩm mới ngay tại shop trong 30 ngày nếu có lỗi NSX.(**)</>,
               <>Gửi bảo hành chính hãng không mất phí vận chuyển.(***)</>,
               <>Theo dõi tiến độ bảo hành nhanh chóng qua hotline <strong>1800.6060</strong> hoặc <strong>1800.6626</strong>.</>,
               <>Hỗ trợ làm việc với hãng để xử lý phát sinh trong quá trình bảo hành.</>,
            ].map((item, i) => (
               <li key={i} className="flex gap-2 leading-relaxed text-primary">
                  <span className="mt-1 shrink-0">•</span>
                  <span>{item}</span>
               </li>
            ))}
         </ul>

         <p className="leading-relaxed mb-4 text-primary">
            Bên cạnh đó Quý khách có thể tham khảo một số các trường hợp thường gặp nằm ngoài
            chính sách bảo hành sau để xác định sơ bộ máy có đủ điều kiện bảo hành hãng:
         </p>

         <ul className="mb-6 space-y-2">
            {[
               <>Sản phẩm hết hạn bảo hành. Vui lòng liên hệ hotline <strong>1800.6060</strong> để tra cứu thời hạn bảo hành sản phẩm.</>,
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
               <li key={i} className="flex gap-2 leading-relaxed text-primary">
                  <span className="mt-1 shrink-0">•</span>
                  <span>{item}</span>
               </li>
            ))}
         </ul>

         <p className="font-semibold mb-3 text-primary">Lưu ý:</p>
         <ul className="mb-6 space-y-2">
            {[
               "Chương trình bảo hành bắt đầu có hiệu lực từ thời điểm ChoCongNghe xuất hóa đơn cho Quý khách.",
               "Với mỗi dòng sản phẩm khác nhau sẽ có chính sách bảo hành khác nhau tùy theo chính sách của Hãng/Nhà cung cấp.",
               <>Để tìm hiểu thông tin chi tiết về chính sách bảo hành cho sản phẩm cụ thể, xin liên hệ bộ phận Chăm sóc Khách hàng của ChoCongNghe <strong>1800.6060</strong> hoặc <strong>1800.6626</strong>.</>,
               "Quý khách có thể tra cứu tình trạng bảo hành bằng cách liên hệ trực tiếp hotline hoặc đến cửa hàng ChoCongNghe gần nhất bất cứ lúc nào.",
               "Trong quá trình thực hiện dịch vụ bảo hành, các nội dung lưu trữ trên sản phẩm của Quý khách sẽ bị xóa và định dạng lại. Do đó, Quý khách vui lòng tự sao lưu toàn bộ dữ liệu trong sản phẩm, đồng thời gỡ bỏ tất cả các thông tin cá nhân mà Quý khách muốn bảo mật. ChoCongNghe không chịu trách nhiệm đối với bất kỳ mất mát nào liên quan tới các chương trình phần mềm, dữ liệu hoặc thông tin nào khác lưu trữ trên sản phẩm bảo hành.",
               "Vui lòng tắt tất cả các mật khẩu bảo vệ, ChoCongNghe sẽ từ chối tiếp nhận bảo hành nếu thiết bị của bạn bị khóa bởi bất cứ phương pháp nào.",
            ].map((item, i) => (
               <li key={i} className="flex gap-2 leading-relaxed text-primary">
                  <span className="mt-1 shrink-0">•</span>
                  <span>{item}</span>
               </li>
            ))}
         </ul>

         <div className="pt-4 space-y-1.5 border-t border-neutral">
            {[
               "(*) Áp dụng với các sản phẩm bán mới hoặc còn hạn bảo hành mặc định nếu đã qua sử dụng.",
               "(**) Áp dụng với các sản phẩm thuộc diện đổi mới trong 30 ngày nếu có lỗi NSX được công bố trên website Chính sách đổi trả.",
               "(***) Trừ các sản phẩm có chính sách bảo hành tại nhà, sản phẩm thuộc diện cồng kềnh.",
            ].map((note, i) => (
               <p key={i} className="leading-relaxed text-neutral-darker">{note}</p>
            ))}
         </div>
      </>
   );
}