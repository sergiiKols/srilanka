/**
 * Форматирование часов работы для оптимального отображения
 * Убирает избыточность для мест, работающих 24/7
 */

export function formatOpeningHours(weekdayText) {
  if (!weekdayText || !Array.isArray(weekdayText)) {
    return '';
  }

  // Сокращаем время: убираем минуты если :00, убираем пробелы
  const shortTime = (time) => {
    return time
      .replace(/(\d+):00\s*/g, '$1 ')  // 11:00 → 11
      .replace(/\s+(AM|PM)/g, ' $1')    // normalize spaces
      .replace(/\s*–\s*/g, '–')         // remove spaces around dash
      .replace(/\s*-\s*/g, '–')         // - to –
      .trim();
  };

  // Проверяем, работает ли место 24/7
  const is24_7 = weekdayText.every(day => 
    day.includes('Open 24 hours') || 
    day.includes('24 hours') ||
    day.includes('круглосуточно')
  );

  if (is24_7) {
    return 'Open 24/7';
  }
  
  // Извлекаем часы для каждого дня
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayNamesShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const daysData = weekdayText.map((dayStr, index) => {
    const match = dayStr.match(/:\s*(.+)$/);
    const hours = match ? match[1].trim() : dayStr;
    const is24h = hours.includes('Open 24 hours') || hours.includes('24 hours');
    const isClosed = hours.includes('Closed');
    
    return {
      index,
      name: dayNames[index],
      nameShort: dayNamesShort[index],
      hours: hours,
      is24h: is24h,
      isClosed: isClosed,
      hoursShort: is24h ? '24h' : (isClosed ? 'Closed' : shortTime(hours))
    };
  });

  // Проверяем, одинаковые ли часы каждый день
  const hours = weekdayText.map(day => {
    // Извлекаем только часы работы (после двоеточия)
    const match = day.match(/:\s*(.+)$/);
    return match ? match[1].trim() : day;
  });

  const uniqueHours = [...new Set(hours)];

  // Если все дни одинаковые
  if (uniqueHours.length === 1) {
    return `Every day: ${uniqueHours[0]}`;
  }

  // Если есть разница между буднями и выходными
  const weekdayHours = hours.slice(0, 5); // Mon-Fri
  const weekendHours = hours.slice(5, 7); // Sat-Sun

  const uniqueWeekday = [...new Set(weekdayHours)];
  const uniqueWeekend = [...new Set(weekendHours)];

  if (uniqueWeekday.length === 1 && uniqueWeekend.length === 1) {
    if (uniqueWeekday[0] === uniqueWeekend[0]) {
      return `Every day: ${uniqueWeekday[0]}`;
    } else {
      return `Mon-Fri: ${uniqueWeekday[0]} | Sat-Sun: ${uniqueWeekend[0]}`;
    }
  }

  // Если есть закрытые дни
  const closedDays = [];
  const closedIndices = [];
  weekdayText.forEach((day, index) => {
    if (day.includes('Closed') || day.includes('закрыто')) {
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      closedDays.push(dayNames[index]);
      closedIndices.push(index);
    }
  });

  if (closedDays.length > 0 && closedDays.length < 7) {
    const openDays = weekdayText.filter(day => 
      !day.includes('Closed') && !day.includes('закрыто')
    );
    
    if (openDays.length > 0) {
      const openHours = openDays.map(day => {
        const match = day.match(/:\s*(.+)$/);
        return match ? match[1].trim() : day;
      });
      
      const uniqueOpen = [...new Set(openHours)];
      
      // Сокращаем время: убираем минуты если :00, убираем пробелы
      const shortTime = (time) => {
        return time
          .replace(/(\d+):00\s*/g, '$1 ')  // 11:00 → 11
          .replace(/\s+(AM|PM)/g, ' $1')    // normalize spaces
          .replace(/\s*–\s*/g, '–')         // remove spaces around dash
          .trim();
      };
      
      if (uniqueOpen.length === 1) {
        const shortHours = shortTime(uniqueOpen[0]);
        
        // Определяем диапазон открытых дней
        const openIndices = [0, 1, 2, 3, 4, 5, 6].filter(i => !closedIndices.includes(i));
        
        // Проверяем последовательность
        const isSequential = openIndices.every((val, idx, arr) => 
          idx === 0 || val === arr[idx - 1] + 1
        );
        
        if (isSequential && openIndices.length > 1) {
          const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const rangeStart = dayNames[openIndices[0]];
          const rangeEnd = dayNames[openIndices[openIndices.length - 1]];
          
          // Форматируем закрытые дни
          let closedText = '';
          if (closedDays.length === 1) {
            closedText = ` | Closed ${closedDays[0]}s`;
          } else if (closedDays.length === 2 && closedDays.includes('Sat') && closedDays.includes('Sun')) {
            closedText = ' | Closed weekends';
          } else {
            closedText = ` | Closed ${closedDays.join(', ')}`;
          }
          
          return `${rangeStart}–${rangeEnd}: ${shortHours}${closedText}`;
        }
        
        return `${shortHours} | Closed ${closedDays.join(', ')}`;
      }
    }
  }

  // Группируем дни с одинаковыми часами
  const groups = [];
  let currentGroup = [daysData[0]];
  
  for (let i = 1; i < daysData.length; i++) {
    if (daysData[i].hoursShort === currentGroup[0].hoursShort) {
      currentGroup.push(daysData[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [daysData[i]];
    }
  }
  groups.push(currentGroup);
  
  // Форматируем группы
  const formattedGroups = groups.map(group => {
    if (group.length === 1) {
      return `${group[0].nameShort}: ${group[0].hoursShort}`;
    } else if (group.length === 7) {
      return `Every day: ${group[0].hoursShort}`;
    } else {
      // Проверяем последовательность
      const isSequential = group.every((day, idx, arr) => 
        idx === 0 || day.index === arr[idx - 1].index + 1
      );
      
      if (isSequential && group.length > 1) {
        return `${group[0].nameShort}–${group[group.length - 1].nameShort}: ${group[0].hoursShort}`;
      } else {
        return group.map(d => `${d.nameShort}: ${d.hoursShort}`).join(', ');
      }
    }
  });
  
  return formattedGroups.join(' | ');
}

// Для использования в Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatOpeningHours };
}
