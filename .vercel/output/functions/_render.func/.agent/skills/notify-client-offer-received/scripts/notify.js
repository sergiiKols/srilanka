#!/usr/bin/env node
/**
 * SKILL #7: Notify Client Offer Received (Mock version)
 */

async function notifyClientOfferReceived(clientId, offerId, propertyData) {
  console.log('📬 SKILL #7: Notify Client Offer Received');
  console.log('Client:', clientId);
  console.log('Offer:', offerId);
  
  const message = `
🏠 Новое предложение на твою заявку!

${propertyData.name}
💰 $${propertyData.price}/ночь
🛏️ ${propertyData.bedrooms} спален

Посмотри все предложения на карте 👇
https://unmissable.com/map/${clientId}
  `;
  
  console.log('---MESSAGE---');
  console.log(message);
  console.log('-------------');
  
  await new Promise(r => setTimeout(r, 500));
  
  console.log('✅ Уведомление отправлено');
  
  return {
    status: 'sent',
    notification_id: Math.floor(Math.random() * 1000),
    message_id: Math.floor(Math.random() * 100000)
  };
}

if (require.main === module) {
  notifyClientOfferReceived('client_123', 'offer_456', {
    name: 'Villa Sunset',
    price: 100,
    bedrooms: 4
  });
}

module.exports = { notifyClientOfferReceived };
