/**
 * TELEGRAM BOT WEBHOOK ENDPOINT
 * Главный endpoint для приёма обновлений от Telegram Bot
 */

import type { APIRoute } from 'astro';

export const prerender = false;

import { sendTelegramMessage } from '@/lib/telegram';
import { getOrCreateTenant, saveProperty, checkDuplicate } from '@/lib/tenant-bot-db';
import { parseForwardMetadata } from '@/lib/telegram-forward-parser';
import { analyzeWithFallback, logAIResult, formatForDatabase } from '@/lib/telegram-bot-ai';
import { uploadTelegramPhotos, getBestQualityPhoto } from '@/lib/telegram-photo-uploader';
import { extractGoogleMapsUrl, formatSuccessMessage, generateUUID } from '@/lib/tenant-bot-utils';

/**
 * Session state для сбора данных перед сохранением
 */
interface UserSession {
  userId: number;
  state: 'collecting' | 'ready_to_save';
  tempData: {
    photos?: string[];
    photoFileIds?: string[];
    photoObjects?: any[]; // Telegram photo objects для загрузки
    latitude?: number;
    longitude?: number;
    description?: string;
    googleMapsUrl?: string;
    forwardMetadata?: any;
    mediaGroupId?: string; // Для отслеживания media groups
  };
  lastActivity: Date;
  lastMessageTime?: Date; // Для определения завершения ввода
}

// Храним сессии в памяти (в production использовать Redis)
const userSessions = new Map<number, UserSession>();

// Храним media groups для сбора множественных фото
const mediaGroups = new Map<string, {
  messages: any[];
  timeout: NodeJS.Timeout;
}>();

/**
 * Основной POST endpoint
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const update = await request.json();
    console.log('📨 Received Telegram update:', update.update_id);
    console.log('📨 Full update:', JSON.stringify(update, null, 2));

    // Обработка callback query (кнопки)
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
      return new Response('OK', { status: 200 });
    }

    // Обработка обычного сообщения
    if (update.message) {
      // Проверяем media group (множественные фото)
      if (update.message.media_group_id) {
        await handleMediaGroup(update.message);
      } else {
        await handleMessage(update.message);
      }
      return new Response('OK', { status: 200 });
    }

    console.log('⚠️ Unknown update type');
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response('Error', { status: 500 });
  }
};

export const GET: APIRoute = async () => {
  return new Response("Telegram Webhook is Active v2", { status: 200 });
};

/**
 * Обработка media group (множественные фото) - БЕЗ ТАЙМЕРА!
 */
async function handleMediaGroup(message: any) {
  const groupId = message.media_group_id;
  const userId = message.from.id;
  const chatId = message.chat.id;
  
  console.log(`📸 Media group photo received: ${groupId}`);
  
  // Добавляем фото СРАЗУ в сессию (без ожидания остальных)
  let session = userSessions.get(userId);
  if (!session) {
    session = {
      userId,
      state: 'collecting',
      tempData: { photoObjects: [] },
      lastActivity: new Date()
    };
    userSessions.set(userId, session);
  }
  
  // Добавляем фото
  if (message.photo && message.photo.length > 0) {
    const bestPhoto = getBestQualityPhoto(message.photo);
    session.tempData.photoObjects = session.tempData.photoObjects || [];
    session.tempData.photoObjects.push(bestPhoto);
    
    const photoCount = session.tempData.photoObjects.length;
    console.log(`📎 Photo ${photoCount} added to session`);
    
    // Отправляем быстрое уведомление (С ОЖИДАНИЕМ)
    try {
      await sendTelegramMessage({
        botToken: import.meta.env.TELEGRAM_BOT_TOKEN,
        chatId: chatId.toString(),
        text: `📸 ${photoCount} фото`
      });
      console.log(`✅ Photo notification sent: ${photoCount} photos`);
    } catch (err) {
      console.error('❌ Error sending notification:', err);
    }
    
    // Проверяем - может уже есть всё (гео + описание)? Тогда показываем превью!
    const hasLocation = !!(session.tempData.latitude || session.tempData.googleMapsUrl);
    const hasDescription = !!(session.tempData.description && session.tempData.description.trim());
    
    // Показываем превью только если есть хотя бы гео (основное условие)
    if (hasLocation) {
      showSessionPreview(chatId, session).catch(err => {
        console.error('❌ Error showing preview after photo:', err);
      });
    }
  }
  
  // Парсим caption из первого фото группы
  if (message.caption) {
    session.tempData.description = message.caption;
    const googleMapsUrl = extractGoogleMapsUrl(message.caption);
    if (googleMapsUrl) {
      session.tempData.googleMapsUrl = googleMapsUrl;
    }
  }
  
  session.lastActivity = new Date();
}

/**
 * Собрать media group в сессию (не сохранять сразу)
 */
