/**
 * TENANT BOOKING REQUEST VALIDATION RULES
 * 
 * Правила валидации для формы запроса на бронирование жилья.
 * Используются как на клиенте (real-time), так и на сервере (final check).
 */

export interface ValidationRule {
  required: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: {
    ru: string;
    en: string;
  };
}

export interface TenantValidationRules {
  location: ValidationRule;
  dates: {
    check_in: ValidationRule;
    check_out: ValidationRule;
    min_nights: ValidationRule;
    max_nights: ValidationRule;
  };
  guests: {
    adults: ValidationRule;
    children: ValidationRule;
    total: ValidationRule;
    guest_type: ValidationRule;
  };
  purpose: ValidationRule;
  pets: ValidationRule;
  extension: ValidationRule;
  additional: ValidationRule;
}

export const TENANT_VALIDATION_RULES: TenantValidationRules = {
  // 📍 ЛОКАЦИЯ
  location: {
    required: true,
    custom: (value: string) => {
      const validLocations = ['unawatuna', 'mirissa', 'hikkaduwa', 'tangalle', 'weligama', 'galle', 'ahangama'];
      return validLocations.includes(value);
    },
    message: {
      ru: 'Выберите локацию',
      en: 'Select location'
    }
  },
  
  // 📅 ДАТЫ
  dates: {
    check_in: {
      required: true,
      custom: (date: string) => {
        const checkIn = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Минимум за 1 день (можно бронировать на завтра)
        return checkIn >= today;
      },
      message: {
        ru: 'Укажите дату заезда (не раньше сегодня)',
        en: 'Specify check-in date (not earlier than today)'
      }
    },
    
    check_out: {
      required: true,
      custom: (date: string, formData: any) => {
        const checkIn = new Date(formData.check_in_date);
        const checkOut = new Date(date);
        return checkOut > checkIn;
      },
      message: {
        ru: 'Дата выезда должна быть позже даты заезда',
        en: 'Check-out date must be after check-in date'
      }
    },
    
    min_nights: {
      required: true,
      min: 1,
      message: {
        ru: 'Минимальная длительность: 1 ночь',
        en: 'Minimum stay: 1 night'
      }
    },
    
    max_nights: {
      required: false,
      max: 365,
      message: {
        ru: 'Максимальная длительность: 365 ночей',
        en: 'Maximum stay: 365 nights'
      }
    }
  },
  
  // 👥 ГОСТИ
  guests: {
    adults: {
      required: true,
      min: 1,
      max: 30,
      message: {
        ru: 'Укажите количество взрослых (от 1 до 30)',
        en: 'Specify number of adults (1 to 30)'
      }
    },
    
    children: {
      required: false,
      min: 0,
      max: 10,
      message: {
        ru: 'Максимум 10 детей',
        en: 'Maximum 10 children'
      }
    },
    
    total: {
      required: true,
      min: 1,
      max: 40,
      custom: (_, formData: any) => {
        const total = (formData.adults_count || 0) + (formData.children_count || 0);
        return total >= 1 && total <= 40;
      },
      message: {
        ru: 'Общее количество гостей: от 1 до 40',
        en: 'Total guests: 1 to 40'
      }
    },
    
    guest_type: {
      required: true,
      custom: (value: string) => {
        return ['family', 'friends', 'couple', 'solo'].includes(value);
      },
      message: {
        ru: 'Выберите тип группы',
        en: 'Select group type'
      }
    }
  },
  
  // 🎯 ЦЕЛЬ ПОЕЗДКИ
  purpose: {
    required: true,
    custom: (value: string) => {
      return ['vacation', 'work', 'event', 'other'].includes(value);
    },
    message: {
      ru: 'Укажите цель поездки',
      en: 'Specify trip purpose'
    }
  },
  
  // 🐾 ЖИВОТНЫЕ
  pets: {
    required: true,
    custom: (value: boolean | string) => {
      return value === true || value === false || value === 'true' || value === 'false';
    },
    message: {
      ru: 'Укажите, будут ли с вами животные',
      en: 'Specify if you will bring pets'
    }
  },
  
  // ⏱️ ПРОЛОНГАЦИЯ (опционально)
  extension: {
    required: false,
    custom: (value: string) => {
      return !value || ['yes', 'no', 'dont_know'].includes(value);
    },
    message: {
      ru: 'Некорректное значение для пролонгации',
      en: 'Invalid extension value'
    }
  },
  
  // 💬 ДОПОЛНИТЕЛЬНЫЕ ПОЖЕЛАНИЯ (опционально)
  additional: {
    required: false,
    minLength: 0,
    maxLength: 1000,
    message: {
      ru: 'Максимум 1000 символов',
      en: 'Maximum 1000 characters'
    }
  }
};

/**
 * Вычисляет процент заполнения формы
 */
export function calculateFormProgress(formData: any): number {
  const requiredFields = [
    'location',
    'check_in_date',
    'check_out_date',
    'adults_count',
    'guest_type',
    'trip_purpose',
    'has_pets'
  ];
  
  const filledFields = requiredFields.filter(field => {
    const value = formData[field];
    return value !== undefined && value !== null && value !== '';
  });
  
  return Math.round((filledFields.length / requiredFields.length) * 100);
}

/**
 * Проверяет, заполнены ли все обязательные поля
 */
export function isFormComplete(formData: any): boolean {
  return calculateFormProgress(formData) === 100;
}

/**
 * Вычисляет количество ночей между датами
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Предупреждения для специфичных случаев
 */
export function getFormWarnings(formData: any): Array<{ field: string; message: { ru: string; en: string } }> {
  const warnings = [];
  
  // Предупреждение для мероприятий
  if (formData.trip_purpose === 'event') {
    warnings.push({
      field: 'trip_purpose',
      message: {
        ru: '⚠️ Мероприятия требуют согласования с арендодателем',
        en: '⚠️ Events require coordination with landlord'
      }
    });
  }
  
  // Предупреждение для большого количества гостей
  const totalGuests = (formData.adults_count || 0) + (formData.children_count || 0);
  if (totalGuests > 10) {
    warnings.push({
      field: 'guests',
      message: {
        ru: '⚠️ Для больших групп (>10 человек) доступно ограниченное количество объектов',
        en: '⚠️ Limited properties available for large groups (>10 people)'
      }
    });
  }
  
  // Предупреждение для долгого проживания
  if (formData.check_in_date && formData.check_out_date) {
    const nights = calculateNights(formData.check_in_date, formData.check_out_date);
    if (nights > 90) {
      warnings.push({
        field: 'dates',
        message: {
          ru: '💡 Для долгосрочной аренды (>3 месяцев) возможны специальные цены',
          en: '💡 Special rates available for long-term rentals (>3 months)'
        }
      });
    }
  }
  
  return warnings;
}

/**
 * Подсказки для улучшения заявки
 */
export function getFormHints(formData: any): Array<{ field: string; message: { ru: string; en: string } }> {
  const hints = [];
  
  // Подсказка для работы
  if (formData.trip_purpose === 'work' && !formData.additional_requirements?.includes('WiFi')) {
    hints.push({
      field: 'additional',
      message: {
        ru: '💡 Совет: укажите требования к интернету, если работаете удалённо',
        en: '💡 Tip: specify internet requirements if working remotely'
      }
    });
  }
  
  // Подсказка для детей
  if (formData.children_count > 0 && !formData.additional_requirements?.includes('кроватка')) {
    hints.push({
      field: 'additional',
      message: {
        ru: '💡 Совет: укажите, нужна ли детская кроватка',
        en: '💡 Tip: specify if you need a baby crib'
      }
    });
  }
  
  return hints;
}
