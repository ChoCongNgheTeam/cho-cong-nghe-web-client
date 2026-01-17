import React, { useState } from 'react';

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
  onSelect 
}: AddressSidebarProps) {
  const [selected, setSelected] = useState<number | undefined>(selectedAddress);

  const handleConfirm = () => {
    const address = addresses.find(a => a.id === selected);
    if (address) {
      onSelect(address);
      onClose();
    }
  };

  if (!isOpen) return null;

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
      <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] lg:w-[520px] bg-white shadow-2xl z-50 transform transition-transform overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b flex-shrink-0">
            <h2 
              className="text-base sm:text-lg font-semibold" 
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Chọn địa chỉ nhận hàng
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-100 rounded-full"
            >
              ×
            </button>
          </div>

          {/* Warning Message */}
          <div 
            className="p-3 mx-4 sm:mx-5 mt-4 rounded flex-shrink-0" 
            style={{ backgroundColor: 'rgb(var(--yellow-light))' }}
          >
            <div className="flex gap-2">
              <span style={{ color: 'rgb(var(--yellow-dark))' }}>⚠️</span>
              <p 
                className="text-xs leading-relaxed" 
                style={{ 
                  fontFamily: 'var(--font-poppins)', 
                  color: 'rgb(var(--yellow-dark))' 
                }}
              >
                Địa chỉ đã được cập nhật theo đơn vị hành chính sau khi nhập. Vui lòng kiểm tra lại.
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
                    ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200' 
                    : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                }`}
                onClick={() => setSelected(address.id)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={selected === address.id}
                    onChange={() => setSelected(address.id)}
                    className="mt-1 cursor-pointer flex-shrink-0"
                    style={{ accentColor: 'rgb(var(--yellow))' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span 
                        className="font-semibold text-sm"
                        style={{ fontFamily: 'var(--font-poppins)' }}
                      >
                        {address.contact_name}
                      </span>
                      <span 
                        className="text-gray-600 text-sm"
                        style={{ fontFamily: 'var(--font-poppins)' }}
                      >
                        {address.phone}
                      </span>
                      <button 
                        className="text-xs ml-auto cursor-pointer hover:underline transition-all"
                        style={{ 
                          fontFamily: 'var(--font-poppins)',
                          color: 'rgb(var(--blue))'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        Sửa
                      </button>
                    </div>
                    
                    <p 
                      className="text-xs sm:text-sm mb-1"
                      style={{ 
                        fontFamily: 'var(--font-poppins)',
                        color: 'rgb(var(--blue))'
                      }}
                    >
                      Nhận tại: Văn Phòng
                    </p>
                    
                    <p 
                      className="text-xs sm:text-sm font-medium mb-1"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      {address.detail_address.split(',')[0]}
                    </p>
                    
                    <p 
                      className="text-xs sm:text-sm text-gray-600"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      {address.detail_address.split(',').slice(1).join(',')}
                    </p>
                    
                    <p 
                      className="text-xs text-gray-500 mt-2"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      Địa chỉ cũ: {address.detail_address}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t space-y-3 flex-shrink-0">
            <button
              onClick={handleConfirm}
              className="w-full py-2.5 sm:py-3 rounded-lg font-medium text-sm transition-all cursor-pointer hover:shadow-md"
              style={{ 
                backgroundColor: 'rgb(var(--yellow))',
                color: 'rgb(var(--blue-darker))',
                fontFamily: 'var(--font-poppins)' 
              }}
            >
              Xác nhận
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
              }}
              className="w-full py-2.5 sm:py-3 rounded-lg font-medium text-sm border-2 transition-all cursor-pointer hover:bg-yellow-50"
              style={{ 
                borderColor: 'rgb(var(--yellow))',
                color: 'rgb(var(--yellow-dark))',
                fontFamily: 'var(--font-poppins)' 
              }}
            >
              Thêm địa chỉ
            </button>
          </div>
        </div>
      </div>
    </>
  );
}