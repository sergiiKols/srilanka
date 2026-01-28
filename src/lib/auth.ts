/**
 * Middleware для проверки прав администратора
 */

import { supabase } from './supabase';
import type { APIContext } from 'astro';

// ================================================
// ТИПЫ
// ================================================

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
  user_metadata?: Record<string, any>;
}

export interface AuthResult {
  authenticated: boolean;
  isAdmin: boolean;
  user?: AuthUser;
  error?: string;
}

// ================================================
// ПРОВЕРКА АУТЕНТИФИКАЦИИ
// ================================================

/**
 * Проверяет, аутентифицирован ли пользователь и является ли он админом
 */
export async function checkAuth(context: APIContext): Promise<AuthResult> {
  try {
    // Получаем токен из куки или заголовка Authorization
    const authHeader = context.request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      // Проверяем сессию из куки
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return {
          authenticated: false,
          isAdmin: false,
          error: 'Not authenticated',
        };
      }
      
      // Проверяем роль админа
      const isAdmin = checkAdminRole(user);
      
      return {
        authenticated: true,
        isAdmin,
        user: {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role,
          user_metadata: user.user_metadata,
        },
      };
    }
    
    // Если есть токен, проверяем его
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return {
        authenticated: false,
        isAdmin: false,
        error: 'Invalid token',
      };
    }
    
    const isAdmin = checkAdminRole(user);
    
    return {
      authenticated: true,
      isAdmin,
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        user_metadata: user.user_metadata,
      },
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return {
      authenticated: false,
      isAdmin: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Проверяет, является ли пользователь администратором
 */
function checkAdminRole(user: any): boolean {
  // Метод 1: проверка через user_metadata.role
  if (user.user_metadata?.role === 'admin') {
    return true;
  }
  
  // Метод 2: проверка через app_metadata.role (если настроено в Supabase)
  if (user.app_metadata?.role === 'admin') {
    return true;
  }
  
  // Метод 3: проверка email (fallback для разработки)
  const adminEmails = import.meta.env.ADMIN_EMAILS?.split(',') || [];
  if (adminEmails.includes(user.email)) {
    return true;
  }
  
  return false;
}

/**
 * Middleware для защиты API роутов админки
 */
export async function requireAdmin(context: APIContext): Promise<Response | null> {
  const authResult = await checkAuth(context);
  
  if (!authResult.authenticated) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  if (!authResult.isAdmin) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: 'Admin access required',
          code: 'FORBIDDEN',
        },
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  return null; // Авторизация успешна
}

/**
 * Получает текущего пользователя из контекста (для использования в API роутах)
 */
export async function getCurrentUser(context: APIContext): Promise<AuthUser | null> {
  const authResult = await checkAuth(context);
  return authResult.user || null;
}

// ================================================
// УТИЛИТЫ ДЛЯ СТРАНИЦ ASTRO
// ================================================

/**
 * Проверяет аутентификацию на стороне сервера (для .astro страниц)
 */
export async function requireAuthPage(context: any): Promise<{ redirect?: Response; user?: AuthUser }> {
  const authResult = await checkAuth(context);
  
  if (!authResult.authenticated) {
    return {
      redirect: new Response(null, {
        status: 302,
        headers: { Location: '/admin?error=auth_required' },
      }),
    };
  }
  
  return { user: authResult.user };
}

/**
 * Проверяет права админа на стороне сервера (для .astro страниц)
 */
export async function requireAdminPage(context: any): Promise<{ redirect?: Response; user?: AuthUser }> {
  const authResult = await checkAuth(context);
  
  if (!authResult.authenticated) {
    return {
      redirect: new Response(null, {
        status: 302,
        headers: { Location: '/admin?error=auth_required' },
      }),
    };
  }
  
  if (!authResult.isAdmin) {
    return {
      redirect: new Response(null, {
        status: 302,
        headers: { Location: '/admin?error=access_denied' },
      }),
    };
  }
  
  return { user: authResult.user };
}
