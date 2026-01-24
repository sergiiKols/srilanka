/**
 * Supabase Client Configuration
 * Обеспечивает безопасное подключение к базе данных
 */

import { createClient } from '@supabase/supabase-js';

// Получаем переменные окружения
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Создаем клиент Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Сохраняем сессию в localStorage
    autoRefreshToken: true, // Автообновление токена
    detectSessionInUrl: true // Определение сессии из URL (для OAuth)
  }
});

// Типы для TypeScript
export interface PropertyData {
  id: string;
  user_id: string; // ID пользователя (владелец объекта)
  title: string;
  property_type: string;
  area: string;
  rooms: number;
  bathrooms: number;
  price: number | null;
  beach_distance: number;
  wifi_speed: number;
  amenities: string[];
  features: {
    pool: boolean;
    parking: boolean;
    breakfast: boolean;
    airConditioning: boolean;
    kitchen: boolean;
    petFriendly: boolean;
    security: string;
    beachfront: boolean;
    garden: boolean;
  };
  clean_description: string;
  images: string[];
  position: [number, number]; // [lat, lng]
  google_maps_url: string;
  created_at: string;
  updated_at: string;
}

// Утилиты для работы с Auth
export const auth = {
  // Регистрация пользователя
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Вход пользователя
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Вход через Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { data, error };
  },

  // Выход
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Получить текущего пользователя
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Сброс пароля
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  }
};

// Утилиты для работы с Properties
export const properties = {
  // Получить все объекты текущего пользователя
  getUserProperties: async () => {
    const { data, error } = await supabase
      .from('user_properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Создать новый объект
  createProperty: async (property: Omit<PropertyData, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('user_properties')
      .insert([property])
      .select()
      .single();
    
    return { data, error };
  },

  // Обновить объект
  updateProperty: async (id: string, updates: Partial<PropertyData>) => {
    const { data, error } = await supabase
      .from('user_properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  // Удалить объект
  deleteProperty: async (id: string) => {
    const { error } = await supabase
      .from('user_properties')
      .delete()
      .eq('id', id);
    
    return { error };
  },

  // Получить один объект по ID
  getPropertyById: async (id: string) => {
    const { data, error } = await supabase
      .from('user_properties')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  }
};

// Подписка на изменения в реальном времени
export const subscribeToProperties = (callback: (payload: any) => void) => {
  return supabase
    .channel('user-properties-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_properties'
      },
      callback
    )
    .subscribe();
};
