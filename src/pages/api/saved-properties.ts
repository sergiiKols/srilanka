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
      
      // Для персональной карты - все объекты активные
      // saved_properties содержит ТОЛЬКО активные объекты (удалённые в archived_properties)
      const { data, error } = await supabase
        .from('saved_properties')
        .select('*, video_url, video_thumbnail_url, video_duration, video_size')
        .eq('telegram_user_id', userIdNum)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading user properties:', error);
        return new Response(JSON.stringify({ error: error.message, details: error }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log(`✅ Found ${data?.length || 0} active properties for user ${userIdNum}`);

      // 🔄 POST-PROCESSING: Применяем fallback логику для price_period
      const processedData = (data || []).map(prop => {
        let pricePeriod = prop.price_period;
        
        // Если есть описание - проверяем ключевые слова
        if (prop.description || prop.raw_text) {
          const text = (prop.description || prop.raw_text || '').toLowerCase();
          const hasMonth = /месяц|month|monthly|\/month/i.test(text);
          const hasWeek = /неделю|неделя|week|weekly|\/week/i.test(text);
          const hasDay = /день|\/день|day|daily|\/day/i.test(text);
          
          // Override если нашли явный период в тексте
          if (hasMonth && pricePeriod !== 'month') {
            console.log(`🔄 API OVERRIDE [${prop.id}]: Found "месяц" in text, ${pricePeriod} → month`);
            pricePeriod = 'month';
          } else if (hasWeek && !hasMonth && pricePeriod === 'night') {
            console.log(`🔄 API OVERRIDE [${prop.id}]: Found "неделя" in text, night → week`);
            pricePeriod = 'week';
          }
          
          // Эвристика: цена > 300 USD без упоминания "день"
          if (prop.price && prop.price > 300 && pricePeriod === 'night' && !hasDay) {
            console.log(`🔄 API SMART OVERRIDE [${prop.id}]: Price ${prop.price} > 300 and no "день" → month`);
            pricePeriod = 'month';
          }
        }
        
        return {
          ...prop,
          price_period: pricePeriod
        };
      });

      return new Response(JSON.stringify({ data: processedData }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Иначе возвращаем все объекты (для админа)
    // saved_properties содержит ТОЛЬКО активные объекты
    // Удалённые объекты находятся в archived_properties
    console.log(`🔍 Querying all saved_properties (active only)...`);
    
    const { data, error } = await supabase
      .from('saved_properties')
      .select('*, video_url, video_thumbnail_url, video_duration, video_size')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('❌ Error loading all properties:', error);
      return new Response(JSON.stringify({ error: error.message, details: error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`✅ Found ${data?.length || 0} active properties`);

    return new Response(JSON.stringify({ 
      data: data || [],
      stats: { total: data?.length || 0 }
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
