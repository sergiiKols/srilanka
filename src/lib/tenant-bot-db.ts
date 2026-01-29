/**
 * TENANT BOT DATABASE FUNCTIONS
 * Функции для работы с базой данных
 */

import { supabase } from './supabase';
import { generateMapToken, buildPersonalMapUrl } from './tenant-bot-utils';

/**
 * Интерфейс Tenant
 */
export interface Tenant {
  id: string;
  telegram_user_id: number;
  map_secret_token: string;
  personal_map_url: string;
  saved_properties_count: number;
  created_at: string;
  last_active_at: string;
}

/**
 * Интерфейс SavedProperty
 */
export interface SavedProperty {
  id: string;
  telegram_user_id: number;
  title?: string;
  description?: string;
  notes?: string;
  latitude: number;
  longitude: number;
  google_maps_url?: string;
  address?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  price?: number;
  currency?: string;
  price_period?: string;
  photos?: string[];
  amenities?: any;
  contact_info?: string;
  contact_phone?: string;
  contact_name?: string;
  source_type?: string;
  forward_from_user_id?: number;
  forward_from_username?: string;
  forward_from_first_name?: string;
  forward_from_chat_id?: number;
  forward_from_chat_title?: string;
  forward_from_chat_username?: string;
  forward_from_message_id?: number;
  forward_date?: string;
  original_message_link?: string;
  is_favorite?: boolean;
  viewed_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Получить или создать арендатора
 * 
 * @param {number} telegramUserId - Telegram user ID
 * @returns {Promise<Tenant>} Tenant объект
 */
export async function getOrCreateTenant(telegramUserId: number): Promise<Tenant> {
  try {
    // 1. Проверяем существование
    const { data: existing, error: selectError } = await supabase
      .from('tenants')
      .select('*')
      .eq('telegram_user_id', telegramUserId)
      .single();

    if (existing && !selectError) {
      // Обновляем last_active_at
      await supabase
        .from('tenants')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', existing.id);

      return existing as Tenant;
    }

    // 2. Создаём нового tenant
    const token = generateMapToken();
    const mapUrl = buildPersonalMapUrl(telegramUserId, token);

    const { data: newTenant, error: insertError } = await supabase
      .from('tenants')
      .insert({
        telegram_user_id: telegramUserId,
        map_secret_token: token,
        personal_map_url: mapUrl,
        saved_properties_count: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating tenant:', insertError);
      throw insertError;
    }

    return newTenant as Tenant;
    
  } catch (error) {
    console.error('Error in getOrCreateTenant:', error);
    throw error;
  }
}

/**
 * Интерфейс для создания property
 */
export interface CreatePropertyInput {
  telegram_user_id: number;
  title?: string;
  description?: string;
  latitude: number;
  longitude: number;
  google_maps_url?: string;
  address?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  price?: number;
  currency?: string;
  price_period?: string;
  photos?: string[];
  amenities?: any;
  contact_info?: string;
  contact_phone?: string;
  contact_name?: string;
  source_type?: string;
  forward_from_user_id?: number;
  forward_from_username?: string;
  forward_from_first_name?: string;
  forward_from_chat_id?: number;
  forward_from_chat_title?: string;
  forward_from_chat_username?: string;
  forward_from_message_id?: number;
  forward_date?: string;
  original_message_link?: string;
}

/**
 * Сохранить объект недвижимости
 * 
 * @param {CreatePropertyInput} data - Данные объекта
 * @returns {Promise<SavedProperty>} Сохранённый объект
 */
export async function saveProperty(data: CreatePropertyInput): Promise<SavedProperty> {
  try {
    const { data: property, error } = await supabase
      .from('saved_properties')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error saving property:', error);
      throw error;
    }

    return property as SavedProperty;
    
  } catch (error) {
    console.error('Error in saveProperty:', error);
    throw error;
  }
}

/**
 * Проверить на дубликаты
 * Сравнивает по координатам (±0.001°) и цене
 * 
 * @param {number} userId - Telegram user ID
 * @param {number} latitude - Широта
 * @param {number} longitude - Долгота
 * @param {number} price - Цена
 * @returns {Promise<SavedProperty | null>} Найденный дубликат или null
 */
export async function checkDuplicate(
  userId: number,
  latitude: number,
  longitude: number,
  price?: number
): Promise<SavedProperty | null> {
  try {
    // Погрешность координат ±0.001° (около 100 метров)
    const latDelta = 0.001;
    const lonDelta = 0.001;

    let query = supabase
      .from('saved_properties')
      .select('*')
      .eq('telegram_user_id', userId)
      .gte('latitude', latitude - latDelta)
      .lte('latitude', latitude + latDelta)
      .gte('longitude', longitude - lonDelta)
      .lte('longitude', longitude + lonDelta);

    // Если цена указана, добавляем её в проверку
    if (price) {
      query = query.eq('price', price);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      console.error('Error checking duplicate:', error);
      return null;
    }

    return data && data.length > 0 ? (data[0] as SavedProperty) : null;
    
  } catch (error) {
    console.error('Error in checkDuplicate:', error);
    return null;
  }
}

/**
 * Получить объекты пользователя
 * 
 * @param {number} userId - Telegram user ID
 * @param {number} limit - Лимит записей
 * @returns {Promise<SavedProperty[]>} Массив объектов
 */
export async function getUserProperties(
  userId: number,
  limit: number = 100
): Promise<SavedProperty[]> {
  try {
    const { data, error } = await supabase
      .from('saved_properties')
      .select('*')
      .eq('telegram_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }

    return (data || []) as SavedProperty[];
    
  } catch (error) {
    console.error('Error in getUserProperties:', error);
    return [];
  }
}

/**
 * Обновить объект
 * 
 * @param {string} propertyId - ID объекта
 * @param {Partial<SavedProperty>} updates - Обновления
 * @returns {Promise<SavedProperty>} Обновлённый объект
 */
export async function updateProperty(
  propertyId: string,
  updates: Partial<SavedProperty>
): Promise<SavedProperty> {
  try {
    const { data, error } = await supabase
      .from('saved_properties')
      .update(updates)
      .eq('id', propertyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating property:', error);
      throw error;
    }

    return data as SavedProperty;
    
  } catch (error) {
    console.error('Error in updateProperty:', error);
    throw error;
  }
}

/**
 * Удалить объект
 * 
 * @param {string} propertyId - ID объекта
 * @returns {Promise<boolean>} true если успешно
 */
export async function deleteProperty(propertyId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_properties')
      .delete()
      .eq('id', propertyId);

    if (error) {
      console.error('Error deleting property:', error);
      return false;
    }

    return true;
    
  } catch (error) {
    console.error('Error in deleteProperty:', error);
    return false;
  }
}

/**
 * Отметить как избранное
 * 
 * @param {string} propertyId - ID объекта
 * @param {boolean} isFavorite - true/false
 * @returns {Promise<boolean>} true если успешно
 */
export async function toggleFavorite(
  propertyId: string,
  isFavorite: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_properties')
      .update({ is_favorite: isFavorite })
      .eq('id', propertyId);

    if (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }

    return true;
    
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    return false;
  }
}

