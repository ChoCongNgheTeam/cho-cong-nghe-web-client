export default function BlogSidebar() {
  return (
    <div className="bg-neutral-light rounded-2xl p-4 space-y-3 shadow-sm">
      <h3 className="font-semibold text-sm mb-2">Danh mục</h3>

      {[
        "Nổi bật",
        "Tin mới",
        "Khuyến mãi",
        "Đánh giá",
        "Thủ thuật",
        "Video hot",
        "Hỏi đáp",
      ].map((item) => (
        <button
          key={item}
          className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-accent-light hover:text-accent transition"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
