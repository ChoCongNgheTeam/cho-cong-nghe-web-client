import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold">Chào mừng bạn đến với MyShop</h1>

      <p className="mb-8 max-w-2xl text-gray-600">
        Nơi bạn có thể khám phá sản phẩm chất lượng với trải nghiệm mượt mà và tối ưu SEO.
      </p>

      <div className="flex gap-4">
        <Link
          href="/products"
          className="rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          Xem sản phẩm
        </Link>

        <Link href="/blog" className="rounded-md border px-6 py-3 hover:bg-gray-100">
          Đọc blog
        </Link>
      </div>
    </section>
  );
}
