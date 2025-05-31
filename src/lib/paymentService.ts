// src/lib/paymentService.ts
import { api } from './api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface StripeResponseDTO {
  sessionId: string;
  url: string;
  status: string;
  message?: string;
}

export interface StorageInfo {
  userId: string;
  currentStorageInBytes: number;
  currentStorageInMB: number;
  currentStorageInGB: number;
  lastUpdated: string | null;
  totalRecords: string;
}

export interface MonthlyBill {
  userId: string;
  month: number;
  year: number;
  monthName: string;
  totalMonthlyBillUSD: string;
  dailyAverageCostUSD: string;
  currentStorageBytes: number;
  currentStorageMB: string;
  currentStorageGB: string;
  daysInMonth: number;
  costPerMBPerDay: string;
  billingPeriod: string;
}

export interface PaymentInformation {
  id: string;
  userId: string;
  storageGb: number;
  costInUsd: number;
  timestamp: string;
  month: number;
  year: number;
}

export interface PaymentHistory {
  content: PaymentInformation[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface PaymentStatus {
  sessionId: string;
  status: string;
  amount: number;
  currency: string;
  storageGb: number;
  createdAt: string;
  updatedAt: string;
}

class PaymentService {
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    params?: Record<string, string | number>
  ): Promise<ApiResponse<T>> {
    try {
      let url = endpoint;
      
      // Add query parameters if provided
      if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, value.toString());
        });
        url += `?${searchParams.toString()}`;
      }

      const response = await api({
        method,
        url,
      });

      // Handle nested response structure from your backend
      const responseData = response.data;
      
      // If the response has a nested data structure, extract it
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return { success: true, data: responseData.data };
      }

      return { success: true, data: responseData };
    } catch (error: any) {
      console.error(`PaymentService error:`, error);
      
      // Extract error message from axios error
      let errorMessage = 'Unknown error occurred';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async checkoutStorageBill(month?: number, year?: number): Promise<ApiResponse<StripeResponseDTO>> {
    const params: Record<string, number> = {};
    if (month) params.month = month;
    if (year) params.year = year;
    
    return this.makeRequest<StripeResponseDTO>('POST', '/payment/checkout', params);
  }

  async getCurrentStorage(): Promise<ApiResponse<StorageInfo>> {
    return this.makeRequest<StorageInfo>('GET', '/payment-info/current-storage');
  }

  async getMonthlyBill(month?: number, year?: number): Promise<ApiResponse<MonthlyBill>> {
    const params: Record<string, number> = {};
    if (month) params.month = month;
    if (year) params.year = year;
    
    return this.makeRequest<MonthlyBill>('GET', '/payment-info/monthly-bill', params);
  }

  async getStorageHistory(page: number = 0, size: number = 10): Promise<ApiResponse<PaymentHistory>> {
    const params = { page, size };
    return this.makeRequest<PaymentHistory>('GET', '/payment-info/storage-history', params);
  }

  async getPaymentStatus(sessionId: string): Promise<ApiResponse<PaymentStatus>> {
    return this.makeRequest<PaymentStatus>('GET', `/payment/status/${sessionId}`);
  }

  async getLatestStorageInfo(): Promise<ApiResponse<PaymentInformation>> {
    return this.makeRequest<PaymentInformation>('GET', '/payment-info/latest');
  }

  async getDailyCost(): Promise<ApiResponse<{
    userId: string;
    dailyCostUSD: number;
    period: string;
    timestamp: string;
  }>> {
    return this.makeRequest('GET', '/payment-info/daily-cost');
  }

  async getCostCalculation(month?: number, year?: number): Promise<ApiResponse<{
    userId: string;
    month: number;
    year: number;
    monthName: string;
    totalCostUSD: number;
    periodStart: string;
    periodEnd: string;
    currentStorageBytes: number;
    currentStorageMB: number;
    currentStorageGB: number;
    monthlyStats: any;
  }>> {
    const params: Record<string, number> = {};
    if (month) params.month = month;
    if (year) params.year = year;
    
    return this.makeRequest('GET', '/payment-info/cost-calculation', params);
  }

  // Helper method for handling Stripe redirects
  static handleStripeRedirect(sessionId: string, success: boolean) {
    const currentUrl = window.location.origin;
    const successUrl = `${currentUrl}/billing?session_id=${sessionId}&success=true`;
    const cancelUrl = `${currentUrl}/billing?session_id=${sessionId}&cancelled=true`;
    
    return success ? successUrl : cancelUrl;
  }

  // Utility method for formatting currency
  static formatCurrency(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num);
  }

  // Utility method for formatting file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Create and export a singleton instance
const paymentService = new PaymentService();
export default paymentService;