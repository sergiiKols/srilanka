// НОВАЯ ЛОГИКА: Пошаговые уведомления после КАЖДОГО действия

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
    
    // === ОБРАБОТКА ФОТО ===
    if (message.photo && message.photo.length > 0) {
      const bestPhoto = getBestQualityPhoto(message.photo);
      session.tempData.photoObjects = session.tempData.photoObjects || [];
      session.tempData.photoObjects.push(bestPhoto);
      
      const photoCount = session.tempData.photoObjects.length;
      console.log(`📸 Added photo to session, total: ${photoCount}`);
      
      // ✅ ОТПРАВЛЯЕМ УВЕДОМЛЕНИЕ СРАЗУ
      await sendStatusUpdate(chatId, session, botToken, 'photo');
    }
    
    // === ОБРАБОТКА ЛОКАЦИИ ===
    if (message.location) {
      session.tempData.latitude = message.location.latitude;
      session.tempData.longitude = message.location.longitude;
      console.log(`📍 Added location to session`);
      
      // ✅ ОТПРАВЛЯЕМ УВЕДОМЛЕНИЕ СРАЗУ
      await sendStatusUpdate(chatId, session, botToken, 'location');
    }
    
    // === ОБРАБОТКА ТЕКСТА ===
    const text = message.caption || message.text || '';
    if (text) {
      // Добавляем к описанию
      if (session.tempData.description) {
        session.tempData.description += '\n' + text;
      } else {
        session.tempData.description = text;
      }
      
      // Проверяем на Google Maps URL
      const googleMapsUrl = extractGoogleMapsUrl(text);
      if (googleMapsUrl) {
        session.tempData.googleMapsUrl = googleMapsUrl;
        console.log(`🔗 Added Google Maps URL`);
        
        // ✅ ОТПРАВЛЯЕМ УВЕДОМЛЕНИЕ СРАЗУ
        await sendStatusUpdate(chatId, session, botToken, 'location');
      } else if (text.length > 5) {
        // Обычный текст (описание)
        console.log(`💬 Added description`);
        
        // ✅ ОТПРАВЛЯЕМ УВЕДОМЛЕНИЕ СРАЗУ
        await sendStatusUpdate(chatId, session, botToken, 'description');
      }
    }
    
    // Парсим forward метаданные
    if (!session.tempData.forwardMetadata) {
      const forwardMeta = parseForwardMetadata(message);
      session.tempData.forwardMetadata = forwardMeta;
    }
    
  } catch (error) {
    console.error('❌ Error collecting message:', error);
  }
}

// === НОВАЯ ФУНКЦИЯ: Отправка статуса после каждого действия ===
async function sendStatusUpdate(
  chatId: number, 
  session: UserSession, 
  botToken: string,
  justAdded: 'photo' | 'location' | 'description'
) {
  const data = session.tempData;
  
  // Проверяем что уже есть
  const photoCount = data.photoObjects?.length || 0;
  const hasLocation = !!(data.latitude || data.googleMapsUrl);
  const hasDescription = !!(data.description && data.description.trim());
  
  // Формируем сообщение
  let message = '';
  
  // Что только что добавили
  if (justAdded === 'photo') {
    message = `✅ Фото загружено! (${photoCount} шт.)\n\n`;
  } else if (justAdded === 'location') {
    message = `✅ Геолокация загружена!\n\n`;
  } else if (justAdded === 'description') {
    message = `✅ Описание добавлено!\n\n`;
  }
  
  // Показываем общий статус
  message += '📦 Что уже загружено:\n';
  message += photoCount > 0 ? `✅ Фото: ${photoCount} шт.\n` : `❌ Фото: нет\n`;
  message += hasLocation ? `✅ Геолокация: есть\n` : `❌ Геолокация: нет\n`;
  message += hasDescription ? `✅ Описание: есть\n` : `❌ Описание: нет\n`;
  
  // Кнопки ТОЛЬКО если всё готово
  let buttons: any[][] = [];
  
  if (hasLocation && photoCount > 0 && hasDescription) {
    // ✅ ВСЁ ГОТОВО!
    message += '\n🎉 Всё готово для размещения!';
    buttons = [
      [
        { text: '💾 Разместить объект', callback_data: 'session_save' }
      ],
      [
        { text: '❌ Отмена', callback_data: 'session_cancel' }
      ]
    ];
  } else {
    // Подсказка что ещё нужно
    message += '\n📝 Чего не хватает:\n';
    if (photoCount === 0) message += '• Отправьте фото\n';
    if (!hasLocation) message += '• Отправьте геолокацию или Google Maps ссылку\n';
    if (!hasDescription) message += '• Добавьте описание (цена, тип и т.д.)\n';
    
    // Кнопка отмены всегда есть
    buttons = [
      [{ text: '❌ Отмена', callback_data: 'session_cancel' }]
    ];
  }
  
  try {
    await sendTelegramMessage({
      botToken,
      chatId: chatId.toString(),
      text: message,
      replyMarkup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined
    });
    console.log(`✅ Status update sent`);
  } catch (err) {
    console.error('❌ Error sending status update:', err);
  }
}
