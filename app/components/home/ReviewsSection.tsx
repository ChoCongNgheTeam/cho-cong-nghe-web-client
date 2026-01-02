import { reviews } from "../../data/reviews";

export default function ReviewsSection() {
  return (
    <div className="bg-white py-8 mb-6 rounded-lg shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Góc Review cho bạn</h2>
          <a href="#reviews" className="text-sm text-blue-600 hover:text-blue-700">Xem tất cả →</a>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="group cursor-pointer">
              <div className="rounded-lg aspect-video mb-3 overflow-hidden relative">
                <img src={review.thumbnail} alt={review.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                    <span className="text-2xl ml-1">▶</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {review.author[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{review.author}</p>
                  <p className="text-xs text-gray-500">{review.date} • {review.views} lượt xem</p>
                </div>
              </div>
              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">{review.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
