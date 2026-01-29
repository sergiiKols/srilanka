/**
 * API для управления формами
 * GET /api/admin/forms - список всех форм
 * POST /api/admin/forms - создать новую форму
 */

import type { APIRoute } from 'astro';
import { requireAdmin, getCurrentUser } from '../../../lib/auth';

export const prerender = false;
import { getAllForms, createForm } from '../../../lib/db';
import { FormConfigCreateSchema } from '../../../types/telegram.types';
import { createLog } from '../../../lib/db';

// GET - список форм
export const GET: APIRoute = async (context) => {
  // Проверка прав админа
  const authError = await requireAdmin(context);
  if (authError) return authError;

  try {
    const url = new URL(context.request.url);
    const activeOnly = url.searchParams.get('active') === 'true';

    const { data, error } = await getAllForms(activeOnly);

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: error.message,
            code: 'DATABASE_ERROR',
          },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('GET /api/admin/forms error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST - создать форму
export const POST: APIRoute = async (context) => {
  // Проверка прав админа
  const authError = await requireAdmin(context);
  if (authError) return authError;

  try {
    const user = await getCurrentUser(context);
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'User not found', code: 'USER_NOT_FOUND' },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await context.request.json();

    // Валидация данных
    const validation = FormConfigCreateSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: validation.error.errors,
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Создаем форму
    const { data, error } = await createForm(validation.data, user.id);

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: error.message,
            code: 'DATABASE_ERROR',
          },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Логируем создание
    await createLog({
      form_id: data.id,
      event_type: 'form_created',
      metadata: { created_by: user.id },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('POST /api/admin/forms error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
