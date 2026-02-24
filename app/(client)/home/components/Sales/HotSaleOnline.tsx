"use client";

import { ProductDTO } from "@/lib/api-demo";
import { useState, useEffect } from "react";
import { Slidezy } from "@/components/Slider";
import { Flame } from "lucide-react";
import HotSaleProductCard from "./HotSaleProductCard";

interface HotSaleOnlineProps {
   products: ProductDTO[];
}

export default function HotSaleOnline({ products }: HotSaleOnlineProps) {
   const [timeLeft, setTimeLeft] = useState({
      hours: 10,
      minutes: 37,
      seconds: 54,
   });

   useEffect(() => {
      const timer = setInterval(() => {
         setTimeLeft((prev) => {
            let { hours, minutes, seconds } = prev;

            if (seconds > 0) {
               seconds--;
            } else {
               seconds = 59;
               if (minutes > 0) {
                  minutes--;
               } else {
                  minutes = 59;
                  if (hours > 0) {
                     hours--;
                  } else {
                     hours = 23;
                  }
               }
            }

            return { hours, minutes, seconds };
         });
      }, 1000);

      return () => clearInterval(timer);
   }, []);

   const sessions = [
      {
         time: "10:00, 30/01",
         countdown: `${timeLeft.hours}:${timeLeft.minutes.toString().padStart(2, "0")}:${timeLeft.seconds.toString().padStart(2, "0")}`,
         active: true,
      },
      { time: "10:00, 30/01", status: "Sắp diễn ra", active: false },
      { time: "10:00, 30/01", status: "Sắp diễn ra", active: false },
   ];

   return (
      <section className="py-6 md:py-8">
         <div className="container">
            <div className="relative">
               {/* Header Tab */}
               <div className="flex justify-center relative z-10">
                  <div className="bg-promotion px-16 py-3 flex items-center gap-2 rounded-t-2xl">
                     <Flame className="w-10 h-10 text-yellow-400 fill-yellow-400" />
                     <h2 className="text-xl md:text-2xl font-black text-yellow-300 tracking-wider">
                        SALE ONLINE
                     </h2>
                  </div>
               </div>

               {/* Main Container */}
               <div className="relative rounded-3xl border-4 border-promotion overflow-hidden bg-white -mt-1">
                  {/* Session Tabs */}
                  <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                     {sessions.map((session, i) => (
                        <button
                           key={i}
                           className={`shrink-0 w-45 px-4 py-4 text-center transition-all cursor-pointer ${
                              session.active
                                 ? "bg-promotion-light-hover border-b-2 border-promotion-hover"
                                 : ""
                           }`}
                        >
                           <div className="font-semibold text-gray-800 text-sm leading-tight">
                              {session.time}
                           </div>
                           {session.active ? (
                              <div className="text-xs mt-0.5 text-gray-700 leading-tight">
                                 Bắt đầu sau:{" "}
                                 <span className="font-bold text-red-500">
                                    {session.countdown}
                                 </span>
                              </div>
                           ) : (
                              <div className="text-xs mt-0.5 text-gray-500 leading-tight">
                                 {session.status}
                              </div>
                           )}
                        </button>
                     ))}
                  </div>

                  {/* Products Slider */}
                  <div className="px-4 py-2 border-t border-neutral">
                     <Slidezy
                        items={{ mobile: 2, tablet: 3, desktop: 4 }}
                        gap={16}
                        speed={300}
                        loop={false}
                        nav={false}
                        controls={true}
                        slideBy={1}
                        draggable={true}
                     >
                        {products.map((product, index) => (
                           <HotSaleProductCard
                              key={product.product.id}
                              product={product}
                              index={index}
                           />
                        ))}
                     </Slidezy>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
}
