/**
 * TENANT REQUEST API ENDPOINT
 * 
 * POST /api/tenant-request
 * 
 * Обработка запросов арендаторов на поиск жилья.
 * Включает валидацию, сохранение в БД и отправку уведомлений.
 */

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { validateTenantForm, type TenantFormData } from '@/services/tenantValidation';

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Парсинг body
    const body = await request.json();
    
    // 2. Извлечение данных Telegram
    const initData = body.initData;
    if (!initData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing Telegram initData' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 3. Валидация Telegram подписи
    const isValid = await validateTelegramWebAppData(initData);
    if (!isValid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid Telegram signature' 
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 4. Парсинг Telegram данных
    const telegramData = parseTelegramInitData(initData);
    
    // 5. Извлечение данных формы
    const formData: TenantFormData = {
      location: body.location,
      check_in_date: body.check_in_date,
      check_out_date: body.check_out_date,
      adults_count: body.adults_count,
      children_count: body.children_count || 0,
      guest_type: body.guest_type,
      trip_purpose: body.trip_purpose,
      has_pets: body.has_pets,
      extension_possible: body.extension_possible,
      additional_requirements: body.additional_requirements,
      form_language: body.form_language || 'ru'
    };
    
    // 6. Валидация формы
    const validation = validateTenantForm(formData, formData.form_language);
    
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Validation failed',
          errors: validation.errors,
          warnings: validation.warnings
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 7. Проверка дубликатов (опционально)
    const hasDuplicate = await checkDuplicateRequest(
      telegramData.user.id,
      formData.check_in_date!,
      formData.check_out_date!
    );
    
    if (hasDuplicate) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Duplicate request',
          message: formData.form_language === 'ru' 
            ? 'У вас уже есть активная заявка на эти даты'
            : 'You already have an active request for these dates'
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 8. Сохранение в БД
    const { data, error } = await supabase
      .from('tenant_requests')
      .insert({
        telegram_user_id: telegramData.user.id,
        telegram_username: telegramData.user.username,
        telegram_first_name: telegramData.user.first_name,
        telegram_last_name: telegramData.user.last_name,
        location: formData.location,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        adults_count: formData.adults_count,
        children_count: formData.children_count,
        guest_type: formData.guest_type,
        trip_purpose: formData.trip_purpose,
        has_pets: formData.has_pets,
        extension_possible: formData.extension_possible,
        additional_requirements: formData.additional_requirements,
        form_language: formData.form_language,
        status: 'pending',
        validation_status: 'valid',
        source: 'telegram_web_app',
        user_agent: request.headers.get('user-agent') || undefined,
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') || 
                   undefined
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Database error',
          details: error.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 9. Отправка уведомления админу (опционально)
    try {
      await sendAdminNotification(data);
    } catch (notifError) {
      console.error('Notification error:', notifError);
      // Не падаем, если уведомление не отправилось
    }
    
    // 10. Возврат успешного ответа
    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          id: data.id,
          status: data.status,
          created_at: data.created_at
        },
        message: formData.form_language === 'ru'
          ? 'Ваш запрос принят! Мы начинаем подбирать варианты.'
          : 'Your request has been received! We are finding options for you.'
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error('API error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * Валидация Telegram WebApp данных
 */
async function validateTelegramWebAppData(initData: string): Promise<boolean> {
  // TODO: Реализовать проверку подписи через crypto.subtle
  // Пока для разработки возвращаем true
  
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
  if (!BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN not set, skipping signature validation');
    return true; // В продакшене должно быть false!
  }
  
  try {
    const crypto = await import('crypto');
    
    // Парсинг initData
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');
    
    if (!hash) return false;
    
    // Сортировка параметров
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Создание secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest();
    
    // Вычисление hash
    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    return computedHash === hash;
    
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

/**
 * Парсинг Telegram initData
 */
function parseTelegramInitData(initData: string) {
  const params = new URLSearchParams(initData);
  const user = JSON.parse(params.get('user') || '{}');
  
  return {
    query_id: params.get('query_id'),
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      language_code: user.language_code
    },
    auth_date: params.get('auth_date'),
    hash: params.get('hash')
  };
}

/**
 * Проверка дубликатов
 */
async function checkDuplicateRequest(
  userId: number,
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  const { data } = await supabase
    .from('tenant_requests')
    .select('id')
    .eq('telegram_user_id', userId)
    .eq('check_in_date', checkIn)
    .eq('check_out_date', checkOut)
    .in('status', ['pending', 'processing', 'published'])
    .limit(1);
  
  return (data && data.length > 0) || false;
}

/**
 * Отправка уведомления админу
 */
async function sendAdminNotification(request: any): Promise<void> {
  // TODO: Реализовать отправку через Telegram Bot API
  // Например, в админский чат или канал
  
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
  const ADMIN_CHAT_ID = import.meta.env.TELEGRAM_ADMIN_CHAT_ID;
  
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.warn('Bot token or admin chat ID not configured');
    return;
  }
  
  const message = `
🏠 Новая заявка на жильё!

👤 Пользователь: @${request.telegram_username || 'unknown'}
📅 Даты: ${request.check_in_date} — ${request.check_out_date}
👥 Гостей: ${request.adults_count} взр + ${request.children_count} детей
🎯 Цель: ${request.trip_purpose}
🐾 Животные: ${request.has_pets ? 'Да' : 'Нет'}

💬 Пожелания: ${request.additional_requirements || '-'}

ID: ${request.id}
  `.trim();
  
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: ADMIN_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    })
  });
}
