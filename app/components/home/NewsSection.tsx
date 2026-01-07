"use client";

import { news } from "../../data/news";

export default function NewsSection() {
  return (
    <section className="py-8 mb-6 rounded-lg shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* TITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">
            TIN TỨC MỚI
          </h2>
          <a href="#news" className="text-sm text-blue-600 hover:text-blue-700">
            Xem tất cả →
          </a>
        </div>

        {/* SLIDER */}
        <div className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory -mx-4 px-4 pb-3 scrollbar-hide">
          {news.map((article) => (
            <div
              key={article.id}
              className="shrink-0 w-65 sm:w-70 snap-start cursor-pointer"
            >
              <div className="rounded-lg aspect-video mb-3 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex gap-2 items-center">
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-medium">
                  {article.category}
                </span>
                <span className="text-xs text-gray-400">{article.timeAgo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
