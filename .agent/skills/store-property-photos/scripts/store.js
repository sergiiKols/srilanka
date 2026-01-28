#!/usr/bin/env node

/**
 * SKILL #4: Store Property Photos
 * 
 * Сохранение фотографий из Telegram в Supabase Storage
 * 
 * Usage: node store.js --file-ids="id1,id2,id3" --property-id=456
 */

// Mock данные
const MOCK_FILE_IDS = [
  'AgACAgIAAxkBAAIC_001',
  'AgACAgIAAxkBAAIC_002',
  'AgACAgIAAxkBAAIC_003'
];

const MOCK_CONFIG = {
  TELEGRAM_BOT_TOKEN: 'MOCK_TOKEN',
  SUPABASE_URL: 'https://mcmzdscpuoxwneuzsanu.supabase.co',
  SUPABASE_KEY: 'MOCK_KEY',
  MAX_PHOTO_SIZE_MB: 5,
  MAX_PHOTOS: 10,
  COMPRESS: true
};

/**
 * Mock: Скачивание файла из Telegram
 */
async function downloadFromTelegram(fileId, index) {
  console.log(`   📥 Скачивание фото ${index + 1}: ${fileId.substring(0, 20)}...`);
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockSize = Math.floor(Math.random() * 3000000) + 500000; // 0.5-3.5MB
  const mockBuffer = Buffer.alloc(mockSize);
  
  console.log(`   ✓ Загружено ${(mockSize / 1024 / 1024).toFixed(2)} MB`);
  
  return {
    buffer: mockBuffer,
    size: mockSize,
    extension: 'jpg'
  };
}

/**
 * Mock: Сжатие фото
 */
async function compressPhoto(photo, index) {
  console.log(`   🗜️  Сжатие фото ${index + 1}...`);
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const originalSize = photo.size;
  const compressedSize = Math.floor(originalSize * 0.35); // 65% сжатие
  
  console.log(`   ✓ Сжато: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(compressedSize / 1024 / 1024).toFixed(2)} MB (${Math.floor((1 - compressedSize / originalSize) * 100)}%)`);
  
  return {
    ...photo,
    buffer: Buffer.alloc(compressedSize),
    size: compressedSize
  };
}

/**
 * Mock: Загрузка в Supabase Storage
 */
async function uploadToSupabase(photo, propertyId, index) {
  console.log(`   ☁️  Загрузка в Supabase Storage...`);
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const fileName = `photo_${Date.now()}_${index}.jpg`;
  const publicUrl = `https://mcmzdscpuoxwneuzsanu.supabase.co/storage/v1/object/public/properties/${propertyId}/${fileName}`;
  
  console.log(`   ✓ Загружено: ${fileName}`);
  console.log(`   📎 URL: ${publicUrl}`);
  
  return publicUrl;
}

/**
 * Mock: Обновление БД
 */
async function updateDatabase(propertyId, urls) {
  console.log(`\n💾 Обновление БД...`);
  console.log(`   UPDATE properties`);
  console.log(`   SET photos = ARRAY[${urls.length} URLs],`);
  console.log(`       photos_count = ${urls.length},`);
  console.log(`       updated_at = NOW()`);
  console.log(`   WHERE id = ${propertyId}`);
  
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`   ✓ БД обновлена`);
}

/**
 * Основная функция
 */
