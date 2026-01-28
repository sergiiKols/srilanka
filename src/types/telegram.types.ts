/**
 * Типы для Telegram Web App форм
 */

import { z } from 'zod';

// ================================================
// ТИПЫ ПОЛЕЙ ФОРМЫ
// ================================================

export type FormFieldType = 
  | 'text'
  | 'email'
  | 'tel'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'number'
  | 'date';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // для select, radio, checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// ================================================
// КОНФИГУРАЦИЯ ФОРМЫ
// ================================================

export interface FormConfig {
  id: string;
  title: string;
  description?: string;
  submit_text: string;
  fields: FormField[];
  bot_token_encrypted?: string;
  chat_id?: string;
  message_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  total_submissions: number;
  last_submission_at?: string;
}

// ================================================
// ЗАЯВКА (SUBMISSION)
// ================================================

export interface FormSubmission {
  id: string;
  form_id: string;
  user_id: string; // Telegram user_id
  first_name?: string;
  last_name?: string;
  username?: string;
  data: Record<string, any>; // field_id -> value
  telegram_message_id?: number;
  telegram_chat_id?: string;
  status: 'received' | 'processing' | 'sent' | 'error';
  error_message?: string;
  created_at: string;
  processed_at?: string;
  ip_address?: string;
  user_agent?: string;
}

// ================================================
// ЛОГИ
// ================================================

export type FormLogEventType =
  | 'form_created'
  | 'form_updated'
  | 'form_deleted'
  | 'submit_start'
  | 'submit_success'
  | 'validation_error'
  | 'telegram_send_error'
  | 'telegram_send_success'
  | 'rate_limit_exceeded';

export interface FormLog {
  id: string;
  form_id?: string;
  submission_id?: string;
  event_type: FormLogEventType;
  error_message?: string;
  error_code?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ================================================
// TELEGRAM WEB APP ТИПЫ
// ================================================

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      photo_url?: string;
    };
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }, callback?: (buttonId?: string) => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// ================================================
// ZOD СХЕМЫ ДЛЯ ВАЛИДАЦИИ
// ================================================

// Схема для поля формы
export const FormFieldSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'radio', 'number', 'date']),
  label: z.string().min(1),
  placeholder: z.string().optional(),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    message: z.string().optional(),
  }).optional(),
});

// Схема для создания/обновления формы
export const FormConfigCreateSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  submit_text: z.string().default('Отправить'),
  fields: z.array(FormFieldSchema).min(1, 'Добавьте хотя бы одно поле'),
  bot_token_encrypted: z.string().optional(),
  chat_id: z.string().optional(),
  message_template: z.string().min(1),
  is_active: z.boolean().default(true),
});

export const FormConfigUpdateSchema = FormConfigCreateSchema.partial();

// Схема для сабмита формы
export const FormSubmissionSchema = z.object({
  form_id: z.string().uuid(),
  user_id: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  data: z.record(z.any()),
  initData: z.string(), // для проверки подписи
});

// ================================================
// API ТИПЫ
// ================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

export interface FormSubmitPayload {
  form_id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  data: Record<string, any>;
  initData: string;
}

export interface FormSubmitResponse {
  success: boolean;
  submission_id?: string;
  telegram_message_id?: number;
  error?: string;
  code?: string;
}

// ================================================
// ADMIN ТИПЫ
// ================================================

export interface FormStats {
  total_forms: number;
  active_forms: number;
  total_submissions: number;
  submissions_today: number;
  submissions_this_week: number;
  submissions_this_month: number;
}

export interface SubmissionFilters {
  form_id?: string;
  user_id?: string;
  status?: FormSubmission['status'];
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: 'created_at' | 'status';
  order?: 'asc' | 'desc';
}

export interface SubmissionsExportOptions {
  form_id: string;
  format: 'csv' | 'json' | 'xlsx';
  filters?: SubmissionFilters;
}
