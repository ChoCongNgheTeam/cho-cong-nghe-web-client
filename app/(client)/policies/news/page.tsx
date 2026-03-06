import Image from "next/image";
import Link from "next/link";

interface NewsItem {
   id: number;
   category: string;
   title: string;
   excerpt: string;
   date: string;
   image: string;
   badge?: string;
}

const newsList: NewsItem[] = [
   {
      id: 1,
      category: "Khuyến mãi",
      title: "iPhone 16 Pro Max giảm đến 3 triệu – Ưu đãi độc quyền tháng 3",
      excerpt:
         "Cơ hội sở hữu iPhone 16 Pro Max với mức giá tốt nhất trong năm. Áp dụng khi thanh toán qua thẻ tín dụng hoặc trả góp 0%.",
      date: "04/03/2026",
      image: "https://cdn2.fptshop.com.vn/unsafe/640x0/filters:format(webp):quality(75)/small/dac_quyen_vung_trang_sam_apple_chinh_hang_uu_dai_den_73_trieu_dong_200887_1_816e528747.jpg",
      badge: "HOT",
   },
   {
      id: 2,
      category: "Khuyến mãi",
      title: "Samsung Galaxy S25 Ultra – Tặng kèm Galaxy Buds 3 trị giá 3.5 triệu",
      excerpt:
         "Mua Samsung Galaxy S25 Ultra trong tháng 3 nhận ngay tai nghe Galaxy Buds 3 hoàn toàn miễn phí. Số lượng có hạn.",
      date: "03/03/2026",
      image: "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/valentine_co_doi_nhan_qua_gap_boi_200967_1_10346e5c6d.jpg",
      badge: "MỚI",
   },
   {
      id: 3,
      category: "Tin tức",
      title: "ChoCongNghe Shop khai trương thêm 5 cửa hàng tại Hà Nội và TP.HCM",
      excerpt:
         "Mở rộng mạng lưới phục vụ, ChoCongNghe Shop chính thức khai trương 5 cửa hàng mới với diện tích lớn và trải nghiệm hiện đại.",
      date: "02/03/2026",
      image: "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/tang_garmin_cho_mua_yeu_thuong_uu_dai_den_47percent_200958_1_1cd2981bd9.png",
   },
   {
      id: 4,
      category: "Khuyến mãi",
      title: "Laptop MacBook Air M3 – Trả góp 0% lên đến 24 tháng",
      excerpt:
         "Sở hữu MacBook Air M3 ngay hôm nay với chương trình trả góp 0% lãi suất. Hỗ trợ nhiều ngân hàng và ví điện tử.",
      date: "01/03/2026",
      image: "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/tan_huong_uu_dai_hoan_tien_den_20percent_tai_fpt_retail_voi_the_tpbank_evo_2_3153f689ac.png",
   },
   {
      id: 5,
      category: "Sự kiện",
      title: "Tech Fest 2026 – Ngày hội công nghệ lớn nhất năm tại ChoCongNghe Shop",
      excerpt:
         "Chuỗi sự kiện Tech Fest 2026 quy tụ hàng trăm sản phẩm công nghệ mới nhất, kèm ưu đãi khủng và nhiều hoạt động trải nghiệm hấp dẫn.",
      date: "28/02/2026",
      image: "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/small/honor_watch_doc_quyen_fpt_shop_200940_5_d343fcb61c.jpg",
      badge: "SỰ KIỆN",
   },
   {
      id: 6,
      category: "Khuyến mãi",
      title: "Phụ kiện Apple chính hãng giảm đến 40% – Chỉ trong tuần này",
      excerpt:
         "Toàn bộ phụ kiện Apple chính hãng bao gồm cáp, sạc, ốp lưng, tai nghe đang được giảm giá mạnh. Mua ngay kẻo hết.",
      date: "27/02/2026",
      image: "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/2000x1000_2_7abd862736.png",
   },
];

const featuredNews = newsList[0];
const restNews = newsList.slice(1);

const categoryColors: Record<string, string> = {
   "Khuyến mãi": "bg-promotion-light text-promotion",
   "Tin tức": "bg-accent-light text-accent",
   "Sự kiện": "bg-neutral-light-active text-primary",
};

const badgeColors: Record<string, string> = {
   HOT: "bg-promotion text-neutral-light",
   MỚI: "bg-accent text-neutral-light",
   "SỰ KIỆN": "bg-dark text-neutral-light",
};

