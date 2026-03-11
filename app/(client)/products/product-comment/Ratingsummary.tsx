"use client";
import { Star } from "lucide-react";

interface RatingBreakdown {
   stars: number;
   count: number;
}

interface RatingStats {
   average: number;
   total: number;
   breakdown: RatingBreakdown[];
}

interface RatingSummaryProps {
   ratingStats: RatingStats;
}

export default function RatingSummary({ ratingStats }: RatingSummaryProps) {
   const getBarWidth = (count: number) => {
      const maxCount = Math.max(...ratingStats.breakdown.map((r) => r.count));
      return (count / maxCount) * 100;
   };

   return (
      <div className="mb-6 sm:mb-8">
         <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">
            Đánh giá và bình luận
         </h2>

         <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-12 mb-6">
            {/* LEFT */}
            <div className="flex flex-col items-center w-full sm:w-auto">
               <div className="text-5xl sm:text-6xl font-bold mb-2 text-primary">
                  {ratingStats.average}
               </div>

               <div className="flex gap-1 mb-2 flex-wrap justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                     <Star
                        key={star}
                        className="w-4 h-4 sm:w-5 sm:h-5 fill-accent text-accent"
                     />
                  ))}
               </div>

               <div className="text-sm text-neutral-darker mb-3">
                  {ratingStats.total} lượt đánh giá
               </div>

               <button className="px-6 py-2 bg-promotion text-white rounded-full font-medium hover:bg-promotion-hover text-sm sm:text-base">
                  Đánh giá sản phẩm
               </button>
            </div>

            {/* RIGHT */}
            <div className="flex-1 w-full">
               {ratingStats.breakdown.map((rating) => (
                  <div
                     key={rating.stars}
                     className="flex items-center gap-2 sm:gap-3 mb-2"
                  >
                     <span className="text-xs sm:text-sm w-7 sm:w-8 text-neutral-darker">
                        {rating.stars} ⭐
                     </span>

                     <div className="flex-1 h-2 bg-neutral rounded-full overflow-hidden">
                        <div
                           className="h-full bg-promotion rounded-full transition-all duration-300"
                           style={{ width: `${getBarWidth(rating.count)}%` }}
                        />
                     </div>

                     <span className="text-xs sm:text-sm text-neutral-darker w-6 sm:w-8 text-right">
                        {rating.count}
                     </span>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}