async function collectMediaGroupToSession(messages: any[]) {
  if (messages.length === 0) return;
  
  const firstMessage = messages[0];
  const userId = firstMessage.from.id;
  const chatId = firstMessage.chat.id;
  const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;
  
  try {
    console.log(`📸 Collecting ${messages.length} photos to session...`);
    
    // Получаем или создаём сессию
    let session = userSessions.get(userId);
    if (!session) {
      session = {
        userId,
        state: 'collecting',
        tempData: {},
        lastActivity: new Date()
      };
      userSessions.set(userId, session);
    }
    
    session.lastActivity = new Date();
    session.lastMessageTime = new Date();
    
    // Собираем фото объекты
    const photoObjects: any[] = [];
    for (const msg of messages) {
      if (msg.photo && msg.photo.length > 0) {
        const bestPhoto = getBestQualityPhoto(msg.photo);
        photoObjects.push(bestPhoto);
      }
    }
    
    // Добавляем к существующим или создаём новые
    session.tempData.photoObjects = [
      ...(session.tempData.photoObjects || []),
      ...photoObjects
    ];
    
    // Извлекаем текст из caption (только первое фото)
    const caption = firstMessage.caption || '';
    if (caption) {
      session.tempData.description = caption;
      
      // Проверяем на Google Maps URL
      const googleMapsUrl = extractGoogleMapsUrl(caption);
      if (googleMapsUrl) {
        session.tempData.googleMapsUrl = googleMapsUrl;
      }
    }
    
    // Парсим forward метаданные
    const forwardMeta = parseForwardMetadata(firstMessage);
    session.tempData.forwardMetadata = forwardMeta;
    
    // НЕ показываем превью после фото - только собираем
    console.log(`✅ Session updated (${session.tempData.photoObjects?.length || 0} photos collected)`);
    
  } catch (error) {
    console.error('❌ Error collecting media group:', error);
    // НЕ отправляем сообщение об ошибке - это тоже async
  }
}

/**
 * Обработка полной media group (старая функция - оставляем для совместимости)
 */
async function processCompleteMediaGroup(messages: any[]) {
  if (messages.length === 0) return;
  
  // Берём первое сообщение для метаданных (caption только на первом)
  const firstMessage = messages[0];
  const userId = firstMessage.from.id;
  const chatId = firstMessage.chat.id;
  const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;
  
  try {
    console.log(`⚡ Processing media group with ${messages.length} photos`);
    
    // 1. Получить/создать tenant
    const tenant = await getOrCreateTenant(userId);
    console.log(`✅ Tenant: ${tenant.telegram_user_id}`);
    
    // 2. Парсинг forward метаданных (из первого сообщения)
    const forwardMeta = parseForwardMetadata(firstMessage);
    console.log(`📨 Source: ${forwardMeta.source_type}`);
    
    // 3. Извлечь текст (caption только на первом фото)
    const text = firstMessage.caption || firstMessage.text || '';
    const googleMapsUrl = extractGoogleMapsUrl(text);
    
    // 4. AI анализ
    console.log('🤖 Starting AI analysis...');
    const aiResult = await analyzeWithFallback(text, googleMapsUrl || undefined);
    logAIResult(aiResult);
    
    // 5. Проверка дубликатов
    if (aiResult.coordinates) {
      const duplicate = await checkDuplicate(
        userId,
        aiResult.coordinates.lat,
        aiResult.coordinates.lng,
        aiResult.price
      );
      
      if (duplicate) {
        console.log('⚠️ Duplicate found');
        await sendDuplicateWarning(chatId, duplicate);
        return;
      }
    }
    
    // 6. Загрузка ВСЕХ фото из группы
    let photoUrls: string[] = [];
    const propertyId = generateUUID();
    
    console.log(`📸 Uploading ${messages.length} photos from media group...`);
    
    // Собираем все фото из всех сообщений
    const allPhotos: any[] = [];
    for (const msg of messages) {
      if (msg.photo && msg.photo.length > 0) {
        const bestPhoto = getBestQualityPhoto(msg.photo);
        allPhotos.push(bestPhoto);
      }
    }
    
    // Загружаем все фото
    if (allPhotos.length > 0) {
      photoUrls = await uploadTelegramPhotos(
        botToken,
        allPhotos,
        userId,
        propertyId,
        allPhotos.length
      );
      console.log(`✅ Uploaded ${photoUrls.length} photos from ${messages.length} messages`);
    }
    
    // 7. Подготовка данных
    const propertyData = {
      ...formatForDatabase(aiResult),
      telegram_user_id: userId,
      photos: photoUrls,
      description: text || aiResult.description,  // ✅ Сохраняем исходный текст
      raw_text: text,  // ✅ Full backup
      google_maps_url: googleMapsUrl || undefined,
      ...forwardMeta
    };
    
    // 8. Сохранение в БД
    console.log('💾 Saving to database...');
    const property = await saveProperty(propertyData);
    console.log(`✅ Property saved: ${property.id} with ${photoUrls.length} photos`);
    
    // 9. Отправка ответа
    const newCount = tenant.saved_properties_count + 1;
    const successMessage = formatSuccessMessage(
      property,
      newCount,
      tenant.personal_map_url
    );
    
    await sendTelegramMessage({
      botToken,
      chatId: chatId.toString(),
      text: successMessage + `\n\n📸 Загружено фото: ${photoUrls.length}`,
      replyMarkup: {
        inline_keyboard: [
          [
            { text: '🗺️ Открыть карту', url: tenant.personal_map_url },
            { text: '⭐ В избранное', callback_data: `favorite_${property.id}` }
          ],
          [
            { text: '✏️ Добавить заметку', callback_data: `add_note_${property.id}` },
            { text: '🗑️ Удалить', callback_data: `delete_${property.id}` }
          ]
        ]
      }
    });
    
    console.log('✅ Media group processed successfully');
    
  } catch (error) {
    console.error('❌ Error processing media group:', error);
    await sendErrorMessage(chatId, 'Не удалось сохранить объект. Попробуй ещё раз.');
  }
}

