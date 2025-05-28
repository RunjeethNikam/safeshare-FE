"use client";

import React, { useEffect, useState } from "react";
import styles from "@/styles/MediaGallery.module.css";
import UserProfile from "@/components/ui/UserProfile";
import PaymentService from "@/lib/paymentService";

interface MediaHeaderProps {
  viewMode: "grid" | "list";
  switchViewMode: (mode: "grid" | "list") => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadLoading: boolean;
  uploadProgress: number;
}

export default function MediaHeader({
  viewMode,
  switchViewMode,
  handleUpload,
  uploadLoading,
  uploadProgress,
}: MediaHeaderProps) {
  const [storageUsed, setStorageUsed] = useState<string>("Loading...");

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const result = await PaymentService.getCurrentStorage();
        if (result.data) {
          const mbUsed = result.data.currentStorageInMB?.toFixed(2) || "0.00";
          setStorageUsed(`${mbUsed} MB`);
        } else {
          setStorageUsed("N/A");
        }
      } catch (error) {
        console.error("Failed to fetch storage usage:", error);
        setStorageUsed("Error");
      }
    };

    fetchStorage();
  }, []);

  return (
    <div className={styles.header}>
      <h1 className={styles.title}>
        <span role="img" aria-label="folder">
          📂
        </span>{" "}
        Your Media
      </h1>

      <div className={styles.headerActions}>
        {/* Upload Button */}
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

        {/* View toggle */}
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

        <div className="flex items-center h-10 px-4 rounded-full border border-gray-300 bg-white shadow-sm hover:shadow-md transition duration-150 ease-in-out">
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

        <UserProfile />
      </div>
    </div>
  );
}
