'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderSummaryProps {
  subtotal: number;
  discounts: number;
  shipping: number;
  total: number;
  points: number;
  onCheckout: () => void;
  onOpenPromotion?: () => void;
}

export default function OrderSummary({
  subtotal,
  discounts,
  shipping,
  total,
  points,
  onCheckout,
  onOpenPromotion
}: OrderSummaryProps) {
  const [usePoints, setUsePoints] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const handleUsePointsChange = (checked: boolean) => {
    setUsePoints(checked);
    checked
      ? toast.success('Đã áp dụng điểm thưởng')
      : toast('Đã hủy sử dụng điểm thưởng', { icon: 'ℹ️' });
  };

  const handleCheckoutClick = () => {
    if (!agreedToTerms) {
      toast.error('Vui lòng đồng ý với điều khoản dịch vụ');
      return;
    }
    onCheckout();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm sticky top-4">
      <div className="p-4 sm:p-5 space-y-4">
        {/* CHỌN ƯU ĐÃI */}
        <div
          onClick={onOpenPromotion}
          className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:border-yellow-500"
          style={{ borderColor: 'rgb(var(--yellow))' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgb(var(--yellow))' }}
          >
            <span className="font-bold" style={{ color: 'rgb(var(--blue-darker))' }}>%</span>
          </div>
          <span 
            className="text-sm font-medium flex-1"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Chọn hoặc nhập ưu đãi
          </span>
          <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
        </div>

        {/* ĐĂNG NHẬP ĐỂ SỬ DỤNG ĐIỂM THƯỞNG */}
        <label className="flex items-center justify-between cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <span 
              className="text-sm"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Đăng nhập để sử dụng điểm thưởng
            </span>
          </div>
          <input
            type="checkbox"
            checked={usePoints}
            onChange={(e) => handleUsePointsChange(e.target.checked)}
            className="w-5 h-5 cursor-pointer"
            style={{ accentColor: 'rgb(var(--yellow))' }}
          />
        </label>

        {/* THÔNG TIN ĐƠN HÀNG */}
        <div className="pt-4 border-t">
          <h3 
            className="font-semibold mb-3 text-sm"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Thông tin đơn hàng
          </h3>

          {showDetails && (
            <div className="space-y-2 text-sm mb-3">
              <Row label="Tổng tiền" value={formatPrice(subtotal)} />
              <Row
                label="Tổng khuyến mãi"
                value={`-${formatPrice(discounts)}`}
                color="text-red-600"
              />
              <Row
                label="Giảm giá sản phẩm"
                value={formatPrice(discounts)}
                muted
              />
              <Row label="Voucher" value="0đ" muted />
              <Row
                label="Phí vận chuyển"
                value={shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                success={shipping === 0}
              />
            </div>
          )}

          {/* TỔNG THANH TOÁN */}
          <div className="flex justify-between items-center pt-3 mt-3 border-t">
            <span 
              className="font-semibold text-sm"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Cần thanh toán
            </span>
            <span
              className="text-xl font-bold"
              style={{ 
                color: 'rgb(var(--red))',
                fontFamily: 'var(--font-poppins)'
              }}
            >
              {formatPrice(total)}
            </span>
          </div>

          {/* ĐIỂM THƯỞNG */}
          <div className="flex justify-between items-center mt-2 text-xs">
            <span style={{ fontFamily: 'var(--font-poppins)' }}>Điểm thưởng</span>
            <span className="flex items-center gap-1">
              <span>⭐</span>
              <span 
                className="font-medium"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                +{points.toLocaleString()}
              </span>
            </span>
          </div>
        </div>

        {/* RÚT GỌN / XEM CHI TIẾT */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-sm flex items-center justify-center gap-1 py-2 hover:bg-gray-50 rounded transition-colors cursor-pointer"
          style={{ 
            color: 'rgb(var(--blue))',
            fontFamily: 'var(--font-poppins)'
          }}
        >
          {showDetails ? 'Rút gọn ▲' : 'Xem chi tiết ▼'}
        </button>

        {/* NÚT ĐẶT HÀNG */}
        <button
          onClick={handleCheckoutClick}
          disabled={!agreedToTerms}
          className="w-full py-3 rounded-lg text-base font-semibold shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{
            backgroundColor: agreedToTerms ? 'rgb(var(--yellow))' : '#ccc',
            color: 'rgb(var(--blue-darker))',
            fontFamily: 'var(--font-poppins)'
          }}
        >
          Đặt hàng
        </button>

        {/* ĐIỀU KHOẢN */}
        <label className="flex gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 cursor-pointer flex-shrink-0"
            style={{ accentColor: 'rgb(var(--yellow))' }}
          />
          <p style={{ 
            color: 'rgb(var(--neutral-darker))',
            fontFamily: 'var(--font-poppins)'
          }}>
            Bằng việc tiến hành đặt mua hàng, bạn đồng ý với{' '}
            <a className="underline font-medium hover:text-red-600 cursor-pointer" href="#">
              Điều khoản dịch vụ
            </a>{' '}
            và{' '}
            <a className="underline font-medium hover:text-red-600 cursor-pointer" href="#">
              Chính sách xử lý dữ liệu cá nhân
            </a>{' '}
            của ChoCongNghe.
          </p>
        </label>

        {/* TÙY CHỌN */}
        <button className="w-full py-2.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium cursor-pointer">
          Tùy chọn ▼
        </button>
      </div>
    </div>
  );
}

/* ===================== HELPER ===================== */
function Row({
  label,
  value,
  muted,
  success,
  color
}: {
  label: string;
  value: string;
  muted?: boolean;
  success?: boolean;
  color?: string;
}) {
  return (
    <div className="flex justify-between" style={{ fontFamily: 'var(--font-poppins)' }}>
      <span className={muted ? 'text-gray-400 text-xs' : 'text-xs'}>{label}</span>
      <span
        className={`font-medium text-xs ${
          success ? 'text-green-600' : color || ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}