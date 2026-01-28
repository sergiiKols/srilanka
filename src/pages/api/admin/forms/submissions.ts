/**
 * API для получения всех заявок со всех форм
 * GET /api/admin/forms/submissions - список заявок с фильтрацией
 */

import type { APIRoute } from 'astro';
import { requireAdmin } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';
import { convertSubmissionsToCSV } from '../../../../lib/telegram';

export const GET: APIRoute = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;

  try {
    const url = new URL(context.request.url);
    const formId = url.searchParams.get('form_id');
    const status = url.searchParams.get('status');
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const exportFormat = url.searchParams.get('export');

    const offset = (page - 1) * limit;

    // Базовый запрос
    let query = supabase
      .from('form_submissions')
      .select('*, form_configs(id, title)', { count: 'exact' })
      .neq('status', 'deleted') // Исключаем удаленные
      .order('created_at', { ascending: false });

    // Фильтры
    if (formId) {
      query = query.eq('form_id', formId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (dateFrom) {
      query = query.gte('created_at', new Date(dateFrom).toISOString());
    }

    if (dateTo) {
      // Добавляем один день чтобы включить весь день
      const toDate = new Date(dateTo);
      toDate.setDate(toDate.getDate() + 1);
      query = query.lt('created_at', toDate.toISOString());
    }

    // CSV экспорт
    if (exportFormat === 'csv') {
      const { data: allSubmissions, error } = await query;

      if (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: { message: error.message, code: 'DATABASE_ERROR' },
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const csv = convertSubmissionsToCSV(allSubmissions || []);
      const filename = `all_submissions_${new Date().toISOString().split('T')[0]}.csv`;

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Пагинация
    query = query.range(offset, offset + limit - 1);

    const { data: submissions, error, count } = await query;

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: error.message, code: 'DATABASE_ERROR' },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return new Response(
      JSON.stringify({
        success: true,
        data: submissions,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: totalPages,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('GET /api/admin/forms/submissions error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Internal error', code: 'INTERNAL_ERROR' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
