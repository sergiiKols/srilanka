/**
 * VIDEO TYPES
 * Типы для работы с видео из Telegram и TeraBox
 */

/**
 * Telegram Video объект
 */
export interface TelegramVideo {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  width: number;
  height: number;
  duration: number;
  thumb?: {
    file_id: string;
    file_unique_id: string;
    file_size?: number;
    width: number;
    height: number;
  };
  mime_type?: string;
  file_name?: string;
}

/**
 * TeraBox Upload Response
 */
export interface TeraBoxUploadResponse {
  success: boolean;
  url?: string;
  shareUrl?: string;
  fileId?: string;
  error?: string;
}

/**
 * Результат загрузки видео
 */
export interface VideoUploadResult {
  success: boolean;
  teraboxUrl?: string;
  shareUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  originalFileId?: string;
  fileSize?: number;
  duration?: number;
}

/**
 * Конфигурация TeraBox
 */
export interface TeraBoxConfig {
  apiKey?: string;
  uploadEndpoint: string;
  maxFileSize: number; // в байтах
  allowedMimeTypes: string[];
}

/**
 * Метаданные видео в БД
 */
export interface VideoMetadata {
  id: string;
  propertyId: string;
  teraboxUrl: string;
  shareUrl: string;
  thumbnailUrl?: string;
  duration: number;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}
