interface RatingStarsProps {
   rating: number;
   count: number;
}

export default function RatingStars({ rating, count }: RatingStarsProps) {
   const fullStars = Math.floor(rating);
   const hasHalfStar = rating % 1 >= 0.5;
   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

   return (
      <div className="flex items-center gap-2">
         <div className="flex items-center">
            {/* Full Stars */}
            {[...Array(fullStars)].map((_, i) => (
               <svg
                  key={`full-${i}`}
                  className="w-4 h-4 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
               >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
               </svg>
            ))}

            {/* Half Star */}
            {hasHalfStar && (
               <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
                  <defs>
                     <linearGradient id="half-fill">
                        <stop
                           offset="50%"
                           stopColor="currentColor"
                           stopOpacity="1"
                        />
                        <stop
                           offset="50%"
                           stopColor="currentColor"
                           stopOpacity="0.2"
                        />
                     </linearGradient>
                  </defs>
                  <path
                     fill="url(#half-fill)"
                     d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
                  />
               </svg>
            )}

            {/* Empty Stars */}
            {[...Array(emptyStars)].map((_, i) => (
               <svg
                  key={`empty-${i}`}
                  className="w-4 h-4 text-gray-300 fill-current"
                  viewBox="0 0 20 20"
               >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
               </svg>
            ))}
         </div>

         <span className="text-xs text-gray-600">
            {rating.toFixed(1)} ({count})
         </span>
      </div>
   );
}
