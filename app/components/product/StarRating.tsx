import { Star, StarHalf } from "lucide-react";
const STAR_COUNT = 5;
export function StarRating({ average }: { average: number }) {
   return (
      <div className="flex items-center gap-0.5">
         {Array.from({ length: STAR_COUNT }).map((_, i) => {
            const filled = i < Math.floor(average);
            const half = !filled && i < average; // vd: average=4.5, i=4 → half

            if (filled) {
               return (
                  <Star
                     key={i}
                     className="w-4 h-4"
                     fill="#FBBF24"
                     stroke="none"
                  />
               );
            }
            if (half) {
               return (
                  // Dùng relative container để stack Star rỗng + StarHalf
                  <span key={i} className="relative w-4 h-4">
                     <Star
                        className="w-4 h-4 absolute inset-0"
                        fill="rgb(var(--neutral))"
                        stroke="none"
                     />
                     <StarHalf
                        className="w-4 h-4 absolute inset-0"
                        fill="#FBBF24"
                        stroke="none"
                     />
                  </span>
               );
            }
            return (
               <Star
                  key={i}
                  className="w-4 h-4"
                  fill="rgb(var(--neutral))"
                  stroke="none"
               />
            );
         })}
      </div>
   );
}