/**
 * Обработка сообщений
 */
async function handleMessage(message: any) {
  const userId = message.from.id;
  const chatId = message.chat.id;

  console.log(`👤 Processing message from user ${userId}`);

  // Команды
  if (message.text?.startsWith('/')) {
    await handleCommand(message);
    return;
  }

  // Проверяем что в сообщении есть полезная информация
  const hasPhotos = message.photo && message.photo.length > 0;
  const hasLocation = message.location !== undefined;
  const hasText = message.text || message.caption;
  const hasGoogleMapsUrl = hasText && extractGoogleMapsUrl(hasText);

  // Если ничего полезного нет
  if (!hasPhotos && !hasLocation && !hasGoogleMapsUrl && !hasText) {
    await sendHelp(chatId);
    return;
  }

  // НОВАЯ ЛОГИКА: Всегда собираем в сессию, не сохраняем сразу
  await collectMessageToSession(message);
}

/**
 * Собрать обычное сообщение в сессию
 */
async function collectMessageToSession(message: any) {
  const userId = message.from.id;
  const chatId = message.chat.id;
  const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;
  
  try {
    // Получаем или создаём сессию
    let session = userSessions.get(userId);
    if (!session) {
      session = {
        userId,
        state: 'collecting',
        tempData: {},
        lastActivity: new Date()
      };
      userSessions.set(userId, session);
    }
    
    session.lastActivity = new Date();
    session.lastMessageTime = new Date();
    
    // Обрабатываем фото
    if (message.photo && message.photo.length > 0) {
      const bestPhoto = getBestQualityPhoto(message.photo);
      session.tempData.photoObjects = session.tempData.photoObjects || [];
      session.tempData.photoObjects.push(bestPhoto);
      console.log(`📸 Added photo to session, total: ${session.tempData.photoObjects.length}`);
    }
    
    // Обрабатываем локацию
    if (message.location) {
      session.tempData.latitude = message.location.latitude;
      session.tempData.longitude = message.location.longitude;
      console.log(`📍 Added location to session: ${message.location.latitude}, ${message.location.longitude}`);
    }
    
    // Обрабатываем текст
    const text = message.caption || message.text || '';
    if (text) {
      // Добавляем к существующему описанию или создаём новое
      if (session.tempData.description) {
        session.tempData.description += '\n' + text;
      } else {
        session.tempData.description = text;
      }
      
      // Проверяем на Google Maps URL
      const googleMapsUrl = extractGoogleMapsUrl(text);
      if (googleMapsUrl) {
        session.tempData.googleMapsUrl = googleMapsUrl;
        console.log(`🔗 Added Google Maps URL to session`);
      }
    }
    
    // Парсим forward метаданные
    if (!session.tempData.forwardMetadata) {
      const forwardMeta = parseForwardMetadata(message);
      session.tempData.forwardMetadata = forwardMeta;
    }
    
    // Показываем превью ТОЛЬКО если добавили локацию И есть фото
    const hasLocation = !!(session.tempData.latitude || session.tempData.googleMapsUrl);
    const hasPhotos = (session.tempData.photoObjects?.length || 0) > 0;
    const justAddedLocation = !!(message.location || extractGoogleMapsUrl(message.text || message.caption || ''));
    
    if (hasLocation && hasPhotos && justAddedLocation) {
      showSessionPreview(chatId, session).catch(err => {
        console.error('❌ Error showing preview:', err);
      });
    }
    
    console.log(`✅ Message collected: photos=${hasPhotos}, location=${hasLocation}, justAddedLocation=${justAddedLocation}`);
    
  } catch (error) {
    console.error('❌ Error collecting message to session:', error);
    // НЕ отправляем сообщение об ошибке - это тоже async
  }
}

