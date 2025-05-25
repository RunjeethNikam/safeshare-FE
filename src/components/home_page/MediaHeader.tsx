// src/components/home_page/MediaHeader.tsx
import React from 'react';
import styles from "@/styles/MediaGallery.module.css";

interface MediaHeaderProps {
  viewMode: 'grid' | 'list';
  switchViewMode: (mode: 'grid' | 'list') => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadLoading: boolean;
  uploadProgress: number;
}

export default function MediaHeader({ 
  viewMode, 
  switchViewMode, 
  handleUpload, 
  uploadLoading, 
  uploadProgress 
}: MediaHeaderProps) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>
        <span role="img" aria-label="folder">📂</span> Your Media
      </h1>
      <div className={styles.headerActions}>
        <label className={`${styles.uploadButton} ${uploadLoading ? styles.loading : ''}`}>
          {uploadLoading ? `Uploading... ${uploadProgress}%` : 'Upload'}
          <input
            type="file"
            onChange={handleUpload}
            className={styles.hiddenInput}
            disabled={uploadLoading}
            accept="image/*,video/*"
          />
        </label>
        
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewToggleButton} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => switchViewMode('grid')}
            title="Grid view"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
            </svg>
          </button>
          <button
            className={`${styles.viewToggleButton} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => switchViewMode('list')}
            title="List view"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}