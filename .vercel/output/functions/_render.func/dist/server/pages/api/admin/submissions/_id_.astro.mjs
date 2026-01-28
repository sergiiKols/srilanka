import { a as requireAdmin } from '../../../../chunks/auth_DRVvN-zp.mjs';
import { i as deleteSubmission, c as createLog } from '../../../../chunks/db_CeY49yL6.mjs';
export { renderers } from '../../../../renderers.mjs';

const DELETE = async (context) => {
  const authError = await requireAdmin(context);
  if (authError) return authError;
  try {
    const { id } = context.params;
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: "Submission ID required", code: "MISSING_ID" }
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data, error } = await deleteSubmission(id);
    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: error.message, code: "DATABASE_ERROR" }
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    if (data) {
      await createLog({
        form_id: data.form_id,
        submission_id: id,
        event_type: "submit_success",
        // можно добавить 'submission_deleted' в enum
        metadata: { action: "soft_delete" }
      });
    }
    return new Response(
      JSON.stringify({
        success: true,
        data
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("DELETE /api/admin/submissions/[id] error:", error);
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
  DELETE
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
