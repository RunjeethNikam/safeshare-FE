// src/components/home_page/MediaContainer.tsx
import React from 'react';
import {  Media } from "@/lib/mediaService";
import MediaGridView from './MediaGridView';
import MediaListView from './MediaListView';
import styles from '@/styles/MediaGallery.module.css';

interface MediaContainerProps {
  viewMode: 'grid' | 'list';
  isTransitioning: boolean;
  mediaList: (Media & { blobUrl?: string })[];
  selectedMediaIndex: number | null;
  selectMedia: (index: number) => void;
  openFullscreen: (index: number) => void;
  observer: (node: HTMLDivElement) => void;
  loading: boolean;
}

export default function MediaContainer({
  viewMode,
  isTransitioning,
  mediaList,
  selectedMediaIndex,
  selectMedia,
  openFullscreen,
  observer,
  loading
}: MediaContainerProps) {
  return (
    <div className={`${styles.mediaContainer} ${isTransitioning ? styles.transitioning : ''}`}>
      {viewMode === 'list' ? (
        <MediaListView
          mediaList={mediaList}
          selectedMediaIndex={selectedMediaIndex}
          selectMedia={selectMedia}
          openFullscreen={openFullscreen}
          observer={observer}
        />
      ) : (
        <MediaGridView
          mediaList={mediaList}
          openFullscreen={openFullscreen}
          observer={observer}
        />
      )}
    </div>
  );
}