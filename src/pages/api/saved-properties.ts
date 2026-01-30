/**
 * API endpoint для получения saved_properties
 * GET /api/saved-properties?userId=123&token=xxx - для конкретного пользователя (персональная карта)
 * GET /api/saved-properties - все объекты (для админа)
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials (same as in src/lib/supabase.ts)
const supabaseUrl = 'https://mcmzdscpuoxwneuzsanu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXpkc2NwdW94d25ldXpzYW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNDAxMjEsImV4cCI6MjA4NDkxNjEyMX0.FINUETJbgsos3tJdrJp_cyAPVOPxqpT_XjWIeFywPzw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const userId = url.searchParams.get('userId');
    const token = url.searchParams.get('token');

    console.log('📥 API Request:', { userId, token });

    // Если указан userId - возвращаем только его объекты (персональная карта)
    if (userId) {
      // TODO: Проверить token для безопасности
      // Пока что возвращаем данные без проверки токена
      
      // Преобразуем userId в число для BIGINT
      const userIdNum = parseInt(userId, 10);
      
      if (isNaN(userIdNum)) {
        console.error('❌ Invalid userId:', userId);
        return new Response(JSON.stringify({ error: 'Invalid userId format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('🔍 Querying saved_properties for user:', userIdNum);
      
      // Для персональной карты показываем только НЕ удалённые объекты
      const { data, error } = await supabase
        .from('saved_properties')
        .select('*')
        .eq('telegram_user_id', userIdNum)
        .is('deleted_at', null)  // ✅ Только активные объекты
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading user properties:', error);
        return new Response(JSON.stringify({ error: error.message, details: error }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log(`✅ Found ${data?.length || 0} active properties for user ${userIdNum}`);

      return new Response(JSON.stringify({ data: data || [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Иначе возвращаем все объекты (для админа)
    // Проверяем параметр showDeleted для отображения удалённых
    const showDeleted = url.searchParams.get('showDeleted') === 'true';
    
    console.log(`🔍 Querying all saved_properties (showDeleted: ${showDeleted})...`);
    
    let query = supabase
      .from('saved_properties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    // По умолчанию показываем только активные
    if (!showDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error loading all properties:', error);
      return new Response(JSON.stringify({ error: error.message, details: error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const activeCount = data?.filter(p => !p.deleted_at).length || 0;
    const deletedCount = data?.filter(p => p.deleted_at).length || 0;
    
    console.log(`✅ Found ${data?.length || 0} total properties (${activeCount} active, ${deletedCount} deleted)`);

    return new Response(JSON.stringify({ 
      data: data || [],
      stats: { active: activeCount, deleted: deletedCount, total: data?.length || 0 }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('❌ API error:', err);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: err?.message || 'Unknown error',
      stack: err?.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