async function storePropertyPhotos(fileIds, propertyId, options = {}) {
  const {
    compress = true,
    maxSizeMB = 5,
    maxPhotos = 10
  } = options;
  
  try {
    console.log('🚀 SKILL #4: Store Property Photos');
    console.log('=' .repeat(50));
    console.log('');
    
    // Step 1: Validate
    console.log('✅ Step 1: Валидация входных данных');
    if (!fileIds || fileIds.length === 0) {
      throw new Error('No photo IDs provided');
    }
    if (fileIds.length > maxPhotos) {
      throw new Error(`Too many photos: ${fileIds.length} > ${maxPhotos}`);
    }
    console.log(`   Фотографий: ${fileIds.length}`);
    console.log(`   Property ID: ${propertyId}`);
    console.log(`   Сжатие: ${compress ? 'ВКЛ' : 'ВЫКЛ'}`);
    console.log(`   Макс размер: ${maxSizeMB} MB`);
    console.log('   ✓ Валидация пройдена');
    console.log('');
    
    // Step 2: Download from Telegram
    console.log('✅ Step 2: Скачивание из Telegram');
    const downloadedPhotos = [];
    const errors = [];
    
    for (let i = 0; i < fileIds.length; i++) {
      try {
        const photo = await downloadFromTelegram(fileIds[i], i);
        
        // Проверка размера
        const sizeMB = photo.size / 1024 / 1024;
        if (sizeMB > maxSizeMB) {
          errors.push(`Фото ${i + 1}: Слишком большой размер (${sizeMB.toFixed(1)}MB)`);
          console.log(`   ❌ Фото ${i + 1}: Слишком большой`);
          continue;
        }
        
        downloadedPhotos.push({ ...photo, index: i });
      } catch (err) {
        errors.push(`Фото ${i + 1}: ${err.message}`);
        console.log(`   ❌ Ошибка загрузки фото ${i + 1}`);
      }
    }
    
    console.log(`   ✓ Загружено ${downloadedPhotos.length} из ${fileIds.length} фото`);
    console.log('');
    
    if (downloadedPhotos.length === 0) {
      throw new Error('Не удалось загрузить ни одной фотографии');
    }
    
    // Step 3: Compress
    console.log('✅ Step 3: Сжатие фотографий');
    const compressedPhotos = [];
    
    if (compress) {
      for (const photo of downloadedPhotos) {
        const compressed = await compressPhoto(photo, photo.index);
        compressedPhotos.push(compressed);
      }
    } else {
      console.log('   ⏭️  Сжатие пропущено');
      compressedPhotos.push(...downloadedPhotos);
    }
    console.log('');
    
    // Step 4: Upload to Supabase
    console.log('✅ Step 4: Загрузка в Supabase Storage');
    const storageUrls = [];
    let totalSize = 0;
    
    for (const photo of compressedPhotos) {
      try {
        const url = await uploadToSupabase(photo, propertyId, photo.index);
        storageUrls.push(url);
        totalSize += photo.size;
      } catch (err) {
        errors.push(`Фото ${photo.index + 1}: Ошибка загрузки - ${err.message}`);
        console.log(`   ❌ Ошибка загрузки фото ${photo.index + 1}`);
      }
    }
    
    console.log(`   ✓ Загружено ${storageUrls.length} фото в Storage`);
    console.log('');
    
    // Step 5: Update DB
    console.log('✅ Step 5: Сохранение в БД');
    await updateDatabase(propertyId, storageUrls);
    console.log('');
    
    // Step 6: Result
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    const compressionRatio = compress ? 
      `${Math.floor((1 - totalSize / downloadedPhotos.reduce((s, p) => s + p.size, 0)) * 100)}%` : 
      'N/A';
    
    const result = {
      status: errors.length === 0 ? 'success' : 'partial',
      property_id: propertyId,
      photos_uploaded: storageUrls.length,
      photos_failed: errors.length,
      storage_urls: storageUrls,
      errors: errors,
      message: `${storageUrls.length} из ${fileIds.length} фотографий загружены`,
      storage_size_mb: parseFloat(totalSizeMB),
      compression_ratio: compressionRatio
    };
    
    console.log('🎉 УСПЕШНО!');
    console.log('=' .repeat(50));
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    
    return result;
    
  } catch (error) {
    console.error('❌ ОШИБКА:', error.message);
    console.log('');
    
    return {
      status: 'error',
      error: error.message,
      message: 'Ошибка при сохранении фотографий'
    };
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  const fileIdsArg = args.find(arg => arg.startsWith('--file-ids='));
  const propertyIdArg = args.find(arg => arg.startsWith('--property-id='));
  const compressArg = args.find(arg => arg.startsWith('--compress='));
  
  if (!propertyIdArg) {
    console.log('Usage: node store.js --file-ids="id1,id2,id3" --property-id=456 [--compress=true]');
    console.log('');
    console.log('Будут использованы mock данные');
    console.log('');
  }
  
  const fileIds = fileIdsArg ? 
    fileIdsArg.split('=')[1].split(',') : 
    MOCK_FILE_IDS;
  
  const propertyId = propertyIdArg ? 
    parseInt(propertyIdArg.split('=')[1]) : 
    456;
  
  const compress = compressArg ? 
    compressArg.split('=')[1] === 'true' : 
    true;
  
  storePropertyPhotos(fileIds, propertyId, { compress })
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { storePropertyPhotos };
