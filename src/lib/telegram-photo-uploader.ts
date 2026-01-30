/**
 * TELEGRAM PHOTO UPLOADER
 * Загрузка фотографий из Telegram в Supabase Storage
 */

import { supabase } from './supabase';

/**
 * Telegram Photo объект
 */
interface TelegramPhoto {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  width: number;
  height: number;
}

/**
 * Результат загрузки фото
 */
interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  originalFileId?: string;
}

/**
 * Загружает фотографии из Telegram в Supabase Storage
 * 
 * @param {string} botToken - Telegram Bot Token
 * @param {TelegramPhoto[]} photos - Массив фото из Telegram
 * @param {number} userId - Telegram user ID
 * @param {string} propertyId - UUID объекта недвижимости
 * @param {number} maxPhotos - Максимальное количество фото (по умолчанию 10)
 * @returns {Promise<string[]>} Массив публичных URL загруженных фото
 */
export async function uploadTelegramPhotos(
  botToken: string,
  photos: TelegramPhoto[],
  userId: number,
  propertyId: string,
  maxPhotos: number = 10
): Promise<string[]> {
  
  if (!photos || photos.length === 0) {
    console.log('📸 No photos to upload');
    return [];
  }
  
  // Ограничиваем количество фото
  const photosToUpload = photos.slice(0, maxPhotos);
  
  if (photos.length > maxPhotos) {
    console.warn(`⚠️ Too many photos (${photos.length}), uploading first ${maxPhotos}`);
  }
  
  console.log(`📸 Uploading ${photosToUpload.length} photos...`);
  
  const uploadResults: UploadResult[] = [];
  
  // Загружаем фото параллельно для скорости
  const uploadPromises = photosToUpload.map((photo, index) =>
    uploadSinglePhoto(botToken, photo, userId, propertyId, index)
  );
  
  const results = await Promise.allSettled(uploadPromises);
  
  // Обрабатываем результаты
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      uploadResults.push(result.value);
      console.log(`✅ Photo ${index + 1} uploaded: ${result.value.url}`);
    } else {
      const error = result.status === 'rejected' 
        ? result.reason 
        : result.value.error;
      console.error(`❌ Photo ${index + 1} failed:`, error);
      uploadResults.push({
        success: false,
        error: error?.toString(),
        originalFileId: photosToUpload[index].file_id
      });
    }
  });
  
  // Возвращаем только успешно загруженные URL
  const successfulUploads = uploadResults
    .filter(r => r.success && r.url)
    .map(r => r.url!);
  
  console.log(`✅ Successfully uploaded ${successfulUploads.length}/${photosToUpload.length} photos`);
  
  return successfulUploads;
}

/**
 * Загружает одно фото из Telegram в Supabase Storage
 */
