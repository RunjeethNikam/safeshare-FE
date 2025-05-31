/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/billing/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Download, Calendar, Database, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import PaymentService from '@/lib/paymentService';
import { AuthService } from '@/lib/authService';
import AppHeader from '@/components/ui/AppHeader';
import styles from "@/styles/MediaGallery.module.css";
import { SafeShareLogoSimple } from '@/components/ui/SafeShareLogo';

interface StorageInfo {
  currentStorageInBytes: number;
  currentStorageInMB: number;
  currentStorageInGB: number;
  lastUpdated: string | null;
  totalRecords: string;
  userId: string;
}

interface MonthlyBill {
  month: number;
  year: number;
  monthName: string;
  totalMonthlyBillUSD: string;
  dailyAverageCostUSD: string;
  currentStorageMB: string;
  currentStorageGB: string;
  daysInMonth: number;
  costPerMBPerDay: string;
  billingPeriod: string;
}

interface PaymentHistory {
  content: Array<{
    id: string;
    userId: string;
    storageGb: number;
    costInUsd: number;
    timestamp: string;
    month: number;
    year: number;
  }>;
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [monthlyBill, setMonthlyBill] = useState<MonthlyBill | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchStorageInfo = async () => {
    try {
      const result = await PaymentService.getCurrentStorage();
      if (result.success && result.data) {
        console.log('Storage info response:', result.data); // Debug log
        setStorageInfo(result.data);
      } else {
        console.error('Storage info error:', result.error);
        setError('Failed to load storage information: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to fetch storage info:', error);
      setError('Failed to load storage information');
    }
  };

  const fetchMonthlyBill = async (month?: number, year?: number) => {
    try {
      const result = await PaymentService.getMonthlyBill(month, year);
      if (result.success && result.data) {
        setMonthlyBill(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch monthly bill:', error);
      setError('Failed to load monthly bill');
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const result = await PaymentService.getStorageHistory(0, 10);
      if (result.success && result.data) {
        setPaymentHistory(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      setError('Failed to load payment history');
    }
  };

  const handleCheckout = async () => {
    setIsProcessingPayment(true);
    try {
      const result = await PaymentService.checkoutStorageBill(selectedMonth, selectedYear);
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        setError(result.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      setError('Payment processing failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleMonthYearChange = () => {
    fetchMonthlyBill(selectedMonth, selectedYear);
  };

  const dismissPaymentStatus = () => {
    setPaymentStatus(null);
    // Remove URL params
    const url = new URL(window.location.href);
    url.searchParams.delete('session_id');
    url.searchParams.delete('success');
    url.searchParams.delete('cancelled');
    router.replace(url.pathname);
  };

  useEffect(() => {
    // Check for payment status in URL params
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');

    if (sessionId && success === 'true') {
      setPaymentStatus('success');
    } else if (sessionId && cancelled === 'true') {
      setPaymentStatus('cancelled');
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStorageInfo(),
        fetchMonthlyBill(),
        fetchPaymentHistory()
      ]);
      setLoading(false);
    };

    // Check authentication
    const token = AuthService.getToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    loadData();
  }, [router, searchParams]);

  useEffect(() => {
    handleMonthYearChange();
  }, [selectedMonth, selectedYear]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading billing information...</p>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <AppHeader 
        title="Billing & Usage"
        icon={<SafeShareLogoSimple /> as any}
        showUpload={false}
        showViewToggle={false}
        showStorageInfo={false}
        showBillingInfo={false}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Payment Status Messages */}
        {paymentStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">Payment Successful!</p>
              <p className="text-green-700 text-sm">Your payment has been processed successfully.</p>
            </div>
            <button
              onClick={dismissPaymentStatus}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        {paymentStatus === 'cancelled' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <XCircle className="w-5 h-5 text-yellow-500 mr-3" />
            <div className="flex-1">
              <p className="text-yellow-800 font-medium">Payment Cancelled</p>
              <p className="text-yellow-700 text-sm">Your payment was cancelled. You can try again anytime.</p>
            </div>
            <button
              onClick={dismissPaymentStatus}
              className="text-yellow-600 hover:text-yellow-800"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError('')}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Current Storage Usage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Current Storage</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {storageInfo ? formatFileSize(storageInfo.currentStorageInBytes) : 'Loading...'}
                </p>
                <p className="text-sm text-gray-500">
                  {storageInfo && storageInfo.currentStorageInGB ? `${storageInfo.currentStorageInGB.toFixed(4)} GB` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Bill</h3>
                <p className="text-2xl font-bold text-green-600">
                  {monthlyBill ? formatCurrency(monthlyBill.totalMonthlyBillUSD) : 'Loading...'}
                </p>
                <p className="text-sm text-gray-500">
                  {monthlyBill ? `${monthlyBill.monthName} ${monthlyBill.year}` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Daily Average</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {monthlyBill ? formatCurrency(monthlyBill.dailyAverageCostUSD) : 'Loading...'}
                </p>
                <p className="text-sm text-gray-500">Per day</p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Period Selector & Payment */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Billing</h2>
          
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessingPayment || !monthlyBill}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isProcessingPayment ? 'Processing...' : 'Pay Now'}
            </button>
          </div>

          {monthlyBill && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Billing Period</p>
                <p className="font-semibold">{monthlyBill.billingPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold text-green-600">{formatCurrency(monthlyBill.totalMonthlyBillUSD)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="font-semibold">{monthlyBill.currentStorageGB} GB</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rate per MB/day</p>
                <p className="font-semibold">{formatCurrency(monthlyBill.costPerMBPerDay)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
            <button className="flex items-center text-blue-600 hover:text-blue-800">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>

          {paymentHistory && paymentHistory.content.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Storage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentHistory.content.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {months[payment.month - 1]} {payment.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.storageGb} GB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(payment.costInUsd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No payment history available</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading...</p>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}