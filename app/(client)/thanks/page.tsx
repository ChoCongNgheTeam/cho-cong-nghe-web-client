import React from "react";
import Link from "next/link";
import { Check, Home, ShoppingBag, Package, Clock, Mail } from "lucide-react";

export default function ThanksPage() {
   return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-light transition-colors">
         <div className="w-full max-w-2xl">
            {/* Main Card */}
            <div className="rounded-3xl overflow-hidden shadow-2xl bg-neutral transition-colors">
               {/* ===== HEADER ===== */}
               <div className="relative px-8 py-12 text-center overflow-hidden bg-linear-to-br from-accent via-accent-hover to-accent-dark">
                  {/* Decorative */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-20 translate-y-20" />

                  {/* Icon */}
                  <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral shadow-lg">
                     <Check className="w-12 h-12 text-accent" strokeWidth={3} />
                  </div>

                  <h1 className="mb-3 text-4xl font-bold text-primary">
                     Đặt hàng thành công!
                  </h1>
                  <p className="text-base text-neutral-darker">
                     Cảm ơn bạn đã tin tưởng ChoCongNghe
                  </p>
               </div>

               {/* ===== CONTENT ===== */}
               <div className="px-8 py-10">
                  {/* Order Info */}
                  <div className="mb-8 rounded-2xl p-6 border bg-accent-light border-accent/40">
                     <div className="flex items-start gap-4">
                        <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                           <Package className="w-6 h-6 text-primary" />
                        </div>

                        <div>
                           <h2 className="mb-2 text-xl font-semibold text-primary">
                              Đơn hàng đã được ghi nhận
                           </h2>
                           <p className="text-sm leading-relaxed text-neutral-darker">
                              Chúng tôi đã nhận được đơn hàng của bạn và đang
                              tiến hành xử lý. Bạn sẽ nhận được email xác nhận
                              trong giây lát.
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* ===== TIMELINE ===== */}
                  <div className="mb-8">
                     <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-primary">
                        <Clock className="w-5 h-5 text-accent" />
                        Bước tiếp theo
                     </h3>

                     <div className="relative">
                        <div className="absolute left-0 right-0 top-6 hidden h-0.5 sm:block bg-accent/30" />

                        <div className="flex flex-col gap-6 sm:flex-row sm:gap-4">
                           {[
                              {
                                 step: 1,
                                 title: "Xác nhận đơn hàng",
                                 desc: "Liên hệ trong 15–30 phút",
                              },
                              {
                                 step: 2,
                                 title: "Chuẩn bị hàng",
                                 desc: "Đóng gói cẩn thận",
                              },
                              {
                                 step: 3,
                                 title: "Giao hàng",
                                 desc: "Thông báo qua email & SMS",
                              },
                           ].map((item) => (
                              <div
                                 key={item.step}
                                 className="flex flex-1 flex-col items-center text-center"
                              >
                                 <div className="z-10 mb-3 flex h-12 w-12 items-center justify-center rounded-full shadow-md bg-accent text-primary font-bold">
                                    {item.step}
                                 </div>
                                 <p className="mb-1 font-semibold text-primary">
                                    {item.title}
                                 </p>
                                 <p className="text-sm text-neutral-darker">
                                    {item.desc}
                                 </p>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* ===== CONTACT ===== */}
                  <div className="mb-8 rounded-2xl p-6 bg-linear-to-r from-neutral-light to-neutral">
                     <div className="mb-3 flex items-center gap-3">
                        <Mail className="w-5 h-5 text-accent" />
                        <h3 className="font-semibold text-primary">
                           Cần hỗ trợ?
                        </h3>
                     </div>

                     <p className="mb-3 text-sm text-neutral-darker">
                        Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn
                     </p>

                     <div className="flex flex-wrap gap-3 text-sm">
                        <a
                           href="tel:18006777"
                           className="font-medium text-accent hover:underline"
                        >
                           📞 1800 6777
                        </a>
                        <span className="opacity-40">•</span>
                        <a
                           href="mailto:ceo@electro.com"
                           className="font-medium text-accent hover:underline"
                        >
                           ✉️ ceo@electro.com
                        </a>
                     </div>
                  </div>

                  {/* ===== ACTIONS ===== */}
                  <div className="flex flex-col gap-4 sm:flex-row">
                     <Link
                        href="/"
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl py-4 px-6 font-semibold bg-primary text-white transition hover:bg-primary-hover"
                     >
                        <Home className="w-5 h-5" />
                        Về trang chủ
                     </Link>

                     <Link
                        href="/products"
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl py-4 px-6 font-semibold border border-accent text-accent transition hover:bg-accent-light"
                     >
                        <ShoppingBag className="w-5 h-5" />
                        Tiếp tục mua sắm
                     </Link>
                  </div>
               </div>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-neutral-darker">
               Mã đơn hàng và thông tin chi tiết đã được gửi về email của bạn
            </p>
         </div>
      </div>
   );
}
