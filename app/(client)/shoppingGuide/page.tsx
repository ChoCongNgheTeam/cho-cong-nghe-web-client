"use client";

import { useState } from "react";
import { steps, paymentMethods, faqs } from "./data";
import StepCard from "./components/StepCard";
import PaymentCard from "./components/PaymentCard";
import FaqItem from "./components/FaqItem";
import Tabs from "./components/Tabs";
import Hero from "./components/Hero";

export default function ShoppingGuide() {
  const [activeTab, setActiveTab] = useState("steps");

  return (
    <div className="min-h-screen bg-stone-50">
        <Hero />
      <div className="">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="container mx-auto px-6 py-10">
        {activeTab === "steps" &&
          steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}

        {activeTab === "payment" &&
          paymentMethods.map((m, i) => (
            <PaymentCard key={i} method={m} />
          ))}

        {activeTab === "faq" &&
          faqs.map((faq, i) => (
            <FaqItem key={i} faq={faq} />
          ))}
      </div>
    </div>
  );
}