import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold">
          MyShop
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/products" className="hover:text-blue-600">
            Products
          </Link>
          <Link href="/blog" className="hover:text-blue-600">
            Blog
          </Link>
          <Link href="/cart" className="hover:text-blue-600">
            Cart
          </Link>
          <Link href="/checkout" className="hover:text-blue-600">
            Checkout
          </Link>
          <Link href="/thanks" className="hover:text-blue-600">
            Thanks
          </Link>
          <Link href="/profile" className="hover:text-blue-600">
            Profile
          </Link>
          <Link href="/login" className="rounded-md border px-4 py-2 hover:bg-gray-100">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
