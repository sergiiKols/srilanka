/**
 * Telegram Web App форма
 * React компонент с интеграцией Telegram Web App SDK
 */

import { useState, useEffect } from 'react';
import type { FormConfig, FormField, TelegramWebApp } from '../types/telegram.types';

interface TelegramFormProps {
  formId: string;
}

export default function TelegramForm({ formId }: TelegramFormProps) {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  // Инициализация Telegram Web App
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
      
      // Разворачиваем Web App
      tg.ready();
      tg.expand();
      
      // Настраиваем тему
      document.body.style.backgroundColor = tg.backgroundColor;
      
      // Показываем кнопку "Назад"
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        tg.close();
      });
      
      console.log('Telegram Web App initialized:', tg.initDataUnsafe);
    } else {
      console.warn('Telegram Web App SDK not found');
    }
  }, []);

  // Загружаем конфигурацию формы
  useEffect(() => {
    const loadForm = async () => {
      try {
        const response = await fetch(`/api/admin/forms/${formId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setFormConfig(result.data);
          
          // Инициализируем начальные значения
          const initialData: Record<string, any> = {};
          result.data.fields.forEach((field: FormField) => {
            initialData[field.id] = field.type === 'checkbox' ? false : '';
          });
          setFormData(initialData);
        } else {
          webApp?.showAlert('Не удалось загрузить форму');
        }
      } catch (error) {
        console.error('Failed to load form:', error);
        webApp?.showAlert('Ошибка загрузки формы');
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [formId, webApp]);

  // Валидация поля
  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return 'Это поле обязательно';
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Неверный формат email';
      }
    }

    if (field.type === 'tel' && value) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(value)) {
        return 'Неверный формат телефона';
      }
    }

    if (field.validation) {
      const { min, max, pattern, message } = field.validation;
      
      if (min !== undefined && String(value).length < min) {
        return message || `Минимум ${min} символов`;
      }
      
      if (max !== undefined && String(value).length > max) {
        return message || `Максимум ${max} символов`;
      }
      
      if (pattern && value) {
        const regex = new RegExp(pattern);
        if (!regex.test(String(value))) {
          return message || 'Неверный формат';
        }
      }
    }

    return null;
  };

  // Обработка изменения поля
  const handleFieldChange = (field: FormField, value: any) => {
    setFormData(prev => ({ ...prev, [field.id]: value }));
    
    // Убираем ошибку при изменении
    if (errors[field.id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field.id];
        return newErrors;
      });
    }

    // Haptic feedback
    webApp?.HapticFeedback.selectionChanged();
  };

  // Валидация всей формы
  const validateForm = (): boolean => {
    if (!formConfig) return false;

    const newErrors: Record<string, string> = {};
    
    formConfig.fields.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!webApp || !formConfig) {
      return;
    }

    // Валидация
    if (!validateForm()) {
      webApp.HapticFeedback.notificationOccurred('error');
      webApp.showAlert('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setSubmitting(true);
    webApp.MainButton.showProgress();

    try {
      const user = webApp.initDataUnsafe.user;
      
      if (!user) {
        webApp.showAlert('Не удалось получить данные пользователя');
        return;
      }

      const payload = {
        form_id: formId,
        user_id: String(user.id),
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        data: formData,
        initData: webApp.initData,
      };

      const response = await fetch('/api/telegram-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        // Успех
        webApp.HapticFeedback.notificationOccurred('success');
        
        // Отправляем данные обратно в бот (опционально)
        webApp.sendData(JSON.stringify({ status: 'ok', submission_id: result.submission_id }));
        
        // Показываем сообщение и закрываем через 2 секунды
        webApp.showAlert('Заявка успешно отправлена!', () => {
          webApp.close();
        });
      } else {
        // Ошибка
        webApp.HapticFeedback.notificationOccurred('error');
        webApp.showAlert(result.error || 'Не удалось отправить заявку');
      }
    } catch (error) {
      console.error('Submit error:', error);
      webApp.HapticFeedback.notificationOccurred('error');
      webApp.showAlert('Произошла ошибка при отправке');
    } finally {
      setSubmitting(false);
      webApp.MainButton.hideProgress();
    }
  };

  // Рендер поля формы
  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];
    const hasError = Boolean(error);

    const commonInputClasses = `
      w-full px-4 py-3 rounded-lg border
      ${hasError ? 'border-red-500' : 'border-gray-300'}
      focus:outline-none focus:ring-2
      ${hasError ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
      transition-colors
      text-base
    `;

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={commonInputClasses}
              disabled={submitting}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className={commonInputClasses}
              disabled={submitting}
            >
              <option value="">Выберите...</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value === true}
                onChange={(e) => handleFieldChange(field, e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              />
              <span className="ml-3 text-sm">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                  <span className="ml-3 text-sm">{option}</span>
                </label>
              ))}
            </div>
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              placeholder={field.placeholder}
              className={commonInputClasses}
              disabled={submitting}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка формы...</p>
        </div>
      </div>
    );
  }

  if (!formConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <p className="text-red-600 text-lg">Форма не найдена</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-2">{formConfig.title}</h1>
        {formConfig.description && (
          <p className="text-gray-600 mb-6">{formConfig.description}</p>
        )}

        <form onSubmit={handleSubmit}>
          {formConfig.fields.map(field => renderField(field))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base"
          >
            {submitting ? 'Отправка...' : formConfig.submit_text}
          </button>
        </form>
      </div>
    </div>
  );
}
