"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MediaService, Media, fetchUserMedia } from "@/lib/mediaService";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import MediaHeader from "./MediaHeader";
import MediaContainer from "./MediaContainer";
import UploadModal from "./UploadModal";
import ErrorMessage from "./ErrorMessage";
import FullscreenViewer from "./FullScreenViewer";
import styles from "@/styles/MediaGallery.module.css";

export default function HomePage() {
  const [mediaList, setMediaList] = useState<(Media & { blobUrl?: string })[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

  // Custom hooks
  const { uploadState, handleUpload } = useMediaUpload(setMediaList, setError);


  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError('');
    
    try {
      const items = await fetchUserMedia(page, 10);

      // Load media URLs using MediaService
      const withUrls = await Promise.all(
        items.map(async (item) => {
          try {
            const blobUrl = await MediaService.getMediaUrlWithToken(item.id);
            return { ...item, blobUrl };
          } catch (error) {
            console.error(`Failed to load media ${item.id}:`, error);
            return { ...item, blobUrl: undefined };
          }
        })
      );

      setMediaList((prev) => {
        // Check for duplicates to prevent the key error
        const existingIds = new Set(prev.map(media => media.id));
        const newItems = withUrls.filter(item => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
      
      setHasMore(items.length === 10);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to load media list:', error);
      setError('Failed to load media. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  useEffect(() => {
    loadMore();
  }, []);

  // Auto-select first item when switching to list view
  useEffect(() => {
    if (viewMode === 'list' && mediaList.length > 0 && selectedMediaIndex === null) {
      setSelectedMediaIndex(0);
    }
  }, [viewMode, mediaList.length, selectedMediaIndex]);

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
  };

  const closeFullscreen = () => {
    setFullscreenIndex(null);
  };

  const goToNext = () => {
    if (fullscreenIndex === null) return;
    const nextIndex = (fullscreenIndex + 1) % mediaList.length;
    setFullscreenIndex(nextIndex);
  };

  const goToPrevious = () => {
    if (fullscreenIndex === null) return;
    const prevIndex = fullscreenIndex === 0 ? mediaList.length - 1 : fullscreenIndex - 1;
    setFullscreenIndex(prevIndex);
  };

  const switchViewMode = (mode: 'grid' | 'list') => {
    if (mode === viewMode) return;
    
    setIsTransitioning(true);
    setViewMode(mode);
    
    if (mode === 'list' && mediaList.length > 0) {
      setSelectedMediaIndex(0);
    } else if (mode === 'grid') {
      setSelectedMediaIndex(null);
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const selectMedia = (index: number) => {
    setSelectedMediaIndex(index);
  };

  const { observer } = useInfiniteScroll(loadMore, loading);
  
  useKeyboardNavigation(fullscreenIndex, goToPrevious, goToNext, closeFullscreen);

  return (
    <main className={styles.main}>
      <UploadModal uploadState={uploadState} />
      
      <MediaHeader 
        viewMode={viewMode}
        switchViewMode={switchViewMode}
        handleUpload={handleUpload}
        uploadLoading={uploadState.loading}
        uploadProgress={uploadState.progress}
      />

      <ErrorMessage error={error} setError={setError} />

      <MediaContainer
        viewMode={viewMode}
        isTransitioning={isTransitioning}
        mediaList={mediaList}
        selectedMediaIndex={selectedMediaIndex}
        selectMedia={selectMedia}
        openFullscreen={openFullscreen}
        observer={observer}
        loading={loading}
      />

      {loading && (
        <p className={styles.loadingText}>
          Loading more...
        </p>
      )}

      <FullscreenViewer
        fullscreenIndex={fullscreenIndex}
        mediaList={mediaList}
        closeFullscreen={closeFullscreen}
        goToPrevious={goToPrevious}
        goToNext={goToNext}
      />
    </main>
  );
}