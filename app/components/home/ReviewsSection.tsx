"use client";

import { reviews } from "../../data/reviews";

export default function ReviewsSection() {
   return (
      <section className="bg-white py-8 mb-6 rounded-lg shadow-sm">
         <div className="container mx-auto px-6">
            {/* TITLE */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
               <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">
                  Góc Review cho bạn
               </h2>
               <a
                  href="#reviews"
                  className="text-sm text-blue-600 hover:text-blue-700"
               >
                  Xem tất cả →
               </a>
            </div>

            {/* SLIDER */}
            <div className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory -mx-4 px-4 pb-3 scrollbar-hide">
               {reviews.map((review) => (
                  <div
                     key={review.id}
                     className="shrink-0 w-65 sm:w-70 snap-start cursor-pointer group"
                  >
                     <div className="rounded-lg aspect-video mb-3 overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                           src={review.thumbnail}
                           alt={review.title}
                           className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                              <span className="text-2xl ml-1">▶</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                           {review.author[0]}
                        </div>
                        <div>
                           <p className="text-sm font-medium">
                              {review.author}
                           </p>
                           <p className="text-xs text-gray-500">
                              {review.date} • {review.views} lượt xem
                           </p>
                        </div>
                     </div>

                     <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {review.title}
                     </h3>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}
