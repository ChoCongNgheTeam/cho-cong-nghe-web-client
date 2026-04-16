"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { SiZalo } from "react-icons/si";
import Link from "next/link";
import Image from "next/image";

interface OpenSections {
  about: boolean;
  policy: boolean;
  payment: boolean;
  hotline: boolean;
}

const Footer = () => {
  const [openSections, setOpenSections] = useState<OpenSections>({
    about: false,
    policy: false,
    payment: false,
    hotline: false,
  });

  const toggleSection = (section: keyof OpenSections): void => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* ── Banner toàn quốc ── */}
      <div className="bg-gray-800 py-2 md:py-4 lg:py-4">
        <div className="container">
          <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2">Hệ thống ChoCongNghe trên toàn quốc</h2>
          <p className="text-gray-300 text-[11px] sm:text-sm">Bao gồm Cửa hàng chính hãng, Trung tâm bảo hành và hệ thống chi nhánh toàn quốc.</p>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="container py-3 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6">
          {/* ── Cột 1: Logo + MXH + Hotline ── */}
          <div>
            <Link href="/">
              <Image
                src="/logo-dark.png"
                width={180}
                height={60}
                alt="Logo"
                sizes="(max-width: 640px) 100px, (max-width: 1024px) 170px, 190px"
                className="h-auto w-25 sm:w-35 md:w-42.5 lg:w-47.5 hover:opacity-90 transition-opacity -mt-1 sm:-mt-2 mb-3"
                priority
              />
            </Link>
            <p className="text-gray-300 text-[11px] sm:text-sm mb-3 leading-relaxed">
              <span className="font-semibold">ChoCongNghe</span> – Nền tảng mua sắm thiết bị điện tử chính hãng, giao nhanh toàn quốc.
            </p>
            <div className="mb-4">
              <h4 className="text-xs sm:text-sm font-semibold mb-2">KẾT NỐI VỚI ChoCongNghe</h4>
              <div className="flex gap-3">
                <Link
                  href="https://www.facebook.com/profile.php?id=61574743745458"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <FaFacebookF className="w-5 h-5" />
                </Link>
                <Link
                  href="https://x.com/chocongnghe_"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                >
                  <FaXTwitter className="w-5 h-5" />
                </Link>
                <Link
                  href="https://www.instagram.com/chocongnghe.18006060/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
                >
                  <FaInstagram className="w-5 h-5" />
                </Link>
                <Link
                  href="https://zalo.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Zalo"
                  className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <SiZalo className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div>
              <button onClick={() => toggleSection("hotline")} className="w-full flex items-center justify-between mb-2 md:cursor-default">
                <h4 className="text-xs sm:text-sm font-semibold">TỔNG ĐÀI MIỄN PHÍ</h4>
                <ChevronDown className={`w-5 h-5 md:hidden transition-transform ${openSections.hotline ? "rotate-180" : ""}`} />
              </button>
              <div className={`space-y-1.5 text-[11px] sm:text-sm ${openSections.hotline ? "block" : "hidden md:block"}`}>
                <div>
                  <p className="text-gray-400">Tư vấn mua hàng (Miễn phí)</p>
                  <p className="font-semibold">
                    1800.6060 <span className="text-gray-400">(Nhánh 1)</span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Hỗ trợ kỹ thuật</p>
                  <p className="font-semibold">
                    1800.6626 <span className="text-gray-400">(Nhánh 2)</span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Góp ý, khiếu nại</p>
                  <p className="font-semibold">
                    1800.6616 <span className="text-gray-400">(8h00 - 22h00)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Cột 2: Về chúng tôi ── */}
          <div>
            <button onClick={() => toggleSection("about")} className="w-full flex items-center justify-between mb-2 md:cursor-default">
              <h4 className="text-xs sm:text-sm font-semibold">VỀ CHÚNG TÔI</h4>
              <ChevronDown className={`w-5 h-5 md:hidden transition-transform ${openSections.about ? "rotate-180" : ""}`} />
            </button>
            <ul className={`space-y-1 text-[11px] sm:text-sm text-gray-300 ${openSections.about ? "block" : "hidden md:block"}`}>
              {[
                {
                  label: "Giới thiệu về công ty",
                  href: "/policies/about",
                },
                {
                  label: "Quy chế hoạt động",
                  href: "/policies/regulations",
                },
                {
                  label: "Dự án Doanh nghiệp",
                  href: "/policies/enterprise-projects",
                },
                { label: "Tin tức khuyến mãi", href: "/policies/news" },
                {
                  label: "Giới thiệu máy đổi trả",
                  href: "/policies/exchangeIntro",
                },
                {
                  label: "Hướng dẫn mua hàng & thanh toán online",
                  href: "/policies/shoppingGuide",
                },
                {
                  label: "Đại lý ủy quyền và TTBH ủy quyền của Apple",
                  href: "/policies/apple-authorized-centers",
                },
                {
                  label: "Tra cứu bảo hành",
                  href: "/policies/warranty-lookup",
                },
                { label: "Câu hỏi thường gặp", href: "/policies/faq" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Cột 3: Chính sách ── */}
          <div>
            <button onClick={() => toggleSection("policy")} className="w-full flex items-center justify-between mb-2 md:cursor-default">
              <h4 className="text-xs sm:text-sm font-semibold">CHÍNH SÁCH</h4>
              <ChevronDown className={`w-5 h-5 md:hidden transition-transform ${openSections.policy ? "rotate-180" : ""}`} />
            </button>
            <ul className={`space-y-1 text-[11px] sm:text-sm text-gray-300 ${openSections.policy ? "block" : "hidden md:block"}`}>
              {[
                {
                  label: "Chính sách bảo hành",
                  href: "/policies/warranty-policy",
                },
                {
                  label: "Chính sách đổi trả",
                  href: "/policies/Return",
                },
                {
                  label: "Chính sách bảo mật",
                  href: "/policies/Privacy",
                },
                {
                  label: "Chính sách trả góp",
                  href: "/policies/Installment",
                },
                {
                  label: "Chính sách khui hộp sản phẩm",
                  href: "/policies/unboxing",
                },
                {
                  label: "Chính sách giao hàng & lắp đặt",
                  href: "/policies/Delivery",
                },
                {
                  label: "Chính sách mạng di động ChoCongNghe",
                  href: "/policies/MobileNetwork",
                },
                {
                  label: "Chính sách thu thập & xử lý dữ liệu cá nhân",
                  href: "/policies/DataPrivacy",
                },
                {
                  label: "Quy định về hỗ trợ kỹ thuật & sao lưu dữ liệu",
                  href: "/policies/Technical-support",
                },
                {
                  label: "Chính sách giao hàng & lắp đặt Điện máy, Gia dụng",
                  href: "/policies/DeliveryInstallation",
                },
                {
                  label: "Chính sách chương trình khách hàng thân thiết",
                  href: "/policies/Loyalty",
                },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Cột 4: Thanh toán + Chứng nhận ── */}
          <div>
            <button onClick={() => toggleSection("payment")} className="w-full flex items-center justify-between mb-2 md:cursor-default">
              <h4 className="text-xs sm:text-sm font-semibold">HỖ TRỢ THANH TOÁN</h4>
              <ChevronDown className={`w-5 h-5 md:hidden transition-transform ${openSections.payment ? "rotate-180" : ""}`} />
            </button>
            <div className={`${openSections.payment ? "block" : "hidden md:block"}`}>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {/* VISA */}
                <div className="bg-white rounded p-2 flex items-center justify-center h-12">
                  <span className="text-blue-700 font-bold text-lg italic">VISA</span>
                </div>
                {/* MoMo */}
                <div className="bg-pink-600 rounded p-2 flex items-center justify-center h-12">
                  <span className="text-white font-bold text-sm">MoMo</span>
                </div>
                {/* VNPay */}
                <div className="bg-blue-600 rounded p-2 flex items-center justify-center h-12">
                  <span className="text-white font-bold text-xs">VNPay</span>
                </div>
                {/* ZaloPay */}
                <div className="bg-blue-500 rounded p-2 flex items-center justify-center h-12">
                  <span className="text-white font-bold text-xs">ZaloPay</span>
                </div>
                {/* COD */}
                <div className="bg-white rounded p-2 flex flex-col items-center justify-center h-12 gap-0.5">
                  <span className="text-green-700 font-bold text-xs">COD</span>
                  <span className="text-gray-500 text-[8px]">Nhận hàng</span>
                </div>
                {/* Chuyển khoản */}
                <div className="bg-white rounded p-2 flex flex-col items-center justify-center h-12 gap-0.5">
                  <span className="text-blue-700 font-bold text-[9px] text-center">Ngân hàng</span>
                  <span className="text-blue-700 text-[8px] text-center">Chuyển khoản</span>
                </div>
              </div>

              <h4 className="text-xs sm:text-sm font-semibold mb-2">CHỨNG NHẬN</h4>
              <div className="flex gap-2">
                <div className="bg-white rounded p-2 flex items-center justify-center w-16 h-16">
                  <div className="text-center">
                    <div className="text-blue-600 font-bold text-xs">BCT</div>
                    <div className="text-gray-600 text-[8px]">Đã thông báo</div>
                  </div>
                </div>
                <div className="bg-blue-700 rounded p-2 flex items-center justify-center w-16 h-16">
                  <span className="text-white font-bold text-xs text-center">DMCA</span>
                </div>
                <div className="bg-green-600 rounded-full p-2 flex items-center justify-center w-16 h-16">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-gray-700">
        <div className="container py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-xs sm:text-sm text-gray-400">
            <div className="space-y-1">
              <p>© Bản quyền thuộc về ChoCongNghe</p>
              <p>Công ty TNHH ChoCongNghe Việt Nam</p>
              <p>Giấy chứng nhận đăng ký kinh doanh: 0315667679 do Sở Kế hoạch & Đầu tư TP HCM cấp ngày 22/08/2025</p>
              <p>Góp ý & khiếu nại: chocongnghe.info@gmail.com</p>
              <p>Hotline: 1800 6060</p>
              <p>Địa chỉ trụ sở: 50/22 Gò Dầu, Phường Tân Quý, Quận Tân Phú, TP. Hồ Chí Minh</p>
            </div>
            <div className="flex items-center gap-3">
              <img src="https://webmedia.com.vn/images/2021/09/logo-da-thong-bao-bo-cong-thuong-mau-xanh.png" alt="Đã thông báo Bộ Công Thương" className="h-12" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
