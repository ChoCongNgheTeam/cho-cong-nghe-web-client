import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Address {
   id: number;
   contact_name: string;
   phone: string;
   detail_address: string;
   province_id: number;
   district_id: number;
   ward_id: number;
   type: string;
   is_default: boolean;
}

interface AddressSidebarProps {
   isOpen: boolean;
   onClose: () => void;
   addresses: Address[];
   selectedAddress: number | undefined;
   onSelect: (address: Address) => void;
}

export default function AddressSidebar({
   isOpen,
   onClose,
   addresses,
   selectedAddress,
   onSelect,
}: AddressSidebarProps) {
   const [selected, setSelected] = useState<number | undefined>(
      selectedAddress,
   );

   // Disable body scroll when sidebar is open
   useEffect(() => {
      if (isOpen) {
         // Calculate scrollbar width
         const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;

         // Add padding to prevent layout shift
         document.body.style.paddingRight = `${scrollbarWidth}px`;
         document.body.style.overflow = "hidden";
      } else {
         // Remove padding and restore scroll
         document.body.style.paddingRight = "0px";
         document.body.style.overflow = "unset";
      }

      // Cleanup when component unmounts
      return () => {
         document.body.style.paddingRight = "0px";
         document.body.style.overflow = "unset";
      };
   }, [isOpen]);

   const handleConfirm = () => {
      const address = addresses.find((a) => a.id === selected);
      if (address) {
         onSelect(address);
         onClose();
      }
   };

   if (!isOpen) return null;

   return (
      <>
         {/* Backdrop - Blur effect */}
         <div
            className="fixed inset-0 z-40 transition-all cursor-pointer backdrop-blur-sm bg-neutral-light/70"
            onClick={onClose}
         />

         {/* Sidebar */}
         <div className="fixed inset-y-0 right-0 w-full sm:w-120 lg:w-130 bg-neutral-light shadow-2xl z-50 overflow-hidden">
            <div className="flex flex-col h-full">
               {/* Header */}
               <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral shrink-0">
                  <h2 className="text-base sm:text-lg font-semibold text-primary-darker">
                     Chọn địa chỉ nhận hàng
                  </h2>
                  <button
                     onClick={onClose}
                     className="text-neutral-dark hover:text-neutral-darker text-2xl w-8 h-8 flex items-center justify-center cursor-pointer transition-colors hover:bg-neutral rounded-full"
                  >
                     <X size={24} />
                  </button>
               </div>

               {/* Warning Message */}
               <div className="p-3 mx-4 sm:mx-5 mt-4 rounded shrink-0 bg-accent-light">
                  <div className="flex gap-2">
                     <span className="text-accent-dark">⚠️</span>
                     <p className="text-xs leading-relaxed text-accent-dark">
                        Địa chỉ đã được cập nhật theo đơn vị hành chính sau khi
                        nhập. Vui lòng kiểm tra lại.
                     </p>
                  </div>
               </div>

               {/* Address List - Scrollable */}
               <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                  {addresses.map((address) => (
                     <div
                        key={address.id}
                        className={`border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                           selected === address.id
                              ? "border-accent bg-accent-light ring-2 ring-accent"
                              : "border-neutral-dark hover:border-neutral-darker hover:shadow-sm"
                        }`}
                        onClick={() => setSelected(address.id)}
                     >
                        <div className="flex items-start gap-3">
                           <input
                              type="radio"
                              checked={selected === address.id}
                              onChange={() => setSelected(address.id)}
                              className="mt-1 cursor-pointer shrink-0 accent-accent"
                           />
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                 <span className="font-semibold text-sm text-primary-darker">
                                    {address.contact_name}
                                 </span>
                                 <span className="text-neutral-darker text-sm">
                                    {address.phone}
                                 </span>
                                 <button
                                    className="text-xs ml-auto cursor-pointer hover:underline transition-all text-primary"
                                    onClick={(e) => {
                                       e.stopPropagation();
                                    }}
                                 >
                                    Sửa
                                 </button>
                              </div>

                              <p className="text-xs sm:text-sm mb-1 text-primary">
                                 Nhận tại: Văn Phòng
                              </p>

                              <p className="text-xs sm:text-sm font-medium mb-1 text-primary-darker">
                                 {address.detail_address.split(",")[0]}
                              </p>

                              <p className="text-xs sm:text-sm text-neutral-darker">
                                 {address.detail_address
                                    .split(",")
                                    .slice(1)
                                    .join(",")}
                              </p>

                              <p className="text-xs text-neutral-dark mt-2">
                                 Địa chỉ cũ: {address.detail_address}
                              </p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>

               {/* Footer */}
               <div className="p-4 sm:p-5 border-t border-neutral space-y-3 shrink-0">
                  <button
                     onClick={handleConfirm}
                     className="w-full py-2.5 sm:py-3 rounded-lg font-medium text-sm transition-all cursor-pointer hover:shadow-md bg-accent hover:bg-accent-hover text-primary-darker"
                  >
                     Xác nhận
                  </button>

                  <button
                     onClick={(e) => {
                        e.preventDefault();
                     }}
                     className="w-full py-2.5 sm:py-3 rounded-lg font-medium text-sm border-2 transition-all cursor-pointer hover:bg-accent-light border-accent text-accent-dark"
                  >
                     Thêm địa chỉ
                  </button>
               </div>
            </div>
         </div>
      </>
   );
}
