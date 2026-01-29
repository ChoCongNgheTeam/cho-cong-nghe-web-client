import { Blog } from "../_lib/blog.type";
import { BLOG_CATEGORIES } from "./blog.constants";

export const BLOG_FEATURED: Blog[] = [
  {
    id: 1,
    slug: "vivo-x200t-ra-mat",
    title: "vivo X200T ra mắt với chip Dimensity 9400+ và camera Zeiss",
    excerpt:
      "vivo X200T chính thức ra mắt, mở rộng phân khúc smartphone cận cao cấp với hiệu năng mạnh và camera hợp tác cùng Zeiss.",
    content: `
vivo X200T là mẫu smartphone mới nhất vừa được vivo giới thiệu, hướng đến người dùng yêu thích hiệu năng cao và khả năng chụp ảnh chất lượng.

Thiết bị được trang bị vi xử lý Dimensity 9400+ mới, mang lại hiệu suất mạnh mẽ trong các tác vụ hàng ngày lẫn chơi game nặng. Hệ thống camera hợp tác cùng Zeiss tiếp tục là điểm nhấn, tập trung vào khả năng chụp chân dung và ảnh đêm.

Ngoài ra, vivo X200T còn sở hữu màn hình AMOLED 120Hz, pin dung lượng lớn cùng công nghệ sạc nhanh, hứa hẹn sẽ là lựa chọn đáng chú ý trong phân khúc cận cao cấp năm nay.
    `,
    thumbnail: "https://picsum.photos/900/500?1",
    category: BLOG_CATEGORIES.FEATURED,
    author: "Tiến Dũng",
    publishedAt: "2 giờ trước",
    isFeatured: true, // 👈 CHỈ 1 BÀI
  },

  {
    id: 2,
    slug: "galaxy-s26-ultra-camera",
    title: "Galaxy S26 Ultra: Samsung tiếp tục đặt cược lớn vào camera",
    excerpt:
      "Những rò rỉ mới nhất cho thấy Samsung sẽ tiếp tục nâng cấp mạnh camera trên Galaxy S26 Ultra.",
    content: `
Theo các nguồn tin rò rỉ, Galaxy S26 Ultra sẽ tập trung mạnh vào khả năng chụp ảnh với cảm biến mới và thuật toán xử lý AI nâng cao.

Samsung được cho là sẽ cải thiện khả năng zoom, chụp thiếu sáng và quay video trên flagship tiếp theo. Ngoài camera, Galaxy S26 Ultra vẫn giữ thiết kế vuông vức quen thuộc cùng màn hình lớn độ phân giải cao.

Dự kiến thiết bị sẽ được ra mắt vào đầu năm sau và tiếp tục cạnh tranh trực tiếp với các flagship Android khác.
    `,
    thumbnail: "https://picsum.photos/900/500?2",
    category: BLOG_CATEGORIES.FEATURED,
    author: "Trần Ngọc Mai",
    publishedAt: "6 giờ trước",
  },

  {
    id: 3,
    slug: "iphone-16-esim",
    title: "iPhone 16 và xu hướng eSIM: Người dùng Việt cần biết gì?",
    excerpt:
      "Apple tiếp tục mở rộng eSIM trên iPhone 16, đặt ra nhiều câu hỏi cho người dùng tại Việt Nam.",
    content: `
iPhone 16 được cho là sẽ tiếp tục loại bỏ khay SIM vật lý trên nhiều thị trường, thay thế hoàn toàn bằng eSIM.

Động thái này giúp Apple tối ưu không gian bên trong thiết bị, đồng thời tăng tính bảo mật. Tuy nhiên, tại Việt Nam, việc sử dụng eSIM vẫn còn một số hạn chế đối với người dùng phổ thông.

Bài viết sẽ giúp bạn hiểu rõ iPhone 16 hỗ trợ bao nhiêu eSIM, sử dụng như thế nào và liệu có phù hợp với nhu cầu cá nhân hay không.
    `,
    thumbnail: "https://picsum.photos/900/500?3",
    category: BLOG_CATEGORIES.FEATURED,
    author: "Tuấn Vương",
    publishedAt: "10 giờ trước",
  },

  {
    id: 4,
    slug: "xiaomi-17-max-dinh-huong",
    title: "Xiaomi 17 Max: Định hướng flagship mới của Xiaomi",
    excerpt:
      "Xiaomi được cho là đang thay đổi chiến lược với dòng flagship mới mang tên Xiaomi 17 Max.",
    content: `
Xiaomi 17 Max xuất hiện trong nhiều tin đồn gần đây với vai trò là mẫu flagship cao cấp nhất của Xiaomi trong năm tới.

Thiết bị được kỳ vọng sở hữu màn hình lớn, pin dung lượng cao và hệ thống camera được tinh chỉnh mạnh mẽ hơn. Xiaomi cũng được cho là sẽ tập trung nhiều hơn vào trải nghiệm phần mềm và khả năng tối ưu hiệu năng.

Nếu các thông tin rò rỉ là chính xác, Xiaomi 17 Max có thể sẽ trở thành đối thủ nặng ký trong phân khúc flagship Android.
    `,
    thumbnail: "https://picsum.photos/900/500?4",
    category: BLOG_CATEGORIES.FEATURED,
    author: "Tâm An",
    publishedAt: "1 ngày trước",
  },
];

export const BLOG_NEWS: Blog[] = [
  {
    id: 2,
    slug: "iphone-16-co-may-sim",
    title: "iPhone 16 có mấy SIM? Những điều người dùng cần biết",
    excerpt:
      "Apple tiếp tục duy trì chiến lược eSIM trên iPhone 16, nhưng vẫn có khác biệt giữa các thị trường.",
    thumbnail: "https://picsum.photos/400/300?2",
    category: BLOG_CATEGORIES.NEWS,
    author: "Tuấn Vương",
    publishedAt: "5 giờ trước",
  },
  {
    id: 3,
    slug: "moto-g77-ra-mat",
    title: "Moto G77 chính thức ra mắt với camera 108MP",
    excerpt:
      "Motorola giới thiệu Moto G77 với camera độ phân giải cao, pin lớn và thiết kế trẻ trung.",
    thumbnail: "https://picsum.photos/400/300?3",
    category: BLOG_CATEGORIES.NEWS,
    author: "Trần Ngọc Mai",
    publishedAt: "6 giờ trước",
  },
  {
    id: 4,
    slug: "galaxy-s26-ultra-cobalt",
    title: "Galaxy S26 Ultra lộ màu Cobalt Violet cực hút mắt",
    excerpt:
      "Phiên bản màu mới của Galaxy S26 Ultra đang nhận được sự quan tâm lớn từ cộng đồng công nghệ.",
    thumbnail: "https://picsum.photos/400/300?4",
    category: BLOG_CATEGORIES.NEWS,
    author: "Trần Ngọc Mai",
    publishedAt: "1 giờ trước",
  },
  {
    id: 5,
    slug: "ios-16-7-13",
    title: "iOS 16.7.13 có gì mới? Bản cập nhật bảo mật quan trọng",
    excerpt:
      "Apple phát hành iOS 16.7.13 nhằm vá các lỗ hổng bảo mật nghiêm trọng.",
    thumbnail: "https://picsum.photos/400/300?5",
    category: BLOG_CATEGORIES.NEWS,
    author: "Xuân Lộc",
    publishedAt: "1 giờ trước",
  },
];
