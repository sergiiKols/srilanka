/**
 * API эндпоинт для сабмита Telegram формы
 * POST /api/telegram-form
 * 
 * Процесс:
 * 1. Валидация payload
 * 2. Проверка подписи initData
 * 3. Проверка rate limit
 * 4. Валидация данных формы
 * 5. Сохранение в БД
 * 6. Отправка в Telegram Bot
 * 7. Возврат результата
 */

import type { APIRoute } from 'astro';
import { FormSubmissionSchema } from '../../types/telegram.types';
import {
  verifyTelegramWebAppData,
  parseTelegramInitData,
  validateFormData,
  sendTelegramMessage,
  formatMessageTemplate,
  checkRateLimit,
  decryptBotToken,
} from '../../lib/telegram';
import {
  getFormById,
  createSubmission,
  updateSubmissionStatus,
  createLog,
  checkRateLimitDB,
} from '../../lib/db';

export const POST: APIRoute = async (context) => {
  const startTime = Date.now();
  
  try {
    // 1. Парсим и валидируем payload
    const body = await context.request.json();
    
    const validation = FormSubmissionSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid payload',
          code: 'VALIDATION_ERROR',
          details: validation.error.errors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { form_id, user_id, first_name, last_name, username, data, initData } = validation.data;
    
    // 2. Получаем конфигурацию формы
    const { data: form, error: formError } = await getFormById(form_id);
    
    if (formError || !form) {
      await createLog({
        form_id,
        event_type: 'submit_start',
        error_message: 'Form not found',
        error_code: 'FORM_NOT_FOUND',
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Form not found',
          code: 'FORM_NOT_FOUND',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Проверка активности формы
    if (!form.is_active) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Form is not active',
          code: 'FORM_INACTIVE',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 3. Проверяем подпись Telegram (если есть Bot Token)
    const botToken = form.bot_token_encrypted
      ? decryptBotToken(form.bot_token_encrypted, import.meta.env.SECRET_KEY || 'default-secret')
      : process.env.TELEGRAM_BOT_TOKEN!;
    
    if (!botToken) {
      await createLog({
        form_id,
        event_type: 'telegram_send_error',
        error_message: 'Bot token not configured',
        error_code: 'NO_BOT_TOKEN',
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Bot token not configured',
          code: 'CONFIGURATION_ERROR',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Проверка подписи (в production обязательно!)
    if (import.meta.env.PROD && !verifyTelegramWebAppData(initData, botToken)) {
      await createLog({
        form_id,
        event_type: 'validation_error',
        error_message: 'Invalid Telegram signature',
        error_code: 'INVALID_SIGNATURE',
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid Telegram signature',
          code: 'INVALID_SIGNATURE',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 4. Проверяем rate limit
    const rateLimitOk = await checkRateLimitDB(form_id, user_id);
    
    if (!rateLimitOk) {
      await createLog({
        form_id,
        event_type: 'rate_limit_exceeded',
        metadata: { user_id },
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 5. Валидируем данные формы
    const formValidation = validateFormData(data, form.fields);
    
    if (!formValidation.valid) {
      await createLog({
        form_id,
        event_type: 'validation_error',
        error_message: 'Form validation failed',
        metadata: { errors: formValidation.errors },
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Validation failed',
          code: 'FORM_VALIDATION_ERROR',
          details: formValidation.errors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 6. Сохраняем заявку в БД
    const { data: submission, error: submissionError } = await createSubmission({
      form_id,
      user_id,
      first_name,
      last_name,
      username,
      data,
      status: 'processing',
      ip_address: context.clientAddress,
      user_agent: context.request.headers.get('user-agent') || undefined,
    });
    
    if (submissionError || !submission) {
      await createLog({
        form_id,
        event_type: 'submit_start',
        error_message: 'Failed to save submission',
        error_code: 'DATABASE_ERROR',
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to save submission',
          code: 'DATABASE_ERROR',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 7. Отправляем сообщение в Telegram
    const chatId = form.chat_id || import.meta.env.TELEGRAM_CHAT_ID;
    
    if (!chatId) {
      // Если нет chat_id, просто сохраняем и возвращаем успех
      await updateSubmissionStatus(submission.id, 'received');
      
      return new Response(
        JSON.stringify({
          success: true,
          submission_id: submission.id,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const message = formatMessageTemplate(form.message_template, submission, data);
    
    const telegramResult = await sendTelegramMessage({
      botToken,
      chatId,
      text: message,
    });
    
    // 8. Обновляем статус заявки
    if (telegramResult.success) {
      await updateSubmissionStatus(
        submission.id,
        'sent',
        undefined,
        telegramResult.message_id
      );
      
      await createLog({
        form_id,
        submission_id: submission.id,
        event_type: 'telegram_send_success',
        metadata: {
          message_id: telegramResult.message_id,
          processing_time_ms: Date.now() - startTime,
        },
      });
      
      return new Response(
        JSON.stringify({
          success: true,
          submission_id: submission.id,
          telegram_message_id: telegramResult.message_id,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      await updateSubmissionStatus(
        submission.id,
        'error',
        telegramResult.error
      );
      
      await createLog({
        form_id,
        submission_id: submission.id,
        event_type: 'telegram_send_error',
        error_message: telegramResult.error,
        error_code: 'TELEGRAM_API_ERROR',
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send Telegram message',
          code: 'TELEGRAM_ERROR',
          details: telegramResult.error,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('POST /api/telegram-form error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'INTERNAL_ERROR',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
