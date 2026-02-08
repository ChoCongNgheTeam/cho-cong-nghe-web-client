export default function WishlistSidebar() {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* User */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center">
          👤
        </div>
        <div>
          <p className="font-medium">Nguyễn Khánh duy</p>
          <p className="text-sm text-neutral-500">0990023128</p>
        </div>
      </div>

      <hr />

      {/* Menu */}
      <ul className="space-y-2 text-sm">
        <li className="px-3 py-2 rounded hover:bg-neutral-100 cursor-pointer">
          Đơn hàng của tôi
        </li>
        <li className="px-3 py-2 rounded hover:bg-neutral-100 cursor-pointer">
          Thông tin bảo hành
        </li>
        <li className="px-3 py-2 rounded hover:bg-neutral-100 cursor-pointer">
          Thông báo của tôi
        </li>
        <li className="px-3 py-2 rounded hover:bg-neutral-100 cursor-pointer">
          Địa chỉ nhận hàng
        </li>
        <li className="px-3 py-2 rounded bg-neutral-100 font-medium">
          Sản phẩm yêu thích
        </li>
        <li className="px-3 py-2 rounded hover:bg-neutral-100 cursor-pointer">
          Đăng xuất
        </li>
      </ul>
    </div>
  );
}