/**
 * РЕЖИМ 1: Обработка полного сообщения (forward) - СТАРАЯ ФУНКЦИЯ
 */
async function handleCompleteMessage(message: any) {
  const userId = message.from.id;
  const chatId = message.chat.id;
  const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;

  try {
    console.log('⚡ Complete message mode - processing...');

    // 1. Получить/создать tenant
    const tenant = await getOrCreateTenant(userId);
    console.log(`✅ Tenant: ${tenant.telegram_user_id}, token: ${tenant.map_secret_token}`);

    // 2. Парсинг forward метаданных
    const forwardMeta = parseForwardMetadata(message);
    console.log(`📨 Source: ${forwardMeta.source_type}`);

    // 3. Извлечь текст и Google Maps URL
    const text = message.caption || message.text || '';
    const googleMapsUrl = extractGoogleMapsUrl(text);

    // 4. AI анализ (с fallback на manual parser)
    console.log('🤖 Starting AI analysis...');
    const aiResult = await analyzeWithFallback(text, googleMapsUrl || undefined);
    logAIResult(aiResult);

    // 5. Проверка дубликатов
    if (aiResult.coordinates) {
      const duplicate = await checkDuplicate(
        userId,
        aiResult.coordinates.lat,
        aiResult.coordinates.lng,
        aiResult.price
      );

      if (duplicate) {
        console.log('⚠️ Duplicate found, asking user...');
        await sendDuplicateWarning(chatId, duplicate);
        return;
      }
    }

    // 6. Загрузка фото
    let photoUrls: string[] = [];
    const propertyId = generateUUID();

    if (message.photo && message.photo.length > 0) {
      console.log('📸 Uploading photo...');
      const bestPhoto = getBestQualityPhoto(message.photo);
      photoUrls = await uploadTelegramPhotos(
        botToken,
        [bestPhoto],
        userId,
        propertyId,
        1
      );
      console.log(`✅ Uploaded ${photoUrls.length} photo(s)`);
    }

    // 7. Подготовка данных для сохранения
    const propertyData = {
      ...formatForDatabase(aiResult),
      telegram_user_id: userId,
      photos: photoUrls,
      description: text || aiResult.description,  // ✅ Сохраняем исходный текст
      raw_text: text,  // ✅ Full backup
      google_maps_url: googleMapsUrl || undefined,
      ...forwardMeta
    };

    // 8. Сохранение в БД
    console.log('💾 Saving to database...');
    const property = await saveProperty(propertyData);
    console.log(`✅ Property saved: ${property.id}`);

    // 9. Отправка ответа пользователю
    const newCount = tenant.saved_properties_count + 1;
    const successMessage = formatSuccessMessage(
      property,
      newCount,
      tenant.personal_map_url
    );

    await sendTelegramMessage({
      botToken,
      chatId: chatId.toString(),
      text: successMessage,
      replyMarkup: {
        inline_keyboard: [
          [
            { text: '🗺️ Открыть карту', url: tenant.personal_map_url },
            { text: '⭐ В избранное', callback_data: `favorite_${property.id}` }
          ],
          [
            { text: '✏️ Добавить заметку', callback_data: `add_note_${property.id}` },
            { text: '🗑️ Удалить', callback_data: `delete_${property.id}` }
          ]
        ]
      }
    });

    console.log('✅ Complete message processed successfully');

  } catch (error) {
    console.error('❌ Error processing complete message:', error);
    await sendErrorMessage(chatId, 'Не удалось сохранить объект. Попробуй ещё раз.');
  }
}

/**
 * РЕЖИМ 2: Пошаговый ввод
 */
