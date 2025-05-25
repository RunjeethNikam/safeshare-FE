// src/components/home_page/UploadModal.tsx
import React from 'react';
import styles from "@/styles/MediaGallery.module.css";

interface UploadState {
  loading: boolean;
  progress: number;
  fileName: string;
}

interface UploadModalProps {
  uploadState: UploadState;
}

export default function UploadModal({ uploadState }: UploadModalProps) {
  if (!uploadState.loading) return null;

  return (
    <div className={styles.uploadOverlay}>
      <div className={styles.uploadModal}>
        <div className={styles.uploadIcon}>
          {uploadState.progress === 100 ? (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#10b981" />
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="17,8 12,3 7,8" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="3" x2="12" y2="15" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </div>
        
        <h3 className={styles.uploadTitle}>
          {uploadState.progress === 100 ? 'Upload Complete!' : 'Uploading File...'}
        </h3>
        
        <p className={styles.uploadFileName}>{uploadState.fileName}</p>
        
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${uploadState.progress}%` }}
            ></div>
          </div>
          <span className={styles.progressText}>{uploadState.progress}%</span>
        </div>
        
        {uploadState.progress === 100 && (
          <p className={styles.successMessage}>File uploaded successfully!</p>
        )}
      </div>
    </div>
  );
}