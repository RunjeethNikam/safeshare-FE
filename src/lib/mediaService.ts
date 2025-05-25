// src/lib/mediaService.ts
import { AuthService } from '@/lib/authService';

// ✅ CORRECT: Use base URL only, not including /media
const MEDIA_API_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_API_BASE_URL || 'http://localhost:8080';

export class MediaService {
  /**
   * Get media URL with authentication token
   */
  static async getMediaUrlWithToken(mediaId: string): Promise<string> {
    const token = AuthService.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      // ✅ CORRECT: This should call http://localhost:8080/media/{mediaId}/download
      const response = await fetch(`${MEDIA_API_BASE_URL}/media/${mediaId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch media: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error fetching media:', error);
      throw error;
    }
  }

  /**
   * Upload a file
   */
  static async uploadFile(file: File): Promise<void> {
    const token = AuthService.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // ✅ CORRECT: This should call http://localhost:8080/media/upload
      const response = await fetch(`${MEDIA_API_BASE_URL}/media/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}