import { a as requireAdmin } from '../../../../chunks/auth_DRVvN-zp.mjs';
import { b as getFormById, u as updateForm, c as createLog, d as deleteForm } from '../../../../chunks/db_CeY49yL6.mjs';
import { F as FormConfigUpdateSchema } from '../../../../chunks/telegram.types_hrEzItCz.mjs';
export { r as renderers } from '../../../../chunks/_@astro-renderers_1ISMqT13.mjs';

const GET = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;
  try {
    const { id } = context.params;
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: "Form ID required", code: "MISSING_ID" }
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data, error } = await getFormById(id);
    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: error.message, code: "DATABASE_ERROR" }
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: "Form not found", code: "NOT_FOUND" }
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GET /api/admin/forms/[id] error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: "Internal error", code: "INTERNAL_ERROR" }
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const PUT = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;
  try {
    const { id } = context.params;
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: "Form ID required", code: "MISSING_ID" }
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const body = await context.request.json();
    const validation = FormConfigUpdateSchema.safeParse(body);
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
    const { data, error } = await updateForm(id, validation.data);
    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: error.message, code: "DATABASE_ERROR" }
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    await createLog({
      form_id: id,
      event_type: "form_updated",
      metadata: { updated_fields: Object.keys(validation.data) }
    });
    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("PUT /api/admin/forms/[id] error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: "Internal error", code: "INTERNAL_ERROR" }
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const DELETE = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;
  try {
    const { id } = context.params;
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: "Form ID required", code: "MISSING_ID" }
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    await createLog({
      form_id: id,
      event_type: "form_deleted"
    });
    const { error } = await deleteForm(id);
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
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("DELETE /api/admin/forms/[id] error:", error);
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
  DELETE,
  GET,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
