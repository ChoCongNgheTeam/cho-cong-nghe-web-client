"use client";

import FaqItem from "../online-purchase/components/FaqItem";
import { FileText } from "lucide-react";

interface FAQ {
  q: string;
  a: string;
}

interface PolicyFAQProps {
  title: string;
  faqs: FAQ[];
}

export default function PolicyFAQ({ title, faqs }: PolicyFAQProps) {
  return (
    <section className="bg-white rounded-3xl p-10 shadow-xl border border-stone-100">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-primary mb-4">{title}</h3>
        <p className="text-xl text-stone-600 max-w-2xl mx-auto">
          Những câu hỏi thường gặp nhất về chính sách này
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {faqs.slice(0, faqs.length / 2).map((faq, i) => (
          <FaqItem key={i} faq={faq} />
        ))}
        {faqs.slice(faqs.length / 2).map((faq, i) => (
          <FaqItem key={`b${i}`} faq={faq} />
        ))}
      </div>
    </section>
  );
}
