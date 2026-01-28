import { a as requireAdmin } from '../../../../../chunks/auth_DRVvN-zp.mjs';
import { g as getSubmissions, a as getFormStats } from '../../../../../chunks/db_CeY49yL6.mjs';
import { c as convertSubmissionsToCSV } from '../../../../../chunks/telegram_B-Cestcv.mjs';
export { r as renderers } from '../../../../../chunks/_@astro-renderers_1ISMqT13.mjs';

const GET = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;
  try {
    const { id } = context.params;
    const url = new URL(context.request.url);
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: "Form ID required", code: "MISSING_ID" }
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const exportFormat = url.searchParams.get("export");
    const filters = {
      form_id: id,
      user_id: url.searchParams.get("user_id") || void 0,
      status: url.searchParams.get("status") || void 0,
      date_from: url.searchParams.get("date_from") || void 0,
      date_to: url.searchParams.get("date_to") || void 0,
      limit: parseInt(url.searchParams.get("limit") || "50"),
      offset: parseInt(url.searchParams.get("offset") || "0"),
      sort: url.searchParams.get("sort") || "created_at",
      order: url.searchParams.get("order") || "desc"
    };
    if (exportFormat === "csv") {
      const { data: data2, error: error2 } = await getSubmissions({
        ...filters,
        limit: 1e4,
        // максимум для экспорта
        offset: 0
      });
      if (error2 || !data2) {
        return new Response(
          JSON.stringify({
            success: false,
            error: { message: error2?.message || "No data", code: "EXPORT_ERROR" }
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      const csv = convertSubmissionsToCSV(data2);
      const filename = `submissions_${id}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      });
    }
    const { data, error, count } = await getSubmissions(filters);
    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: error.message, code: "DATABASE_ERROR" }
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const statsResult = await getFormStats(id);
    return new Response(
      JSON.stringify({
        success: true,
        data,
        count,
        stats: statsResult.data || null
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GET /api/admin/forms/[id]/submissions error:", error);
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
