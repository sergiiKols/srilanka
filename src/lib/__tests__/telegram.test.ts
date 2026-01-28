/**
 * Unit тесты для критичных функций telegram.ts
 * Запуск: npm test (требуется настройка test runner)
 */

import { describe, it, expect } from 'vitest';
import {
  verifyTelegramWebAppData,
  encryptBotToken,
  decryptBotToken,
  validateFormData,
  convertSubmissionsToCSV,
  formatMessageTemplate,
} from '../telegram';
import type { FormSubmission } from '../../types/telegram.types';

describe('Telegram Utilities', () => {
  describe('encryptBotToken / decryptBotToken', () => {
    it('должен корректно шифровать и дешифровать токен', () => {
      const token = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';
      const secret = 'test-secret-key';
      
      const encrypted = encryptBotToken(token, secret);
      expect(encrypted).not.toBe(token);
      expect(encrypted.length).toBeGreaterThan(0);
      
      const decrypted = decryptBotToken(encrypted, secret);
      expect(decrypted).toBe(token);
    });

    it('должен возвращать разные результаты для разных секретов', () => {
      const token = '123456:ABC-DEF';
      const secret1 = 'secret1';
      const secret2 = 'secret2';
      
      const encrypted1 = encryptBotToken(token, secret1);
      const encrypted2 = encryptBotToken(token, secret2);
      
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('validateFormData', () => {
    it('должен валидировать обязательные поля', () => {
      const fields = [
        { id: 'name', type: 'text', required: true },
        { id: 'email', type: 'email', required: false },
      ];

      const validData = { name: 'John', email: 'john@example.com' };
      const result = validateFormData(validData, fields);
      
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('должен находить ошибки в обязательных полях', () => {
      const fields = [
        { id: 'name', type: 'text', required: true },
      ];

      const invalidData = { name: '' };
      const result = validateFormData(invalidData, fields);
      
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBeDefined();
    });

    it('должен валидировать email формат', () => {
      const fields = [
        { id: 'email', type: 'email', required: false },
      ];

      const invalidEmail = { email: 'not-an-email' };
      const result = validateFormData(invalidEmail, fields);
      
      expect(result.valid).toBe(false);
      expect(result.errors.email).toContain('email');
    });

    it('должен валидировать минимальную длину', () => {
      const fields = [
        { 
          id: 'password', 
          type: 'text', 
          required: true,
          validation: { min: 8 }
        },
      ];

      const shortPassword = { password: '123' };
      const result = validateFormData(shortPassword, fields);
      
      expect(result.valid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });
  });

  describe('formatMessageTemplate', () => {
    it('должен заменять плейсхолдеры пользователя', () => {
      const template = 'Новая заявка от {firstName} {lastName} (@{username})';
      const submission = {
        first_name: 'John',
        last_name: 'Doe',
        username: 'johndoe',
      };
      const data = {};

      const result = formatMessageTemplate(template, submission, data);
      
      expect(result).toBe('Новая заявка от John Doe (@johndoe)');
    });

    it('должен заменять плейсхолдеры полей формы', () => {
      const template = 'Email: {email}, Phone: {phone}';
      const submission = { first_name: 'John' };
      const data = {
        email: 'john@example.com',
        phone: '+1234567890',
      };

      const result = formatMessageTemplate(template, submission, data);
      
      expect(result).toContain('john@example.com');
      expect(result).toContain('+1234567890');
    });

    it('должен заменять отсутствующие значения на N/A', () => {
      const template = 'Name: {firstName}, Email: {email}';
      const submission = {};
      const data = {};

      const result = formatMessageTemplate(template, submission, data);
      
      expect(result).toContain('N/A');
    });
  });

  describe('convertSubmissionsToCSV', () => {
    it('должен генерировать CSV с заголовками', () => {
      const submissions: FormSubmission[] = [
        {
          id: '1',
          form_id: 'form-1',
          user_id: '123',
          first_name: 'John',
          last_name: 'Doe',
          username: 'johndoe',
          data: { email: 'john@example.com', message: 'Hello' },
          status: 'received',
          created_at: new Date().toISOString(),
        },
      ];

      const csv = convertSubmissionsToCSV(submissions);
      
      expect(csv).toContain('ID');
      expect(csv).toContain('Дата');
      expect(csv).toContain('User ID');
      expect(csv).toContain('email');
      expect(csv).toContain('message');
    });

    it('должен экранировать кавычки в CSV', () => {
      const submissions: FormSubmission[] = [
        {
          id: '1',
          form_id: 'form-1',
          user_id: '123',
          first_name: 'John "The Boss"',
          last_name: 'Doe',
          data: {},
          status: 'received',
          created_at: new Date().toISOString(),
        },
      ];

      const csv = convertSubmissionsToCSV(submissions);
      
      expect(csv).toContain('""'); // Экранированные кавычки
    });

    it('должен возвращать пустую строку для пустого массива', () => {
      const csv = convertSubmissionsToCSV([]);
      expect(csv).toBe('');
    });
  });

  describe('verifyTelegramWebAppData', () => {
    // Note: Для полноценного теста нужны реальные данные от Telegram
    it('должен возвращать false для невалидных данных', () => {
      const invalidData = 'invalid_data';
      const botToken = '123456:ABC-DEF';
      
      const result = verifyTelegramWebAppData(invalidData, botToken);
      
      expect(result).toBe(false);
    });

    it('должен возвращать false если hash отсутствует', () => {
      const dataWithoutHash = 'query_id=123&user=test';
      const botToken = '123456:ABC-DEF';
      
      const result = verifyTelegramWebAppData(dataWithoutHash, botToken);
      
      expect(result).toBe(false);
    });
  });
});
