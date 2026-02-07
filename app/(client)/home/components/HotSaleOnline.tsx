'use client';

import { ProductDTO } from '@/lib/api-demo';
import HotSaleProductCard from './HotSaleProductCard';
import { useState, useEffect } from 'react';

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

  // Session tabs data
  const sessions = [
    { time: '10:00, 30/01', countdown: `${timeLeft.hours}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`, active: true },
    { time: '10:00, 30/01', status: 'Sắp diễn ra', active: false },
    { time: '10:00, 30/01', status: 'Sắp diễn ra', active: false },
  ];

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Header Tab - SALE ONLINE - Above the border */}
          <div className="flex justify-center relative z-10">
            <div className="bg-promotion px-16 py-3 flex items-center gap-2 rounded-t-2xl">
              {/* Fire Icon */}
              <svg className="w-6 h-6 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.5 2C12.5 2 9.5 5.5 9.5 9.5C9.5 11.71 11.29 13.5 13.5 13.5C15.71 13.5 17.5 11.71 17.5 9.5C17.5 7.5 15.5 4 15.5 4L14.5 6C14.5 6 13.5 4.5 13.5 3.5C13.5 3.5 12.5 4.37 12.5 6V2Z" />
              </svg>
              <h2 className="text-xl md:text-2xl font-black text-yellow-300 tracking-wider">
                SALE ONLINE
              </h2>
            </div>
          </div>

          {/* Main Container with Red Border */}
          <div className="relative rounded-3xl border-4 border-promotion overflow-hidden bg-white -mt-1">

          {/* Session Tabs */}
          <div className="border-b-4 border-promotion">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {sessions.map((session, i) => (
                <button
                  key={i}
                  className={`flex-1 min-w-[200px] px-6 py-4 text-sm font-semibold transition-all border-b-4 ${
                    session.active
                      ? 'bg-white text-primary border-promotion'
                      : 'bg-neutral-light text-neutral-dark border-transparent hover:bg-white/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-bold text-base">{session.time}</div>
                    {session.active ? (
                      <div className="text-sm mt-1">
                        Bắt đầu sau: <span className="font-bold text-promotion">{session.countdown}</span>
                      </div>
                    ) : (
                      <div className="text-sm mt-1 text-neutral-dark-hover">{session.status}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="p-6 bg-white">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.slice(0, 4).map((product, index) => (
                <HotSaleProductCard key={product.product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}