import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="mb-2 text-2xl font-semibold">Sản phẩm không tồn tại</h1>
      <p className="mb-6 text-gray-600">Sản phẩm có thể đã ngừng kinh doanh.</p>
      <Link href="/products" className="underline">
        Quay lại danh sách sản phẩm
      </Link>
    </div>
  );
}
