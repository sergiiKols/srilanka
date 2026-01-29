/**
 * TELEGRAM FORWARD PARSER
 * Парсинг метаданных пересланных сообщений
 */

/**
 * Интерфейс Forward метаданных
 */
export interface ForwardMetadata {
  source_type: 'direct' | 'forward_user' | 'forward_channel';
  forward_from_user_id?: number;
  forward_from_username?: string;
  forward_from_first_name?: string;
  forward_from_chat_id?: number;
  forward_from_chat_title?: string;
  forward_from_chat_username?: string;
  forward_from_message_id?: number;
  forward_date?: string;
  original_message_link?: string;
}

/**
 * Парсит метаданные пересланного сообщения из Telegram
 * 
 * @param {any} message - Telegram message объект
 * @returns {ForwardMetadata} Метаданные forward
 */
export function parseForwardMetadata(message: any): ForwardMetadata {
  // Если нет признаков forward - это direct сообщение
  if (!message.forward_from && !message.forward_from_chat && !message.forward_sender_name) {
    return {
      source_type: 'direct'
    };
  }

  // Forward от пользователя
  if (message.forward_from) {
    const user = message.forward_from;
    
    return {
      source_type: 'forward_user',
      forward_from_user_id: user.id,
      forward_from_username: user.username,
      forward_from_first_name: user.first_name,
      forward_date: message.forward_date 
        ? new Date(message.forward_date * 1000).toISOString()
        : undefined
    };
  }

  // Forward из канала/группы
  if (message.forward_from_chat) {
    const chat = message.forward_from_chat;
    let messageLink: string | undefined;

    // Строим ссылку на оригинальное сообщение
    if (chat.username && message.forward_from_message_id) {
      messageLink = `https://t.me/${chat.username}/${message.forward_from_message_id}`;
    }

    return {
      source_type: 'forward_channel',
      forward_from_chat_id: chat.id,
      forward_from_chat_title: chat.title,
      forward_from_chat_username: chat.username,
      forward_from_message_id: message.forward_from_message_id,
      forward_date: message.forward_date
        ? new Date(message.forward_date * 1000).toISOString()
        : undefined,
      original_message_link: messageLink
    };
  }

  // Forward от пользователя с скрытым профилем
  if (message.forward_sender_name) {
    return {
      source_type: 'forward_user',
      forward_from_first_name: message.forward_sender_name,
      forward_date: message.forward_date
        ? new Date(message.forward_date * 1000).toISOString()
        : undefined
    };
  }

  // По умолчанию - direct
  return {
    source_type: 'direct'
  };
}

/**
 * Проверяет является ли сообщение forward
 * 
 * @param {any} message - Telegram message объект
 * @returns {boolean} true если forward
 */
export function isForwardedMessage(message: any): boolean {
  return !!(
    message.forward_from ||
    message.forward_from_chat ||
    message.forward_sender_name
  );
}

/**
 * Получает читаемое описание источника
 * 
 * @param {ForwardMetadata} metadata - Метаданные
 * @returns {string} Описание источника
 */
export function getSourceDescription(metadata: ForwardMetadata): string {
  switch (metadata.source_type) {
    case 'direct':
      return 'Добавлено напрямую';
      
    case 'forward_user':
      if (metadata.forward_from_username) {
        return `От @${metadata.forward_from_username}`;
      }
      if (metadata.forward_from_first_name) {
        return `От ${metadata.forward_from_first_name}`;
      }
      return 'От пользователя';
      
    case 'forward_channel':
      if (metadata.forward_from_chat_title) {
        return `Из "${metadata.forward_from_chat_title}"`;
      }
      if (metadata.forward_from_chat_username) {
        return `Из @${metadata.forward_from_chat_username}`;
      }
      return 'Из канала/группы';
      
    default:
      return 'Неизвестный источник';
  }
}

/**
 * Форматирует информацию о forward для отображения
 * 
 * @param {ForwardMetadata} metadata - Метаданные
 * @returns {string} Форматированная информация
 */
export function formatForwardInfo(metadata: ForwardMetadata): string {
  if (metadata.source_type === 'direct') {
    return '';
  }

  const lines: string[] = [];
  
  lines.push(`📨 Источник: ${getSourceDescription(metadata)}`);
  
  if (metadata.original_message_link) {
    lines.push(`🔗 Оригинал: ${metadata.original_message_link}`);
  }
  
  if (metadata.forward_date) {
    const date = new Date(metadata.forward_date);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      lines.push('📅 Переслано: сегодня');
    } else if (diffDays === 1) {
      lines.push('📅 Переслано: вчера');
    } else if (diffDays < 7) {
      lines.push(`📅 Переслано: ${diffDays} дн. назад`);
    } else {
      lines.push(`📅 Переслано: ${date.toLocaleDateString('ru-RU')}`);
    }
  }
  
  return lines.join('\n');
}

/**
 * Извлекает chat ID из forward
 * 
 * @param {ForwardMetadata} metadata - Метаданные
 * @returns {number | null} Chat ID или null
 */
export function getForwardChatId(metadata: ForwardMetadata): number | null {
  if (metadata.forward_from_chat_id) {
    return metadata.forward_from_chat_id;
  }
  
  if (metadata.forward_from_user_id) {
    return metadata.forward_from_user_id;
  }
  
  return null;
}

/**
 * Определяет тип источника для аналитики
 * 
 * @param {ForwardMetadata} metadata - Метаданные
 * @returns {string} Тип источника
 */
export function getSourceType(metadata: ForwardMetadata): string {
  switch (metadata.source_type) {
    case 'direct':
      return 'direct';
    case 'forward_user':
      return 'user';
    case 'forward_channel':
      // Различаем каналы и группы по типу chat
      return 'channel';
    default:
      return 'unknown';
  }
}
