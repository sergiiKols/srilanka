/**
 * Supabase Edge Function: Обновление курсов валют
 * 
 * Вызывается автоматически через Cron или вручную из админки
 * Загружает актуальные курсы с https://open.er-api.com/v6/latest/USD
 * Обновляет функцию calculate_price_usd() в базе данных
 * Пересчитывает price_usd для всех существующих объектов
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Интерфейсы
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
  updated_records?: number;
  error?: string;
}

// Поддерживаемые валюты
const SUPPORTED_CURRENCIES = ['LKR', 'EUR', 'GBP', 'INR', 'RUB', 'AUD', 'CAD'];

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting exchange rates update...');
    
    // Создаем Supabase клиент
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

    // 1. Загружаем актуальные курсы с API
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
    console.log(`   Time: ${new Date(data.time_last_update_unix * 1000).toISOString()}`);
    
    // 2. Конвертируем курсы в наш формат (валюта → USD)
    const rates: Record<string, number> = { USD: 1 };
    
    for (const currency of SUPPORTED_CURRENCIES) {
      if (data.rates[currency]) {
        rates[currency] = 1 / data.rates[currency]; // Обратный курс
        console.log(`   ${currency}: 1 = $${rates[currency].toFixed(6)} USD`);
      }
    }
    
    // 3. Обновляем функцию calculate_price_usd() в базе
    console.log('📝 Updating SQL function...');
    
    const functionSQL = `
      CREATE OR REPLACE FUNCTION calculate_price_usd()
      RETURNS TRIGGER AS $$
      BEGIN
        IF (TG_OP = 'INSERT' OR NEW.price != OLD.price OR NEW.currency != OLD.currency) THEN
          NEW.price_usd := CASE 
            WHEN NEW.currency = 'USD' OR NEW.currency IS NULL THEN NEW.price
            WHEN NEW.currency = 'LKR' THEN NEW.price * ${rates.LKR}
            WHEN NEW.currency = 'EUR' THEN NEW.price * ${rates.EUR}
            WHEN NEW.currency = 'GBP' THEN NEW.price * ${rates.GBP}
            WHEN NEW.currency = 'INR' THEN NEW.price * ${rates.INR}
            WHEN NEW.currency = 'RUB' THEN NEW.price * ${rates.RUB}
            WHEN NEW.currency = 'AUD' THEN NEW.price * ${rates.AUD}
            WHEN NEW.currency = 'CAD' THEN NEW.price * ${rates.CAD}
            ELSE NEW.price
          END;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    const { error: functionError } = await supabaseClient.rpc('exec_sql', {
      sql: functionSQL
    });
    
    if (functionError) {
      console.error('❌ Error updating function:', functionError);
      throw functionError;
    }
    
    console.log('✅ SQL function updated');
    
    // 4. Пересчитываем price_usd для всех существующих записей
    console.log('🔄 Recalculating existing records...');
    
    const updateSQL = `
      UPDATE saved_properties 
      SET price_usd = CASE 
        WHEN currency = 'USD' OR currency IS NULL THEN price
        WHEN currency = 'LKR' THEN price * ${rates.LKR}
        WHEN currency = 'EUR' THEN price * ${rates.EUR}
        WHEN currency = 'GBP' THEN price * ${rates.GBP}
        WHEN currency = 'INR' THEN price * ${rates.INR}
        WHEN currency = 'RUB' THEN price * ${rates.RUB}
        WHEN currency = 'AUD' THEN price * ${rates.AUD}
        WHEN currency = 'CAD' THEN price * ${rates.CAD}
        ELSE price
      END
      WHERE price IS NOT NULL;
    `;
    
    const { data: updateResult, error: updateError } = await supabaseClient.rpc('exec_sql', {
      sql: updateSQL
    });
    
    if (updateError) {
      console.error('❌ Error updating records:', updateError);
      throw updateError;
    }
    
    console.log('✅ Records recalculated');
    
    // 5. Сохраняем лог обновления
    const { error: logError } = await supabaseClient
      .from('exchange_rates_log')
      .insert({
        rates: rates,
        api_timestamp: new Date(data.time_last_update_unix * 1000).toISOString(),
        success: true,
        message: 'Successfully updated exchange rates'
      });
    
    if (logError) {
      console.warn('⚠️ Could not save log:', logError);
    }
    
    // 6. Возвращаем результат
    const result: UpdateResult = {
      success: true,
      message: 'Exchange rates updated successfully',
      rates: rates,
      updated_records: updateResult?.count || 0
    };
    
    console.log('✅ Update completed successfully');
    
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
    
    // Пытаемся сохранить ошибку в лог
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
 * Тестирование локально:
 * 
 * deno run --allow-net --allow-env supabase/functions/update-exchange-rates/index.ts
 * 
 * Или через curl:
 * curl -X POST https://your-project.supabase.co/functions/v1/update-exchange-rates \
 *   -H "Authorization: Bearer YOUR_ANON_KEY"
 */
