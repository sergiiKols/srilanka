/**
 * API endpoint для получения saved_properties
 * GET /api/saved-properties?userId=123&token=xxx - для конкретного пользователя (персональная карта)
 * GET /api/saved-properties - все объекты (для админа)
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL || 'https://mcmzdscpuoxwneuzsanu.supabase.co',
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXpkc2NwdW94d25ldXpzYW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNDAxMjEsImV4cCI6MjA4NDkxNjEyMX0.FINUETJbgsos3tJdrJp_cyAPVOPxqpT_XjWIeFywPzw'
);

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const userId = url.searchParams.get('userId');
    const token = url.searchParams.get('token');

    // Если указан userId - возвращаем только его объекты (персональная карта)
    if (userId) {
      // TODO: Проверить token для безопасности
      // Пока что возвращаем данные без проверки токена
      
      const { data, error } = await supabase
        .from('saved_properties')
        .select('*')
        .eq('telegram_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading user properties:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ data: data || [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Иначе возвращаем все объекты (для админа)
    const { data, error } = await supabase
      .from('saved_properties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Error loading all properties:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ data: data || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('API error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
