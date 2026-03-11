"use client";

import { forwardRef, useImperativeHandle, useState, useMemo, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { SpecificationGroup } from "@/lib/types/product";

export interface ProductSpecsModalRef {
  open: () => void;
  close: () => void;
}

interface ProductSpecsModalProps {
  specifications?: SpecificationGroup[];
}

const ProductSpecsModal = forwardRef<ProductSpecsModalRef, ProductSpecsModalProps>(
  function ProductSpecsModal({ specifications }, ref) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<number | null>(0);

    const safeSpecifications = specifications ?? [];

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
    }));

    useEffect(() => {
      if (open) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      } else {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }
      return () => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      };
    }, [open]);

    const tabs = useMemo(() => {
      return safeSpecifications.map((group) => ({
        id: group.groupName,
        label: group.groupName,
        data: group.items.map((item) => ({
          label: item.name,
          value: item.unit ? `${item.value} ${item.unit}` : item.value,
        })),
      }));
    }, [safeSpecifications]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-darker/50 px-4">
        <div className="bg-neutral-light w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden border border-neutral">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral">
            <h2 className="text-lg font-semibold text-primary">Chi tiết thông số</h2>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-neutral transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5 text-neutral-darker" />
            </button>
          </div>

          {/* ===== MOBILE: ACCORDION ===== */}
          <div className="block md:hidden max-h-[70vh] overflow-y-auto">
            {tabs.length === 0 ? (
              <EmptyState />
            ) : (
              tabs.map((tab, index) => {
                const isOpen = activeTab === index;
                return (
                  <div key={tab.id} className="border-b border-neutral">
                    <button
                      onClick={() => setActiveTab(isOpen ? null : index)}
                      className="w-full cursor-pointer flex items-center justify-between px-4 py-4 font-semibold text-accent hover:bg-neutral/40 transition-colors"
                    >
                      {tab.label}
                      <ChevronDown
                        className={`w-5 h-5 text-neutral-darker transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 space-y-3">
                        {tab.data.map((row, idx) => (
                          <SpecRow key={idx} {...row} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ===== DESKTOP: SIDEBAR TABS ===== */}
          <div className="hidden md:grid md:grid-cols-4 h-[70vh]">
            {/* Sidebar Tabs */}
            <div className="bg-neutral-light-active border-r border-neutral overflow-y-auto scrollbar-thin">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(index)}
                  className={`w-full text-left px-4 py-3 cursor-pointer text-sm font-medium border-b border-neutral transition-colors
                    ${
                      activeTab === index
                        ? "bg-neutral-light text-promotion border-l-2 border-l-promotion"
                        : "text-primary hover:bg-neutral"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="md:col-span-3 p-6 overflow-y-auto max-h-[70vh] bg-neutral-light scrollbar-thin">
              {tabs.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-3">
                  {tabs[activeTab ?? 0]?.data.map((row, idx) => (
                    <SpecRow key={idx} {...row} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

/* ===== COMPONENT CON ===== */

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="group relative bg-neutral/30 hover:bg-neutral/60 rounded-xl p-4 transition-all duration-200 hover:shadow-sm border border-neutral">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-promotion rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between gap-4">
        <span className="text-sm text-neutral-darker font-medium w-2/5">
          {label}
        </span>
        <span className="text-sm text-primary font-semibold text-right flex-1">
          {value}
        </span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 mb-4 rounded-full bg-neutral flex items-center justify-center text-2xl">
        📄
      </div>
      <p className="text-neutral-darker font-medium">Không có thông số kỹ thuật</p>
    </div>
  );
}

export default ProductSpecsModal;