async function handleStepByStepInput(message: any) {
  const userId = message.from.id;
  const chatId = message.chat.id;

  // Получаем или создаём сессию
  let session = userSessions.get(userId);
  if (!session) {
    session = {
      userId,
      state: 'idle',
      tempData: {},
      lastActivity: new Date()
    };
    userSessions.set(userId, session);
  }

  session.lastActivity = new Date();

  const hasPhotos = message.photo && message.photo.length > 0;
  const hasLocation = message.location !== undefined;
  const hasText = message.text || message.caption;

  // State machine
  switch (session.state) {
    case 'idle':
      if (hasPhotos) {
        // Получили фото - ждём локацию
        const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;
        const bestPhoto = getBestQualityPhoto(message.photo);
        session.tempData.photoFileIds = [bestPhoto.file_id];
        session.state = 'awaiting_location';

        await sendTelegramMessage({
          botToken,
          chatId: chatId.toString(),
          text: '📸 Фото получены! (1 шт.)\n\n📍 Теперь отправь:\n• Геолокацию объекта\n• Или Google Maps ссылку\n• Или текст с адресом',
          replyMarkup: {
            inline_keyboard: [
              [{ text: '💾 Сохранить без адреса', callback_data: 'save_no_location' }],
              [{ text: '❌ Отмена', callback_data: 'cancel' }]
            ]
          }
        });
      } else if (hasLocation) {
        // Получили локацию - ждём фото
        session.tempData.latitude = message.location.latitude;
        session.tempData.longitude = message.location.longitude;
        session.state = 'awaiting_photos';

        await sendTelegramMessage({
          botToken: import.meta.env.TELEGRAM_BOT_TOKEN,
          chatId: chatId.toString(),
          text: '📍 Местоположение получено!\n\n📸 Теперь отправь фото объекта',
          replyMarkup: {
            inline_keyboard: [
              [{ text: '💾 Сохранить без фото', callback_data: 'save_no_photos' }],
              [{ text: '❌ Отмена', callback_data: 'cancel' }]
            ]
          }
        });
      } else if (hasText) {
        // Получили текст - пытаемся извлечь данные
        const googleMapsUrl = extractGoogleMapsUrl(hasText);
        if (googleMapsUrl) {
          session.tempData.googleMapsUrl = googleMapsUrl;
          session.tempData.description = hasText;
          session.state = 'awaiting_photos';

          await sendTelegramMessage({
            botToken: import.meta.env.TELEGRAM_BOT_TOKEN,
            chatId: chatId.toString(),
            text: '🔗 Google Maps ссылка получена!\n\n📸 Теперь отправь фото объекта',
            replyMarkup: {
              inline_keyboard: [
                [{ text: '💾 Сохранить без фото', callback_data: 'save_complete' }]
              ]
            }
          });
        } else {
          session.tempData.description = hasText;
          session.state = 'awaiting_location';

          await sendTelegramMessage({
            botToken: import.meta.env.TELEGRAM_BOT_TOKEN,
            chatId: chatId.toString(),
            text: '💬 Описание получено!\n\n📍 Теперь отправь геолокацию или Google Maps ссылку'
          });
        }
      }
      break;

    case 'awaiting_location':
      if (hasLocation) {
        session.tempData.latitude = message.location.latitude;
        session.tempData.longitude = message.location.longitude;
        session.state = 'awaiting_description';

        await sendTelegramMessage({
          botToken: import.meta.env.TELEGRAM_BOT_TOKEN,
          chatId: chatId.toString(),
          text: '📍 Отлично! Теперь добавь описание или сохраняй так',
          replyMarkup: {
            inline_keyboard: [[{ text: '💾 Сохранить сейчас', callback_data: 'save_complete' }]]
          }
        });
      } else if (hasText) {
        const googleMapsUrl = extractGoogleMapsUrl(hasText);
        if (googleMapsUrl) {
          session.tempData.googleMapsUrl = googleMapsUrl;
          session.tempData.description = session.tempData.description
            ? session.tempData.description + '\n' + hasText
            : hasText;
          session.state = 'awaiting_description';

          await sendTelegramMessage({
            botToken: import.meta.env.TELEGRAM_BOT_TOKEN,
            chatId: chatId.toString(),
            text: '✅ Google Maps ссылка получена!\n\n💬 Добавь описание или сохраняй',
            replyMarkup: {
              inline_keyboard: [[{ text: '💾 Сохранить сейчас', callback_data: 'save_complete' }]]
            }
          });
        }
      }
      break;

    case 'awaiting_photos':
      if (hasPhotos) {
        const bestPhoto = getBestQualityPhoto(message.photo);
        session.tempData.photoFileIds = session.tempData.photoFileIds || [];
        session.tempData.photoFileIds.push(bestPhoto.file_id);

        await sendTelegramMessage({
          botToken: import.meta.env.TELEGRAM_BOT_TOKEN,
          chatId: chatId.toString(),
          text: `📸 Фото получено! (${session.tempData.photoFileIds.length} шт.)`,
          replyMarkup: {
            inline_keyboard: [[{ text: '💾 Сохранить', callback_data: 'save_complete' }]]
          }
        });
      }
      break;

    case 'awaiting_description':
      if (hasText) {
        session.tempData.description = hasText;

        await sendTelegramMessage({
          botToken: import.meta.env.TELEGRAM_BOT_TOKEN,
          chatId: chatId.toString(),
          text: '✅ Описание получено!',
          replyMarkup: {
            inline_keyboard: [[{ text: '💾 Сохранить объект', callback_data: 'save_complete' }]]
          }
        });
      }
      break;
  }
}

/**
 * Обработка callback query (кнопки)
 */
