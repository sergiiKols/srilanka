/**
 * Database queries для работы с Telegram формами
 */

import { supabase } from './supabase';
import type { FormConfig, FormSubmission, FormLog, SubmissionFilters } from '../types/telegram.types';

// ================================================
// ФОРМЫ (FORMS)
// ================================================

/**
 * Получить все формы
 */
export async function getAllForms(activeOnly: boolean = false) {
  let query = supabase
    .from('form_configs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (activeOnly) {
    query = query.eq('is_active', true);
  }
  
  return await query;
}

/**
 * Получить форму по ID
 */
export async function getFormById(id: string) {
  return await supabase
    .from('form_configs')
    .select('*')
    .eq('id', id)
    .single();
}

/**
 * Создать новую форму
 */
export async function createForm(form: Partial<FormConfig>, userId: string) {
  return await supabase
    .from('form_configs')
    .insert([{
      ...form,
      created_by: userId,
    }])
    .select()
    .single();
}

/**
 * Обновить форму
 */
export async function updateForm(id: string, updates: Partial<FormConfig>) {
  return await supabase
    .from('form_configs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

/**
 * Удалить форму
 */
export async function deleteForm(id: string) {
  return await supabase
    .from('form_configs')
    .delete()
    .eq('id', id);
}

// ================================================
// ЗАЯВКИ (SUBMISSIONS)
// ================================================

/**
 * Получить заявки с фильтрацией
 */
export async function getSubmissions(filters: SubmissionFilters = {}) {
  const {
    form_id,
    user_id,
    status,
    date_from,
    date_to,
    limit = 50,
    offset = 0,
    sort = 'created_at',
    order = 'desc',
  } = filters;
  
  let query = supabase
    .from('form_submissions')
    .select('*', { count: 'exact' })
    // Исключаем удаленные заявки по умолчанию (если не запрашивается явно)
    .neq('status', 'deleted');
  
  if (form_id) {
    query = query.eq('form_id', form_id);
  }
  
  if (user_id) {
    query = query.eq('user_id', user_id);
  }
  
  if (status) {
    // Если явно запрошен статус 'deleted', покажем их
    query = query.eq('status', status);
  }
  
  if (date_from) {
    query = query.gte('created_at', date_from);
  }
  
  if (date_to) {
    query = query.lte('created_at', date_to);
  }
  
  query = query
    .order(sort, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);
  
  return await query;
}

/**
 * Получить заявку по ID
 */
export async function getSubmissionById(id: string) {
  return await supabase
    .from('form_submissions')
    .select('*')
    .eq('id', id)
    .single();
}

/**
 * Создать новую заявку
 */
export async function createSubmission(submission: Partial<FormSubmission>) {
  return await supabase
    .from('form_submissions')
    .insert([submission])
    .select()
    .single();
}

/**
 * Обновить статус заявки
 */
export async function updateSubmissionStatus(
  id: string,
  status: FormSubmission['status'],
  errorMessage?: string,
  telegramMessageId?: number
) {
  return await supabase
    .from('form_submissions')
    .update({
      status,
      error_message: errorMessage,
      telegram_message_id: telegramMessageId,
      processed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
}

/**
 * Удалить заявку (soft delete - меняем статус на deleted)
 */
export async function deleteSubmission(id: string) {
  return await supabase
    .from('form_submissions')
    .update({ status: 'deleted' })
    .eq('id', id)
    .select()
    .single();
}

// ================================================
// СТАТИСТИКА
// ================================================

/**
 * Получить статистику по формам
 */
export async function getFormsStats() {
  const { data: forms, error: formsError } = await supabase
    .from('form_configs')
    .select('id, is_active, total_submissions');
  
  if (formsError || !forms) {
    return { error: formsError };
  }
  
  const totalForms = forms.length;
  const activeForms = forms.filter(f => f.is_active).length;
  const totalSubmissions = forms.reduce((sum, f) => sum + (f.total_submissions || 0), 0);
  
  // Получаем статистику по датам
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const { count: submissionsToday } = await supabase
    .from('form_submissions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today);
  
  const { count: submissionsThisWeek } = await supabase
    .from('form_submissions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo);
  
  const { count: submissionsThisMonth } = await supabase
    .from('form_submissions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', monthAgo);
  
  return {
    data: {
      total_forms: totalForms,
      active_forms: activeForms,
      total_submissions: totalSubmissions,
      submissions_today: submissionsToday || 0,
      submissions_this_week: submissionsThisWeek || 0,
      submissions_this_month: submissionsThisMonth || 0,
    },
  };
}

/**
 * Получить статистику по конкретной форме
 */
export async function getFormStats(formId: string) {
  const { data: submissions, error } = await supabase
    .from('form_submissions')
    .select('status, created_at')
    .eq('form_id', formId);
  
  if (error || !submissions) {
    return { error };
  }
  
  const total = submissions.length;
  const received = submissions.filter(s => s.status === 'received').length;
  const sent = submissions.filter(s => s.status === 'sent').length;
  const errors = submissions.filter(s => s.status === 'error').length;
  
  return {
    data: {
      total,
      received,
      sent,
      errors,
      success_rate: total > 0 ? ((sent / total) * 100).toFixed(1) : '0',
    },
  };
}

// ================================================
// ЛОГИ
// ================================================

/**
 * Создать лог
 */
export async function createLog(log: Partial<FormLog>) {
  return await supabase
    .from('form_logs')
    .insert([log]);
}

/**
 * Получить логи по форме
 */
export async function getFormLogs(formId: string, limit: number = 100) {
  return await supabase
    .from('form_logs')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false })
    .limit(limit);
}

// ================================================
// RATE LIMITING
// ================================================

/**
 * Проверить rate limit через БД
 */
export async function checkRateLimitDB(formId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_form_rate_limit', {
    p_form_id: formId,
    p_user_id: userId,
    p_max_attempts: 5,
    p_window_seconds: 300,
  });
  
  if (error) {
    console.error('Rate limit check error:', error);
    return false;
  }
  
  return data === true;
}
