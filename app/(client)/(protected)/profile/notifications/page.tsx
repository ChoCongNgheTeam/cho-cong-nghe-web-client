import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Thông báo",
  robots: { index: false, follow: false },
};

export default function NotificationsPage() {
  return (
    <>
    <div>
       {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-800  text-left mt-2">
        Thông báo của tôi
      </h1>
          <div className="flex flex-col items-center justify-center py-10 px-4">
      {/* Empty Box Image */}
      <div className=" mb-2">
        <img
          src="https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/estore-v2/img/empty_state.png"
          alt="Không có đơn hàng"
          className="object-contain w-60 h-60 mx-auto"
        />
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Bạn chưa có thông báo nào
      </h3>
      <p className="text-gray-600 mb-6 text-center text-sm">
        Cùng khám các dịch vụ tại ChoCongNghe Shop nhé!
      </p>

      {/* CTA Button */}
      <Link
        href="/"
        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-md hover:shadow-lg"
      >
        Khám phá ngay
      </Link>
    </div>
    </div>
    </>
  );
}
