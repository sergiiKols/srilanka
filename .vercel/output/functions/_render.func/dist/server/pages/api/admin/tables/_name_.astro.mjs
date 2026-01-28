import { createClient } from '@supabase/supabase-js';
export { renderers } from '../../../../renderers.mjs';

const SUPABASE_URL = "https://mcmzdscpuoxwneuzsanu.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}
const GET = async ({ params }) => {
  const tableName = params.name;
  if (!tableName) {
    return new Response(JSON.stringify({ error: "Table name is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    console.log(`[API] Fetching data for table: ${tableName}`);
    let columns = [];
    const { data: sampleRecord, error: sampleError } = await supabase.from(tableName).select("*").limit(1).single();
    console.log(`[API] Sample record for ${tableName}:`, sampleRecord ? "Got data" : "No data", sampleError);
    if (sampleRecord && !sampleError) {
      columns = Object.keys(sampleRecord).map((key) => {
        const value = sampleRecord[key];
        let dataType = typeof value;
        if (value === null) {
          dataType = "null";
        } else if (Array.isArray(value)) {
          dataType = "array";
        } else if (value instanceof Date) {
          dataType = "timestamp";
        } else if (typeof value === "number") {
          dataType = Number.isInteger(value) ? "integer" : "numeric";
        }
        return {
          column_name: key,
          data_type: dataType,
          is_nullable: "YES",
          column_default: null
        };
      });
      console.log(`[API] Extracted ${columns.length} columns from ${tableName}`);
    } else {
      console.warn(`[API] Could not get sample record for ${tableName}:`, sampleError?.message);
    }
    const { count, error: countError } = await supabase.from(tableName).select("*", { count: "exact", head: true });
    const recordsCount = countError ? 0 : count || 0;
    const { data: sampleData, error: dataError } = await supabase.from(tableName).select("*").limit(20);
    let tableSize = "Unknown";
    try {
      const { data: sizeData } = await supabase.rpc("get_table_size", {
        table_name: tableName
      });
      if (sizeData) {
        tableSize = sizeData;
      }
    } catch (e) {
    }
    let statistics = null;
    if (tableName === "poi_locations") {
      const { data: categoryStats } = await supabase.from(tableName).select("category").limit(1e3);
      if (categoryStats) {
        const categoryCounts = {};
        categoryStats.forEach((row) => {
          const cat = row.category || "Unknown";
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        statistics = {
          byCategory: Object.entries(categoryCounts).map(([name, count2]) => ({ name, count: count2 })).sort((a, b) => b.count - a.count).slice(0, 10)
        };
      }
      const { data: locationStats } = await supabase.from(tableName).select("location").limit(1e3);
      if (locationStats && statistics) {
        const locationCounts = {};
        locationStats.forEach((row) => {
          const loc = row.location || "Unknown";
          locationCounts[loc] = (locationCounts[loc] || 0) + 1;
        });
        statistics.byLocation = Object.entries(locationCounts).map(([name, count2]) => ({ name, count: count2 })).sort((a, b) => b.count - a.count).slice(0, 10);
      }
    }
    if (!statistics && sampleData && sampleData.length > 0) {
      statistics = {
        general: {
          totalRecords: recordsCount,
          columnsCount: columns?.length || 0,
          sampleSize: sampleData.length
        }
      };
    }
    const response = {
      tableName,
      columns: columns || [],
      columnsCount: columns?.length || 0,
      recordsCount,
      tableSize,
      sampleData: sampleData || [],
      statistics
    };
    console.log(`[API] Response for ${tableName}:`, {
      columnsCount: response.columnsCount,
      recordsCount: response.recordsCount,
      sampleDataLength: response.sampleData.length,
      hasStatistics: !!response.statistics
    });
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`Error fetching table ${tableName}:`, error);
    return new Response(JSON.stringify({
      error: "Failed to fetch table details",
      tableName,
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
