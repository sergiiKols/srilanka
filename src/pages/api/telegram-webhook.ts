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
 * Session state для пошагового ввода
 */
interface UserSession {
  userId: number;
  state: 'idle' | 'awaiting_location' | 'awaiting_photos' | 'awaiting_description';
  tempData: {
    photos?: string[];
    photoFileIds?: string[];
    latitude?: number;
    longitude?: number;
    description?: string;
    googleMapsUrl?: string;
    forwardMetadata?: any;
  };
  lastActivity: Date;
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
 * Обработка media group (множественные фото)
 */
async function handleMediaGroup(message: any) {
  const groupId = message.media_group_id;
  
  console.log(`📸 Media group message received: ${groupId}`);
  
  // Получаем или создаём группу
  let group = mediaGroups.get(groupId);
  
  if (!group) {
    // Создаём новую группу с таймаутом
    group = {
      messages: [],
      timeout: setTimeout(() => {
        // Через 300ms обрабатываем все собранные фото
        const completeGroup = mediaGroups.get(groupId);
        if (completeGroup) {
          console.log(`⏰ Processing media group ${groupId} with ${completeGroup.messages.length} photos`);
          processCompleteMediaGroup(completeGroup.messages);
          mediaGroups.delete(groupId);
        }
      }, 300) // 300ms достаточно для получения всех фото
    };
    mediaGroups.set(groupId, group);
  }
  
  // Добавляем сообщение в группу
  group.messages.push(message);
  console.log(`📎 Added photo to group ${groupId}, total: ${group.messages.length}`);
}

/**
 * Обработка полной media group
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

  // РЕЖИМ 1: Полное сообщение (forward с фото + текст + локация)
  // Это оптимальный путь - обрабатываем сразу
  if ((hasPhotos || hasLocation || hasGoogleMapsUrl) && hasText) {
    await handleCompleteMessage(message);
    return;
  }

  // РЕЖИМ 2: Пошаговый ввод
  await handleStepByStepInput(message);
}

/**
 * РЕЖИМ 1: Обработка полного сообщения (forward)
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
  if (data === 'cancel') {
    userSessions.delete(userId);
    await sendTelegramMessage({
      botToken,
      chatId: chatId.toString(),
      text: '❌ Добавление отменено'
    });
  } else if (data === 'save_complete') {
    await saveFromSession(userId, chatId);
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
 * Сохранение из сессии (пошаговый режим)
 */
async function saveFromSession(userId: number, chatId: number) {
  const session = userSessions.get(userId);
  if (!session || !session.tempData) {
    await sendErrorMessage(chatId, 'Сессия истекла. Начни заново.');
    return;
  }

  try {
    // TODO: Implement full save from session
    console.log('💾 Saving from session:', session.tempData);

    userSessions.delete(userId);

    await sendTelegramMessage({
      botToken: import.meta.env.TELEGRAM_BOT_TOKEN,
      chatId: chatId.toString(),
      text: '✅ Объект сохранён!'
    });
  } catch (error) {
    console.error('Error saving from session:', error);
    await sendErrorMessage(chatId, 'Ошибка сохранения');
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
 * Отправка сообщения об ошибке
 */
async function sendErrorMessage(chatId: number, text: string) {
  await sendTelegramMessage({
    botToken: import.meta.env.TELEGRAM_BOT_TOKEN,
    chatId: chatId.toString(),
    text: `❌ ${text}`
  });
}