/**
 * Добавить заметку
 * 
 * @param {string} propertyId - ID объекта
 * @param {string} notes - Текст заметки
 * @returns {Promise<boolean>} true если успешно
 */
export async function addNote(propertyId: string, notes: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_properties')
      .update({ notes })
      .eq('id', propertyId);

    if (error) {
      console.error('Error adding note:', error);
      return false;
    }

    return true;
    
  } catch (error) {
    console.error('Error in addNote:', error);
    return false;
  }
}

/**
 * Получить статистику пользователя
 * 
 * @param {number} userId - Telegram user ID
 * @returns {Promise<object>} Статистика
 */
export async function getUserStats(userId: number): Promise<any> {
  try {
    const { data: properties, error } = await supabase
      .from('saved_properties')
      .select('*')
      .eq('telegram_user_id', userId);

    if (error) {
      console.error('Error fetching stats:', error);
      return null;
    }

    const total = properties?.length || 0;
    const favorites = properties?.filter((p) => p.is_favorite).length || 0;
    
    const now = new Date();
    const today = properties?.filter((p) => {
      const created = new Date(p.created_at);
      return created.toDateString() === now.toDateString();
    }).length || 0;
    
    const thisWeek = properties?.filter((p) => {
      const created = new Date(p.created_at);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return created >= weekAgo;
    }).length || 0;

    // Средняя цена
    const pricesArray = properties
      ?.map((p) => p.price)
      .filter((p) => p !== null && p !== undefined) || [];
    
    const avgPrice = pricesArray.length > 0
      ? pricesArray.reduce((a, b) => a + b, 0) / pricesArray.length
      : 0;

    return {
      total,
      favorites,
      today,
      thisWeek,
      avgPrice: Math.round(avgPrice)
    };
    
  } catch (error) {
    console.error('Error in getUserStats:', error);
    return null;
  }
}
