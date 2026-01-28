/**
 * API для управления конкретной заявкой
 * DELETE /api/admin/submissions/[id] - удалить заявку (soft delete)
 */

import type { APIRoute } from 'astro';
import { requireAdmin } from '../../../../lib/auth';
import { deleteSubmission, createLog } from '../../../../lib/db';

export const DELETE: APIRoute = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;
  
  try {
    const { id } = context.params;
    
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Submission ID required', code: 'MISSING_ID' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Удаляем (soft delete)
    const { data, error } = await deleteSubmission(id);
    
    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: error.message, code: 'DATABASE_ERROR' },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Логируем удаление
    if (data) {
      await createLog({
        form_id: data.form_id,
        submission_id: id,
        event_type: 'submit_success', // можно добавить 'submission_deleted' в enum
        metadata: { action: 'soft_delete' },
      });
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('DELETE /api/admin/submissions/[id] error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Internal error', code: 'INTERNAL_ERROR' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
