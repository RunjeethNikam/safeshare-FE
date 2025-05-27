// src/lib/mediaService.ts - Using axios interceptors
import { api } from '@/lib/api';

export interface Media {
  id: string;
  fileName: string;
  fileType: string;
  mediaType: 'PHOTO' | 'VIDEO' | 'DOCUMENT';
  uploadedAt?: string;
  sizeInBytes?: number;
  s3Key?: string;
  userId?: string;
}

interface MediaPage {
  content: Media[];
}

interface MediaApiResponse {
  data: MediaPage;
}

export class MediaService {
  /**
   * Fetch user media with pagination
   */
  static async fetchUserMedia(page = 0, size = 10): Promise<Media[]> {
    try {
      // Using axios instance with interceptors
      const response = await api.get(`/media?page=${page}&size=${size}`);
      const data = response.data;

      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data.data?.content && Array.isArray(data.data.content)) {
        return data.data.content;
      } else if (data.content && Array.isArray(data.content)) {
        return data.content;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      throw error;
    }
  }

  /**
   * Get media URL with authentication (returns blob URL)
   */
  static async getMediaUrlWithToken(mediaId: string): Promise<string> {
    try {
      // Using axios with responseType: 'blob' for binary data
      const response = await api.get(`/media/${mediaId}/download`, {
        responseType: 'blob'
      });

      // Create blob URL from response
      const blob = new Blob([response.data]);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error fetching media:', error);
      throw error;
    }
  }

  /**
   * Upload a file
   */
  static async uploadFile(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Using axios with multipart/form-data
      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Delete a media file
   */
  static async deleteMedia(mediaId: string): Promise<void> {
    try {
      await api.delete(`/media/${mediaId}`);
    } catch (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
  }

  /**
   * Get media metadata
   */
  static async getMediaMetadata(mediaId: string): Promise<Media> {
    try {
      const response = await api.get(`/media/${mediaId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching media metadata:', error);
      throw error;
    }
  }

  /**
   * Update media metadata
   */
  static async updateMedia(mediaId: string, updateData: Partial<Media>): Promise<Media> {
    try {
      const response = await api.put(`/media/${mediaId}`, updateData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating media:', error);
      throw error;
    }
  }

  /**
   * Search media by filename or type
   */
  static async searchMedia(query: string, page = 0, size = 10): Promise<Media[]> {
    try {
      const response = await api.get(`/media/search`, {
        params: { q: query, page, size }
      });
      
      const data = response.data;
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data.data?.content && Array.isArray(data.data.content)) {
        return data.data.content;
      } else if (data.content && Array.isArray(data.content)) {
        return data.content;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error searching media:', error);
      throw error;
    }
  }

  /**
   * Get media by type
   */
  static async getMediaByType(
    mediaType: 'PHOTO' | 'VIDEO' | 'DOCUMENT', 
    page = 0, 
    size = 10
  ): Promise<Media[]> {
    try {
      const response = await api.get(`/media/type/${mediaType}`, {
        params: { page, size }
      });
      
      const data = response.data;
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data.data?.content && Array.isArray(data.data.content)) {
        return data.data.content;
      } else if (data.content && Array.isArray(data.content)) {
        return data.content;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching media by type:', error);
      throw error;
    }
  }
}

// Convenience function for backward compatibility
export async function fetchUserMedia(page = 0, size = 10): Promise<Media[]> {
  return MediaService.fetchUserMedia(page, size);
}