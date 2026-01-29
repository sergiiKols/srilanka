/**
 * Утилиты для работы с Telegram Bot API и Web App
 */

import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import type { FormSubmission, TelegramWebApp } from '../types/telegram.types';

// ================================================
// ПРОВЕРКА ПОДПИСИ TELEGRAM WEB APP
// ================================================

/**
 * Проверяет подлинность данных от Telegram Web App
 * @param initData - строка initData от Telegram
 * @param botToken - токен бота
 * @returns true если данные валидны
 */
export function verifyTelegramWebAppData(initData: string, botToken: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) {
      return false;
    }

    // Удаляем hash из параметров
    urlParams.delete('hash');

    // Сортируем параметры по ключу
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаем секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Создаем подпись
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (error) {
    console.error('Error verifying Telegram data:', error);
    return false;
  }
}

/**
 * Парсит initData от Telegram Web App
 */
export function parseTelegramInitData(initData: string) {
  const urlParams = new URLSearchParams(initData);
  const userParam = urlParams.get('user');

  return {
    query_id: urlParams.get('query_id') || undefined,
    user: userParam ? JSON.parse(userParam) : undefined,
    auth_date: parseInt(urlParams.get('auth_date') || '0'),
    hash: urlParams.get('hash') || '',
  };
}

// ================================================
// ШИФРОВАНИЕ BOT TOKEN
// ================================================

/**
 * Шифрует Bot Token перед сохранением в БД
 */
export function encryptBotToken(token: string, secret: string): string {
  return CryptoJS.AES.encrypt(token, secret).toString();
}

/**
 * Дешифрует Bot Token из БД
 */
export function decryptBotToken(encrypted: string, secret: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// ================================================
// ОТПРАВКА СООБЩЕНИЙ В TELEGRAM
// ================================================

interface SendMessageParams {
  botToken: string;
  chatId: string;
  text: string;
  parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  disableWebPagePreview?: boolean;
  replyMarkup?: {
    inline_keyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
  };
}

/**
 * Отправляет сообщение через Telegram Bot API
 */
export async function sendTelegramMessage(params: SendMessageParams): Promise<{
  success: boolean;
  message_id?: number;
  error?: string;
}> {
  const { botToken, chatId, text, parseMode = 'HTML', disableWebPagePreview = true, replyMarkup } = params;

  console.log('📤 sendTelegramMessage called:', { chatId, textLength: text.length, hasReplyMarkup: !!replyMarkup });

  try {
    const body: any = {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: disableWebPagePreview,
    };

    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }

    console.log('📤 Sending to Telegram API...');
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('📤 Telegram API response:', data);

    if (!data.ok) {
      console.error('❌ Telegram API error:', data.description);
      return {
        success: false,
        error: data.description || 'Telegram API error',
      };
    }

    console.log('✅ Message sent successfully:', data.result.message_id);
    return {
      success: true,
      message_id: data.result.message_id,
    };
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Форматирует сообщение по шаблону
 */
export function formatMessageTemplate(
  template: string,
  submission: Partial<FormSubmission>,
  data: Record<string, any>
): string {
  let message = template;

  // Заменяем пользовательские данные
  message = message.replace(/{firstName}/g, submission.first_name || 'N/A');
  message = message.replace(/{lastName}/g, submission.last_name || 'N/A');
  message = message.replace(/{username}/g, submission.username ? `@${submission.username}` : 'N/A');
  message = message.replace(/{userId}/g, submission.user_id || 'N/A');

  // Заменяем значения полей
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = new RegExp(`{${key}}`, 'g');
    message = message.replace(placeholder, String(value || 'N/A'));
  });

  return message;
}

// ================================================
// ВАЛИДАЦИЯ ДАННЫХ ФОРМЫ
// ================================================

/**
 * Валидирует данные формы согласно конфигурации полей
 */
export function validateFormData(
  data: Record<string, any>,
  fields: Array<{ id: string; required: boolean; type: string; validation?: any }>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  fields.forEach((field) => {
    const value = data[field.id];

    // Проверка обязательных полей
    if (field.required && (!value || value === '')) {
      errors[field.id] = 'Это поле обязательно';
      return;
    }

    // Если поле не обязательно и пустое, пропускаем дальнейшую валидацию
    if (!value) return;

    // Валидация email
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[field.id] = 'Неверный формат email';
      }
    }

    // Валидация телефона
    if (field.type === 'tel' && value) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(value)) {
        errors[field.id] = 'Неверный формат телефона';
      }
    }

    // Дополнительная валидация
    if (field.validation) {
      const { min, max, pattern, message } = field.validation;

      if (min !== undefined && String(value).length < min) {
        errors[field.id] = message || `Минимум ${min} символов`;
      }

      if (max !== undefined && String(value).length > max) {
        errors[field.id] = message || `Максимум ${max} символов`;
      }

      if (pattern) {
        const regex = new RegExp(pattern);
        if (!regex.test(String(value))) {
          errors[field.id] = message || 'Неверный формат';
        }
      }
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ================================================
// RATE LIMITING
// ================================================

/**
 * Проверяет, может ли пользователь отправить заявку (simple in-memory rate limit)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  userId: string,
  maxAttempts: number = 5,
  windowMs: number = 5 * 60 * 1000 // 5 минут
): { allowed: boolean; retryAfter?: number } {
  const key = `rate_limit_${userId}`;
  const now = Date.now();
  const record = rateLimitMap.get(key);

  // Если записи нет или окно истекло
  if (!record || record.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  // Если превышен лимит
  if (record.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  // Увеличиваем счетчик
  record.count++;
  return { allowed: true };
}

// ================================================
// ЭКСПОРТ ДАННЫХ
// ================================================

/**
 * Конвертирует заявки в CSV формат
 */
export function convertSubmissionsToCSV(submissions: FormSubmission[]): string {
  if (submissions.length === 0) return '';

  // Получаем все уникальные ключи из data
  const dataKeys = new Set<string>();
  submissions.forEach((sub) => {
    Object.keys(sub.data).forEach((key) => dataKeys.add(key));
  });

  // Заголовки
  const headers = [
    'ID',
    'Дата',
    'User ID',
    'Имя',
    'Фамилия',
    'Username',
    'Статус',
    ...Array.from(dataKeys),
  ];

  // Строки данных
  const rows = submissions.map((sub) => {
    const baseData = [
      sub.id,
      new Date(sub.created_at).toLocaleString('ru-RU'),
      sub.user_id,
      sub.first_name || '',
      sub.last_name || '',
      sub.username || '',
      sub.status,
    ];

    const fieldData = Array.from(dataKeys).map((key) => {
      const value = sub.data[key];
      return typeof value === 'object' ? JSON.stringify(value) : String(value || '');
    });

    return [...baseData, ...fieldData];
  });

  // Форматирование CSV
  const csvRows = [headers, ...rows].map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  );

  return csvRows.join('\n');
}
