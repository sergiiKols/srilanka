/**
 * Форматирует часы работы в умный компактный формат
 * 
 * Примеры:
 * "Monday: 10:30 AM – 10:30 PM | Tuesday: 10:30 AM – 10:30 PM..." 
 * → "Пн-Вс: 10:30-22:30"
 * 
 * "Monday-Friday: 9:00 AM – 5:00 PM | Saturday-Sunday: Closed"
 * → "Пн-Пт: 9:00-17:00 | Сб-Вс: Закрыто"
 */

interface ParsedHours {
  days: string[];
  hours: string;
}

export function formatOpeningHours(text: string): string {
  if (!text) return '';

  // Если в тексте нет "Hours:" - вернуть как есть
  const hoursMatch = text.match(/Hours?:\s*(.+?)(?:\n|$)/i);
  if (!hoursMatch) return text;

  const hoursText = hoursMatch[1];
  const beforeHours = text.substring(0, hoursMatch.index);
  const afterHours = text.substring(hoursMatch.index! + hoursMatch[0].length);

  try {
    const formatted = parseAndFormatHours(hoursText);
    return beforeHours + 'Hours: ' + formatted + afterHours;
  } catch (e) {
    // Если не удалось распарсить - вернуть оригинал
    return text;
  }
}

function parseAndFormatHours(hoursText: string): string {
  // Парсим формат "Monday: 10:30 AM – 10:30 PM | Tuesday: ..."
  const dayEntries = hoursText.split('|').map(s => s.trim());
  
  const parsed: ParsedHours[] = [];
  const dayMap: { [key: string]: string } = {
    'Monday': 'Mon',
    'Tuesday': 'Tue', 
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri',
    'Saturday': 'Sat',
    'Sunday': 'Sun'
  };

  for (const entry of dayEntries) {
    const match = entry.match(/^(\w+):\s*(.+)$/);
    if (!match) continue;

    const [, day, hours] = match;
    const shortDay = dayMap[day] || day;
    
    // Конвертируем AM/PM в 24h
    let formattedHours = hours
      .replace(/(\d{1,2}):(\d{2})\s*AM/gi, (_, h, m) => {
        const hour = parseInt(h);
        return `${hour === 12 ? 0 : hour}:${m}`;
      })
      .replace(/(\d{1,2}):(\d{2})\s*PM/gi, (_, h, m) => {
        const hour = parseInt(h);
        return `${hour === 12 ? 12 : hour + 12}:${m}`;
      })
      .replace(/–/g, '-')
      .trim();

    // Если "Closed" - оставить как есть
    if (/closed/i.test(formattedHours)) {
      formattedHours = 'Closed';
    }

    parsed.push({ days: [shortDay], hours: formattedHours });
  }

  // Группируем одинаковые часы
  const grouped = groupSameHours(parsed);
  
  // Форматируем в строку
  return grouped.map(g => `${g.days.join('-')}: ${g.hours}`).join(' | ');
}

function groupSameHours(parsed: ParsedHours[]): ParsedHours[] {
  if (parsed.length === 0) return [];

  const groups: ParsedHours[] = [];
  let currentGroup = { ...parsed[0] };

  for (let i = 1; i < parsed.length; i++) {
    const current = parsed[i];
    
    if (current.hours === currentGroup.hours) {
      // Добавляем день в текущую группу
      currentGroup.days.push(...current.days);
    } else {
      // Сохраняем текущую группу и начинаем новую
      groups.push(currentGroup);
      currentGroup = { ...current };
    }
  }
  
  groups.push(currentGroup);

  // Если все дни одинаковые - сократить до "Mon-Sun"
  return groups.map(g => {
    if (g.days.length === 7) {
      return { days: ['Mon-Sun'], hours: g.hours };
    }
    return g;
  });
}

/**
 * Извлекает только часы работы из описания
 */
export function extractOpeningHours(text: string): string | null {
  const match = text.match(/Hours?:\s*(.+?)(?:\n|$)/i);
  return match ? match[1] : null;
}

/**
 * Удаляет блок часов работы из описания
 */
export function removeOpeningHours(text: string): string {
  return text.replace(/Hours?:\s*.+?(?:\n|$)/i, '').trim();
}
