#!/usr/bin/env node
/**
 * SKILL #9: Notify Free Tier Cleanup (Mock version)
 */

const MOCK_EXPIRING_REQUESTS = [
  { client_id: 101, request_id: 'req_1', days_remaining: 1 },
  { client_id: 102, request_id: 'req_2', days_remaining: 1 }
];

async function notifyFreeTierCleanup() {
  console.log('⚠️  SKILL #9: Notify Free Tier Cleanup');
  
  const expiring = MOCK_EXPIRING_REQUESTS;
  console.log(`Найдено ${expiring.length} заявок к удалению`);
  console.log('');
  
  for (const item of expiring) {
    console.log(`📬 Отправка уведомления клиенту ${item.client_id}...`);
    
    const message = `
⚠️ Важно!

Твоя карта поиска жилья будет удалена завтра.

Если хочешь сохранить её дольше → обновись на платный тариф:
💳 Посмотреть планы https://unmissable.com/pricing
    `;
    
    console.log(message);
    await new Promise(r => setTimeout(r, 300));
    console.log('✅ Отправлено');
    console.log('');
  }
  
  return {
    notifications_sent: expiring.length,
    clients_notified: expiring.map(e => e.client_id)
  };
}

if (require.main === module) {
  notifyFreeTierCleanup();
}

module.exports = { notifyFreeTierCleanup };
