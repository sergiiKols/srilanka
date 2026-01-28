import { a as requireAdmin, g as getCurrentUser } from '../../../chunks/auth_DRVvN-zp.mjs';
import { e as getAllForms, f as createForm, c as createLog } from '../../../chunks/db_CeY49yL6.mjs';
import { a as FormConfigCreateSchema } from '../../../chunks/telegram.types_hrEzItCz.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;
  try {
    const url = new URL(context.request.url);
    const activeOnly = url.searchParams.get("active") === "true";
    const { data, error } = await getAllForms(activeOnly);
    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: error.message,
            code: "DATABASE_ERROR"
          }
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
    console.error("GET /api/admin/forms error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          code: "INTERNAL_ERROR"
        }
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const POST = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;
  try {
    const user = await getCurrentUser(context);
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: "User not found", code: "USER_NOT_FOUND" }
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const body = await context.request.json();
    const validation = FormConfigCreateSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: "Validation error",
            code: "VALIDATION_ERROR",
            details: validation.error.errors
          }
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data, error } = await createForm(validation.data, user.id);
    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: error.message,
            code: "DATABASE_ERROR"
          }
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    await createLog({
      form_id: data.id,
      event_type: "form_created",
      metadata: { created_by: user.id }
    });
    return new Response(
      JSON.stringify({
        success: true,
        data
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("POST /api/admin/forms error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          code: "INTERNAL_ERROR"
        }
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
