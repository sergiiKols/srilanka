/**
 * API для работы с конкретной формой
 * GET /api/admin/forms/[id] - получить форму
 * PUT /api/admin/forms/[id] - обновить форму
 * DELETE /api/admin/forms/[id] - удалить форму
 */

import type { APIRoute } from 'astro';
import { requireAdmin } from '../../../../lib/auth';

export const prerender = false;
import { getFormById, updateForm, deleteForm } from '../../../../lib/db';
import { FormConfigUpdateSchema } from '../../../../types/telegram.types';
import { createLog } from '../../../../lib/db';

// GET - получить форму
export const GET: APIRoute = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;

  try {
    const { id } = context.params;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Form ID required', code: 'MISSING_ID' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await getFormById(id);

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: error.message, code: 'DATABASE_ERROR' },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Form not found', code: 'NOT_FOUND' },
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('GET /api/admin/forms/[id] error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Internal error', code: 'INTERNAL_ERROR' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// PUT - обновить форму
export const PUT: APIRoute = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;

  try {
    const { id } = context.params;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Form ID required', code: 'MISSING_ID' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await context.request.json();

    // Валидация
    const validation = FormConfigUpdateSchema.safeParse(body);
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

    // Обновляем
    const { data, error } = await updateForm(id, validation.data);

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: error.message, code: 'DATABASE_ERROR' },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Логируем
    await createLog({
      form_id: id,
      event_type: 'form_updated',
      metadata: { updated_fields: Object.keys(validation.data) },
    });

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('PUT /api/admin/forms/[id] error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Internal error', code: 'INTERNAL_ERROR' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE - удалить форму
export const DELETE: APIRoute = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;

  try {
    const { id } = context.params;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Form ID required', code: 'MISSING_ID' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Логируем перед удалением
    await createLog({
      form_id: id,
      event_type: 'form_deleted',
    });

    const { error } = await deleteForm(id);

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: error.message, code: 'DATABASE_ERROR' },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('DELETE /api/admin/forms/[id] error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Internal error', code: 'INTERNAL_ERROR' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
