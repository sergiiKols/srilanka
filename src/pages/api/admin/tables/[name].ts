import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'https://mcmzdscpuoxwneuzsanu.supabase.co';
const SUPABASE_SERVICE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
}

export const GET: APIRoute = async ({ params }) => {
  const tableName = params.name;

  if (!tableName) {
    return new Response(JSON.stringify({ error: 'Table name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log(`[API] Fetching data for table: ${tableName}`);

    // 1. Получаем структуру таблицы (колонки)
    let columns: any[] = [];
    
    // Простой подход: получаем первую запись и извлекаем структуру
    const { data: sampleRecord, error: sampleError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
      .single();

    console.log(`[API] Sample record for ${tableName}:`, sampleRecord ? 'Got data' : 'No data', sampleError);

    if (sampleRecord && !sampleError) {
      // Создаём структуру из полей объекта
      columns = Object.keys(sampleRecord).map(key => {
        const value = sampleRecord[key];
        let dataType = typeof value;
        
        // Более точное определение типа
        if (value === null) {
          dataType = 'null';
        } else if (Array.isArray(value)) {
          dataType = 'array';
        } else if (value instanceof Date) {
          dataType = 'timestamp';
        } else if (typeof value === 'number') {
          dataType = Number.isInteger(value) ? 'integer' : 'numeric';
        }
        
        return {
          column_name: key,
          data_type: dataType,
          is_nullable: 'YES',
          column_default: null,
        };
      });
      
      console.log(`[API] Extracted ${columns.length} columns from ${tableName}`);
    } else {
      console.warn(`[API] Could not get sample record for ${tableName}:`, sampleError?.message);
    }

    // 2. Получаем количество записей в таблице
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    const recordsCount = countError ? 0 : (count || 0);

    // 3. Получаем первые 20 записей для предварительного просмотра
    const { data: sampleData, error: dataError } = await supabase
      .from(tableName)
      .select('*')
      .limit(20);

    // 4. Получаем размер таблицы (если возможно)
    let tableSize = 'Unknown';
    try {
      const { data: sizeData } = await supabase.rpc('get_table_size', { 
        table_name: tableName 
      });
      if (sizeData) {
        tableSize = sizeData;
      }
    } catch (e) {
      // Size calculation not available
    }

    // 5. Получаем статистику по категориям/группам (если применимо)
    let statistics = null;
    
    // Для poi_locations - специфичная статистика
    if (tableName === 'poi_locations') {
      // Статистика по категориям
      const { data: categoryStats } = await supabase
        .from(tableName)
        .select('category')
        .limit(1000);

      if (categoryStats) {
        const categoryCounts: Record<string, number> = {};
        categoryStats.forEach((row: any) => {
          const cat = row.category || 'Unknown';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        
        statistics = {
          byCategory: Object.entries(categoryCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
        };
      }

      // Статистика по локациям
      const { data: locationStats } = await supabase
        .from(tableName)
        .select('location')
        .limit(1000);

      if (locationStats && statistics) {
        const locationCounts: Record<string, number> = {};
        locationStats.forEach((row: any) => {
          const loc = row.location || 'Unknown';
          locationCounts[loc] = (locationCounts[loc] || 0) + 1;
        });
        
        statistics.byLocation = Object.entries(locationCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }
    }

    // Для других таблиц - общая статистика
    if (!statistics && sampleData && sampleData.length > 0) {
      statistics = {
        general: {
          totalRecords: recordsCount,
          columnsCount: columns?.length || 0,
          sampleSize: sampleData.length,
        }
      };
    }

    // Формируем ответ
    const response = {
      tableName,
      columns: columns || [],
      columnsCount: columns?.length || 0,
      recordsCount,
      tableSize,
      sampleData: sampleData || [],
      statistics,
    };

    console.log(`[API] Response for ${tableName}:`, {
      columnsCount: response.columnsCount,
      recordsCount: response.recordsCount,
      sampleDataLength: response.sampleData.length,
      hasStatistics: !!response.statistics,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error fetching table ${tableName}:`, error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch table details',
      tableName,
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
