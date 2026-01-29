'use client';

import { useEffect, useState } from 'react';
import {
  getSaleProducts,
  getActivePromotions,
  ProductDTO,
  Promotion,
  PromotionTarget,
} from '@/lib/api-demo';
import Slidezy from '@/components/Slider/Slidezy';
import ProductCard from './ProductCard';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function HotSaleOnline() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, promotionsData] = await Promise.all([
          getSaleProducts(),
          getActivePromotions(),
        ]);

        setProducts(productsData);

        // Lấy promotion active có priority cao nhất
        const activePromotion = promotionsData
          .filter(p => p.is_active)
          .sort((a, b) => b.priority - a.priority)[0];

        if (activePromotion) {
          setPromotion(activePromotion);
        }
      } catch (error) {
        console.error('Error loading hot sale:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!promotion) return;

    const calculateTimeLeft = () => {
      const difference =
        promotion.end_date.getTime() - new Date().getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [promotion]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="h-40 bg-neutral animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!products.length || !promotion) {
    return null;
  }

  const timelineTabs = [
    { time: '10:00, 29/01' },
    { time: '10:00, 30/01' },
    { time: '31/01' },
    { time: '01/02' },
  ];

  return (
    <section className="container py-8">
      <div className="relative">
        {/* Header Badge */}
        <div className="relative h-14 mb-2">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 z-20">
            <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-t-3xl px-16 py-4 shadow-2xl relative overflow-hidden">
              <span className="text-2xl font-black text-white tracking-wide drop-shadow-lg relative z-10">
                {promotion.name}
              </span>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="border-[6px] border-promotion rounded-3xl bg-white overflow-hidden relative">
          {/* Timeline Tabs */}
          <div className="border-b-2 border-gray-200 bg-gradient-to-b from-red-50 to-white px-6 pt-6">
            <div className="flex items-start gap-6 overflow-x-auto pb-4">
              {timelineTabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex-shrink-0 transition-all ${
                    activeTab === index ? '' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`text-base font-bold mb-2 whitespace-nowrap ${
                      activeTab === index
                        ? 'text-primary'
                        : 'text-gray-600'
                    }`}
                  >
                    {tab.time}
                  </div>

                  {activeTab === index ? (
                    <div className="flex items-center gap-2 pb-2">
                      <span className="text-xs text-gray-600">
                        Kết thúc sau:
                      </span>
                      <div className="flex items-center gap-1">
                        <TimeBox value={timeLeft.days} />
                        <span className="text-promotion font-bold text-sm">
                          :
                        </span>
                        <TimeBox value={timeLeft.hours} />
                        <span className="text-promotion font-bold text-sm">
                          :
                        </span>
                        <TimeBox value={timeLeft.minutes} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 pb-2">
                      Sắp diễn ra
                    </div>
                  )}

                  {activeTab === index && (
                    <div className="h-1 bg-promotion rounded-t"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Products Slider */}
          <div className="p-8 bg-white">
            <Slidezy
              items={{ mobile: 2, tablet: 3, desktop: 5 }}
              speed={400}
              gap={16}
              loop={false}
              nav={false}
              controls={true}
              slideBy={1}
              draggable={true}
            >
              {products.map(product => {
                // ✅ Promotion đúng ERD: lấy từ product.activePromotions
                const promotionTarget: PromotionTarget | undefined =
                  product.activePromotions.find(
                    pt => pt.promotion_id === promotion.id
                  );

                return (
                  <ProductCard
                    key={product.product.id}
                    product={product}
                  />
                );
              })}
            </Slidezy>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimeBox({ value }: { value: number }) {
  return (
    <div className="bg-promotion text-white font-bold text-xs px-2 py-1 rounded min-w-[26px] text-center">
      {String(value).padStart(2, '0')}
    </div>
  );
}
