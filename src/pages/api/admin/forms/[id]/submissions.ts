/**
 * API для работы с заявками конкретной формы
 * GET /api/admin/forms/[id]/submissions - список заявок с фильтрацией
 * GET /api/admin/forms/[id]/submissions?export=csv - экспорт в CSV
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { requireAdmin } from '../../../../../lib/auth';
import { getSubmissions, getFormStats } from '../../../../../lib/db';
import { convertSubmissionsToCSV } from '../../../../../lib/telegram';
import type { SubmissionFilters } from '../../../../../types/telegram.types';

export const GET: APIRoute = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;

  try {
    const { id } = context.params;
    const url = new URL(context.request.url);

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Form ID required', code: 'MISSING_ID' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Проверка на экспорт
    const exportFormat = url.searchParams.get('export');

    // Фильтры
    const filters: SubmissionFilters = {
      form_id: id,
      user_id: url.searchParams.get('user_id') || undefined,
      status: url.searchParams.get('status') as any || undefined,
      date_from: url.searchParams.get('date_from') || undefined,
      date_to: url.searchParams.get('date_to') || undefined,
      limit: parseInt(url.searchParams.get('limit') || '50'),
      offset: parseInt(url.searchParams.get('offset') || '0'),
      sort: url.searchParams.get('sort') as any || 'created_at',
      order: url.searchParams.get('order') as any || 'desc',
    };

    // Если запрос на экспорт
    if (exportFormat === 'csv') {
      // Получаем все заявки без лимита
      const { data, error } = await getSubmissions({
        ...filters,
        limit: 10000, // максимум для экспорта
        offset: 0,
      });

      if (error || !data) {
        return new Response(
          JSON.stringify({
            success: false,
            error: { message: error?.message || 'No data', code: 'EXPORT_ERROR' },
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const csv = convertSubmissionsToCSV(data);
      const filename = `submissions_${id}_${new Date().toISOString().split('T')[0]}.csv`;

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Обычный запрос с пагинацией
    const { data, error, count } = await getSubmissions(filters);

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: error.message, code: 'DATABASE_ERROR' },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Получаем статистику
    const statsResult = await getFormStats(id);

    return new Response(
      JSON.stringify({
        success: true,
        data,
        count,
        stats: statsResult.data || null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('GET /api/admin/forms/[id]/submissions error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Internal error', code: 'INTERNAL_ERROR' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
