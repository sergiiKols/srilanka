#!/usr/bin/env node
/**
 * SKILL #6: Get Client Map URL (Mock version)
 */

async function getClientMapUrl(clientId, requestId) {
  console.log('🔗 SKILL #6: Get Client Map URL');
  
  const url = `https://unmissable.com/map/${clientId}?request=${requestId}`;
  
  console.log('Generated URL:', url);
  console.log('📤 Отправка в Telegram...');
  
  await new Promise(r => setTimeout(r, 500));
  
  console.log('✅ Ссылка отправлена клиенту');
  
  return {
    status: 'sent',
    map_url: url,
    message_id: Math.floor(Math.random() * 100000)
  };
}

if (require.main === module) {
  getClientMapUrl('client_123', 'req_456');
}

module.exports = { getClientMapUrl };
