// src/lib/media.ts
import { AuthService } from '@/lib/authService';

// ✅ CORRECT: Use media API base URL, NOT the api instance
const MEDIA_API_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_API_BASE_URL || 'http://localhost:8080';

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

export async function fetchUserMedia(page = 0, size = 10): Promise<Media[]> {
  const token = AuthService.getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // ✅ CORRECT: Direct fetch to media API, not using the api instance
    const url = `${MEDIA_API_BASE_URL}/media?page=${page}&size=${size}`;

    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response URL:', response.url);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {

        AuthService.logout();
        throw new Error('Authentication failed');
      }
      
      const errorText = await response.text();

      throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
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

    throw error;
  }
}