async function uploadSinglePhoto(
  botToken: string,
  photo: TelegramPhoto,
  userId: number,
  propertyId: string,
  index: number
): Promise<UploadResult> {
  
  try {
    // 1. Получаем file_path от Telegram
    const fileId = photo.file_id;
    console.log(`📥 Fetching file info for photo ${index + 1}...`);
    
    const fileInfoResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
    );
    
    if (!fileInfoResponse.ok) {
      throw new Error(`Telegram API error: ${fileInfoResponse.status}`);
    }
    
    const fileInfo = await fileInfoResponse.json();
    
    if (!fileInfo.ok || !fileInfo.result?.file_path) {
      throw new Error('Invalid file info response');
    }
    
    const filePath = fileInfo.result.file_path;
    
    // 2. Скачиваем файл из Telegram
    console.log(`⬇️ Downloading photo ${index + 1}...`);
    
    const photoUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    const photoResponse = await fetch(photoUrl);
    
    if (!photoResponse.ok) {
      throw new Error(`Failed to download photo: ${photoResponse.status}`);
    }
    
    // Получаем blob и определяем MIME type
    const photoArrayBuffer = await photoResponse.arrayBuffer();
    
    // Определяем тип файла из расширения или используем image/jpeg по умолчанию
    let mimeType = 'image/jpeg';
    if (filePath.toLowerCase().endsWith('.png')) {
      mimeType = 'image/png';
    } else if (filePath.toLowerCase().endsWith('.webp')) {
      mimeType = 'image/webp';
    }
    
    const photoBlob = new Blob([photoArrayBuffer], { type: mimeType });
    console.log(`📦 Photo type: ${mimeType}, size: ${Math.round(photoBlob.size / 1024)}KB`);
    
    // Проверяем размер файла (лимит 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (photoBlob.size > MAX_SIZE) {
      console.warn(`⚠️ Photo ${index + 1} is too large (${Math.round(photoBlob.size / 1024 / 1024)}MB), compressing...`);
      // TODO: Можно добавить сжатие здесь
    }
    
    // 3. Генерируем уникальное имя файла
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const fileName = `photo_${index + 1}_${timestamp}_${randomStr}.jpg`;
    
    // Путь в Storage: tenant-photos/{userId}/{propertyId}/{fileName}
    const storagePath = `${userId}/${propertyId}/${fileName}`;
    
    console.log(`⬆️ Uploading photo ${index + 1} to Storage...`);
    
    // 4. Загружаем в Supabase Storage
    console.log(`🔍 Storage path: ${storagePath}`);
    console.log(`🔍 Blob size: ${Math.round(photoBlob.size / 1024)}KB`);
    console.log(`🔍 Content-Type: ${mimeType}`);
    
    const { data, error } = await supabase.storage
      .from('tenant-photos')
      .upload(storagePath, photoBlob, {
        contentType: mimeType, // ✅ Используем определённый MIME type
        upsert: false,
        cacheControl: '3600' // Кэширование на 1 час
      });
    
    if (error) {
      console.error(`❌ Storage upload failed:`, error);
      throw new Error(`Storage upload error: ${error.message}`);
    }
    
    console.log(`✅ Storage upload successful:`, data);
    
    // 5. Получаем публичный URL
    const { data: urlData } = supabase.storage
      .from('tenant-photos')
      .getPublicUrl(storagePath);
    
    const publicUrl = urlData?.publicUrl;
    
    if (!publicUrl) {
      throw new Error('Failed to get public URL');
    }
    
    console.log(`✅ Photo ${index + 1} uploaded successfully: ${publicUrl}`);
    
    return {
      success: true,
      url: publicUrl,
      originalFileId: fileId
    };
    
  } catch (error) {
    console.error(`❌ Error uploading photo ${index + 1}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      originalFileId: photo.file_id
    };
  }
}

/**
 * Удаляет фотографии объекта из Storage
 * 
 * @param {number} userId - Telegram user ID
 * @param {string} propertyId - UUID объекта
 * @returns {Promise<boolean>} true если успешно
 */
export async function deletePropertyPhotos(
  userId: number,
  propertyId: string
): Promise<boolean> {
  
  try {
    console.log(`🗑️ Deleting photos for property ${propertyId}...`);
    
    // Удаляем всю папку объекта
    const folderPath = `${userId}/${propertyId}`;
    
    // Получаем список файлов в папке
    const { data: files, error: listError } = await supabase.storage
      .from('tenant-photos')
      .list(folderPath);
    
    if (listError) {
      throw listError;
    }
    
    if (!files || files.length === 0) {
      console.log('📁 No photos to delete');
      return true;
    }
    
    // Удаляем все файлы
    const filePaths = files.map(file => `${folderPath}/${file.name}`);
    
    const { error: deleteError } = await supabase.storage
      .from('tenant-photos')
      .remove(filePaths);
    
    if (deleteError) {
      throw deleteError;
    }
    
    console.log(`✅ Deleted ${files.length} photos`);
    return true;
    
  } catch (error) {
    console.error('❌ Error deleting photos:', error);
    return false;
  }
}

/**
 * Получает размер лучшего качества фото из массива Telegram photos
 * Telegram отправляет фото в нескольких размерах, выбираем самый большой
 * 
 * @param {TelegramPhoto[]} photos - Массив фото разных размеров
 * @returns {TelegramPhoto} Фото лучшего качества
 */
export function getBestQualityPhoto(photos: TelegramPhoto[]): TelegramPhoto {
  if (!photos || photos.length === 0) {
    throw new Error('No photos provided');
  }
  
  // Сортируем по размеру файла (если доступен) или по разрешению
  const sorted = [...photos].sort((a, b) => {
    if (a.file_size && b.file_size) {
      return b.file_size - a.file_size;
    }
    // Если размер файла неизвестен, сортируем по разрешению
    return (b.width * b.height) - (a.width * a.height);
  });
  
  return sorted[0];
}

/**
 * Обрабатывает media group (альбом фото) из Telegram
 * Telegram группирует фото в media_group_id если отправлено как альбом
 * 
 * @param {any[]} messages - Массив сообщений из одного media group
 * @param {string} botToken - Bot token
 * @param {number} userId - User ID
 * @param {string} propertyId - Property ID
 * @returns {Promise<string[]>} Массив URL загруженных фото
 */
export async function uploadMediaGroup(
  messages: any[],
  botToken: string,
  userId: number,
  propertyId: string
): Promise<string[]> {
  
  console.log(`📸 Processing media group (${messages.length} photos)...`);
  
  // Извлекаем лучшее качество из каждого сообщения
  const allPhotos: TelegramPhoto[] = [];
  
  for (const message of messages) {
    if (message.photo && message.photo.length > 0) {
      const bestPhoto = getBestQualityPhoto(message.photo);
      allPhotos.push(bestPhoto);
    }
  }
  
  // Загружаем все фото
  return uploadTelegramPhotos(botToken, allPhotos, userId, propertyId);
}

/**
 * Получает информацию о размере фото
 * 
 * @param {string} url - URL фото
 * @returns {Promise<{width: number, height: number, size: number}>}
 */
export async function getPhotoInfo(url: string): Promise<{
  width: number;
  height: number;
  size: number;
}> {
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    const size = contentLength ? parseInt(contentLength) : 0;
    
    // Для получения размеров нужно загрузить и декодировать изображение
    // Это можно сделать на клиенте или с помощью библиотеки типа sharp
    
    return {
      width: 0,
      height: 0,
      size
    };
    
  } catch (error) {
    console.error('Error getting photo info:', error);
    return { width: 0, height: 0, size: 0 };
  }
}

/**
 * Валидация фото перед загрузкой
 */
export function validatePhoto(photo: TelegramPhoto): {
  valid: boolean;
  error?: string;
} {
  
  // Проверка размера файла (если доступен)
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (photo.file_size && photo.file_size > MAX_SIZE) {
    return {
      valid: false,
      error: `File too large: ${Math.round(photo.file_size / 1024 / 1024)}MB (max 5MB)`
    };
  }
  
  // Проверка разрешения
  const MAX_DIMENSION = 4096;
  if (photo.width > MAX_DIMENSION || photo.height > MAX_DIMENSION) {
    return {
      valid: false,
      error: `Image too large: ${photo.width}x${photo.height} (max ${MAX_DIMENSION})`
    };
  }
  
  return { valid: true };
}
