/**
 * TELEGRAM VIDEO STORAGE
 * Хранение видео на серверах Telegram (бесплатно, без лимитов)
 * 
 * АРХИТЕКТУРА:
 * 1. Пользователь отправляет видео боту
 * 2. Сохраняем file_id в БД (НЕ скачиваем!)
 * 3. Для просмотра получаем временный URL через Bot API
 * 
 * ПРЕИМУЩЕСТВА:
 * ✅ Бесплатно навсегда
 * ✅ Без лимитов на общий объём
 * ✅ Надёжность серверов Telegram
 * ✅ Автоматическая работа через Bot API
 * ✅ До 2GB на видео файл
 */

import type { 
  TelegramVideo, 
  VideoUploadResult, 
  TeraBoxConfig 
} from '@/types/video.types';

/**
 * Конфигурация Telegram Storage
 */
const TELEGRAM_STORAGE_CONFIG = {
  maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB - лимит Telegram
  allowedMimeTypes: [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/x-matroska' // mkv
  ],
  // Время жизни временного URL (24 часа)
  urlExpiryTime: 24 * 60 * 60 * 1000
};

/**
 * Сохраняет видео на Telegram Storage
 * 
 * ВАЖНО: Видео НЕ скачивается! Просто сохраняем file_id
 * 
 * @param {string} botToken - Telegram Bot Token
 * @param {TelegramVideo} video - Видео объект из Telegram
 * @param {number} userId - Telegram user ID
 * @param {string} propertyId - UUID объекта недвижимости
 * @returns {Promise<VideoUploadResult>} Результат с file_id и метаданными
 */
export async function saveTelegramVideo(
  botToken: string,
  video: TelegramVideo,
  userId: number,
  propertyId: string
): Promise<VideoUploadResult> {
  
  try {
    console.log(`🎬 Saving video to Telegram Storage...`);
    console.log(`📊 Video info: ${video.duration}s, ${video.width}x${video.height}`);
    
    // 1. Валидация видео
    const validation = validateVideo(video);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        originalFileId: video.file_id
      };
    }
    
    // 2. Получаем размер файла (уже есть в video объекте!)
    const fileSize = video.file_size || 0;
    console.log(`📥 Video file size: ${fileSize} bytes`);
    
    console.log(`📦 File size: ${Math.round(fileSize / 1024 / 1024)}MB`);
    
    // 3. Загружаем thumbnail (если есть)
    let thumbnailFileId: string | undefined;
    if (video.thumb) {
      console.log(`📸 Saving thumbnail file_id...`);
      thumbnailFileId = video.thumb.file_id;
    }
    
    // 4. Формируем результат
    // ВАЖНО: Сохраняем file_id, НЕ загружаем видео!
    const result: VideoUploadResult = {
      success: true,
      teraboxUrl: video.file_id, // Используем file_id как "URL"
      shareUrl: video.file_id, // Для совместимости
      thumbnailUrl: thumbnailFileId,
      originalFileId: video.file_id,
      fileSize,
      duration: video.duration
    };
    
    console.log(`✅ Video saved to Telegram Storage!`);
    console.log(`🆔 file_id: ${video.file_id}`);
    console.log(`📦 Size: ${Math.round(fileSize / 1024 / 1024)}MB`);
    console.log(`⏱️ Duration: ${formatVideoDuration(video.duration)}`);
    
    return result;
    
  } catch (error) {
    console.error(`❌ Error saving video:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      originalFileId: video.file_id
    };
  }
}

/**
 * Получает временный URL для просмотра видео из Telegram
 * 
 * @param {string} botToken - Telegram Bot Token
 * @param {string} fileId - file_id видео
 * @returns {Promise<string|null>} Временный URL (действителен ~1 час)
 */
export async function getTelegramVideoUrl(
  botToken: string,
  fileId: string
): Promise<string | null> {
  
  try {
    console.log(`🔗 Getting video URL from Telegram...`);
    
    // Получаем file_path
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
    );
    
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.ok || !data.result?.file_path) {
      throw new Error('Invalid file info response');
    }
    
    // Формируем URL
    const videoUrl = `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
    
    console.log(`✅ Got temporary video URL`);
    console.log(`⏱️ URL valid for ~1 hour`);
    
    return videoUrl;
    
  } catch (error) {
    console.error(`❌ Error getting video URL:`, error);
    return null;
  }
}

/**
 * Получает URL для thumbnail видео
 */
export async function getTelegramThumbnailUrl(
  botToken: string,
  thumbFileId: string | undefined
): Promise<string | null> {
  
  if (!thumbFileId) return null;
  
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${thumbFileId}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (!data.ok || !data.result?.file_path) return null;
    
    return `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
    
  } catch (error) {
    console.error('Error getting thumbnail URL:', error);
    return null;
  }
}

// Удалена функция uploadVideoThumbnail - больше не нужна
// Thumbnail хранится как file_id в Telegram

/**
 * Валидация видео перед сохранением
 */
export function validateVideo(video: TelegramVideo): {
  valid: boolean;
  error?: string;
} {
  
  // Проверка размера файла (Telegram лимит: 2GB)
  if (video.file_size && video.file_size > TELEGRAM_STORAGE_CONFIG.maxFileSize) {
    const sizeMB = Math.round(video.file_size / 1024 / 1024);
    const maxSizeMB = Math.round(TELEGRAM_STORAGE_CONFIG.maxFileSize / 1024 / 1024);
    return {
      valid: false,
      error: `Video too large: ${sizeMB}MB (max ${maxSizeMB}MB)`
    };
  }
  
  // Проверка MIME type
  if (video.mime_type && !TELEGRAM_STORAGE_CONFIG.allowedMimeTypes.includes(video.mime_type)) {
    return {
      valid: false,
      error: `Unsupported video format: ${video.mime_type}`
    };
  }
  
  // Проверка длительности (рекомендуемый лимит: 1 час)
  const MAX_DURATION = 3600; // 1 час
  if (video.duration > MAX_DURATION) {
    return {
      valid: false,
      error: `Video too long: ${Math.round(video.duration / 60)} minutes (recommended max: ${Math.round(MAX_DURATION / 60)} minutes)`
    };
  }
  
  return { valid: true };
}

/**
 * Получает информацию о видео
 */
export async function getVideoInfo(fileId: string, botToken: string): Promise<TelegramVideo | null> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
    );
    
    const data = await response.json();
    
    if (!data.ok) {
      return null;
    }
    
    return data.result;
  } catch (error) {
    console.error('Error getting video info:', error);
    return null;
  }
}

/**
 * Форматирует размер видео для отображения
 */
export function formatVideoSize(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  if (mb < 1) {
    return `${Math.round(bytes / 1024)}KB`;
  }
  return `${mb.toFixed(1)}MB`;
}

/**
 * Форматирует длительность видео
 */
export function formatVideoDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
