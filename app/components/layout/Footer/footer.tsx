"use client";
import React, { useState } from "react";
import { Facebook, Twitter, Instagram, Music, ChevronDown } from "lucide-react";

interface OpenSections {
   about: boolean;
   policy: boolean;
   payment: boolean;
}

const Footer = () => {
   const [openSections, setOpenSections] = useState<OpenSections>({
      about: false,
      policy: false,
      payment: false,
   });

   const toggleSection = (section: keyof OpenSections): void => {
      setOpenSections((prev) => ({
         ...prev,
         [section]: !prev[section],
      }));
   };

   return (
      <footer className="bg-gray-900 text-white">
         <div className="bg-gray-800 py-8">
            <div className="container mx-auto px-4">
               <h2 className="text-xl font-bold mb-2">
                  Hệ thống ChoCongNghe trên toàn quốc
               </h2>
               <p className="text-gray-300 text-sm">
                  Bao gồm Cửa hàng chính hãng, Trung tâm bảo hành và hệ thống
                  chi nhánh toàn quốc.
               </p>
            </div>
         </div>
         <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <div>
                  <h3 className="text-xl font-bold mb-6">ChoCongNghe.</h3>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                     ChoCongNghe – Nền tảng mua sắm thiết bị điện tử chính hãng,
                     giao nhanh toàn quốc.
                  </p>
                  <div className="mb-6">
                     <h4 className="font-semibold mb-3">
                        KẾT NÔI VỚI ChoCongNghe.
                     </h4>
                     <div className="flex gap-3">
                        <a
                           href="#"
                           className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                        >
                           <Facebook className="w-5 h-5" />
                        </a>
                        <a
                           href="#"
                           className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                        >
                           <Twitter className="w-5 h-5" />
                        </a>
                        <a
                           href="#"
                           className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
                        >
                           <Instagram className="w-5 h-5" />
                        </a>
                        <a
                           href="#"
                           className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                        >
                           <Music className="w-5 h-5" />
                        </a>
                     </div>
                  </div>
                  <div>
                     <h4 className="font-semibold mb-3">TỔNG ĐÀI MIỄN PHÍ</h4>
                     <div className="space-y-2 text-sm">
                        <div>
                           <p className="text-gray-400">
                              Tư vấn mua hàng (Miễn phí)
                           </p>
                           <p className="font-semibold">
                              1800.6601{" "}
                              <span className="text-gray-400">(Nhánh 1)</span>
                           </p>
                        </div>
                        <div>
                           <p className="text-gray-400">Hỗ trợ kỹ thuật</p>
                           <p className="font-semibold">
                              1800.6601{" "}
                              <span className="text-gray-400">(Nhánh 2)</span>
                           </p>
                        </div>
                        <div>
                           <p className="text-gray-400">Góp ý, khiếu nại</p>
                           <p className="font-semibold">
                              1800.6616{" "}
                              <span className="text-gray-400">
                                 (8h00 - 22h00)
                              </span>
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               <div>
                  <button
                     onClick={() => toggleSection("about")}
                     className="w-full flex items-center justify-between mb-4 md:cursor-default"
                  >
                     <h4 className="font-semibold">VỀ CHÚNG TÔI</h4>
                     <ChevronDown
                        className={`w-5 h-5 md:hidden transition-transform ${
                           openSections.about ? "rotate-180" : ""
                        }`}
                     />
                  </button>
                  <ul
                     className={`space-y-2 text-sm text-gray-300 ${
                        openSections.about ? "block" : "hidden md:block"
                     }`}
                  >
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Giới thiệu về công ty
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Quy chế hoạt động
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Tư án Doanh nghiệp
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Tin tức khuyến mãi
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Giới thiệu máy đổi trả
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Hướng dẫn mua hàng & thanh toán online
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Đại lý ủy quyền và TTBH ủy quyền của Apple
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Tra cứu hoá đơn điện tử
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Tra cứu bảo hành
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Câu hỏi thường gặp
                        </a>
                     </li>
                  </ul>
               </div>

               <div>
                  <button
                     onClick={() => toggleSection("policy")}
                     className="w-full flex items-center justify-between mb-4 md:cursor-default"
                  >
                     <h4 className="font-semibold">CHÍNH SÁCH</h4>
                     <ChevronDown
                        className={`w-5 h-5 md:hidden transition-transform ${
                           openSections.policy ? "rotate-180" : ""
                        }`}
                     />
                  </button>
                  <ul
                     className={`space-y-2 text-sm text-gray-300 ${
                        openSections.policy ? "block" : "hidden md:block"
                     }`}
                  >
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Chính sách bảo hành
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Chính sách đổi trả
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Chính sách bảo mật
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Chính sách trả góp
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Chính sách khui hộp sản phẩm
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Chính sách giao hàng & lắp đặt
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Chính sách mạng di động ChoCongNghe
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Chính sách thu thập & xử lý dữ liệu cá nhân
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Quy định về hỗ trợ kỹ thuật & sao lưu dữ liệu
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Chính sách giao hàng & lắp đặt Điện máy, Gia dụng
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-white transition-colors"
                        >
                           Chính sách chương trình khách hàng thân thiết
                        </a>
                     </li>
                  </ul>
               </div>

               <div>
                  <button
                     onClick={() => toggleSection("payment")}
                     className="w-full flex items-center justify-between mb-4 md:cursor-default"
                  >
                     <h4 className="font-semibold">HỖ TRỢ THANH TOÁN</h4>
                     <ChevronDown
                        className={`w-5 h-5 md:hidden transition-transform ${
                           openSections.payment ? "rotate-180" : ""
                        }`}
                     />
                  </button>
                  <div
                     className={`${
                        openSections.payment ? "block" : "hidden md:block"
                     }`}
                  >
                     <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="bg-white rounded p-2 flex items-center justify-center h-12">
                           <span className="text-blue-700 font-bold text-lg italic">
                              VISA
                           </span>
                        </div>
                        <div className="bg-white rounded p-2 flex items-center justify-center h-12">
                           <div className="flex items-center gap-0.5">
                              <div className="w-5 h-5 bg-red-500 rounded-full opacity-80"></div>
                              <div className="w-5 h-5 bg-yellow-500 rounded-full opacity-80 -ml-2"></div>
                           </div>
                        </div>
                        <div className="bg-white rounded p-2 flex items-center justify-center h-12">
                           <span className="text-blue-900 font-bold text-sm">
                              JCB
                           </span>
                        </div>
                        <div className="bg-white rounded p-2 flex items-center justify-center h-12">
                           <span className="text-blue-600 font-bold text-xs">
                              AMEX
                           </span>
                        </div>
                        <div className="bg-white rounded p-2 flex items-center justify-center h-12">
                           <span className="text-green-700 font-semibold text-xs">
                              COD
                           </span>
                        </div>
                        <div className="bg-white rounded p-2 flex items-center justify-center h-12">
                           <span className="text-purple-700 font-semibold text-xs">
                              Trả góp
                           </span>
                        </div>
                        <div className="bg-pink-600 rounded p-2 flex items-center justify-center h-12">
                           <span className="text-white font-bold text-sm">
                              MoMo
                           </span>
                        </div>
                        <div className="bg-blue-500 rounded p-2 flex items-center justify-center h-12">
                           <span className="text-white font-bold text-xs">
                              ZaloPay
                           </span>
                        </div>
                        <div className="bg-blue-600 rounded p-2 flex items-center justify-center h-12">
                           <span className="text-white font-bold text-xs">
                              VNPAY
                           </span>
                        </div>
                        <div className="bg-red-600 rounded p-2 flex items-center justify-center h-12">
                           <span className="text-white font-semibold text-xs">
                              Home Credit
                           </span>
                        </div>
                        <div className="bg-black rounded p-2 flex items-center justify-center h-12">
                           <span className="text-white font-semibold text-xs">
                              Apple Pay
                           </span>
                        </div>
                        <div className="bg-blue-700 rounded p-2 flex items-center justify-center h-12">
                           <span className="text-white font-semibold text-xs">
                              Samsung Pay
                           </span>
                        </div>
                     </div>
                     <h4 className="font-semibold mb-4">CHỨNG NHẬN</h4>
                     <div className="flex gap-2">
                        <div className="bg-white rounded p-2 flex items-center justify-center w-16 h-16">
                           <div className="text-center">
                              <div className="text-blue-600 font-bold text-xs">
                                 BCT
                              </div>
                              <div className="text-gray-600 text-[8px]">
                                 Đã thông báo
                              </div>
                           </div>
                        </div>
                        <div className="bg-blue-700 rounded p-2 flex items-center justify-center w-16 h-16">
                           <span className="text-white font-bold text-xs text-center">
                              DMCA
                           </span>
                        </div>
                        <div className="bg-green-600 rounded-full p-2 flex items-center justify-center w-16 h-16">
                           <svg
                              className="w-8 h-8 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth="3"
                                 d="M5 13l4 4L19 7"
                              ></path>
                           </svg>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className="border-t border-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-6">
               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-sm text-gray-400">
                  <div className="space-y-1">
                     <p>© Bản quyền thuộc về ChoCongNghe</p>
                     <p>Công ty TNHH ChoCongNghe Việt Nam</p>
                     <p>
                        Giấy chứng nhận đăng ký kinh doanh: 0315667679 do Sở Kế
                        hoạch & Đầu tư TP HCM cấp ngày 22/08/2025
                     </p>
                     <p>Góp ý & khiếu nại: ceo@electro.com</p>
                     <p>Hotline: 1800 6777</p>
                     <p>
                        Địa chỉ trụ sở: 50/22 Gò Dầu, Phường Tân Quý, Quận Tân
                        Phú, TP. Hồ Chí Minh
                     </p>
                  </div>
                  <div className="flex items-center gap-3">
                     <img
                        src="https://webmedia.com.vn/images/2021/09/logo-da-thong-bao-bo-cong-thuong-mau-xanh.png"
                        alt="Đã thông báo Bộ Công Thương"
                        className="h-12"
                     />
                  </div>
               </div>
            </div>
         </div>
      </footer>
   );
};

export default Footer;