async function handleCallbackQuery(callbackQuery: any) {
  const data = callbackQuery.data;
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;

  console.log(`🔘 Callback: ${data} from user ${userId}`);

  // Answer callback (убирает "часики")
  await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQuery.id })
  });

  // Обработка по типу callback
  if (data === 'session_save') {
    // Сохранить объект из сессии
    console.log(`🔘 Callback session_save triggered for user ${userId}`);
    
    // ВАЖНО: Копируем сессию и СРАЗУ удаляем из памяти чтобы избежать зацикливания
    const session = userSessions.get(userId);
    if (!session) {
      await sendErrorMessage(chatId, 'Сессия истекла');
      return;
    }
    
    const sessionCopy = { ...session, tempData: { ...session.tempData } };
    userSessions.delete(userId); // Удаляем СРАЗУ!
    
    try {
      await saveFromSessionData(sessionCopy, chatId);
      console.log(`✅ saveFromSession completed for user ${userId}`);
    } catch (error) {
      console.error(`❌ saveFromSession error for user ${userId}:`, error);
      await sendErrorMessage(chatId, `Ошибка: ${error.message}`);
    }
  } else if (data === 'session_cancel') {
    // Отменить - очистить сессию
    userSessions.delete(userId);
    await sendTelegramMessage({
      botToken,
      chatId: chatId.toString(),
      text: '❌ Отменено. Данные удалены.'
    });
  } else if (data === 'session_continue') {
    // Продолжить добавление данных
    await sendTelegramMessage({
      botToken,
      chatId: chatId.toString(),
      text: '➕ Продолжайте отправлять данные:\n• Фото\n• Геолокацию\n• Описание'
    });
  } else if (data === 'cancel') {
    userSessions.delete(userId);
    await sendTelegramMessage({
      botToken,
      chatId: chatId.toString(),
      text: '❌ Добавление отменено'
    });
  } else if (data === 'save_complete') {
    // ИСПРАВЛЕНО: используем правильную функцию
    const session = userSessions.get(userId);
    if (!session) {
      await sendErrorMessage(chatId, 'Сессия истекла');
      return;
    }
    
    const sessionCopy = { ...session, tempData: { ...session.tempData } };
    userSessions.delete(userId); // Удаляем СРАЗУ!
    
    await saveFromSessionData(sessionCopy, chatId);
  } else if (data.startsWith('favorite_')) {
    // TODO: Implement favorite toggle
    await sendTelegramMessage({
      botToken,
      chatId: chatId.toString(),
      text: '⭐ Добавлено в избранное!'
    });
  } else if (data.startsWith('delete_')) {
    // TODO: Implement delete confirmation
    await sendTelegramMessage({
      botToken,
      chatId: chatId.toString(),
      text: '⚠️ Подтверди удаление',
      replyMarkup: {
        inline_keyboard: [
          [
            { text: '✅ Да, удалить', callback_data: `confirm_${data}` },
            { text: '❌ Отмена', callback_data: 'cancel' }
          ]
        ]
      }
    });
  }
}

/**
 * Сохранение из сессии (работает с копией данных)
 */
