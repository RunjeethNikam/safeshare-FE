import { api } from './api'

export interface Media {
  id: string
  fileName: string
  fileType: string
  mediaType: 'PHOTO' | 'VIDEO'
  uploadedAt?: string  // Added this property
  sizeInBytes?: number // Added this property
  s3Key?: string       // Optional - from your console log
  userId?: string      // Optional - from your console log
}

interface MediaPage {
  content: Media[]
}

interface MediaApiResponse {
  data: MediaPage
}

export async function fetchUserMedia(page = 0, size = 10): Promise<Media[]> {
  try {
    const res = await api.get<MediaApiResponse>('/media', {
      params: { page, size }
    })
    return res.data?.data?.content || []
  } catch (error) {
    console.error('Failed to fetch media:', error)
    throw new Error('Failed to fetch media')
  }
}