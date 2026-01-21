// components/home/ServiceSection.tsx
"use client";

import React from 'react';

const services = [
  { 
    icon: '✓', 
    title: 'Thương hiệu đảm bảo', 
    desc: 'Nhập khẩu, bảo hành chính hãng',
    color: 'bg-promotion/10 text-promotion-dark'
  },
  { 
    icon: '⟲', 
    title: 'Đổi trả dễ dàng', 
    desc: 'Theo chính sách đổi trả tại FPT Shop',
    color: 'bg-blue-50 text-blue-600'
  },
  { 
    icon: '🚚', 
    title: 'Giao hàng tận nơi', 
    desc: 'Trên toàn quốc',
    color: 'bg-green-50 text-green-600'
  },
  { 
    icon: '⭐', 
    title: 'Sản phẩm chất lượng', 
    desc: 'Đảm bảo tương thích và độ bền cao',
    color: 'bg-purple-50 text-purple-600'
  }
];

export default function ServiceSection() {
  return (
    <section className="bg-white rounded-lg p-6 mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {services.map((service, idx) => (
          <div key={idx} className="text-center group">
            <div className={`w-14 h-14 ${service.color} rounded-full flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform`}>
              {service.icon}
            </div>
            <h3 className="font-semibold text-primary mb-1 text-sm">{service.title}</h3>
            <p className="text-xs text-neutral-darker leading-relaxed">{service.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}