export const steps = [
  {
    num: "01",
    icon: "🛒",
    title: "Chọn sản phẩm",
    desc: "Duyệt danh mục và chọn sản phẩm phù hợp với nhu cầu của bạn.",
    tips: [
      "Xem kỹ mô tả sản phẩm",
      "Kiểm tra đánh giá từ khách hàng",
      "Chọn đúng màu sắc / size",
    ],
  },
  {
    num: "02",
    icon: "🧾",
    title: "Thêm vào giỏ hàng",
    desc: "Thêm sản phẩm vào giỏ và kiểm tra lại thông tin trước khi thanh toán.",
    tips: [
      "Kiểm tra số lượng",
      "Áp dụng mã giảm giá nếu có",
      "Xem lại tổng tiền",
    ],
  },
  {
    num: "03",
    icon: "📍",
    title: "Nhập thông tin nhận hàng",
    desc: "Điền đầy đủ thông tin để đảm bảo giao hàng chính xác.",
    tips: [
      "Nhập đúng số điện thoại",
      "Ghi rõ địa chỉ cụ thể",
      "Thêm ghi chú nếu cần",
    ],
  },
  {
    num: "04",
    icon: "💳",
    title: "Thanh toán",
    desc: "Chọn phương thức thanh toán phù hợp và hoàn tất đơn hàng.",
    tips: [
      "Chọn phương thức phù hợp",
      "Kiểm tra lại đơn hàng",
      "Xác nhận thanh toán",
    ],
  },
];

export type StepItem = (typeof steps)[number];

export const paymentMethods = [
  {
    icon: "💵",
    name: "Thanh toán khi nhận hàng (COD)",
    desc: "Thanh toán trực tiếp cho nhân viên giao hàng khi nhận sản phẩm.",
    badge: "Phổ biến",
    badgeColor: "bg-accent-light text-accent-dark",
    pros: [
      "Không cần thanh toán trước",
      "An toàn, dễ sử dụng",
    ],
    note: "Chuẩn bị tiền mặt chính xác để giao dịch nhanh hơn",
  },
  {
    icon: "🏦",
    name: "Chuyển khoản ngân hàng",
    desc: "Chuyển khoản trực tiếp qua tài khoản ngân hàng của cửa hàng.",
    badge: "Tiết kiệm",
    badgeColor: "bg-accent-light text-accent-dark",
    pros: [
      "Không cần tiền mặt",
      "Xử lý nhanh",
    ],
    note: "Ghi đúng nội dung chuyển khoản để xác nhận đơn",
  },
  {
    icon: "📱",
    name: "Ví điện tử",
    desc: "Thanh toán qua Momo, ZaloPay, VNPay...",
    badge: "Tiện lợi",
    badgeColor: "bg-accent-light text-accent-dark",
    pros: [
      "Thanh toán nhanh chóng",
      "Nhiều ưu đãi",
    ],
    note: "Đảm bảo ví đủ số dư",
  },
];

export type PaymentMethod = (typeof paymentMethods)[number];

export const faqs = [
  {
    q: "Bao lâu thì nhận được hàng?",
    a: "Thời gian giao hàng từ 2-5 ngày tùy khu vực. Nội thành thường nhanh hơn.",
  },
  {
    q: "Có được kiểm tra hàng trước khi thanh toán không?",
    a: "Có, bạn được kiểm tra sản phẩm trước khi thanh toán (COD).",
  },
  {
    q: "Có hỗ trợ đổi trả không?",
    a: "Có, bạn có thể đổi trả trong vòng 7 ngày nếu sản phẩm lỗi hoặc không đúng mô tả.",
  },
  {
    q: "Làm sao để theo dõi đơn hàng?",
    a: "Bạn có thể vào mục 'Đơn hàng của tôi' để theo dõi trạng thái.",
  },
];

export type FaqEntry = (typeof faqs)[number];
