// src/components/ui/AppHeader.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/MediaGallery.module.css";
import UserProfile from "@/components/ui/UserProfile";
import PaymentService from "@/lib/paymentService";

interface AppHeaderProps {
  title: string;
  icon: string;
  showUpload?: boolean;
  showViewToggle?: boolean;
  viewMode?: "grid" | "list";
  switchViewMode?: (mode: "grid" | "list") => void;
  handleUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadLoading?: boolean;
  uploadProgress?: number;
  showStorageInfo?: boolean;
  showBillingInfo?: boolean;
}

export default function AppHeader({
  title,
  icon,
  showUpload = false,
  showViewToggle = false,
  viewMode = "grid",
  switchViewMode,
  handleUpload,
  uploadLoading = false,
  uploadProgress = 0,
  showStorageInfo = true,
  showBillingInfo = false,
}: AppHeaderProps) {
  const router = useRouter();
  const [storageUsed, setStorageUsed] = useState<string>("Loading...");
  const [monthlyBill, setMonthlyBill] = useState<string>("Loading...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (showStorageInfo || showBillingInfo) {
          const [storageResult, billResult] = await Promise.all([
            showStorageInfo ? PaymentService.getCurrentStorage() : Promise.resolve(null),
            showBillingInfo ? PaymentService.getMonthlyBill() : Promise.resolve(null)
          ]);

          if (storageResult?.success && storageResult.data) {
            const mbUsed = storageResult.data.currentStorageInMB?.toFixed(2) || "0.00";
            setStorageUsed(`${mbUsed} MB`);
          }

          if (billResult?.success && billResult.data) {
            const amount = parseFloat(billResult.data.totalMonthlyBillUSD);
            setMonthlyBill(`$${amount.toFixed(2)}`);
          }
        }
      } catch (error) {
        console.error("Failed to fetch header data:", error);
        if (showStorageInfo) setStorageUsed("Error");
        if (showBillingInfo) setMonthlyBill("Error");
      }
    };

    fetchData();
  }, [showStorageInfo, showBillingInfo]);

  const navigateToBilling = () => {
    router.push('/billing');
  };

  const navigateToHome = () => {
    router.push('/');
  };

  return (
    <div className={styles.header} style={{ marginBottom: 0 }}>
      <h1 className={styles.title}>
        <span role="img" aria-label={title.toLowerCase()}>
          {icon}
        </span>{" "}
        {title}
      </h1>

      <div className={styles.headerActions}>
        {/* Upload Button */}
        {showUpload && handleUpload && (
          <label
            className={`${styles.uploadButton} ${uploadLoading ? styles.loading : ""}`}
          >
            {uploadLoading ? `Uploading... ${uploadProgress}%` : "Upload"}
            <input
              type="file"
              onChange={handleUpload}
              className={styles.hiddenInput}
              disabled={uploadLoading}
              accept="image/*,video/*"
            />
          </label>
        )}

        {/* View toggle */}
        {showViewToggle && switchViewMode && (
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewToggleButton} ${viewMode === "grid" ? styles.active : ""}`}
              onClick={() => switchViewMode("grid")}
              title="Grid view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
              </svg>
            </button>
            <button
              className={`${styles.viewToggleButton} ${viewMode === "list" ? styles.active : ""}`}
              onClick={() => switchViewMode("list")}
              title="List view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
              </svg>
            </button>
          </div>
        )}

        {/* Storage Info */}
        {showStorageInfo && (
          <div 
            className="flex items-center h-10 px-4 rounded-full border border-gray-300 bg-white shadow-sm hover:shadow-md transition duration-150 ease-in-out cursor-pointer"
            onClick={navigateToBilling}
            title="Click to view billing details"
          >
            <div className="flex items-center text-sm text-gray-700 font-medium gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a8 4 0 018-4 8 4 0 018 4v6a8 4 0 01-8 4 8 4 0 01-8-4V6z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 12v6a8 4 0 008 4 8 4 0 008-4v-6"
                />
              </svg>
              <span className="text-gray-500">Storage</span>
              <span className="text-gray-700 font-semibold">{storageUsed}</span>
            </div>
          </div>
        )}

        {/* Billing Info */}
        {showBillingInfo && (
          <div 
            className="flex items-center h-10 px-4 rounded-full border border-gray-300 bg-white shadow-sm hover:shadow-md transition duration-150 ease-in-out cursor-pointer"
            onClick={navigateToHome}
            title="Click to view media gallery"
          >
            <div className="flex items-center text-sm text-gray-700 font-medium gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z"
                />
              </svg>
              <span className="text-gray-500">This Month</span>
              <span className="text-green-600 font-semibold">{monthlyBill}</span>
            </div>
          </div>
        )}

        <UserProfile />
      </div>
    </div>
  );
}