// src/components/home_page/MediaListView.tsx
import React from 'react';
import { Media } from '@/lib/media';
import MediaPreviewPane from './MediaPreviewPane';
import styles from '@/styles/MediaGallery.module.css';

interface MediaListViewProps {
  mediaList: (Media & { blobUrl?: string })[];
  selectedMediaIndex: number | null;
  selectMedia: (index: number) => void;
  openFullscreen: (index: number) => void;
  observer: (node: HTMLDivElement) => void;
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

export default function MediaListView({
  mediaList,
  selectedMediaIndex,
  selectMedia,
  openFullscreen,
  observer
}: MediaListViewProps) {
  return (
    <div className={styles.listViewContainer}>
      <div className={styles.mediaList}>
        {mediaList.map((media, index) => {
          const isLast = index === mediaList.length - 1;
          const isSelected = selectedMediaIndex === index;
          return (
            <div
              ref={isLast ? observer : undefined}
              key={`${media.id}-${index}`}
              className={`${styles.mediaListItem} ${isSelected ? styles.selected : ''}`}
              onClick={() => selectMedia(index)}
            >
              {media.mediaType === "PHOTO" && media.blobUrl ? (
                <img
                  src={media.blobUrl}
                  alt={media.fileName}
                  className={styles.mediaListThumbnail}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : media.mediaType === "VIDEO" ? (
                <div className={styles.mediaTypeIcon}>
                  🎥
                </div>
              ) : (
                <div className={styles.mediaTypeIcon}>
                  📄
                </div>
              )}
              <div className={styles.mediaListInfo}>
                <p className={styles.mediaListTitle}>
                  {media.fileName}
                </p>
                <p className={styles.mediaListMeta}>
                  {media.mediaType} • {media.uploadedAt ? formatDate(media.uploadedAt) : 'Unknown date'}
                  {media.sizeInBytes && ` • ${formatFileSize(media.sizeInBytes)}`}
                </p>
              </div>
              <div className={styles.mediaListActions}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openFullscreen(index);
                  }}
                  className={styles.actionButton}
                  title="Open fullscreen"
                  disabled={!media.blobUrl}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={styles.actionButton}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <MediaPreviewPane
        mediaList={mediaList}
        selectedMediaIndex={selectedMediaIndex}
        openFullscreen={openFullscreen}
      />
    </div>
  );
}