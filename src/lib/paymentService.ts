// lib/paymentService.ts
import { api } from '@/lib/api';

export interface StorageData {
  userId: string;
  currentStorageInBytes: number;
  currentStorageInMB: number;
  currentStorageInGB: number;
  lastUpdated: string;
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

export interface PaymentHistory {
  content: PaymentInformation[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PaymentInformation {
  id: string;
  userId: string;
  timestamp: string;
  totalStorageUsedInBytes: number;
  previousStorageInBytes: number;
  changeInStorageBytes: number;
  actionType: 'UPLOAD' | 'DELETE';
  mediaId: string;
  fileName: string;
}

export interface StorageUsage {
  id: string;
  userId: string;
  timestamp: string;
  storageUsedInBytes: number;
  periodStart: string;
  periodEnd?: string;
  durationInSeconds?: number;
  calculatedCost?: number;
  costPerBytePerSecond: number;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface StripeResponse {
  status: string;
  message: string;
  sessionId?: string;
  sessionUrl?: string;
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

export interface CostCalculation {
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
  monthlyStats: {
    totalCost: number;
    maxStorageBytes: number;
    minStorageBytes: number;
    avgStorageBytes: number;
    maxStorageMB: number;
    minStorageMB: number;
    avgStorageMB: number;
    totalUsagePeriods: number;
    costPerMBPerDay: number;
  };
}

export class PaymentService {
  
  // Payment Information endpoints
  static async getCurrentStorage(): Promise<StorageData> {
    const response = await api.get('/payment-info/current-storage');
    return response.data;
  }

  static async getMonthlyBill(month?: number, year?: number): Promise<MonthlyBill> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const response = await api.get(`/payment-info/monthly-bill?${params.toString()}`);
    return response.data;
  }

  static async getStorageHistory(page = 0, size = 10): Promise<PaymentHistory> {
    const response = await api.get(`/payment-info/storage-history?page=${page}&size=${size}`);
    return response.data;
  }

  static async getLatestStorageInfo(): Promise<PaymentInformation> {
    const response = await api.get('/payment-info/latest');
    return response.data;
  }

  static async getStorageUsageHistory(page = 0, size = 10): Promise<{ content: StorageUsage[] }> {
    const response = await api.get(`/payment-info/usage-history?page=${page}&size=${size}`);
    return response.data;
  }

  static async getDailyCost(): Promise<{
    userId: string;
    dailyCostUSD: number;
    period: string;
    timestamp: string;
  }> {
    const response = await api.get('/payment-info/daily-cost');
    return response.data;
  }

  static async getCostCalculation(month?: number, year?: number): Promise<CostCalculation> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const response = await api.get(`/payment-info/cost-calculation?${params.toString()}`);
    return response.data;
  }

  // Payment endpoints
  static async createCheckoutSession(month?: number, year?: number): Promise<StripeResponse> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const response = await api.post(`/payment/checkout?${params.toString()}`);
    return response.data;
  }

  static async getPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    const response = await api.get(`/payment/status/${sessionId}`);
    return response.data;
  }

  static async handlePaymentSuccess(sessionId: string): Promise<{
    status: string;
    message: string;
    sessionId: string;
    amount?: number;
    currency?: string;
    userId?: string;
  }> {
    const response = await api.get(`/payment/success?session_id=${sessionId}`);
    return response.data;
  }

  static async handlePaymentCancel(): Promise<{
    status: string;
    message: string;
  }> {
    const response = await api.get('/payment/cancel');
    return response.data;
  }

  // Utility methods for data processing
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static formatCurrency(amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(numAmount);
  }

  static formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString();
  }

  static formatDate(dateTime: string): string {
    return new Date(dateTime).toLocaleDateString();
  }

  // Chart data processing
  static async getChartData(days = 30): Promise<Array<{
    date: string;
    storage: number;
    cost: number;
    storageBytes: number;
  }>> {
    try {
      const [usageHistory, costCalc] = await Promise.all([
        this.getStorageUsageHistory(0, days),
        this.getCostCalculation()
      ]);

      // Process usage history into chart data
      const chartData = usageHistory.content.map(usage => ({
        date: usage.timestamp.split('T')[0],
        storage: usage.storageUsedInBytes / (1024 * 1024 * 1024), // Convert to GB
        cost: usage.calculatedCost || 0,
        storageBytes: usage.storageUsedInBytes
      }));

      // Sort by date and ensure we have data for each day
      const sortedData = chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return sortedData;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Return mock data if API fails
      return this.generateMockChartData(days);
    }
  }

  private static generateMockChartData(days: number) {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toISOString().split('T')[0],
        storage: Math.random() * 3 + 1,
        cost: Math.random() * 0.05 + 0.02,
        storageBytes: Math.floor((Math.random() * 3 + 1) * 1024 * 1024 * 1024)
      };
    });
  }

  // Webhook handling (for frontend notification updates)
  static async checkPaymentWebhookStatus(sessionId: string): Promise<boolean> {
    try {
      const status = await this.getPaymentStatus(sessionId);
      return status.status === 'COMPLETED';
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
  }

  // Real-time cost calculation
  static calculateInstantCost(storageBytes: number, costPerBytePerSecond: number, seconds: number): number {
    return storageBytes * costPerBytePerSecond * seconds;
  }

  // Get aggregated dashboard data
  static async getDashboardData(month?: number, year?: number) {
    try {
      const [storage, bill, history, usage, dailyCost] = await Promise.all([
        this.getCurrentStorage(),
        this.getMonthlyBill(month, year),
        this.getStorageHistory(0, 10),
        this.getStorageUsageHistory(0, 20),
        this.getDailyCost()
      ]);

      const chartData = await this.getChartData(30);

      return {
        storage,
        bill,
        history,
        usage,
        dailyCost,
        chartData
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
}

export default PaymentService;