import { a as requireAdmin } from '../../../chunks/auth_DRVvN-zp.mjs';
import { h as getFormsStats } from '../../../chunks/db_CeY49yL6.mjs';
export { r as renderers } from '../../../chunks/_@astro-renderers_1ISMqT13.mjs';

const GET = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;
  try {
    const { data, error } = await getFormsStats();
    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: error.message, code: "DATABASE_ERROR" }
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        data
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
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
