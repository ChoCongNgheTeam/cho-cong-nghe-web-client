// API Service for Checkout Flow
// Place this file in: app/(client)/checkout/services/checkoutApi.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface CreateOrderPayload {
  user_id: number;
  address_id: number;
  contact_name: string;
  phone: string;
  payment_method_id: number;
  delivery_date: string;
  delivery_time: string;
  notes?: string;
  request_invoice: boolean;
  use_points: boolean;
  items: Array<{
    product_variant_id: number;
    quantity: number;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface OrderResponse {
  order_id: number;
  order_code: string;
  total_amount: number;
  status: string;
}

export const checkoutAPI = {
  // Get user info
  getUserInfo: async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth token if needed
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  },

  // Get user addresses
  getUserAddresses: async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user-addresses?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  // Get cart items
  getCartItems: async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart-items?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
  },

  // Create order
  createOrder: async (orderData: CreateOrderPayload): Promise<ApiResponse<OrderResponse>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  // Update user info
  updateUserInfo: async (userId: number, userData: {
    full_name: string;
    phone: string;
    email: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user info:', error);
      throw error;
    }
  },

  // Get available payment methods
  getPaymentMethods: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // Validate voucher
  validateVoucher: async (voucherCode: string, userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vouchers/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: voucherCode,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid voucher');
      }

      return await response.json();
    } catch (error) {
      console.error('Error validating voucher:', error);
      throw error;
    }
  },
};

// Export types
export type { CreateOrderPayload, ApiResponse, OrderResponse };