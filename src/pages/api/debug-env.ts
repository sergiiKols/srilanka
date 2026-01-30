/**
 * Debug endpoint to check environment variables
 */

import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const envCheck = {
    hasSupabaseUrl: !!import.meta.env.PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrlLength: import.meta.env.PUBLIC_SUPABASE_URL?.length || 0,
    supabaseKeyLength: import.meta.env.PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    // Показываем только первые 10 символов для безопасности
    supabaseUrlPreview: import.meta.env.PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'NOT SET',
  };

  return new Response(JSON.stringify(envCheck, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
