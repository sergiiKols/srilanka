/**
 * API для получения общей статистики
 * GET /api/admin/stats
 */

import type { APIRoute } from 'astro';
import { requireAdmin } from '../../../lib/auth';
import { getFormsStats } from '../../../lib/db';

export const GET: APIRoute = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;
  
  try {
    const { data, error } = await getFormsStats();
    
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
      JSON.stringify({
        success: true,
        data,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('GET /api/admin/stats error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Internal error', code: 'INTERNAL_ERROR' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
