#!/usr/bin/env node

/**
 * SKILL: Publish Request to Telegram
 * 
 * Тестовый скрипт для публикации заявки клиента в Telegram-группу landlords
 * 
 * Usage: node publish.js --request-id=123
 */

// Тестовые данные (mock)
const MOCK_REQUEST_DATA = {
  id: 123,
  location: 'Negombo',
  check_in: '2026-02-15',
  check_out: '2026-03-20',
  budget_min: 1000,
  budget_max: 1500,
  bedrooms: '2-3',
  amenities: ['WiFi', 'бассейн', 'кухня'],
  requirements: 'близко к пляжу, тихое место',
  client_username: '@test_user',
  client_contact: 'По запросу',
  published: false
};

const MOCK_CONFIG = {
  TELEGRAM_BOT_TOKEN: 'MOCK_TOKEN_1234567890',
  LANDLORDS_GROUP_ID: '-1001234567890',
  SUPABASE_URL: 'https://mcmzdscpuoxwneuzsanu.supabase.co',
  SUPABASE_KEY: 'MOCK_KEY'
};

/**
 * Форматирование даты
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { day: 'numeric', month: 'long' };
  return date.toLocaleDateString('ru-RU', options);
}

/**
 * Вычисление количества дней
 */
function calculateDays(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return days;
}

/**
 * Форматирование сообщения для Telegram
 */
function formatTelegramMessage(requestData) {
  const days = calculateDays(requestData.check_in, requestData.check_out);
  const checkInFormatted = formatDate(requestData.check_in);
  const checkOutFormatted = formatDate(requestData.check_out);
  
  return `
🏠 НОВЫЙ ЗАПРОС НА АРЕНДУ

📍 Регион: ${requestData.location}
📅 Даты: ${checkInFormatted} - ${checkOutFormatted} (${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'})
💰 Бюджет: $${requestData.budget_min}-$${requestData.budget_max}/месяц
🛏️ Спальни: ${requestData.bedrooms}
✨ Удобства: ${requestData.amenities.join(', ')}
💬 Требования: ${requestData.requirements}

👤 Клиент: ${requestData.client_username || 'Анонимно'}
📱 Контакт: ${requestData.client_contact}

👉 Ответьте на этот запрос!
  `.trim();
}

/**
 * Mock: Отправка в Telegram
 */
async function sendToTelegram(chatId, text, options) {
  console.log('📤 Отправка сообщения в Telegram...');
  console.log('Chat ID:', chatId);
  console.log('---MESSAGE START---');
  console.log(text);
  console.log('---MESSAGE END---');
  
  // Симуляция задержки API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock response
  const mockMessageId = Math.floor(Math.random() * 1000000);
  return {
    message_id: mockMessageId,
    chat: { id: chatId },
    date: Math.floor(Date.now() / 1000),
    text: text
  };
}

/**
 * Mock: Сохранение в БД
 */
async function saveToDatabase(requestId, messageId) {
  console.log('💾 Сохранение в БД...');
  console.log(`UPDATE rental_requests SET telegram_message_id = ${messageId}, published_at = NOW(), published = true WHERE id = ${requestId}`);
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    updated: true
  };
}

/**
 * Основная функция
 */
async function publishRequestToTelegram(requestId) {
  try {
    console.log('🚀 SKILL: Publish Request to Telegram');
    console.log('=' .repeat(50));
    console.log(`Request ID: ${requestId}`);
    console.log('');
    
    // Step 1: Validate
    console.log('✅ Step 1: Валидация входных данных');
    if (!requestId) {
      throw new Error('Request ID is required');
    }
    console.log('   ✓ Request ID валиден');
    console.log('');
    
    // Step 2: Fetch data (mock)
    console.log('✅ Step 2: Получение данных заявки');
    const requestData = { ...MOCK_REQUEST_DATA, id: requestId };
    
    if (requestData.published) {
      throw new Error('Request already published');
    }
    console.log('   ✓ Данные получены');
    console.log('   ✓ Заявка не опубликована ранее');
    console.log('');
    
    // Step 3: Format message
    console.log('✅ Step 3: Форматирование сообщения');
    const message = formatTelegramMessage(requestData);
    console.log('   ✓ Сообщение отформатировано');
    console.log('');
    
    // Step 4: Send to Telegram (mock)
    console.log('✅ Step 4: Отправка в Telegram');
    const telegramResponse = await sendToTelegram(
      MOCK_CONFIG.LANDLORDS_GROUP_ID,
      message,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ Откликнуться', callback_data: `respond_${requestId}` }
          ]]
        }
      }
    );
    console.log('   ✓ Сообщение отправлено');
    console.log('   ✓ Message ID:', telegramResponse.message_id);
    console.log('');
    
    // Step 5: Save to DB (mock)
    console.log('✅ Step 5: Сохранение в БД');
    await saveToDatabase(requestId, telegramResponse.message_id);
    console.log('   ✓ Данные сохранены');
    console.log('');
    
    // Step 6: Return result
    const result = {
      status: 'published',
      request_id: requestId,
      telegram_message_id: telegramResponse.message_id,
      telegram_group_id: MOCK_CONFIG.LANDLORDS_GROUP_ID,
      message: 'Request successfully published to Telegram',
      published_at: new Date().toISOString()
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
      request_id: requestId
    };
  }
}

// CLI execution
if (require.main === module) {
  // Parse arguments
  const args = process.argv.slice(2);
  const requestIdArg = args.find(arg => arg.startsWith('--request-id='));
  
  if (!requestIdArg) {
    console.log('Usage: node publish.js --request-id=123');
    process.exit(1);
  }
  
  const requestId = parseInt(requestIdArg.split('=')[1]);
  
  publishRequestToTelegram(requestId)
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { publishRequestToTelegram };
