import { news } from "../../data/news";

export default function NewsSection() {
  return (
    <div className="  py-8 mb-6 rounded-lg shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">TIN TỨC MỚI</h2>
          <a href="#news" className="text-sm text-blue-600 hover:text-blue-700">Xem tất cả →</a>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {news.map((article) => (
            <div key={article.id} className="group cursor-pointer">
              <div className="rounded-lg aspect-video mb-3 overflow-hidden">
                <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex gap-2 items-center">
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-medium">{article.category}</span>
                <span className="text-xs text-gray-400">{article.timeAgo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
