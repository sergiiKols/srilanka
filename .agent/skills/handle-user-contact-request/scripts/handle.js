#!/usr/bin/env node
/**
 * SKILL #14: Handle User Contact Request (Mock)
 */

async function handleUserContactRequest(clientId, propertyId, message, dates) {
  console.log('💬 SKILL #14: Handle User Contact Request');
  console.log(`Client: ${clientId}`);
  console.log(`Property: ${propertyId}`);
  console.log(`Message: "${message}"`);
  
  const contactRequestId = Math.floor(Math.random() * 10000);
  
  console.log('');
  console.log('📬 Отправка landlord...');
  
  const landlordMessage = `
💬 Новый вопрос по твоей вилле

Клиент спрашивает: "${message}"
${dates ? `Даты: ${dates.join(' - ')}` : ''}

👉 Ответь в Telegram
  `;
  
  console.log(landlordMessage);
  
  await new Promise(r => setTimeout(r, 500));
  
  console.log('✅ Запрос отправлен landlord');
  
  return {
    contact_request_id: contactRequestId,
    status: 'sent_to_landlord'
  };
}

if (require.main === module) {
  handleUserContactRequest('client_123', 'property_456', 'Свободна ли на 15-20 февраля?', ['2026-02-15', '2026-02-20']);
}

module.exports = { handleUserContactRequest };
