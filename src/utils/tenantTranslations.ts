/**
 * TENANT REQUEST FORM TRANSLATIONS
 * 
 * Переводы для формы запроса на бронирование жилья.
 * Поддерживаемые языки: Русский (ru), English (en)
 */

export type Language = 'ru' | 'en';

export interface Translations {
  // Header
  title: string;
  close: string;
  back: string;
  
  // Progress
  progress_filled: string;
  progress_complete: string;
  
  // Location
  location_title: string;
  location_label: string;
  location_placeholder: string;
  other_city: string;
  custom_city_label: string;
  custom_city_placeholder: string;
  validating_city: string;
  
  // Dates section
  dates_title: string;
  check_in_label: string;
  check_out_label: string;
  duration_label: string;
  nights: string;
  night: string;
  
  // Guests section
  guests_title: string;
  adults_label: string;
  children_label: string;
  guest_type_label: string;
  family: string;
  friends: string;
  couple: string;
  solo: string;
  
  // Purpose section
  purpose_title: string;
  vacation: string;
  work: string;
  event: string;
  other: string;
  
  // Pets section
  pets_title: string;
  pets_question: string;
  yes: string;
  no: string;
  
  // Extension section
  extension_title: string;
  extension_question: string;
  dont_know: string;
  
  // Additional section
  additional_title: string;
  additional_placeholder: string;
  additional_examples: string;
  
  // Main button
  submit: string;
  submitting: string;
  success: string;
  
  // Messages
  draft_found_title: string;
  draft_found_message: string;
  draft_restore: string;
  draft_discard: string;
  
  save_draft_title: string;
  save_draft_message: string;
  save_draft_save: string;
  save_draft_discard: string;
  save_draft_cancel: string;
  
  success_title: string;
  success_message: string;
  success_ok: string;
  
  error_title: string;
  error_message: string;
  error_retry: string;
  
  // Filling time
  filling_time: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  ru: {
    // Header
    title: 'Найти жильё в Шри-Ланке',
    close: 'Закрыть',
    back: 'Назад',
    
    // Progress
    progress_filled: 'Заполнено',
    progress_complete: 'Готово',
    
    // Location
    location_title: 'Где ищете жильё?',
    location_label: 'Локация',
    location_placeholder: 'Выберите город',
    other_city: 'Другой город',
    custom_city_label: 'Название города',
    custom_city_placeholder: 'Введите название города в Шри-Ланке',
    validating_city: 'Проверяем город...',
    
    // Dates
    dates_title: 'Даты пребывания',
    check_in_label: 'Заезд',
    check_out_label: 'Выезд',
    duration_label: 'Длительность',
    nights: 'ночей',
    night: 'ночь',
    
    // Guests
    guests_title: 'Гости',
    adults_label: 'Взрослых',
    children_label: 'Детей',
    guest_type_label: 'Кто вы?',
    family: 'Семья',
    friends: 'Друзья',
    couple: 'Пара',
    solo: 'Один',
    
    // Purpose
    purpose_title: 'Цель поездки',
    vacation: 'Отдых',
    work: 'Работа',
    event: 'Мероприятие',
    other: 'Другое',
    
    // Pets
    pets_title: 'Животные',
    pets_question: 'Будут ли с вами животные?',
    yes: 'Да',
    no: 'Нет',
    
    // Extension
    extension_title: 'Пролонгация',
    extension_question: 'Возможно продление аренды?',
    dont_know: 'Не знаю',
    
    // Additional
    additional_title: 'Дополнительные пожелания',
    additional_placeholder: 'Например: нужна детская кроватка, тихое место, хороший WiFi для работы...',
    additional_examples: '• Детская кроватка\n• Тихое место\n• Хороший WiFi\n• Близко к пляжу',
    
    // Main button
    submit: '🚀 Найти жильё',
    submitting: 'Отправляем...',
    success: '✓ Готово',
    
    // Messages
    draft_found_title: 'Найден черновик',
    draft_found_message: 'У вас есть незавершённая заявка. Восстановить?',
    draft_restore: 'Восстановить',
    draft_discard: 'Начать заново',
    
    save_draft_title: 'Сохранить черновик?',
    save_draft_message: 'У вас есть несохранённые изменения',
    save_draft_save: 'Сохранить',
    save_draft_discard: 'Не сохранять',
    save_draft_cancel: 'Отмена',
    
    success_title: 'Готово!',
    success_message: 'Ваш запрос принят. Мы начинаем подбирать варианты жилья и скоро свяжемся с вами.',
    success_ok: 'Отлично',
    
    error_title: 'Ошибка',
    error_message: 'Не удалось отправить запрос. Попробуйте ещё раз.',
    error_retry: 'Попробовать снова',
    
    // Filling time
    filling_time: 'Заполнение: ~30 секунд'
  },
  
