import { createClient } from '@supabase/supabase-js';
export { renderers } from '../../../renderers.mjs';

const SUPABASE_URL = "https://mcmzdscpuoxwneuzsanu.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}
const GET = async () => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    let tablesData = [];
    try {
      const { data, error } = await supabase.rpc("get_all_tables_info");
      if (!error && data) {
        tablesData = data;
      }
    } catch (e) {
      console.warn("RPC get_all_tables_info not available");
    }
    if (tablesData.length === 0) {
      try {
        const { data: pgTables, error: pgError } = await supabase.from("pg_tables").select("tablename").eq("schemaname", "public");
        if (pgTables && !pgError) {
          const tablesPromises = pgTables.map(async (table) => {
            const tableName = table.tablename;
            const { count: colCount } = await supabase.from(tableName).select("*", { count: "exact", head: true });
            const { data: sample } = await supabase.from(tableName).select("*").limit(1).single();
            const columnsCount = sample ? Object.keys(sample).length : 0;
            return {
              name: tableName,
              columns: columnsCount,
              size: "Unknown",
              // Размер получить сложнее без raw SQL
              description: null
            };
          });
          tablesData = await Promise.all(tablesPromises);
        }
      } catch (e) {
        console.warn("pg_tables approach failed");
      }
    }
    if (tablesData.length === 0) {
      console.warn("All methods failed, using fallback data");
      const knownTables = [
        { name: "analytics_events", size: "48 kB", columns: 22, description: "Analytics and tracking events", category: "superbase_crm" },
        { name: "client_maps", size: "48 kB", columns: 15, description: "Personal maps for clients to view offers", category: "superbase_crm" },
        { name: "landlord_responses", size: "128 kB", columns: 30, description: "Landlord responses to listings", category: "telegram_listing" },
        { name: "landlords", size: "56 kB", columns: 30, description: "Property owners with verification and subscription info", category: "superbase_crm" },
        { name: "listing_publications", size: "120 kB", columns: 14, description: "Publications in Telegram groups", category: "telegram_listing" },
        { name: "map_markers", size: "48 kB", columns: 13, description: "Property markers on client maps", category: "superbase_crm" },
        { name: "messages", size: "64 kB", columns: 19, description: "Direct messages between users", category: "superbase_crm" },
        { name: "notifications", size: "40 kB", columns: 17, description: "User notifications", category: "superbase_crm" },
        { name: "offers", size: "64 kB", columns: 17, description: "Connections between properties and rental requests", category: "superbase_crm" },
        { name: "payments", size: "56 kB", columns: 16, description: "Payment transaction history", category: "superbase_crm" },
        { name: "poi_locations", size: "4752 kB", columns: 20, description: "Points of Interest - Tourist locations", category: "poi" },
        { name: "properties", size: "120 kB", columns: 50, description: "Rental properties with location, pricing, and amenities", category: "superbase_crm" },
        { name: "property_listings", size: "152 kB", columns: 42, description: "Property listings from clients", category: "telegram_listing" },
        { name: "rental_requests", size: "104 kB", columns: 43, description: "Client rental requests/needs", category: "superbase_crm" },
        { name: "reviews", size: "64 kB", columns: 20, description: "Property and landlord reviews", category: "superbase_crm" },
        { name: "saved_properties", size: "40 kB", columns: 5, description: "User favorite properties", category: "superbase_crm" },
        { name: "schema_migrations", size: "32 kB", columns: 3, description: "Database migration history", category: "system" },
        { name: "spatial_ref_sys", size: "7144 kB", columns: 5, description: "PostGIS spatial reference systems", category: "system" },
        { name: "subscriptions", size: "40 kB", columns: 17, description: "Landlord subscription plans", category: "superbase_crm" },
        { name: "system_config", size: "48 kB", columns: 6, description: "System configuration (keep-alive)", category: "system" },
        { name: "telegram_accounts", size: "80 kB", columns: 14, description: "Telegram accounts for publishing", category: "telegram_listing" },
        { name: "telegram_groups", size: "112 kB", columns: 17, description: "Telegram groups/channels", category: "telegram_listing" },
        { name: "temperature_change_log", size: "56 kB", columns: 9, description: "Temperature change log", category: "telegram_listing" },
        { name: "users", size: "64 kB", columns: 28, description: "Extended user profiles with preferences and OAuth data", category: "superbase_crm" }
      ];
      tablesData = knownTables;
    }
    return new Response(JSON.stringify({ tables: tablesData }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in /api/admin/tables:", error);
    return new Response(JSON.stringify({
      error: "Failed to fetch tables",
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
