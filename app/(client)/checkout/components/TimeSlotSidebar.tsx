'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

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
  selectedSlot 
}: TimeSlotSidebarProps) {
  const [selectedDate, setSelectedDate] = useState('12');
  const [selectedTime, setSelectedTime] = useState(selectedSlot || '16:00 -> 17:00');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      const slots: TimeSlot[] = [
        { id: 1, label: '9:00 -> 10:00', available: true },
        { id: 2, label: '10:00 -> 11:00', available: true },
        { id: 3, label: '11:00 -> 12:00', available: true },
        { id: 4, label: '12:00 -> 13:00', available: true },
        { id: 5, label: '13:00 -> 14:00', available: true },
        { id: 6, label: '14:00 -> 15:00', available: true },
        { id: 7, label: '15:00 -> 16:00', available: true },
        { id: 8, label: '16:00 -> 17:00', available: true },
        { id: 9, label: '17:00 -> 18:00', available: true },
        { id: 10, label: '18:00 -> 19:00', available: true }
      ];
      setTimeSlots(slots);
    };
    
    if (isOpen) {
      fetchTimeSlots();
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Vui lòng chọn ngày và giờ nhận hàng');
      return;
    }

    onSelect(`Thứ Hai (${selectedDate}/01)`, selectedTime);
    toast.success('Đã cập nhật thời gian nhận hàng');
    onClose();
  };

  if (!isOpen) return null;

  const dates = [
    { label: 'Thứ Hai', value: '12' },
    { label: 'Thứ Ba', value: '13' },
    { label: 'Thứ Tư', value: '14' },
    { label: 'Thứ Năm', value: '15' }
  ];

  return (
    <>
      {/* Backdrop - Blur effect on checkout page */}
      <div 
        className="fixed inset-0 z-40 transition-all cursor-pointer"
        style={{
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(255, 255, 255, 0.7)'
        }}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] lg:w-[520px] bg-white shadow-2xl z-50 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 
                className="text-lg sm:text-xl font-semibold" 
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Chọn thời gian nhận hàng
              </h2>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Date Selection */}
            <div className="mb-6">
              <p 
                className="text-sm font-medium mb-3" 
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
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
                        ? 'border-yellow-500 bg-yellow-500 text-white font-medium shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    style={{ fontFamily: 'var(--font-poppins)' }}
                  >
                    <div className="text-sm">{date.label}</div>
                    <div className="text-lg font-semibold mt-1">{date.value}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <p 
                className="text-sm font-medium mb-3" 
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Chọn giờ nhận:
              </p>
              <div className="space-y-2">
                {timeSlots.map((slot) => (
                  <label
                    key={slot.id}
                    className={`flex items-center gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTime === slot.label
                        ? 'border-yellow-500 bg-yellow-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeSlot"
                      checked={selectedTime === slot.label}
                      onChange={() => setSelectedTime(slot.label)}
                      className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer"
                      style={{ accentColor: 'rgb(var(--yellow))' }}
                    />
                    <span 
                      className={`text-sm ${selectedTime === slot.label ? 'font-semibold' : ''}`}
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      {slot.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Selected Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p 
                className="text-sm text-center" 
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Nhận hàng vào: <span className="font-semibold">Thứ Hai ({selectedDate}/01)</span>, lúc:{' '}
                <span className="font-semibold">{selectedTime}</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t space-y-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-3 text-white font-medium rounded-lg cursor-pointer transition-all hover:shadow-md"
              style={{ 
                backgroundColor: 'rgb(var(--yellow))',
                color: 'rgb(var(--blue-darker))',
                fontFamily: 'var(--font-poppins)'
              }}
            >
              Xác nhận
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDate('12');
                setSelectedTime('9:00 -> 10:00');
              }}
              className="w-full py-3 font-medium rounded-lg border-2 cursor-pointer transition-all hover:bg-yellow-50"
              style={{ 
                borderColor: 'rgb(var(--yellow))',
                color: 'rgb(var(--yellow-dark))',
                fontFamily: 'var(--font-poppins)'
              }}
            >
              Đặt lại thời gian sớm nhất
            </button>
          </div>
        </div>
      </div>
    </>
  );
}