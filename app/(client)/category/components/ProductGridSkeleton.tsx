export default function ProductGridSkeleton() {
   return (
      <div>
         {/* Sort Options Skeleton */}
         <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="flex items-center gap-2">
               {[1, 2, 3, 4].map((i) => (
                  <div
                     key={i}
                     className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse"
                  />
               ))}
            </div>
         </div>

         {/* Product Grid Skeleton */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(12)].map((_, index) => (
               <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-4 animate-pulse"
               >
                  {/* Image Skeleton */}
                  <div className="aspect-square bg-gray-200 rounded-lg mb-3" />

                  {/* Title Skeleton */}
                  <div className="space-y-2 mb-3">
                     <div className="h-4 bg-gray-200 rounded w-full" />
                     <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>

                  {/* Rating Skeleton */}
                  <div className="h-4 bg-gray-200 rounded w-32 mb-3" />

                  {/* Highlights Skeleton */}
                  <div className="space-y-2 mb-3">
                     <div className="h-3 bg-gray-200 rounded w-full" />
                     <div className="h-3 bg-gray-200 rounded w-full" />
                     <div className="h-3 bg-gray-200 rounded w-4/5" />
                  </div>

                  {/* Color Options Skeleton */}
                  <div className="flex gap-2 mb-3">
                     {[1, 2, 3, 4].map((i) => (
                        <div
                           key={i}
                           className="w-6 h-6 bg-gray-200 rounded-full"
                        />
                     ))}
                  </div>

                  {/* Storage Options Skeleton */}
                  <div className="flex gap-2 mb-3">
                     {[1, 2, 3].map((i) => (
                        <div
                           key={i}
                           className="h-7 w-16 bg-gray-200 rounded-lg"
                        />
                     ))}
                  </div>

                  {/* Price Skeleton */}
                  <div className="space-y-1 mb-3">
                     <div className="h-6 bg-gray-200 rounded w-32" />
                     <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>

                  {/* Installment Badge Skeleton */}
                  <div className="h-10 bg-gray-200 rounded-lg mb-3" />

                  {/* Button Skeleton */}
                  <div className="h-9 bg-gray-200 rounded-lg" />
               </div>
            ))}
         </div>
      </div>
   );
}
