import { a as requireAdmin } from '../../../../chunks/auth_DRVvN-zp.mjs';
import { s as supabase } from '../../../../chunks/supabase_CyZfh9_5.mjs';
import { c as convertSubmissionsToCSV } from '../../../../chunks/telegram_ChSysgpd.mjs';
export { renderers } from '../../../../renderers.mjs';

const GET = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;
  try {
    const url = new URL(context.request.url);
    const formId = url.searchParams.get("form_id");
    const status = url.searchParams.get("status");
    const dateFrom = url.searchParams.get("date_from");
    const dateTo = url.searchParams.get("date_to");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const exportFormat = url.searchParams.get("export");
    const offset = (page - 1) * limit;
    let query = supabase.from("form_submissions").select("*, form_configs(id, title)", { count: "exact" }).neq("status", "deleted").order("created_at", { ascending: false });
    if (formId) {
      query = query.eq("form_id", formId);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (dateFrom) {
      query = query.gte("created_at", new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setDate(toDate.getDate() + 1);
      query = query.lt("created_at", toDate.toISOString());
    }
    if (exportFormat === "csv") {
      const { data: allSubmissions, error: error2 } = await query;
      if (error2) {
        return new Response(
          JSON.stringify({
            success: false,
            error: { message: error2.message, code: "DATABASE_ERROR" }
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      const csv = convertSubmissionsToCSV(allSubmissions || []);
      const filename = `all_submissions_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      });
    }
    query = query.range(offset, offset + limit - 1);
    const { data: submissions, error, count } = await query;
    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: error.message, code: "DATABASE_ERROR" }
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const totalPages = Math.ceil((count || 0) / limit);
    return new Response(
      JSON.stringify({
        success: true,
        data: submissions,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: totalPages
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GET /api/admin/forms/submissions error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: "Internal error", code: "INTERNAL_ERROR" }
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