export default function NewsPage() {
   return (
      <div className="min-h-screen bg-neutral-light">
         {/* Header */}
         <div className="border-b border-neutral bg-neutral-light">
            <div className="py-8">
               <div className="flex items-end justify-between">
                  <div>
                     <p className="uppercase tracking-[0.15em] text-primary font-medium mb-1">
                        Cập nhật mới nhất
                     </p>
                     <h1 className="text-[28px] font-bold text-primary leading-tight">
                        Tin tức & Khuyến mãi
                     </h1>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex gap-1 bg-neutral-light-active rounded-lg p-1">
                     {["Tất cả", "Khuyến mãi", "Tin tức", "Sự kiện"].map(
                        (tab, i) => (
                           <button
                              key={tab}
                              className={[
                                 "px-4 py-1.5 rounded-md font-medium transition-colors cursor-pointer",
                                 i === 0
                                    ? "bg-neutral-light text-primary shadow-sm"
                                    : "text-primary hover:text-primary",
                              ].join(" ")}
                           >
                              {tab}
                           </button>
                        ),
                     )}
                  </div>
               </div>
            </div>
         </div>

         <div className="py-8">
            <Link
               href={`/news/${featuredNews.id}`}
               className="group block mb-8"
            >
               <div className="grid grid-cols-5 gap-0 rounded-xl overflow-hidden border border-neutral bg-neutral-light hover:shadow-md transition-shadow duration-200">
                  {/* Image */}
                  <div className="col-span-3 relative overflow-hidden bg-accent-light aspect-[16/9]">
                     <Image
                        src={featuredNews.image}
                        alt={featuredNews.title}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                     />
                     {featuredNews.badge && (
                        <span
                           className={`absolute top-4 left-4 px-2.5 py-1 rounded font-bold tracking-wide ${badgeColors[featuredNews.badge]}`}
                        >
                           {featuredNews.badge}
                        </span>
                     )}
                  </div>

                  {/* Content */}
                  <div className="col-span-2 p-7 flex flex-col justify-between">
                     <div>
                        <div className="flex items-center gap-2 mb-3">
                           <span
                              className={`px-2 py-0.5 rounded font-semibold ${categoryColors[featuredNews.category]}`}
                           >
                              {featuredNews.category}
                           </span>
                           <span className="text-primary">
                              {featuredNews.date}
                           </span>
                        </div>
                        <h2 className="font-bold text-primary leading-snug mb-3 group-hover:text-accent transition-colors">
                           {featuredNews.title}
                        </h2>
                        <p className="text-primary leading-relaxed line-clamp-3">
                           {featuredNews.excerpt}
                        </p>
                     </div>
                     <div className="mt-5">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-accent group-hover:gap-2.5 transition-all">
                           Xem chi tiết
                           <svg
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                           >
                              <path
                                 d="M2 7h10M8 3l4 4-4 4"
                                 stroke="currentColor"
                                 strokeWidth="1.5"
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                              />
                           </svg>
                        </span>
                     </div>
                  </div>
               </div>
            </Link>

            {/* Grid list */}
            <div className="grid grid-cols-3 gap-5">
               {restNews.map((item) => (
                  <Link
                     key={item.id}
                     href={`/news/${item.id}`}
                     className="group flex flex-col rounded-xl overflow-hidden border border-neutral bg-neutral-light hover:shadow-md transition-shadow duration-200"
                  >
                     {/* Image */}
                     <div className="relative overflow-hidden aspect-[16/9] bg-accent-light">
                        <Image
                           src={item.image}
                           alt={item.title}
                           fill
                           className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                        {item.badge && (
                           <span
                              className={`absolute top-3 left-3 px-2 py-0.5 rounded font-bold tracking-wide ${badgeColors[item.badge]}`}
                           >
                              {item.badge}
                           </span>
                        )}
                     </div>

                     {/* Content */}
                     <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span
                              className={`px-2 py-0.5 rounded font-semibold ${categoryColors[item.category]}`}
                           >
                              {item.category}
                           </span>
                           <span className="text-primary">{item.date}</span>
                        </div>
                        <h3 className="text-[14px] font-bold text-primary leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors flex-1">
                           {item.title}
                        </h3>
                        <p className="text-primary leading-relaxed line-clamp-2 mb-3">
                           {item.excerpt}
                        </p>
                        <span className="inline-flex items-center gap-1 font-semibold text-accent group-hover:gap-2 transition-all mt-auto">
                           Xem chi tiết
                           <svg
                              width="12"
                              height="12"
                              viewBox="0 0 14 14"
                              fill="none"
                           >
                              <path
                                 d="M2 7h10M8 3l4 4-4 4"
                                 stroke="currentColor"
                                 strokeWidth="1.5"
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                              />
                           </svg>
                        </span>
                     </div>
                  </Link>
               ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-1 mt-10">
               <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-neutral text-primary hover:bg-neutral-light-active transition-colors cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                     <path
                        d="M10 12L6 8l4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                     />
                  </svg>
               </button>
               {[1, 2, 3, "...", 8].map((page, i) => (
                  <button
                     key={i}
                     className={[
                        "w-9 h-9 flex items-center justify-center rounded-lg font-medium transition-colors cursor-pointer",
                        page === 1
                           ? "bg-accent text-neutral-light border border-accent"
                           : page === "..."
                             ? "text-primary border-none"
                             : "border border-neutral text-primary hover:bg-neutral-light-active",
                     ].join(" ")}
                  >
                     {page}
                  </button>
               ))}
               <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-neutral text-primary hover:bg-neutral-light-active transition-colors cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                     <path
                        d="M6 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                     />
                  </svg>
               </button>
            </div>
         </div>
      </div>
   );
}