async function saveFromSessionData(session: UserSession, chatId: number) {
  console.log(`💾 saveFromSessionData called for user ${session.userId}`);

  const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;
  const data = session.tempData;
  const userId = session.userId;

  try {
    console.log('💾 Session data:', {
      photos: data.photoObjects?.length || 0,
      hasLocation: !!(data.latitude || data.googleMapsUrl),
      hasDescription: !!data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      googleMapsUrl: data.googleMapsUrl
    });

    // 1. Получить/создать tenant
    console.log('📝 Step 1: Getting/creating tenant...');
    const tenant = await getOrCreateTenant(userId);
    console.log(`✅ Tenant: ${tenant.telegram_user_id}`);
    
    // 2. AI анализ (если есть текст или Google Maps)
    let aiResult: any = null;
    if (data.description || data.googleMapsUrl) {
      console.log('🤖 Step 2: Starting AI analysis...');
      aiResult = await analyzeWithFallback(
        data.description || '', 
        data.googleMapsUrl
      );
      logAIResult(aiResult);
      console.log('✅ AI analysis completed');
    } else {
      console.log('⏭️ Step 2: Skipping AI analysis (no data)');
    }
    
    // 3. Определяем координаты
    console.log('📍 Step 3: Determining coordinates...');
    let latitude = data.latitude;
    let longitude = data.longitude;
    
    if (!latitude && aiResult?.coordinates) {
      latitude = aiResult.coordinates.lat;
      longitude = aiResult.coordinates.lng;
      console.log(`✅ Got coordinates from AI: ${latitude}, ${longitude}`);
    }
    
    // Если координат всё ещё нет - ошибка
    if (!latitude || !longitude) {
      console.log('❌ No coordinates available');
      await sendTelegramMessage({
        botToken,
        chatId: chatId.toString(),
        text: '⚠️ Не удалось определить местоположение.\n\nОтправьте геолокацию или Google Maps ссылку.'
      });
      return;
    }
    
    console.log(`✅ Final coordinates: ${latitude}, ${longitude}`);
    
    // 4. Проверка дубликатов
    console.log('🔍 Step 4: Checking duplicates...');
    const duplicate = await checkDuplicate(
      userId,
      latitude,
      longitude,
      aiResult?.price
    );
    
    if (duplicate) {
      console.log('⚠️ Duplicate found:', duplicate.id);
      await sendDuplicateWarning(chatId, duplicate);
      return;
    }
    console.log('✅ No duplicates found');
    
    // 5. Загрузка фото
    console.log('📸 Step 5: Uploading photos...');
    let photoUrls: string[] = [];
    const propertyId = generateUUID();
    
    if (data.photoObjects && data.photoObjects.length > 0) {
      console.log(`📸 Uploading ${data.photoObjects.length} photos to Storage...`);
      photoUrls = await uploadTelegramPhotos(
        botToken,
        data.photoObjects,
        userId,
        propertyId,
        data.photoObjects.length
      );
      console.log(`✅ Uploaded ${photoUrls.length} photos successfully`);
    } else {
      console.log('⏭️ No photos to upload');
    }
    
    // 6. Подготовка данных
    console.log('📦 Step 6: Preparing property data...');
    const propertyData = {
      ...formatForDatabase(aiResult || {}),
      telegram_user_id: userId,
      latitude,
      longitude,
      photos: photoUrls,
      description: data.description || aiResult?.description,
      raw_text: data.description,
      google_maps_url: data.googleMapsUrl,
      ...data.forwardMetadata
    };
    console.log('✅ Property data prepared:', {
      title: propertyData.title,
      photos: photoUrls.length,
      hasLocation: !!(latitude && longitude)
    });
    
    // 7. Сохранение в БД
    console.log('💾 Step 7: Saving to database...');
    console.log('📊 Property data being saved:', JSON.stringify({
      title: propertyData.title,
      latitude: propertyData.latitude,
      longitude: propertyData.longitude,
      photos: propertyData.photos?.length,
      telegram_user_id: propertyData.telegram_user_id,
      property_type: propertyData.property_type
    }));
    
    const property = await saveProperty(propertyData);
    console.log(`✅ Property saved with ID: ${property.id}`);
    
    // 8. Сессия уже очищена ранее
    
    // 9. Отправка успешного ответа
    const newCount = tenant.saved_properties_count + 1;
    const successMessage = formatSuccessMessage(
      property,
      newCount,
      tenant.personal_map_url
    );
    
    await sendTelegramMessage({
      botToken,
      chatId: chatId.toString(),
      text: successMessage + `\n\n📸 Загружено фото: ${photoUrls.length}`,
      replyMarkup: {
        inline_keyboard: [
          [
            { text: '🗺️ Открыть карту', url: tenant.personal_map_url },
            { text: '⭐ В избранное', callback_data: `favorite_${property.id}` }
          ],
          [
            { text: '✏️ Добавить заметку', callback_data: `add_note_${property.id}` },
            { text: '🗑️ Удалить', callback_data: `delete_${property.id}` }
          ]
        ]
      }
    });
    
    console.log('✅ Saved successfully from session');
    
  } catch (error) {
    console.error('❌ Error saving from session:', error);
    await sendErrorMessage(chatId, 'Не удалось сохранить объект. Попробуйте ещё раз.');
  }
}

/**
 * Обработка команд
 */
async function handleCommand(message: any) {
  const command = message.text.split(' ')[0].toLowerCase();
  const chatId = message.chat.id;
  const userId = message.from.id;
  const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;

  switch (command) {
    case '/start':
      console.log('🔵 /start command - getting tenant for user:', userId);
      const tenant = await getOrCreateTenant(userId);
      console.log('🔵 Tenant received:', { id: tenant.id, map_url: tenant.personal_map_url });
      
      console.log('🔵 Sending welcome message...');
      const result = await sendTelegramMessage({
        botToken,
        chatId: chatId.toString(),
        text: `👋 Привет! Я твоя личная записная книжка для объектов недвижимости!\n\n📝 Как работает:\n1. Нашёл объявление? Переслай мне!\n2. Я автоматически сохраню на карте\n3. Все объекты в одном месте\n\n🗺️ Твоя карта:\n${tenant.personal_map_url}`,
        replyMarkup: {
          inline_keyboard: [
            [
              { text: '🗺️ Моя карта', url: tenant.personal_map_url },
              { text: '❓ Помощь', callback_data: 'help' }
            ]
          ]
        }
      });
      console.log('🔵 Message send result:', result);
      break;

    case '/help':
      await sendHelp(chatId);
      break;

    case '/stats':
      // TODO: Implement stats
      await sendTelegramMessage({
        botToken,
        chatId: chatId.toString(),
        text: '📊 Статистика в разработке...'
      });
      break;

    default:
      await sendHelp(chatId);
  }
}

/**
 * Отправка помощи
 */
async function sendHelp(chatId: number) {
  await sendTelegramMessage({
    botToken: import.meta.env.TELEGRAM_BOT_TOKEN,
    chatId: chatId.toString(),
    text: '❓ Как добавить объект:\n\n📱 Просто переслать мне сообщение с:\n• Фото объекта\n• Геолокацией или Google Maps ссылкой\n• Описанием (цена, тип, контакты)\n\nЯ всё обработаю автоматически! ✨'
  });
}

