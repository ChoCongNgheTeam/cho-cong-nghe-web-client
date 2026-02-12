"use client";

import Link from "next/link";
import { useState } from "react";
import BlogCategoryBar from "../components/BlogCategoryBar";

type Props = {
  slug: string;
  title: string;
};

type FontSize = "small" | "base" | "large";

export default function BlogDetailClient({ slug, title }: Props) {
  const [fontSize, setFontSize] = useState<FontSize>("base");

  const contentSections = [
    "Tìm hiểu về cảm biến độ ẩm",
    "Sự phát triển công nghệ cảm biến độ ẩm",
    "Nguyên lý hoạt động của cảm biến độ ẩm",
    "Tìm hiểu về ứng dụng",
    "Tìm hiểu về nội dung",
    "Tìm hiểu về nội dung",
    "Tìm hiểu về nội dung",
    "Tìm hiểu về nội dung",
  ];

  const products = [
    {
      name: "Máy hút ẩm 28 lít Lumias D3 Pro",
      price: "5.990.000đ",
      oldPrice: "6.590.000đ",
      discount: "-10%",
      image: "https://picsum.photos/260/260?1",
    },
    {
      name: "Máy hút ẩm 28 lít Lumias D3T Pro",
      price: "6.290.000đ",
      oldPrice: "6.990.000đ",
      discount: "-10%",
      image: "https://picsum.photos/260/260?2",
    },
  ];

  const articleClassMap: Record<FontSize, string> = {
    small: "text-[14px] leading-[1.75]",
    base: "text-[15px] leading-[1.75]",
    large: "text-[17px] leading-[1.85]",
  };

  return (
    <main className="mx-auto max-w-[1240px] px-4 py-8 lg:px-6">
      <div className="mb-6 text-[13px] text-primary-light">
        <Link href="/" className="hover:text-primary">Trang chủ</Link> /{" "}
        <Link href="/blog" className="hover:text-primary">Tin tức</Link> /{" "}
        <Link href="/blog" className="hover:text-primary">Điện thoại</Link> /{" "}
        <span className="text-primary">Bài viết</span>
      </div>

      <section className="mb-8">
        <BlogCategoryBar
          className="gap-5 border-b border-neutral pb-2 text-[14px]"
          itemClassName="pb-1 font-medium"
        />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6 xl:col-span-6">
          <div className="aspect-[5/4] w-full overflow-hidden bg-neutral-light">
            <img
              src="https://picsum.photos/900/700?3"
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-6 xl:col-span-6">
          <div className="mb-2 text-[14px] text-primary-light">
            Huy Trọng • 1 tháng trước
          </div>
          <h1 className="text-[42px] font-bold leading-[1.12] text-primary xl:text-[60px]">
            {title}
          </h1>
          <p className="mt-4 max-w-[560px] text-[15px] leading-[1.6] text-primary-light">
            Cảm biến độ ẩm là một trong những thiết bị quan trọng và ngày càng trở
            nên phổ biến trong cuộc sống hiện đại. Từ việc kiểm soát môi trường
            trong nhà, đến các ứng dụng công nghiệp và nông nghiệp, cảm biến độ ẩm
            đang và sẽ trở thành thiết bị thông minh thiết yếu cho đời sống.
          </p>

          <div className="mt-5 flex items-center gap-3 text-primary-light">
            <span className="text-[28px] font-medium text-primary">Chia sẻ:</span>
            <div className="flex gap-2">
              <button className="grid h-9 w-9 place-items-center rounded-full bg-[#1877F2] text-sm font-bold text-white">
                f
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-full bg-[#0068FF] text-[11px] font-bold text-white">
                Zalo
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-xs font-bold text-white">
                IG
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-full border border-neutral text-[18px] text-primary">
                ↪
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-3 xl:col-span-3">
          <div className="sticky top-24">
            <div className="mb-2 flex items-center gap-2">
              <button
                onClick={() => setFontSize("small")}
                className={`rounded-md border px-4 py-1.5 text-[12px] font-semibold uppercase tracking-wide ${
                  fontSize === "small"
                    ? "border-primary bg-primary text-white"
                    : "border-neutral bg-white text-primary hover:border-primary-light"
                }`}
              >
                Cỡ chữ nhỏ
              </button>
              <button
                onClick={() => setFontSize("large")}
                className={`rounded-md border px-4 py-1.5 text-[12px] font-semibold uppercase tracking-wide ${
                  fontSize === "large"
                    ? "border-primary bg-primary text-white"
                    : "border-neutral bg-white text-primary hover:border-primary-light"
                }`}
              >
                Cỡ chữ lớn
              </button>
            </div>

            <div className="overflow-hidden rounded-md bg-[#f3f4f6] text-sm">
              <div className="border-b border-[#e5e7eb] px-4 py-3 font-semibold text-primary">
                Nội dung bài viết
              </div>
              <ul className="px-4 py-2">
                {contentSections.map((item, index) => (
                  <li
                    key={`${slug}-${item}-${index}`}
                    className={`border-l pl-3 py-2 text-[13px] leading-5 ${
                      index === 0
                        ? "border-primary font-medium text-primary"
                        : "border-transparent text-primary-light hover:text-primary"
                    }`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <article
          className={`lg:col-span-6 xl:col-span-6 ${
            articleClassMap[fontSize]
          } text-primary`}
        >
          <h2 className="mb-2 text-[28px] font-bold leading-tight">
            Tìm hiểu về cảm biến độ ẩm
          </h2>
          <p className="text-primary">
            Cảm biến độ ẩm là một thiết bị đo lường và giám sát mức độ ẩm trong
            không khí hoặc môi trường cụ thể. Độ ẩm hay lượng hơi nước có trong
            không khí, là một yếu tố quan trọng ảnh hưởng đến sức khỏe, sản xuất
            công nghiệp, nông nghiệp và thậm chí là chất lượng không khí trong các
            tòa nhà.
          </p>
          <p className="mt-3 text-primary">
            Việc kiểm soát độ ẩm đóng vai trò trong việc duy trì điều kiện lý
            tưởng cho con người và các quá trình sản xuất.
          </p>

          <div className="my-4 overflow-hidden rounded bg-neutral-light">
            <img
              src="https://picsum.photos/900/520?4"
              alt="Cảm biến độ ẩm"
              className="h-full w-full object-cover"
            />
          </div>

          <p className="text-primary">
            Trong đời sống hàng ngày, cảm biến độ ẩm xuất hiện trong nhiều thiết bị
            như máy điều hòa không khí, máy hút ẩm, và các hệ thống thông minh
            trong nhà. Ở quy mô lớn hơn, nó được sử dụng trong nông nghiệp, nhà máy
            sản xuất thực phẩm, dược phẩm, và nhiều ngành công nghiệp khác.
          </p>

          <h3 className="mb-2 mt-4 text-[24px] font-bold leading-tight">
            Sự phát triển của công nghệ cảm biến độ ẩm
          </h3>
          <p className="text-primary">
            Trải qua nhiều năm phát triển, cảm biến độ ẩm đã được cải tiến vượt bậc
            cả về độ chính xác lẫn độ bền. Từ các cảm biến đơn giản đến các thiết
            bị tích hợp IoT và AI, dữ liệu được truyền và xử lý theo thời gian
            thực.
          </p>

          <div className="my-4 overflow-hidden rounded bg-neutral-light">
            <img
              src="https://picsum.photos/900/520?5"
              alt="Ứng dụng cảm biến"
              className="h-full w-full object-cover"
            />
          </div>

          <h3 className="mb-2 mt-4 text-[24px] font-bold leading-tight">
            Nguyên lý hoạt động của cảm biến độ ẩm
          </h3>
          <p className="text-primary">
            Có nhiều loại cảm biến độ ẩm khác nhau, mỗi loại hoạt động theo cơ chế
            riêng. Phổ biến nhất là cảm biến điện dung và cảm biến điện trở, dựa
            trên sự thay đổi đặc tính vật liệu khi tiếp xúc với độ ẩm.
          </p>

          <h4 className="mb-1 mt-3 text-[20px] font-semibold">Cảm biến điện dung</h4>
          <p className="text-primary">
            Cảm biến đo thay đổi điện dung giữa hai bản cực khi độ ẩm môi trường
            thay đổi.
          </p>

          <h4 className="mb-1 mt-3 text-[20px] font-semibold">Cảm biến điện trở</h4>
          <p className="text-primary">
            Loại cảm biến này đo sự biến thiên điện trở của vật liệu nhạy ẩm để xác
            định mức độ ẩm.
          </p>

          <div className="my-4 overflow-hidden rounded bg-neutral-light">
            <img
              src="https://picsum.photos/900/520?6"
              alt="Mạch cảm biến"
              className="h-full w-full object-cover"
            />
          </div>

          <h3 className="mb-2 mt-4 text-[24px] font-bold leading-tight">
            Ứng dụng của cảm biến độ ẩm trong đời sống
          </h3>
          <h4 className="mb-1 text-[20px] font-semibold">Trong nông nghiệp</h4>
          <p className="text-primary">
            Cảm biến độ ẩm được ứng dụng để theo dõi độ ẩm đất, tự động hóa hệ
            thống tưới tiêu và tối ưu lượng nước cho cây trồng.
          </p>

          <div className="my-4 overflow-hidden rounded bg-neutral-light">
            <img
              src="https://picsum.photos/900/520?7"
              alt="Ứng dụng cảm biến độ ẩm"
              className="h-full w-full object-cover"
            />
          </div>

          <h3 className="mb-2 mt-4 text-[24px] font-bold leading-tight">Kết luận</h3>
          <p className="text-primary">
            Cảm biến độ ẩm đóng vai trò lớn trong việc cải thiện sức khỏe cá nhân,
            bảo vệ môi trường sống và nâng cao chất lượng sản xuất công nghiệp.
          </p>
          <p className="mt-2 text-primary">
            Với nhiều ưu điểm nổi bật, đây là công nghệ đáng để theo dõi và ứng
            dụng hiệu quả trong tương lai.
          </p>

          <div className="mt-6 text-primary">
            <p className="font-semibold">Tham khảo theo dõi hóa giá rẻ tại đây:</p>
            <ul className="list-disc pl-5">
              <li>
                <Link href="/blog" className="underline hover:no-underline">
                  Điều hòa
                </Link>
              </li>
            </ul>
            <p className="mt-2 font-semibold">Xem thêm:</p>
            <ul className="list-disc pl-5 text-primary-light">
              <li>
                <Link href="/blog" className="underline hover:no-underline">
                  Cảm biến trên máy hút ẩm có vai trò như thế nào trong hoạt động
                  của thiết bị?
                </Link>
              </li>
              <li>
                <Link href="/blog" className="underline hover:no-underline">
                  Chế độ auto-X và cảm biến độ ẩm Humidity Sensor của máy lạnh
                  Panasonic có đặc điểm gì nổi trội?
                </Link>
              </li>
            </ul>
          </div>
        </article>

        <aside className="lg:col-span-3 xl:col-span-3">
          <div className="sticky top-24 space-y-4">
            {products.map((p) => (
              <div
                key={p.name}
                className="rounded-md border border-neutral bg-white p-3"
              >
                <div className="mb-3 overflow-hidden rounded bg-neutral">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-44 w-full object-cover"
                  />
                </div>
                <div className="mb-1 text-sm text-primary">Trả góp 0%</div>
                <div className="text-sm text-primary-light line-through">{p.oldPrice}</div>
                <div className="text-xl font-bold text-primary">{p.price}</div>
                <div className="text-sm text-promotion">Giảm: 1.000.000đ</div>
                <div className="mt-2 text-[16px] text-primary">{p.name}</div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
