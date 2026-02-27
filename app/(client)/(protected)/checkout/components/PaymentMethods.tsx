"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Banknote, Landmark, CreditCard, Wallet, type LucideIcon } from "lucide-react";
import apiRequest from "@/lib/api";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaymentMethodsResponse {
  data: PaymentMethod[];
  message: string;
}

const METHOD_META: Record<string, { icon: LucideIcon }> = {
  COD: { icon: Banknote },
  Bank_Transfer: { icon: Landmark },
  Credit_Card: { icon: CreditCard },
  Momo: { icon: Wallet },
  ZaloPay: { icon: Wallet },
};

function getMethodMeta(name: string) {
  const key = name.replace(/\s+/g, "_");
  return METHOD_META[key] ?? { icon: CreditCard };
}

interface PaymentMethodsProps {
  selectedMethod?: string;
  onSelect?: (methodId: string) => void;
}

export default function PaymentMethods({ selectedMethod: controlledMethod, onSelect }: PaymentMethodsProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internalSelected, setInternalSelected] = useState<string>("");
  const [showAll, setShowAll] = useState(false);

  const selectedMethod = controlledMethod || internalSelected;
  const VISIBLE_COUNT = 5;
  const visibleMethods = showAll ? methods : methods.slice(0, VISIBLE_COUNT);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        setLoading(true);
        const res = await apiRequest.get<PaymentMethodsResponse>("/payments/active", { noAuth: true });
        const list = res.data ?? [];
        setMethods(list);

        if (list.length > 0) {
          const defaultId = list[0].id;
          setInternalSelected(defaultId);
          // ← Notify parent of the default so page.tsx
          //   has selectedPaymentMethodId even without user interaction
          onSelect?.(defaultId);
        }
      } catch {
        setError("Không thể tải phương thức thanh toán.");
      } finally {
        setLoading(false);
      }
    };

    fetchMethods();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (methodId: string) => {
    setInternalSelected(methodId);
    onSelect?.(methodId);
  };

  return (
    <div className="bg-neutral-light rounded-lg shadow-sm">
      <div className="p-4 sm:p-5 border-b border-neutral">
        <h2 className="text-sm sm:text-base font-semibold text-primary">Phương thức thanh toán</h2>
      </div>

      <div className="p-4 sm:p-5">
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded bg-neutral animate-pulse" />
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <div className="space-y-0">
              {visibleMethods.map((method) => {
                const { icon: Icon } = getMethodMeta(method.name);
                return (
                  <label key={method.id} className="flex items-center gap-3 py-3 cursor-pointer transition-colors -mx-2 px-2 rounded hover:bg-neutral">
                    <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                      <input type="radio" name="payment" checked={selectedMethod === method.id} onChange={() => handleSelect(method.id)} className="sr-only peer" />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedMethod === method.id ? "border-accent bg-accent" : "border-neutral-dark bg-transparent"
                        }`}
                      >
                        {selectedMethod === method.id && <div className="w-2 h-2 rounded-full bg-primary-darker" />}
                      </div>
                    </div>

                    <Icon className="w-5 h-5 shrink-0 text-primary" />

                    <div className="flex-1 min-w-0 pt-0.5">
                      <span className="text-sm leading-tight text-primary">{method.description}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            {methods.length > VISIBLE_COUNT && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-2 py-2 flex items-center justify-center gap-1 text-sm font-medium transition-colors rounded hover:bg-neutral text-primary cursor-pointer"
              >
                <span>{showAll ? "Rút gọn" : "Xem thêm"}</span>
                {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
