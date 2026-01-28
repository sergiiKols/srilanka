/**
 * TENANT REQUEST VALIDATION SERVICE
 * 
 * Сервис для валидации данных формы запроса на бронирование.
 * Используется как на клиенте (real-time), так и на сервере.
 */

import { 
  TENANT_VALIDATION_RULES, 
  calculateNights,
  calculateFormProgress,
  isFormComplete,
  getFormWarnings,
  getFormHints,
  type ValidationRule 
} from '@/config/tenantValidationRules';

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'hint';
}

export interface ValidationResult {
  isValid: boolean;
  progress: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  hints: ValidationError[];
}

export interface TenantFormData {
  location?: string;
  check_in_date?: string;
  check_out_date?: string;
  adults_count?: number;
  children_count?: number;
  guest_type?: 'family' | 'friends' | 'couple' | 'solo';
  trip_purpose?: 'vacation' | 'work' | 'event' | 'other';
  has_pets?: boolean;
  extension_possible?: 'yes' | 'no' | 'dont_know';
  additional_requirements?: string;
  form_language?: 'ru' | 'en';
}

/**
 * Основная функция валидации формы
 */
export function validateTenantForm(
  data: TenantFormData,
  language: 'ru' | 'en' = 'ru'
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const hints: ValidationError[] = [];
  
  // 1. Валидация локации
  const locationError = validateLocation(data, language);
  if (locationError) errors.push(locationError);
  
  // 2. Валидация дат
  const dateErrors = validateDates(data, language);
  errors.push(...dateErrors);
  
  // 3. Валидация гостей
  const guestErrors = validateGuests(data, language);
  errors.push(...guestErrors);
  
  // 4. Валидация цели поездки
  const purposeError = validatePurpose(data, language);
  if (purposeError) errors.push(purposeError);
  
  // 5. Валидация животных
  const petsError = validatePets(data, language);
  if (petsError) errors.push(petsError);
  
  // 6. Валидация дополнительных пожеланий (если есть)
  const additionalError = validateAdditional(data, language);
  if (additionalError) errors.push(additionalError);
  
  // 7. Получение предупреждений
  const formWarnings = getFormWarnings(data);
  warnings.push(...formWarnings.map(w => ({
    field: w.field,
    message: w.message[language],
    type: 'warning' as const
  })));
  
  // 8. Получение подсказок
  const formHints = getFormHints(data);
  hints.push(...formHints.map(h => ({
    field: h.field,
    message: h.message[language],
    type: 'hint' as const
  })));
  
  // 9. Расчёт прогресса
  const progress = calculateFormProgress(data);
  
  return {
    isValid: errors.length === 0 && progress === 100,
    progress,
    errors,
    warnings,
    hints
  };
}

/**
 * Валидация локации
 */
function validateLocation(data: TenantFormData, lang: 'ru' | 'en'): ValidationError | null {
  const rule = TENANT_VALIDATION_RULES.location;
  
  if (!data.location) {
    return {
      field: 'location',
      message: rule.message[lang],
      type: 'error'
    };
  }
  
  if (!rule.custom!(data.location)) {
    return {
      field: 'location',
      message: rule.message[lang],
      type: 'error'
    };
  }
  
  return null;
}

/**
 * Валидация дат
 */
function validateDates(data: TenantFormData, lang: 'ru' | 'en'): ValidationError[] {
  const errors: ValidationError[] = [];
  const rules = TENANT_VALIDATION_RULES.dates;
  
  // Проверка наличия даты заезда
  if (!data.check_in_date) {
    errors.push({
      field: 'check_in_date',
      message: rules.check_in.message[lang],
      type: 'error'
    });
  } else {
    // Проверка корректности даты заезда
    if (!rules.check_in.custom!(data.check_in_date)) {
      errors.push({
        field: 'check_in_date',
        message: rules.check_in.message[lang],
        type: 'error'
      });
    }
  }
  
  // Проверка наличия даты выезда
  if (!data.check_out_date) {
    errors.push({
      field: 'check_out_date',
      message: rules.check_out.message[lang],
      type: 'error'
    });
  } else if (data.check_in_date) {
    // Проверка корректности даты выезда
    if (!rules.check_out.custom!(data.check_out_date, data)) {
      errors.push({
        field: 'check_out_date',
        message: rules.check_out.message[lang],
        type: 'error'
      });
    } else {
      // Проверка минимальной длительности
      const nights = calculateNights(data.check_in_date, data.check_out_date);
      if (nights < rules.min_nights.min!) {
        errors.push({
          field: 'dates',
          message: rules.min_nights.message[lang],
          type: 'error'
        });
      }
      
      // Проверка максимальной длительности
      if (nights > rules.max_nights.max!) {
        errors.push({
          field: 'dates',
          message: rules.max_nights.message[lang],
          type: 'error'
        });
      }
    }
  }
  
  return errors;
}

