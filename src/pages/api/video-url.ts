/**
 * API ENDPOINT: GET VIDEO URL
 * Получает временный URL для просмотра видео из Telegram Storage
 */

import type { APIRoute } from 'astro';
import { getTelegramVideoUrl, getTelegramThumbnailUrl } from '@/lib/telegram-video-uploader';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const fileId = url.searchParams.get('fileId');
    const thumbFileId = url.searchParams.get('thumbFileId');
    const type = url.searchParams.get('type') || 'video'; // 'video' or 'thumbnail'
    
    if (!fileId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'fileId parameter is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Bot token not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let videoUrl: string | null = null;
    
    if (type === 'thumbnail' && thumbFileId) {
      // Получаем URL thumbnail
      videoUrl = await getTelegramThumbnailUrl(botToken, thumbFileId);
    } else {
      // Получаем URL видео
      videoUrl = await getTelegramVideoUrl(botToken, fileId);
    }
    
    if (!videoUrl) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to get video URL from Telegram'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      url: videoUrl,
      expiresIn: '~1 hour',
      note: 'This URL is temporary and will expire. Call this endpoint again to get a new URL.'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error('❌ Error in video-url endpoint:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