/**
 * Отправка предупреждения о дубликате
 */
async function sendDuplicateWarning(chatId: number, duplicate: any) {
  await sendTelegramMessage({
    botToken: import.meta.env.TELEGRAM_BOT_TOKEN,
    chatId: chatId.toString(),
    text: `⚠️ Похоже, этот объект уже сохранён\n\n🏠 ${duplicate.title}\n📅 Добавлен: ${new Date(duplicate.created_at).toLocaleDateString('ru-RU')}\n\nЧто делать?`,
    replyMarkup: {
      inline_keyboard: [
        [
          { text: '🔄 Обновить данные', callback_data: `update_${duplicate.id}` },
          { text: '💾 Сохранить как новый', callback_data: 'save_anyway' }
        ],
        [{ text: '❌ Не сохранять', callback_data: 'cancel' }]
      ]
    }
  });
}

/**
 * Показать превью сессии с простой кнопкой сохранения
 */
async function showSessionPreview(chatId: number, session: UserSession) {
  const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;
  const data = session.tempData;
  
  // Формируем превью со статусом всех 3 компонентов
  const photoCount = data.photoObjects?.length || 0;
  const hasLocation = !!(data.latitude || data.googleMapsUrl);
  const hasDescription = !!(data.description && data.description.trim());
  
  // Формируем статус
  let preview = '📦 Статус данных:\n\n';
  
  // Гео (обязательно)
  if (hasLocation) {
    preview += '✅ Геолокация: есть\n';
  } else {
    preview += '❌ Геолокация: НЕТ (обязательно!)\n';
  }
  
  // Фото (желательно)
  if (photoCount > 0) {
    preview += `✅ Фото: ${photoCount} шт.\n`;
  } else {
    preview += '⚠️ Фото: нет (рекомендуется добавить)\n';
  }
  
  // Описание (желательно)
  if (hasDescription) {
    const shortDesc = data.description.length > 50 
      ? data.description.substring(0, 50) + '...' 
      : data.description;
    preview += `✅ Описание: ${shortDesc}\n`;
  } else {
    preview += '⚠️ Описание: нет (рекомендуется добавить)\n';
  }
  
  preview += '\n';
  
  // Кнопка ТОЛЬКО если есть ГЕО + ФОТО + ОПИСАНИЕ
  let buttons: any[][] = [];
  
  if (hasLocation && photoCount > 0 && hasDescription) {
    // ✅ Всё есть - можно сохранять
    preview += '✅ Все данные собраны!\n\nСохранить объект?';
    buttons = [
      [
        { text: 'Да', callback_data: 'session_save' },
        { text: 'Нет', callback_data: 'session_cancel' }
      ],
      [
        { text: 'Добавить ещё', callback_data: 'session_continue' }
      ]
    ];
  } else if (hasLocation) {
    // Есть гео, но не хватает фото или описания
    preview += '⚠️ Можно сохранить, но рекомендуется добавить недостающее';
    buttons = [
      [
        { text: 'Сохранить как есть', callback_data: 'session_save' }
      ],
      [
        { text: 'Добавить данные', callback_data: 'session_continue' }
      ]
    ];
  } else {
    // Нет гео - сохранение невозможно
    preview += '❌ Сохранение невозможно без геолокации\n\nДобавьте:\n• Геолокацию (📎 → Location)\n• Или Google Maps ссылку';
    // Кнопок нет
  }
  
  console.log(`📤 Sending preview message (${preview.length} chars) to chat ${chatId}...`);
  
  // Отправляем С ОЖИДАНИЕМ результата
  try {
    await sendTelegramMessage({
      botToken,
      chatId: chatId.toString(),
      text: preview,
      replyMarkup: {
        inline_keyboard: buttons
      }
    });
    console.log(`✅ Preview message sent successfully`);
  } catch (error) {
    console.error(`❌ Error sending preview:`, error);
    // Пробуем минимальное сообщение
    try {
      const fallbackText = (hasLocation && photoCount > 0) 
        ? `${photoCount} фото + локация` 
        : `${photoCount} фото`;
      
      await sendTelegramMessage({
        botToken,
        chatId: chatId.toString(),
        text: fallbackText,
        replyMarkup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined
      });
      console.log(`✅ Fallback message sent`);
    } catch (fallbackError) {
      console.error(`❌ Fallback also failed:`, fallbackError);
    }
  }
}

/**
 * Отправка сообщения об ошибке
 */
async function sendErrorMessage(chatId: number, text: string) {
  await sendTelegramMessage({
    botToken: import.meta.env.TELEGRAM_BOT_TOKEN,
    chatId: chatId.toString(),
    text: `❌ ${text}`
  });
}
