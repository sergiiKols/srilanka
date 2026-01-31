/**
 * Упрощенная Edge Function: Обновление курсов валют
 * БЕЗ использования exec_sql - только сохранение в exchange_rates_log
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ExchangeRatesResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
  time_last_update_unix: number;
}

interface UpdateResult {
  success: boolean;
  message: string;
  rates?: Record<string, number>;
  error?: string;
}

const SUPPORTED_CURRENCIES = ['LKR', 'EUR', 'GBP', 'INR', 'RUB', 'AUD', 'CAD'];

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting exchange rates update...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 1. Загружаем курсы с API
    console.log('📥 Fetching rates from API...');
    const apiResponse = await fetch('https://open.er-api.com/v6/latest/USD');
    
    if (!apiResponse.ok) {
      throw new Error(`API returned ${apiResponse.status}`);
    }
    
    const data: ExchangeRatesResponse = await apiResponse.json();
    
    if (data.result !== 'success' || !data.rates) {
      throw new Error('Invalid API response format');
    }
    
    console.log('✅ Successfully fetched rates from API');
    
    // 2. Конвертируем курсы (валюта → USD)
    const rates: Record<string, number> = { USD: 1 };
    
    for (const currency of SUPPORTED_CURRENCIES) {
      if (data.rates[currency]) {
        rates[currency] = 1 / data.rates[currency];
        console.log(`   ${currency}: 1 = $${rates[currency].toFixed(6)} USD`);
      }
    }
    
    // 3. Сохраняем в exchange_rates_log
    console.log('💾 Saving to exchange_rates_log...');
    
    const { error: logError } = await supabaseClient
      .from('exchange_rates_log')
      .insert({
        rates: rates,
        api_timestamp: new Date(data.time_last_update_unix * 1000).toISOString(),
        success: true,
        message: 'Successfully updated exchange rates (simplified version - manual SQL update required)'
      });
    
    if (logError) {
      console.error('❌ Error saving log:', logError);
      throw logError;
    }
    
    console.log('✅ Saved to exchange_rates_log');
    
    // 4. Обновляем счетчик в cron_jobs
    const { error: cronError } = await supabaseClient
      .from('cron_jobs')
      .update({
        last_run_at: new Date().toISOString(),
        last_run_status: 'success',
        last_run_message: 'Rates fetched and saved to log. Manual SQL update needed for calculate_price_usd()',
        run_count: supabaseClient.rpc('increment', { x: 1 })
      })
      .eq('name', 'update_exchange_rates');
    
    if (cronError) {
      console.warn('⚠️ Could not update cron_jobs:', cronError);
    }
    
    const result: UpdateResult = {
      success: true,
      message: 'Exchange rates fetched successfully. Note: SQL function calculate_price_usd() needs manual update with new rates.',
      rates: rates
    };
    
    console.log('✅ Update completed');
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    const result: UpdateResult = {
      success: false,
      message: 'Failed to update exchange rates',
      error: error.message
    };
    
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabaseClient
        .from('exchange_rates_log')
        .insert({
          success: false,
          message: error.message,
          error: error.stack
        });
    } catch (logError) {
      console.error('Could not save error log:', logError);
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})

/* 
 * ИНСТРУКЦИЯ:
 * 
 * Эта упрощенная версия:
 * 1. Загружает курсы с API ✅
 * 2. Сохраняет в exchange_rates_log ✅
 * 3. НЕ обновляет SQL функцию (нужно делать вручную раз в месяц)
 * 
 * Как обновить SQL функцию вручную:
 * 
 * 1. Получить актуальные курсы из exchange_rates_log:
 *    SELECT rates FROM exchange_rates_log ORDER BY created_at DESC LIMIT 1;
 * 
 * 2. Обновить функцию calculate_price_usd() с новыми курсами:
 *    CREATE OR REPLACE FUNCTION calculate_price_usd() ...
 *    (скопировать из database/10_add_price_usd_column.sql и обновить курсы)
 * 
 * 3. Пересчитать все записи:
 *    UPDATE saved_properties SET price_usd = ...
 */
