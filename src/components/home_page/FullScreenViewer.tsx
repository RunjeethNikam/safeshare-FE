// src/components/home_page/FullscreenViewer.tsx
import React from 'react';
import {  Media } from "@/lib/mediaService";
import styles from '@/styles/MediaGallery.module.css';

interface FullscreenViewerProps {
  fullscreenIndex: number | null;
  mediaList: (Media & { blobUrl?: string })[];
  closeFullscreen: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
}

export default function FullscreenViewer({
  fullscreenIndex,
  mediaList,
  closeFullscreen,
  goToPrevious,
  goToNext
}: FullscreenViewerProps) {
  if (fullscreenIndex === null || !mediaList[fullscreenIndex]?.blobUrl) {
    return null;
  }

  return (
    <div
      className={styles.fullscreenOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeFullscreen();
        }
      }}
    >
      <button
        onClick={closeFullscreen}
        className={styles.closeButton}
      >
        ×
      </button>

      <button
        onClick={goToPrevious}
        className={`${styles.navButton} ${styles.prevButton}`}
      >
        ‹
      </button>

      <button
        onClick={goToNext}
        className={`${styles.navButton} ${styles.nextButton}`}
      >
        ›
      </button>

      <div className={styles.fullscreenMediaContainer}>
        {mediaList[fullscreenIndex]?.mediaType === "PHOTO" ? (
          <img
            src={mediaList[fullscreenIndex]?.blobUrl}
            alt={mediaList[fullscreenIndex]?.fileName}
            className={styles.fullscreenImage}
            onError={(e) => {
              console.error('Fullscreen image failed to load');
              closeFullscreen();
            }}
          />
        ) : (
          <video
            controls
            autoPlay
            className={styles.fullscreenVideo}
          >
            <source
              src={mediaList[fullscreenIndex]?.blobUrl}
              type={mediaList[fullscreenIndex]?.fileType}
            />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      <div className={styles.mediaInfo}>
        <p className={styles.mediaInfoTitle}>
          {mediaList[fullscreenIndex]?.fileName}
        </p>
        <p className={styles.mediaInfoCounter}>
          {fullscreenIndex + 1} of {mediaList.length}
        </p>
      </div>
    </div>
  );
}