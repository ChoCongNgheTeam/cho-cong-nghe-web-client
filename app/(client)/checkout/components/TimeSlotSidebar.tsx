"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface TimeSlot {
   id: number;
   label: string;
   available: boolean;
}

interface TimeSlotSidebarProps {
   isOpen: boolean;
   onClose: () => void;
   onSelect: (date: string, time: string) => void;
   selectedSlot: string;
}

export default function TimeSlotSidebar({
   isOpen,
   onClose,
   onSelect,
   selectedSlot,
}: TimeSlotSidebarProps) {
   const [selectedDate, setSelectedDate] = useState("12");
   const [selectedTime, setSelectedTime] = useState(
      selectedSlot || "16:00 -> 17:00",
   );
   const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

   useEffect(() => {
      const fetchTimeSlots = async () => {
         const slots: TimeSlot[] = [
            { id: 1, label: "9:00 -> 10:00", available: true },
            { id: 2, label: "10:00 -> 11:00", available: true },
            { id: 3, label: "11:00 -> 12:00", available: true },
            { id: 4, label: "12:00 -> 13:00", available: true },
            { id: 5, label: "13:00 -> 14:00", available: true },
            { id: 6, label: "14:00 -> 15:00", available: true },
            { id: 7, label: "15:00 -> 16:00", available: true },
            { id: 8, label: "16:00 -> 17:00", available: true },
            { id: 9, label: "17:00 -> 18:00", available: true },
            { id: 10, label: "18:00 -> 19:00", available: true },
         ];
         setTimeSlots(slots);
      };

      if (isOpen) {
         fetchTimeSlots();
      }
   }, [isOpen]);

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
      if (!selectedDate || !selectedTime) {
         toast.error("Vui lòng chọn ngày và giờ nhận hàng");
         return;
      }

      onSelect(`Thứ Hai (${selectedDate}/01)`, selectedTime);
      toast.success("Đã cập nhật thời gian nhận hàng");
      onClose();
   };

   if (!isOpen) return null;

   const dates = [
      { label: "Thứ Hai", value: "12" },
      { label: "Thứ Ba", value: "13" },
      { label: "Thứ Tư", value: "14" },
      { label: "Thứ Năm", value: "15" },
   ];

   return (
      <>
         {/* Backdrop - Blur effect */}
         <div
            className="fixed inset-0 z-40 transition-all cursor-pointer backdrop-blur-sm bg-neutral-light/70"
            onClick={onClose}
         />

         {/* Sidebar */}
         <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] lg:w-[520px] bg-neutral-light shadow-2xl z-50 overflow-hidden">
            <div className="flex flex-col h-full">
               {/* Header */}
               <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral shrink-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-primary">
                     Chọn thời gian nhận hàng
                  </h2>
                  <button
                     onClick={onClose}
                     className="text-neutral-dark hover:text-neutral-darker text-2xl w-8 h-8 flex items-center justify-center cursor-pointer transition-colors hover:bg-neutral rounded-full"
                  >
                     <X size={24} />
                  </button>
               </div>

               {/* Content - Scrollable */}
               <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {/* Date Selection */}
                  <div className="mb-6">
                     <p className="text-sm font-medium mb-3 text-primary">
                        Chọn ngày nhận:
                     </p>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {dates.map((date) => (
                           <button
                              key={date.value}
                              type="button"
                              onClick={() => setSelectedDate(date.value)}
                              className={`py-3 px-2 rounded-lg border-2 text-center transition-all cursor-pointer ${
                                 selectedDate === date.value
                                    ? "border-primary bg-primary text-neutral-light font-medium shadow-md"
                                    : "border-neutral-dark hover:border-neutral-darker hover:shadow-sm text-primary"
                              }`}
                           >
                              <div className="text-sm">{date.label}</div>
                              <div className="text-lg font-semibold mt-1">
                                 {date.value}
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Time Slot Selection */}
                  <div>
                     <p className="text-sm font-medium mb-3 text-primary">
                        Chọn giờ nhận:
                     </p>
                     <div className="space-y-2">
                        {timeSlots.map((slot) => (
                           <label
                              key={slot.id}
                              className={`flex items-center gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                 selectedTime === slot.label
                                    ? "border-accent bg-accent-light shadow-sm"
                                    : "border-neutral-dark hover:border-neutral-darker hover:shadow-sm"
                              }`}
                           >
                              <input
                                 type="radio"
                                 name="timeSlot"
                                 checked={selectedTime === slot.label}
                                 onChange={() => setSelectedTime(slot.label)}
                                 className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer accent-accent"
                              />
                              <span
                                 className={`text-sm ${selectedTime === slot.label ? "font-semibold text-primary" : "text-primary"}`}
                              >
                                 {slot.label}
                              </span>
                           </label>
                        ))}
                     </div>
                  </div>

                  {/* Selected Info */}
                  <div className="mt-6 p-4 bg-neutral rounded-lg border border-neutral-dark">
                     <p className="text-sm text-center text-primary">
                        Nhận hàng vào:{" "}
                        <span className="font-semibold text-primary">
                           Thứ Hai ({selectedDate}/01)
                        </span>
                        , lúc:{" "}
                        <span className="font-semibold text-primary">
                           {selectedTime}
                        </span>
                     </p>
                  </div>
               </div>

               {/* Footer */}
               <div className="p-4 sm:p-6 border-t border-neutral space-y-3 shrink-0">
                  <button
                     type="button"
                     onClick={handleConfirm}
                     className="w-full py-3 rounded-lg font-medium text-sm cursor-pointer transition-all hover:shadow-md bg-primary hover:bg-primary-hover text-neutral-light"
                  >
                     Xác nhận
                  </button>

                  <button
                     type="button"
                     onClick={() => {
                        setSelectedDate("12");
                        setSelectedTime("9:00 -> 10:00");
                     }}
                     className="w-full py-3 rounded-lg font-medium text-sm border-2 border-primary cursor-pointer transition-all hover:bg-accent-light text-primary"
                  >
                     Đặt lại thời gian sớm nhất
                  </button>
               </div>
            </div>
         </div>
      </>
   );
}
