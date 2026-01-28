/**
 * TENANT REQUEST FORM COMPONENT
 * 
 * Форма запроса на бронирование жилья с полной интеграцией Telegram WebApp API.
 * 
 * Особенности:
 * - Telegram MainButton вместо обычной submit кнопки
 * - HapticFeedback на всех взаимодействиях
 * - CloudStorage для автосохранения черновиков
 * - Полная адаптация под тему Telegram
 * - Real-time валидация с прогрессом
 * - Подтверждение при закрытии
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { validateTenantForm, type TenantFormData } from '@/services/tenantValidation';
import { 
  getTranslations, 
  formatNights, 
  type Language 
} from '@/utils/tenantTranslations';
import { calculateNights, calculateFormProgress } from '@/config/tenantValidationRules';
import { getLocationsForLanguage } from '@/config/sriLankaLocations';

// Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        CloudStorage: {
          setItem: (key: string, value: string, callback?: (error: Error | null, success: boolean) => void) => void;
          getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void;
          getItems: (keys: string[], callback: (error: Error | null, values: Record<string, string>) => void) => void;
          removeItem: (key: string, callback?: (error: Error | null, success: boolean) => void) => void;
          removeItems: (keys: string[], callback?: (error: Error | null, success: boolean) => void) => void;
          getKeys: (callback: (error: Error | null, keys: string[]) => void) => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        initDataUnsafe: {
          query_id?: string;
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          auth_date?: number;
          hash?: string;
        };
        initData: string;
        viewportHeight: number;
        viewportStableHeight: number;
        isExpanded: boolean;
        platform: string;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text?: string;
          }>;
        }, callback?: (buttonId: string) => void) => void;
        onEvent: (eventType: string, callback: () => void) => void;
        offEvent: (eventType: string, callback: () => void) => void;
      };
    };
  }
}

const DRAFT_STORAGE_KEY = 'tenant_form_draft_v2';

export default function TenantRequestForm() {
  const [language, setLanguage] = useState<Language>('en');
  const [formData, setFormData] = useState<TenantFormData>({
    children_count: 0,
    has_pets: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCustomCity, setShowCustomCity] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [isValidatingCity, setIsValidatingCity] = useState(false);
  const [cityValidationError, setCityValidationError] = useState<string | null>(null);
  
  const mainButtonCallbackRef = useRef<() => void>();
  const backButtonCallbackRef = useRef<() => void>();
  const saveDraftTimeoutRef = useRef<NodeJS.Timeout>();
  const customCityTimeoutRef = useRef<NodeJS.Timeout>();
  
  const t = getTranslations(language);
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  
  // ============================================
  // ИНИЦИАЛИЗАЦИЯ TELEGRAM WEBAPP
  // ============================================
  
  useEffect(() => {
    if (!tg) return;
    
    // Инициализация
    tg.ready();
    tg.expand();
    
    // Язык по умолчанию - английский (не переопределяем!)
    // setLanguage остаётся 'en', пользователь может переключить вручную
    
    // Применение темы
    applyTelegramTheme();
    
    // Загрузка черновика
    loadDraft();
    
    // Показываем BackButton
    tg.BackButton.show();
    
    return () => {
      // Cleanup
      if (saveDraftTimeoutRef.current) {
        clearTimeout(saveDraftTimeoutRef.current);
      }
    };
  }, [tg]);
  
  // ============================================
  // MAINBUTTON УПРАВЛЕНИЕ
  // ============================================
  
  useEffect(() => {
    if (!tg) return;
    
    const mainButton = tg.MainButton;
    const validation = validateTenantForm(formData, language);
    const progress = calculateFormProgress(formData);
    
    // Настройка MainButton
    mainButton.color = tg.themeParams.button_color || '#7C3AED';
    mainButton.textColor = tg.themeParams.button_text_color || '#FFFFFF';
    
    if (progress < 100) {
      mainButton.setText(
        language === 'ru' ? `Заполнено ${progress}%` : `Filled ${progress}%`
      );
      mainButton.disable();
    } else if (validation.isValid) {
      mainButton.setText(t.submit);
      mainButton.enable();
    } else {
      mainButton.setText(t.submit);
      mainButton.disable();
    }
    
    mainButton.show();
    
    // Обработчик клика MainButton
    const handleMainButtonClick = () => {
      handleSubmit();
    };
    
    mainButtonCallbackRef.current = handleMainButtonClick;
    mainButton.onClick(handleMainButtonClick);
    
    return () => {
      if (mainButtonCallbackRef.current) {
        mainButton.offClick(mainButtonCallbackRef.current);
      }
    };
  }, [formData, language, tg, t]);
  
  // ============================================
  // BACKBUTTON УПРАВЛЕНИЕ
  // ============================================
  
  useEffect(() => {
    if (!tg) return;
    
    const handleBackButtonClick = () => {
      if (hasUnsavedChanges) {
        tg.showPopup({
          title: t.save_draft_title,
          message: t.save_draft_message,
          buttons: [
            { id: 'save', type: 'default', text: t.save_draft_save },
            { id: 'discard', type: 'destructive', text: t.save_draft_discard },
            { id: 'cancel', type: 'cancel', text: t.save_draft_cancel }
          ]
        }, (buttonId) => {
          if (buttonId === 'save') {
            saveDraftNow();
            tg.HapticFeedback.notificationOccurred('success');
            tg.close();
          } else if (buttonId === 'discard') {
            clearDraft();
            tg.close();
          }
          // cancel - ничего не делаем
        });
      } else {
        tg.close();
      }
    };
    
    backButtonCallbackRef.current = handleBackButtonClick;
    tg.BackButton.onClick(handleBackButtonClick);
    
    return () => {
      if (backButtonCallbackRef.current) {
        tg.BackButton.offClick(backButtonCallbackRef.current);
      }
    };
  }, [hasUnsavedChanges, tg, t]);
  
  // ============================================
  // CLOSING CONFIRMATION
  // ============================================
  
  useEffect(() => {
    if (!tg) return;
    
    if (hasUnsavedChanges) {
      tg.enableClosingConfirmation();
    } else {
      tg.disableClosingConfirmation();
    }
  }, [hasUnsavedChanges, tg]);
  
  // ============================================
  // АВТОСОХРАНЕНИЕ ЧЕРНОВИКА
  // ============================================
  
  useEffect(() => {
    if (!tg || !formData.check_in_date) return;
    
    setHasUnsavedChanges(true);
    
    // Debounced save
    if (saveDraftTimeoutRef.current) {
      clearTimeout(saveDraftTimeoutRef.current);
    }
    
    saveDraftTimeoutRef.current = setTimeout(() => {
      saveDraftToCloud();
    }, 5000); // 5 секунд
    
  }, [formData, tg]);
  
  // ============================================
  // ФУНКЦИИ РАБОТЫ С ЧЕРНОВИКОМ
  // ============================================
  
  const loadDraft = useCallback(() => {
    if (!tg) return;
    
    tg.CloudStorage.getItem(DRAFT_STORAGE_KEY, (error, value) => {
      if (error || !value) return;
      
      try {
        const draft = JSON.parse(value);
        const savedAt = draft.savedAt || 0;
        const minutesAgo = (Date.now() - savedAt) / 1000 / 60;
        
        // Черновик актуален только в течение 1 часа
        if (minutesAgo < 60) {
          tg.showPopup({
            title: t.draft_found_title,
            message: `${t.draft_found_message}\n(${Math.round(minutesAgo)} мин. назад)`,
            buttons: [
              { id: 'restore', type: 'default', text: t.draft_restore },
              { id: 'new', type: 'destructive', text: t.draft_discard }
            ]
          }, (buttonId) => {
            if (buttonId === 'restore') {
              delete draft.savedAt;
              setFormData(draft);
              tg.HapticFeedback.notificationOccurred('success');
            } else {
              clearDraft();
            }
          });
        } else {
          // Старый черновик - удаляем
          clearDraft();
        }
      } catch (e) {
        console.error('Draft parse error:', e);
      }
    });
  }, [tg, t]);
  
  const saveDraftToCloud = useCallback(() => {
    if (!tg) return;
    
    const draft = {
      ...formData,
      savedAt: Date.now()
    };
    
    tg.CloudStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [formData, tg]);
  
  const saveDraftNow = () => {
    if (saveDraftTimeoutRef.current) {
      clearTimeout(saveDraftTimeoutRef.current);
    }
    saveDraftToCloud();
  };
  
  const clearDraft = useCallback(() => {
    if (!tg) return;
    tg.CloudStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasUnsavedChanges(false);
  }, [tg]);
  
  // ============================================
  // ПРИМЕНЕНИЕ ТЕМЫ TELEGRAM
  // ============================================
  
  const applyTelegramTheme = () => {
    if (!tg) return;
    
    const theme = tg.themeParams;
    const root = document.documentElement;
    
    root.style.setProperty('--tg-bg', theme.bg_color || '#ffffff');
    root.style.setProperty('--tg-text', theme.text_color || '#000000');
    root.style.setProperty('--tg-hint', theme.hint_color || '#999999');
    root.style.setProperty('--tg-link', theme.link_color || '#168acd');
    root.style.setProperty('--tg-button', theme.button_color || '#7C3AED');
    root.style.setProperty('--tg-button-text', theme.button_text_color || '#ffffff');
    root.style.setProperty('--tg-secondary-bg', theme.secondary_bg_color || '#f4f4f5');
  };
  
  // ============================================
  // ОБРАБОТЧИКИ ПОЛЕЙ
  // ============================================
  
  const handleFieldChange = (field: keyof TenantFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Если выбрали локацию
    if (field === 'location') {
      if (value === 'other') {
        setShowCustomCity(true);
      } else {
        setShowCustomCity(false);
        setCustomCity('');
        setCityValidationError(null);
      }
    }
    
    // Haptic feedback
    if (tg) {
      tg.HapticFeedback.selectionChanged();
    }
  };
  
  // Валидация кастомного города через Perplexity
  const validateCustomCity = async (cityName: string) => {
    if (!cityName || cityName.length < 2) return;
    
    setIsValidatingCity(true);
    setCityValidationError(null);
    
    if (tg) {
      tg.HapticFeedback.impactOccurred('light');
    }
    
    try {
      const response = await fetch('/api/validate-city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          city: cityName,
          language: language
        })
      });
      
      const result = await response.json();
      
      if (result.isValid) {
        // Город валиден
        setCityValidationError(null);
        setFormData(prev => ({ ...prev, location: `custom:${cityName}` }));
        
        if (tg) {
          tg.HapticFeedback.notificationOccurred('success');
        }
      } else {
        // Город не найден в Шри-Ланке
        setCityValidationError(result.message);
        setFormData(prev => ({ ...prev, location: undefined }));
        
        if (tg) {
          tg.HapticFeedback.notificationOccurred('error');
        }
      }
    } catch (error) {
      console.error('City validation error:', error);
      setCityValidationError(
        language === 'ru' 
          ? 'Ошибка проверки города. Попробуйте ещё раз.'
          : 'City validation error. Please try again.'
      );
      
      if (tg) {
        tg.HapticFeedback.notificationOccurred('error');
      }
    } finally {
      setIsValidatingCity(false);
    }
  };
  
  // Debounced валидация при вводе
  const handleCustomCityChange = (value: string) => {
    setCustomCity(value);
    
    // Debounce: валидируем через 1 секунду после последнего ввода
    if (customCityTimeoutRef.current) {
      clearTimeout(customCityTimeoutRef.current);
    }
    
    customCityTimeoutRef.current = setTimeout(() => {
      validateCustomCity(value);
    }, 1000);
  };
  
  const handleChoiceClick = (field: keyof TenantFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Haptic feedback
    if (tg) {
      tg.HapticFeedback.impactOccurred('light');
    }
  };
  
  // ============================================
  // ОТПРАВКА ФОРМЫ
  // ============================================
  
  const handleSubmit = async () => {
    if (!tg || isSubmitting) return;
    
    const mainButton = tg.MainButton;
    
    try {
      setIsSubmitting(true);
      
      // Haptic feedback
      tg.HapticFeedback.impactOccurred('medium');
      
      // MainButton loading
      mainButton.showProgress();
      mainButton.setText(t.submitting);
      
      // Валидация
      const validation = validateTenantForm(formData, language);
      if (!validation.isValid) {
        throw new Error('Validation failed');
      }
      
      // Отправка на сервер
      const response = await fetch('/api/tenant-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          form_language: language,
          initData: tg.initData
        })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Server error');
      }
      
      // Успех!
      mainButton.hideProgress();
      mainButton.setText(t.success);
      tg.HapticFeedback.notificationOccurred('success');
      
      // Очистка черновика
      clearDraft();
      
      // Показываем сообщение успеха
      tg.showPopup({
        title: t.success_title,
        message: t.success_message,
        buttons: [{ type: 'close', text: t.success_ok }]
      }, () => {
        // Закрываем WebApp через 1.5 секунды
        setTimeout(() => {
          tg.close();
        }, 1500);
      });
      
    } catch (error: any) {
      console.error('Submit error:', error);
      
      mainButton.hideProgress();
      mainButton.setText(t.submit);
      tg.HapticFeedback.notificationOccurred('error');
      
      // Показываем ошибку
      tg.showPopup({
        title: t.error_title,
        message: t.error_message,
        buttons: [{ type: 'close', text: t.error_retry }]
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // ============================================
  // ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ
  // ============================================
  
  const nightsCount = formData.check_in_date && formData.check_out_date
    ? calculateNights(formData.check_in_date, formData.check_out_date)
    : 0;
  
  const nightsText = nightsCount > 0 ? formatNights(nightsCount, language) : '';
  
  // Получение локаций для текущего языка
  const locations = getLocationsForLanguage(language);
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="tenant-form">
      {/* Header */}
      <header className="tenant-form__header">
        <h1 className="tenant-form__title">
          🏝️ {t.title}
        </h1>
        
        {/* Language Switcher */}
        <div className="language-switcher">
          <button
            className={language === 'ru' ? 'active' : ''}
            onClick={() => {
              setLanguage('ru');
              tg?.HapticFeedback.impactOccurred('light');
            }}
          >
            🇷🇺 RU
          </button>
          <button
            className={language === 'en' ? 'active' : ''}
            onClick={() => {
              setLanguage('en');
              tg?.HapticFeedback.impactOccurred('light');
            }}
          >
            🇬🇧 EN
          </button>
        </div>
      </header>
      
      {/* Divider */}
      <div className="divider" />
      
      {/* Form Content */}
      <div className="tenant-form__content">
        
        {/* Section: Location (FIRST!) */}
        <section className="form-section">
          <h2 className="section-title">📍 {t.location_title}</h2>
          <div className="section-card">
            <label className="input-label">{t.location_label}</label>
            <select
              value={showCustomCity ? 'other' : (formData.location?.startsWith('custom:') ? 'other' : formData.location || '')}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              className="input-field select-field"
            >
              <option value="">{t.location_placeholder}</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} — {loc.description}
                </option>
              ))}
              <option value="other">➕ {t.other_city}</option>
            </select>
            
            {/* Custom City Input */}
            {showCustomCity && (
              <div className="custom-city-input" style={{ marginTop: '16px' }}>
                <label className="input-label">{t.custom_city_label}</label>
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => handleCustomCityChange(e.target.value)}
                  placeholder={t.custom_city_placeholder}
                  className={`input-field ${cityValidationError ? 'input-error' : ''}`}
                  disabled={isValidatingCity}
                />
                
                {isValidatingCity && (
                  <div className="validation-status validating">
                    ⏳ {t.validating_city}
                  </div>
                )}
                
                {cityValidationError && (
                  <div className="validation-status error">
                    ❌ {cityValidationError}
                  </div>
                )}
                
                {!isValidatingCity && !cityValidationError && customCity && formData.location?.startsWith('custom:') && (
                  <div className="validation-status success">
                    ✅ {language === 'ru' ? 'Город подтверждён' : 'City confirmed'}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
        
        {/* Section: Dates */}
        <section className="form-section">
          <h2 className="section-title">📅 {t.dates_title}</h2>
          <div className="section-card">
            <label className="input-label">{t.check_in_label}</label>
            <input
              type="date"
              value={formData.check_in_date || ''}
              onChange={(e) => handleFieldChange('check_in_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input-field"
            />
            
            <label className="input-label">{t.check_out_label}</label>
            <input
              type="date"
              value={formData.check_out_date || ''}
              onChange={(e) => handleFieldChange('check_out_date', e.target.value)}
              min={formData.check_in_date || new Date().toISOString().split('T')[0]}
              className="input-field"
            />
            
            {nightsText && (
              <div className="duration-display">
                📊 {t.duration_label}: <strong>{nightsText}</strong>
              </div>
            )}
          </div>
        </section>
        
        {/* Section: Guests */}
        <section className="form-section">
          <h2 className="section-title">👥 {t.guests_title}</h2>
          <div className="section-card">
            <div className="input-row">
              <div className="input-group">
                <label className="input-label">{t.adults_label}</label>
                <select
                  value={formData.adults_count || 1}
                  onChange={(e) => handleFieldChange('adults_count', parseInt(e.target.value))}
                  className="input-field"
                >
                  {[...Array(30)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              
              <div className="input-group">
                <label className="input-label">{t.children_label}</label>
                <select
                  value={formData.children_count || 0}
                  onChange={(e) => handleFieldChange('children_count', parseInt(e.target.value))}
                  className="input-field"
                >
                  {[...Array(11)].map((_, i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <label className="input-label">{t.guest_type_label}</label>
            <div className="choice-buttons">
              {(['family', 'friends', 'couple', 'solo'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`choice-button ${formData.guest_type === type ? 'active' : ''}`}
                  onClick={() => handleChoiceClick('guest_type', type)}
                >
                  {type === 'family' && '👨‍👩‍👧'}
                  {type === 'friends' && '👥'}
                  {type === 'couple' && '💑'}
                  {type === 'solo' && '🙂'}
                  <span>{t[type]}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
        
        {/* Section: Purpose */}
        <section className="form-section">
          <h2 className="section-title">🎯 {t.purpose_title}</h2>
          <div className="section-card">
            <div className="choice-buttons">
              {(['vacation', 'work', 'event', 'other'] as const).map((purpose) => (
                <button
                  key={purpose}
                  type="button"
                  className={`choice-button ${formData.trip_purpose === purpose ? 'active' : ''}`}
                  onClick={() => handleChoiceClick('trip_purpose', purpose)}
                >
                  {purpose === 'vacation' && '🏖️'}
                  {purpose === 'work' && '💼'}
                  {purpose === 'event' && '🎉'}
                  {purpose === 'other' && '➕'}
                  <span>{t[purpose]}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
        
        {/* Section: Pets */}
        <section className="form-section">
          <h2 className="section-title">🐾 {t.pets_title}</h2>
          <div className="section-card">
            <p className="section-question">{t.pets_question}</p>
            <div className="choice-buttons choice-buttons--binary">
              <button
                type="button"
                className={`choice-button ${formData.has_pets === true ? 'active' : ''}`}
                onClick={() => handleChoiceClick('has_pets', true)}
              >
                {t.yes}
              </button>
              <button
                type="button"
                className={`choice-button ${formData.has_pets === false ? 'active' : ''}`}
                onClick={() => handleChoiceClick('has_pets', false)}
              >
                {t.no}
              </button>
            </div>
          </div>
        </section>
        
        {/* Section: Extension (optional) */}
        <section className="form-section">
          <h2 className="section-title">⏱️ {t.extension_title}</h2>
          <div className="section-card">
            <p className="section-question">{t.extension_question}</p>
            <div className="choice-buttons">
              {(['yes', 'no', 'dont_know'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`choice-button ${formData.extension_possible === option ? 'active' : ''}`}
                  onClick={() => handleChoiceClick('extension_possible', option)}
                >
                  {option === 'yes' && t.yes}
                  {option === 'no' && t.no}
                  {option === 'dont_know' && t.dont_know}
                </button>
              ))}
            </div>
          </div>
        </section>
        
        {/* Section: Additional */}
        <section className="form-section">
          <h2 className="section-title">💬 {t.additional_title}</h2>
          <div className="section-card">
            <textarea
              value={formData.additional_requirements || ''}
              onChange={(e) => handleFieldChange('additional_requirements', e.target.value)}
              placeholder={t.additional_placeholder}
              className="input-field textarea-field"
              rows={4}
              maxLength={1000}
            />
            <p className="hint-text">{language === 'ru' ? '(опционально)' : '(optional)'}</p>
          </div>
        </section>
        
        {/* Safe zone for MainButton */}
        <div style={{ height: '100px' }} />
        
      </div>
      
      {/* Footer hint */}
      <footer className="tenant-form__footer">
        <p className="filling-time">⏱️ {t.filling_time}</p>
      </footer>
    </div>
  );
}
