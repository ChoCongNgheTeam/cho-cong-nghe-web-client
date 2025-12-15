import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="mb-2 text-2xl font-semibold">Bài viết không tồn tại</h1>
      <p className="mb-6 text-gray-600">
        Bài blog bạn tìm có thể đã bị xóa hoặc chưa được xuất bản.
      </p>
      <Link href="/blog" className="underline">
        Quay lại blog
      </Link>
    </div>
  );
}