/**
 * Валидация количества гостей
 */
function validateGuests(data: TenantFormData, lang: 'ru' | 'en'): ValidationError[] {
  const errors: ValidationError[] = [];
  const rules = TENANT_VALIDATION_RULES.guests;
  
  // Проверка взрослых
  if (data.adults_count === undefined || data.adults_count === null) {
    errors.push({
      field: 'adults_count',
      message: rules.adults.message[lang],
      type: 'error'
    });
  } else if (data.adults_count < rules.adults.min! || data.adults_count > rules.adults.max!) {
    errors.push({
      field: 'adults_count',
      message: rules.adults.message[lang],
      type: 'error'
    });
  }
  
  // Проверка детей (опционально, но с лимитом)
  if (data.children_count !== undefined && data.children_count > rules.children.max!) {
    errors.push({
      field: 'children_count',
      message: rules.children.message[lang],
      type: 'error'
    });
  }
  
  // Проверка общего количества
  if (data.adults_count !== undefined) {
    if (!rules.total.custom!(null, data)) {
      errors.push({
        field: 'guests',
        message: rules.total.message[lang],
        type: 'error'
      });
    }
  }
  
  // Проверка типа группы
  if (!data.guest_type) {
    errors.push({
      field: 'guest_type',
      message: rules.guest_type.message[lang],
      type: 'error'
    });
  } else if (!rules.guest_type.custom!(data.guest_type)) {
    errors.push({
      field: 'guest_type',
      message: rules.guest_type.message[lang],
      type: 'error'
    });
  }
  
  return errors;
}

/**
 * Валидация цели поездки
 */
function validatePurpose(data: TenantFormData, lang: 'ru' | 'en'): ValidationError | null {
  const rule = TENANT_VALIDATION_RULES.purpose;
  
  if (!data.trip_purpose) {
    return {
      field: 'trip_purpose',
      message: rule.message[lang],
      type: 'error'
    };
  }
  
  if (!rule.custom!(data.trip_purpose)) {
    return {
      field: 'trip_purpose',
      message: rule.message[lang],
      type: 'error'
    };
  }
  
  return null;
}

/**
 * Валидация информации о животных
 */
function validatePets(data: TenantFormData, lang: 'ru' | 'en'): ValidationError | null {
  const rule = TENANT_VALIDATION_RULES.pets;
  
  if (data.has_pets === undefined || data.has_pets === null) {
    return {
      field: 'has_pets',
      message: rule.message[lang],
      type: 'error'
    };
  }
  
  return null;
}

/**
 * Валидация дополнительных пожеланий
 */
function validateAdditional(data: TenantFormData, lang: 'ru' | 'en'): ValidationError | null {
  const rule = TENANT_VALIDATION_RULES.additional;
  
  if (data.additional_requirements && data.additional_requirements.length > rule.maxLength!) {
    return {
      field: 'additional_requirements',
      message: rule.message[lang],
      type: 'error'
    };
  }
  
  return null;
}

/**
 * Валидация отдельного поля (для real-time валидации)
 */
export function validateField(
  fieldName: keyof TenantFormData,
  value: any,
  formData: TenantFormData,
  language: 'ru' | 'en' = 'ru'
): ValidationError | null {
  const tempData = { ...formData, [fieldName]: value };
  const result = validateTenantForm(tempData, language);
  
  return result.errors.find(e => e.field === fieldName) || null;
}

/**
 * Получение текста для MainButton в зависимости от прогресса
 */
export function getMainButtonText(progress: number, language: 'ru' | 'en'): string {
  if (progress < 100) {
    return language === 'ru' 
      ? `Заполнено ${progress}%` 
      : `Filled ${progress}%`;
  }
  
  return language === 'ru' 
    ? '🚀 Найти жильё' 
    : '🚀 Find accommodation';
}

/**
 * Проверка, должен ли MainButton быть активен
 */
export function shouldEnableMainButton(formData: TenantFormData): boolean {
  return isFormComplete(formData);
}
