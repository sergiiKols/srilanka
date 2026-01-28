/**
 * FormPreview - Live preview формы
 * Показывает как форма будет выглядеть в Telegram Web App
 */

import { useState } from 'react';
import type { FormField } from '../../types/telegram.types';

interface FormPreviewProps {
  fields: FormField[];
  title?: string;
  description?: string;
  submitText?: string;
}

export default function FormPreview({ 
  fields, 
  title = 'Предпросмотр формы',
  description,
  submitText = 'Отправить'
}: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleChange = (fieldId: string, value: any) => {
    setFormData({ ...formData, [fieldId]: value });
  };

  const renderField = (field: FormField) => {
    const commonClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={commonClasses}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={commonClasses}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            required={field.required}
            className={commonClasses}
          >
            <option value="">Выберите...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  required={field.required}
                  className="text-blue-600"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => handleChange(field.id, e.target.checked)}
              required={field.required}
              className="rounded text-blue-600"
            />
            <span className="text-sm">{field.label}</span>
          </label>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={commonClasses}
          />
        );
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Telegram Header Simulation */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button className="text-white hover:bg-blue-600 rounded p-1">
              ←
            </button>
            <span className="font-semibold">{title}</span>
          </div>
          <button className="text-white hover:bg-blue-600 rounded p-1">
            ⋮
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {description && (
          <p className="text-sm text-gray-600 mb-4">{description}</p>
        )}

        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Поля формы не добавлены</p>
            <p className="text-xs mt-1">Используйте FormBuilder для добавления полей</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {fields.map((field) => (
              <div key={field.id} className="space-y-1">
                {field.type !== 'checkbox' && (
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
                {renderField(field)}
                {field.validation?.message && (
                  <p className="text-xs text-gray-500">{field.validation.message}</p>
                )}
              </div>
            ))}
          </form>
        )}
      </div>

      {/* Telegram Bottom Button */}
      {fields.length > 0 && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <button
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            disabled
          >
            {submitText}
          </button>
          <p className="text-xs text-center text-gray-500 mt-2">
            Это предпросмотр. Форма не отправляется.
          </p>
        </div>
      )}
    </div>
  );
}
