// src/components/billing/BillingSummary.tsx
'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Database, TrendingUp, Calendar } from 'lucide-react';
import PaymentService from '@/lib/paymentService';

interface BillingSummaryProps {
  compact?: boolean;
  showActions?: boolean;
  onViewDetails?: () => void;
}

interface SummaryData {
  currentStorageGB: number;
  monthlyBillUSD: string;
  dailyCostUSD: string;
  lastPaymentDate?: string;
}

export default function BillingSummary({ 
  compact = false, 
  showActions = true,
  onViewDetails 
}: BillingSummaryProps) {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num);
  };

  const formatFileSize = (gb: number): string => {
    if (gb < 1) {
      return `${(gb * 1024).toFixed(1)} MB`;
    }
    return `${gb.toFixed(2)} GB`;
  };

  useEffect(() => {
    const fetchSummaryData = async () => {
      setLoading(true);
      try {
        const [storageResult, billResult] = await Promise.all([
          PaymentService.getCurrentStorage(),
          PaymentService.getMonthlyBill()
        ]);

        if (storageResult.success && billResult.success) {
          setSummaryData({
            currentStorageGB: storageResult.data?.currentStorageInGB || 0,
            monthlyBillUSD: billResult.data?.totalMonthlyBillUSD || '0',
            dailyCostUSD: billResult.data?.dailyAverageCostUSD || '0',
          });
        } else {
          setError('Failed to load billing summary');
        }
      } catch (error) {
        console.error('Error fetching billing summary:', error);
        setError('Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  if (loading) {
    return (
      <div className={`${compact ? 'p-4' : 'p-6'} bg-white rounded-lg shadow animate-pulse`}>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${compact ? 'p-4' : 'p-6'} bg-red-50 border border-red-200 rounded-lg`}>
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow p-4 border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Billing Summary</h3>
          {showActions && (
            <button
              onClick={onViewDetails}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              View Details
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <Database className="w-3 h-3 mr-1" />
              Storage
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {summaryData ? formatFileSize(summaryData.currentStorageGB) : '--'}
            </p>
          </div>
          
          <div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <DollarSign className="w-3 h-3 mr-1" />
              This Month
            </div>
            <p className="text-sm font-semibold text-green-600">
              {summaryData ? formatCurrency(summaryData.monthlyBillUSD) : '--'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Billing Overview</h2>
        {showActions && (
          <button
            onClick={onViewDetails}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View Full Details
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Database className="w-8 h-8 text-blue-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Current Storage</p>
            <p className="text-xl font-semibold text-gray-900">
              {summaryData ? formatFileSize(summaryData.currentStorageGB) : '--'}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex-shrink-0">
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Monthly Bill</p>
            <p className="text-xl font-semibold text-green-600">
              {summaryData ? formatCurrency(summaryData.monthlyBillUSD) : '--'}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex-shrink-0">
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Daily Average</p>
            <p className="text-xl font-semibold text-purple-600">
              {summaryData ? formatCurrency(summaryData.dailyCostUSD) : '--'}
            </p>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onViewDetails}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Calendar className="w-4 h-4 mr-2" />
              View Billing Details
            </button>
            
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <DollarSign className="w-4 h-4 mr-2" />
              Make Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}