  en: {
    // Header
    title: 'Find accommodation in Sri Lanka',
    close: 'Close',
    back: 'Back',
    
    // Progress
    progress_filled: 'Filled',
    progress_complete: 'Complete',
    
    // Location
    location_title: 'Where are you looking?',
    location_label: 'Location',
    location_placeholder: 'Select city',
    other_city: 'Other city',
    custom_city_label: 'City name',
    custom_city_placeholder: 'Enter city name in Sri Lanka',
    validating_city: 'Validating city...',
    
    // Dates
    dates_title: 'Stay dates',
    check_in_label: 'Check-in',
    check_out_label: 'Check-out',
    duration_label: 'Duration',
    nights: 'nights',
    night: 'night',
    
    // Guests
    guests_title: 'Guests',
    adults_label: 'Adults',
    children_label: 'Children',
    guest_type_label: 'Who are you?',
    family: 'Family',
    friends: 'Friends',
    couple: 'Couple',
    solo: 'Solo',
    
    // Purpose
    purpose_title: 'Trip purpose',
    vacation: 'Vacation',
    work: 'Work',
    event: 'Event',
    other: 'Other',
    
    // Pets
    pets_title: 'Pets',
    pets_question: 'Will you bring pets?',
    yes: 'Yes',
    no: 'No',
    
    // Extension
    extension_title: 'Extension',
    extension_question: 'Extension possible?',
    dont_know: "Don't know",
    
    // Additional
    additional_title: 'Additional requirements',
    additional_placeholder: 'E.g.: need baby crib, quiet place, good WiFi for work...',
    additional_examples: '• Baby crib\n• Quiet place\n• Good WiFi\n• Close to beach',
    
    // Main button
    submit: '🚀 Find accommodation',
    submitting: 'Submitting...',
    success: '✓ Done',
    
    // Messages
    draft_found_title: 'Draft found',
    draft_found_message: 'You have an unfinished request. Restore it?',
    draft_restore: 'Restore',
    draft_discard: 'Start over',
    
    save_draft_title: 'Save draft?',
    save_draft_message: 'You have unsaved changes',
    save_draft_save: 'Save',
    save_draft_discard: "Don't save",
    save_draft_cancel: 'Cancel',
    
    success_title: 'Success!',
    success_message: 'Your request has been received. We are finding accommodation options and will contact you soon.',
    success_ok: 'Great',
    
    error_title: 'Error',
    error_message: 'Failed to submit request. Please try again.',
    error_retry: 'Try again',
    
    // Filling time
    filling_time: 'Filling time: ~30 seconds'
  }
};

/**
 * Получить переводы для текущего языка
 */
export function getTranslations(language: Language): Translations {
  return TRANSLATIONS[language] || TRANSLATIONS.ru;
}

/**
 * Хук для использования переводов в React компонентах
 */
export function useTranslations(language: Language) {
  return getTranslations(language);
}

/**
 * Форматирование количества ночей с правильным склонением
 */
export function formatNights(count: number, language: Language): string {
  const t = getTranslations(language);
  
  if (language === 'ru') {
    // Русское склонение
    if (count === 1 || (count > 20 && count % 10 === 1)) {
      return `${count} ночь`;
    } else if ((count >= 2 && count <= 4) || (count > 20 && count % 10 >= 2 && count % 10 <= 4)) {
      return `${count} ночи`;
    } else {
      return `${count} ночей`;
    }
  } else {
    // Английское
    return count === 1 ? `${count} night` : `${count} nights`;
  }
}

/**
 * Определить язык из Telegram
 */
export function detectTelegramLanguage(): Language {
  // По умолчанию английский
  if (typeof window === 'undefined') return 'en';
  
  // @ts-ignore - Telegram WebApp API
  const telegramLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
  
  // Только русский язык переключаем на ru, остальные - en
  if (telegramLang === 'ru') return 'ru';
  
  return 'en'; // По умолчанию английский
}
