/**
 * API endpoint для работы с конкретным saved_property
 * DELETE /api/saved-properties/[id] - удаление объекта
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mcmzdscpuoxwneuzsanu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXpkc2NwdW94d25ldXpzYW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNDAxMjEsImV4cCI6MjA4NDkxNjEyMX0.FINUETJbgsos3tJdrJp_cyAPVOPxqpT_XjWIeFywPzw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Property ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`🗑️ Delete request for property: ${id}`);

    // Получаем userId из query params для проверки владельца
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Проверяем что объект принадлежит пользователю
    const { data: property, error: fetchError } = await supabase
      .from('saved_properties')
      .select('telegram_user_id, photos')
      .eq('id', id)
      .single();

    if (fetchError || !property) {
      console.error('❌ Property not found:', fetchError);
      return new Response(JSON.stringify({ error: 'Property not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Проверка владельца
    if (property.telegram_user_id.toString() !== userId) {
      console.error('❌ Unauthorized: User does not own this property');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Удаляем фото из Storage (опционально)
    // TODO: Implement photo deletion from storage if needed

    // Удаляем объект из БД
    const { error: deleteError } = await supabase
      .from('saved_properties')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Error deleting property:', deleteError);
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Property deleted: ${id}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Property deleted successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('❌ Delete API error:', err);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: err?.message || 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
