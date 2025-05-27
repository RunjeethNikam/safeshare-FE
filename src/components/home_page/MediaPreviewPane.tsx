// src/components/home_page/MediaPreviewPane.tsx
import React from 'react';
import {  Media } from "@/lib/mediaService";
import styles from '@/styles/MediaGallery.module.css';

interface MediaPreviewPaneProps {
  mediaList: (Media & { blobUrl?: string })[];
  selectedMediaIndex: number | null;
  openFullscreen: (index: number) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export default function MediaPreviewPane({
  mediaList,
  selectedMediaIndex,
  openFullscreen
}: MediaPreviewPaneProps) {
  if (selectedMediaIndex === null || !mediaList[selectedMediaIndex]) {
    return null;
  }

  const selectedMedia = mediaList[selectedMediaIndex];
  
  return (
    <div className={styles.previewPane}>
      <div className={styles.previewHeader}>
        <h3 className={styles.previewTitle}>{selectedMedia.fileName}</h3>
        <div className={styles.previewActions}>
          <button
            onClick={() => openFullscreen(selectedMediaIndex)}
            className={styles.previewActionButton}
            title="Open fullscreen"
            disabled={!selectedMedia.blobUrl}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className={styles.previewContent}>
        {selectedMedia.mediaType === "PHOTO" && selectedMedia.blobUrl ? (
          <img
            src={selectedMedia.blobUrl}
            alt={selectedMedia.fileName}
            className={styles.previewImage}
            onClick={() => openFullscreen(selectedMediaIndex)}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : selectedMedia.mediaType === "VIDEO" && selectedMedia.blobUrl ? (
          <video
            controls
            className={styles.previewVideo}
            key={selectedMedia.id}
          >
            <source src={selectedMedia.blobUrl} type={selectedMedia.fileType} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className={styles.previewPlaceholder}>
            <span>📄</span>
            <p>Media unavailable</p>
          </div>
        )}
      </div>
      
      <div className={styles.previewInfo}>
        <div className={styles.previewInfoRow}>
          <span className={styles.previewInfoLabel}>Type:</span>
          <span className={styles.previewInfoValue}>{selectedMedia.mediaType}</span>
        </div>
        <div className={styles.previewInfoRow}>
          <span className={styles.previewInfoLabel}>Size:</span>
          <span className={styles.previewInfoValue}>
            {selectedMedia.sizeInBytes ? formatFileSize(selectedMedia.sizeInBytes) : 'Unknown'}
          </span>
        </div>
        <div className={styles.previewInfoRow}>
          <span className={styles.previewInfoLabel}>Uploaded:</span>
          <span className={styles.previewInfoValue}>
            {selectedMedia.uploadedAt ? formatDate(selectedMedia.uploadedAt) : 'Unknown date'}
          </span>
        </div>
      </div>
    </div>
  );
}