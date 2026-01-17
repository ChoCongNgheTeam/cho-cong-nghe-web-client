import React, { useState, useEffect } from 'react';

interface UserInfo {
  id: number;
  full_name: string;
  phone: string;
  email: string;
}

interface UserInfoSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: UserInfo | null;
  onUpdate: (data: { name: string; phone: string; email: string }) => void;
}

export default function UserInfoSidebar({ 
  isOpen, 
  onClose, 
  userInfo, 
  onUpdate 
}: UserInfoSidebarProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.full_name);
      setPhone(userInfo.phone);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      return;
    }
    onUpdate({ name, phone, email });
    onClose();
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
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 lg:w-[420px] bg-white shadow-2xl z-50 transform transition-transform overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b flex-shrink-0">
            <h2 
              className="text-base sm:text-lg font-semibold" 
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Thông tin người đặt
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-100 rounded-full"
            >
              ×
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                  required
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                  required
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email (không bắt buộc)"
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t flex-shrink-0">
            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 rounded-lg font-medium text-sm transition-all cursor-pointer hover:shadow-md"
              style={{ 
                backgroundColor: 'rgb(var(--yellow))',
                color: 'rgb(var(--blue-darker))',
                fontFamily: 'var(--font-poppins)' 
              }}
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </>
  );
}