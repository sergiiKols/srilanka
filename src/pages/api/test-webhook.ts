/**
 * TEST WEBHOOK - Простой тестовый endpoint
 */

import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    status: 'OK',
    message: 'Test webhook is working!',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));

  return new Response(JSON.stringify({
    status: 'OK',
    message: 'POST webhook received',
    received: body,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
