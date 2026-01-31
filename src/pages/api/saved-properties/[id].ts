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

    // Archive logic in TypeScript (no SQL function needed)
    console.log(`📦 Archiving property in TypeScript... ID: ${id}, UserID: ${userId}`);
    
    // First check if property exists at all (without user check)
    const { data: existsCheck, error: existsError } = await supabase
      .from('saved_properties')
      .select('id, telegram_user_id')
      .eq('id', id)
      .maybeSingle();
    
    if (existsError) {
      console.error('❌ Error checking property existence:', existsError);
      return new Response(JSON.stringify({ 
        error: 'Database error',
        details: existsError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!existsCheck) {
      console.warn('⚠️ Property not found in database (already deleted?):', id);
      // Check if it's already archived
      const { data: archivedCheck } = await supabase
        .from('archived_properties')
        .select('id, archived_at')
        .eq('id', id)
        .maybeSingle();
      
      if (archivedCheck) {
        console.log('✅ Property already archived:', archivedCheck);
        return new Response(JSON.stringify({ 
          success: true,
          archived: true,
          message: 'Property already archived',
          alreadyArchived: true
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Property not found',
        message: 'Property does not exist'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check ownership
    if (existsCheck.telegram_user_id !== parseInt(userId)) {
      console.error('❌ Unauthorized delete attempt:', {
        propertyId: id,
        propertyOwner: existsCheck.telegram_user_id,
        requestUser: userId
      });
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        message: 'You do not own this property'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get full property data
    const { data: fullProperty, error: fullFetchError } = await supabase
      .from('saved_properties')
      .select('*')
      .eq('id', id)
      .single();

    if (fullFetchError || !fullProperty) {
      console.error('❌ Property fetch error:', fullFetchError);
      return new Response(JSON.stringify({ 
        error: 'Property fetch failed',
        details: fullFetchError?.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Convert amenities from jsonb to text[]
    console.log('🔄 Converting amenities:', typeof fullProperty.amenities);
    let amenitiesArray = null;
    if (fullProperty.amenities) {
      if (Array.isArray(fullProperty.amenities)) {
        amenitiesArray = fullProperty.amenities;
      } else if (typeof fullProperty.amenities === 'object') {
        amenitiesArray = Object.values(fullProperty.amenities);
      }
    }
    console.log('✅ Amenities converted:', amenitiesArray);

    // Calculate days active
    const daysActive = Math.floor(
      (Date.now() - new Date(fullProperty.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    console.log('📅 Days active calculated:', daysActive);

    // Insert into archived_properties
    console.log('📦 Inserting into archived_properties...');
    const { error: archiveError } = await supabase
      .from('archived_properties')
      .insert({
        id: fullProperty.id,
        telegram_user_id: fullProperty.telegram_user_id,
        latitude: fullProperty.latitude,
        longitude: fullProperty.longitude,
        title: fullProperty.title,
        description: fullProperty.description,
        raw_text: fullProperty.raw_text,
        property_type: fullProperty.property_type,
        photos: fullProperty.photos,
        price: fullProperty.price,
        currency: fullProperty.currency,
        bedrooms: fullProperty.bedrooms,
        bathrooms: fullProperty.bathrooms,
        amenities: amenitiesArray,
        contact_phone: fullProperty.contact_phone,
        contact_name: fullProperty.contact_name,
        source_type: fullProperty.source_type,
        forward_from_chat_id: fullProperty.forward_from_chat_id,
        forward_from_chat_title: fullProperty.forward_from_chat_title,
        forward_from_username: fullProperty.forward_from_username,
        forward_from_message_id: fullProperty.forward_from_message_id,
        forward_date: fullProperty.forward_date,
        google_maps_url: fullProperty.google_maps_url,
        original_created_at: fullProperty.created_at,
        original_updated_at: fullProperty.updated_at,
        archived_at: new Date().toISOString(),
        archived_by: parseInt(userId),
        archive_reason: 'user_deleted',
        days_active: daysActive,
        views_count: 0,
        clicks_count: 0,
        can_restore: true
      });

    if (archiveError) {
      console.error('❌ Error archiving:', archiveError);
      return new Response(JSON.stringify({ 
        error: 'Failed to archive property',
        details: archiveError.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete from saved_properties
    const { error: deleteError } = await supabase
      .from('saved_properties')
      .delete()
      .eq('id', id)
      .eq('telegram_user_id', parseInt(userId));

    if (deleteError) {
      console.error('❌ Error deleting:', deleteError);
      return new Response(JSON.stringify({ 
        error: 'Failed to delete property',
        details: deleteError.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update tenant counter (best effort) - using RPC call
    try {
      const { error: counterError } = await supabase.rpc('decrement_properties_count', {
        user_id: parseInt(userId)
      });
      
      if (counterError) {
        console.warn('⚠️ Counter update failed:', counterError);
      } else {
        console.log('✅ Counter decremented successfully');
      }
    } catch (counterError) {
      console.warn('⚠️ Counter update exception:', counterError);
    }

    console.log(`✅ Property archived successfully: ${id}`);

    return new Response(JSON.stringify({ 
      success: true,
      archived: true,
      message: 'Property archived successfully' 
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
