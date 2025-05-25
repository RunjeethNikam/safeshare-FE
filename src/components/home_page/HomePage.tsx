"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Media, fetchUserMedia } from "@/lib/media";
import styles from "@/styles/MediaGallery.module.css";

export default function HomePage() {
  const [mediaList, setMediaList] = useState<(Media & { blobUrl?: string })[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const getMediaUrlWithToken = async (mediaId: string): Promise<string> => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(
      `http://localhost:8080/media/${mediaId}/download`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const items = await fetchUserMedia(page, 10);

      const withUrls = await Promise.all(
        items.map(async (item) => ({
          ...item,
          blobUrl: await getMediaUrlWithToken(item.id),
        }))
      );

      setMediaList((prev) => [...prev, ...withUrls]);
      setHasMore(items.length === 10);
      setPage((prev) => prev + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  const lastMediaRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadMore, loading]
  );

  useEffect(() => {
    loadMore();
  }, []);

  // Auto-select first item when switching to list view and data is available
  useEffect(() => {
    if (viewMode === 'list' && mediaList.length > 0 && selectedMediaIndex === null) {
      setSelectedMediaIndex(0);
    }
  }, [viewMode, mediaList.length, selectedMediaIndex]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (fullscreenIndex === null) return;
      
      if (e.key === 'Escape') {
        setFullscreenIndex(null);
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    if (fullscreenIndex !== null) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [fullscreenIndex]);

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
    
    // Immediately switch view mode
    setViewMode(mode);
    
    // Handle selection logic
    if (mode === 'list' && mediaList.length > 0) {
      setSelectedMediaIndex(0); // Select first item when switching to list view
    } else if (mode === 'grid') {
      setSelectedMediaIndex(null); // Clear selection when switching to grid view
    }
    
    // End transition after a short delay
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const selectMedia = (index: number) => {
    setSelectedMediaIndex(index);
  };

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("accessToken");
    await fetch("http://localhost:8080/media/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    setPage(0);
    setMediaList([]);
    setHasMore(true);
    loadMore();
  };

  const renderListView = () => {
    return mediaList.map((media, index) => {
      const isLast = index === mediaList.length - 1;
      const isSelected = selectedMediaIndex === index;
      return (
        <div
          ref={isLast ? lastMediaRef : undefined}
          key={media.id}
          className={`${styles.mediaListItem} ${isSelected ? styles.selected : ''}`}
          onClick={() => selectMedia(index)}
        >
          {media.mediaType === "PHOTO" ? (
            <img
              src={media.blobUrl}
              alt={media.fileName}
              className={styles.mediaListThumbnail}
            />
          ) : (
            <div className={styles.mediaTypeIcon}>
              🎥
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
    });
  };

  const renderGridView = () => {
    return mediaList.map((media, index) => {
      const isLast = index === mediaList.length - 1;
      return (
        <div
          ref={isLast ? lastMediaRef : undefined}
          key={media.id}
          className={styles.mediaCard}
        >
          <p className={styles.mediaTitle}>
            {media.fileName}
          </p>
          {media.mediaType === "PHOTO" ? (
            <img
              src={media.blobUrl}
              alt={media.fileName}
              onClick={() => openFullscreen(index)}
              className={styles.mediaImage}
            />
          ) : (
            <video
              controls
              className={styles.mediaVideo}
            >
              <source src={media.blobUrl} type={media.fileType} />
            </video>
          )}
        </div>
      );
    });
  };

  const renderPreviewPane = () => {
    if (viewMode !== 'list' || selectedMediaIndex === null || !mediaList[selectedMediaIndex]) {
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
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div className={styles.previewContent}>
          {selectedMedia.mediaType === "PHOTO" ? (
            <img
              src={selectedMedia.blobUrl}
              alt={selectedMedia.fileName}
              className={styles.previewImage}
              onClick={() => openFullscreen(selectedMediaIndex)}
            />
          ) : (
            <video
              controls
              className={styles.previewVideo}
              key={selectedMedia.id}
            >
              <source src={selectedMedia.blobUrl} type={selectedMedia.fileType} />
            </video>
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
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span role="img" aria-label="folder">📂</span> Your Media
        </h1>
        <div className={styles.headerActions}>
          <label className={styles.uploadButton}>
            Upload
            <input
              type="file"
              onChange={handleUpload}
              className={styles.hiddenInput}
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

      <div className={`${styles.mediaContainer} ${isTransitioning ? styles.transitioning : ''}`}>
        {viewMode === 'list' ? (
          <div className={styles.listViewContainer}>
            <div className={styles.mediaList}>
              {renderListView()}
            </div>
            {renderPreviewPane()}
          </div>
        ) : (
          <div className={styles.mediaGrid}>
            {renderGridView()}
          </div>
        )}
      </div>

      {loading && (
        <p className={styles.loadingText}>
          Loading more...
        </p>
      )}

      {/* Debug info - remove this later */}
      <div style={{ position: 'fixed', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px', borderRadius: '5px', fontSize: '12px' }}>
        View Mode: {viewMode} | Selected: {selectedMediaIndex} | Media Count: {mediaList.length}
      </div>

      {fullscreenIndex !== null && (
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
      )}
    </main>
  );
}