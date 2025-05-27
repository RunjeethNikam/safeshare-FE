// src/hooks/useMediaUpload.ts
import { useState } from 'react';
import { MediaService, Media, fetchUserMedia } from "@/lib/mediaService";

interface UploadState {
  loading: boolean;
  progress: number;
  fileName: string;
}

export const useMediaUpload = (
  setMediaList: React.Dispatch<React.SetStateAction<(Media & { blobUrl?: string })[]>>,
  setError: React.Dispatch<React.SetStateAction<string>>
) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    loading: false,
    progress: 0,
    fileName: ''
  });

  const validateFile = (file: File): string | null => {
    const MAX_FILE_SIZE = 1000 * 1024 * 1024; // 1GB
    if (file.size > MAX_FILE_SIZE) {
      return `File size too large. Maximum allowed size is ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB. Your file is ${Math.round(file.size / (1024 * 1024))}MB.`;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported. Allowed types: Images (JPEG, PNG, GIF, WebP) and Videos (MP4, AVI, MOV, WMV).';
    }

    return null;
  };

  const refreshMediaList = async () => {
    try {
      const items = await fetchUserMedia(0, 10);
      const withUrls = await Promise.all(
        items.map(async (item) => {
          try {
            const blobUrl = await MediaService.getMediaUrlWithToken(item.id);
            return { ...item, blobUrl };
          } catch (error) {
            return { ...item, blobUrl: undefined };
          }
        })
      );
      setMediaList(withUrls);
    } catch (error) {
      setError('Upload successful but failed to refresh list. Please refresh the page.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(''), 5000);
      e.target.value = '';
      return;
    }

    setUploadState({
      loading: true,
      progress: 0,
      fileName: file.name
    });
    setError('');

    try {
      const { AuthService } = await import('@/lib/authService');
      const token = AuthService.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadState(prev => ({ ...prev, progress: Math.round(percentComplete) }));
        }
      });

      // Handle completion
      xhr.addEventListener('load', async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          setUploadState(prev => ({ ...prev, progress: 100 }));
          
          // Immediately refresh the media list
          await refreshMediaList();
          
          // Hide upload modal after 2 seconds
          setTimeout(() => {
            setUploadState({
              loading: false,
              progress: 0,
              fileName: ''
            });
          }, 2000);
          
        } else {
          let errorMessage = `Upload failed: ${xhr.status}`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            if (errorResponse.error?.message) {
              errorMessage = errorResponse.error.message;
            }
          } catch (e) {
            errorMessage = xhr.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        throw new Error('Upload failed due to network error. Please check your connection and try again.');
      });

      xhr.addEventListener('timeout', () => {
        throw new Error('Upload timed out. The file might be too large or your connection is slow.');
      });

      xhr.timeout = 600000; // 10 minutes

      // Start upload
      const MEDIA_API_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_API_BASE_URL || 'http://localhost:8080';
      xhr.open('POST', `${MEDIA_API_BASE_URL}/media/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

    } catch (error) {
      let errorMessage = 'Upload failed. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('Maximum upload size exceeded')) {
          errorMessage = 'File too large for server. Try a smaller file or compress it first.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Upload timed out. Try a smaller file or check your internet connection.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
      setUploadState({
        loading: false,
        progress: 0,
        fileName: ''
      });
    }
    
    e.target.value = '';
  };

  return { uploadState, handleUpload };
};