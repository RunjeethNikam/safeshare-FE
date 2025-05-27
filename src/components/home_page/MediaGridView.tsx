// src/components/home_page/MediaGridView.tsx
import React from 'react';
import {  Media } from "@/lib/mediaService";
import styles from '@/styles/MediaGallery.module.css';

interface MediaGridViewProps {
  mediaList: (Media & { blobUrl?: string })[];
  openFullscreen: (index: number) => void;
  observer: (node: HTMLDivElement) => void;
}

export default function MediaGridView({
  mediaList,
  openFullscreen,
  observer
}: MediaGridViewProps) {
  return (
    <div className={styles.mediaGrid}>
      {mediaList.map((media, index) => {
        const isLast = index === mediaList.length - 1;
        return (
          <div
            ref={isLast ? observer : undefined}
            key={`${media.id}-${index}`}
            className={styles.mediaCard}
          >
            <p className={styles.mediaTitle}>
              {media.fileName}
            </p>
            {media.mediaType === "PHOTO" && media.blobUrl ? (
              <img
                src={media.blobUrl}
                alt={media.fileName}
                onClick={() => openFullscreen(index)}
                className={styles.mediaImage}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : media.mediaType === "VIDEO" && media.blobUrl ? (
              <video
                controls
                className={styles.mediaVideo}
              >
                <source src={media.blobUrl} type={media.fileType} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className={styles.mediaPlaceholder}>
                <span>📄</span>
                <p>Media unavailable</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}