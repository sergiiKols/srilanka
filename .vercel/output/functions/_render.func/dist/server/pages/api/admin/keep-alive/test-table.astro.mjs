import { createClient } from '@supabase/supabase-js';
export { r as renderers } from '../../../../chunks/_@astro-renderers_1ISMqT13.mjs';

const SUPABASE_URL = "https://mcmzdscpuoxwneuzsanu.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}
const POST = async ({ request }) => {
  try {
    const { tableName } = await request.json();
    if (!tableName) {
      return new Response(JSON.stringify({
        success: false,
        error: "Table name is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const startTime = Date.now();
    const { data: config, error: configError } = await supabase.from("keep_alive_config").select("*").eq("table_name", tableName).single();
    let result;
    let recordId = null;
    if (config && !configError) {
      const { data, error } = await supabase.rpc("keep_alive_test_records_v2");
      if (!error && data) {
        const tableResult = data.find((r) => r.table_name === tableName);
        if (tableResult) {
          result = {
            success: tableResult.status === "SUCCESS",
            status: tableResult.status,
            recordId: tableResult.record_id,
            error: tableResult.error_message,
            executionTime: tableResult.execution_time_ms
          };
        } else {
          result = {
            success: false,
            error: "Table not processed in keep-alive function"
          };
        }
      } else {
        result = {
          success: false,
          error: error?.message || "Failed to execute keep-alive function"
        };
      }
    } else {
      try {
        const { data: sample } = await supabase.from(tableName).select("*").limit(1).single();
        const testData = {
          notes: "AUTO-GENERATED: Keep-alive manual test. Safe to delete."
        };
        if (sample) {
          Object.keys(sample).forEach((key) => {
            if (key === "id") return;
            const value = sample[key];
            if (value === null) return;
            if (typeof value === "string") {
              testData[key] = `keepalive_test_${Date.now()}`;
            } else if (typeof value === "number") {
              testData[key] = 0;
            } else if (typeof value === "boolean") {
              testData[key] = false;
            }
          });
        }
        const { data: insertData, error: insertError } = await supabase.from(tableName).insert(testData).select("id").single();
        if (!insertError && insertData) {
          recordId = insertData.id;
          result = {
            success: true,
            status: "SUCCESS",
            recordId,
            executionTime: Date.now() - startTime
          };
        } else {
          result = {
            success: false,
            status: "ERROR",
            error: insertError?.message || "Unknown error",
            executionTime: Date.now() - startTime
          };
        }
      } catch (e) {
        result = {
          success: false,
          status: "ERROR",
          error: e.message,
          executionTime: Date.now() - startTime
        };
      }
    }
    await supabase.from("keep_alive_logs").insert({
      table_name: tableName,
      status: result.success ? "SUCCESS" : "ERROR",
      record_id: recordId,
      error_message: result.error || null,
      execution_time_ms: result.executionTime || 0
    });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in test-table:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
