import { b as FormSubmissionSchema } from '../../chunks/telegram.types_hrEzItCz.mjs';
import { d as decryptBotToken, v as verifyTelegramWebAppData, a as validateFormData, f as formatMessageTemplate, s as sendTelegramMessage } from '../../chunks/telegram_B-Cestcv.mjs';
import { b as getFormById, c as createLog, j as checkRateLimitDB, k as createSubmission, l as updateSubmissionStatus } from '../../chunks/db_CeY49yL6.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_1ISMqT13.mjs';

const POST = async (context) => {
  const startTime = Date.now();
  try {
    const body = await context.request.json();
    const validation = FormSubmissionSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid payload",
          code: "VALIDATION_ERROR",
          details: validation.error.errors
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { form_id, user_id, first_name, last_name, username, data, initData } = validation.data;
    const { data: form, error: formError } = await getFormById(form_id);
    if (formError || !form) {
      await createLog({
        form_id,
        event_type: "submit_start",
        error_message: "Form not found",
        error_code: "FORM_NOT_FOUND"
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: "Form not found",
          code: "FORM_NOT_FOUND"
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!form.is_active) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Form is not active",
          code: "FORM_INACTIVE"
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const botToken = form.bot_token_encrypted ? decryptBotToken(form.bot_token_encrypted, undefined                           || "default-secret") : undefined                                  ;
    if (!botToken) {
      await createLog({
        form_id,
        event_type: "telegram_send_error",
        error_message: "Bot token not configured",
        error_code: "NO_BOT_TOKEN"
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: "Bot token not configured",
          code: "CONFIGURATION_ERROR"
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!verifyTelegramWebAppData(initData, botToken)) {
      await createLog({
        form_id,
        event_type: "validation_error",
        error_message: "Invalid Telegram signature",
        error_code: "INVALID_SIGNATURE"
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid Telegram signature",
          code: "INVALID_SIGNATURE"
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const rateLimitOk = await checkRateLimitDB(form_id, user_id);
    if (!rateLimitOk) {
      await createLog({
        form_id,
        event_type: "rate_limit_exceeded",
        metadata: { user_id }
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: "Too many requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED"
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
    const formValidation = validateFormData(data, form.fields);
    if (!formValidation.valid) {
      await createLog({
        form_id,
        event_type: "validation_error",
        error_message: "Form validation failed",
        metadata: { errors: formValidation.errors }
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: "Validation failed",
          code: "FORM_VALIDATION_ERROR",
          details: formValidation.errors
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: submission, error: submissionError } = await createSubmission({
      form_id,
      user_id,
      first_name,
      last_name,
      username,
      data,
      status: "processing",
      ip_address: context.clientAddress,
      user_agent: context.request.headers.get("user-agent") || void 0
    });
    if (submissionError || !submission) {
      await createLog({
        form_id,
        event_type: "submit_start",
        error_message: "Failed to save submission",
        error_code: "DATABASE_ERROR"
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to save submission",
          code: "DATABASE_ERROR"
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const chatId = form.chat_id || undefined                                ;
    if (!chatId) {
      await updateSubmissionStatus(submission.id, "received");
      return new Response(
        JSON.stringify({
          success: true,
          submission_id: submission.id
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    const message = formatMessageTemplate(form.message_template, submission, data);
    const telegramResult = await sendTelegramMessage({
      botToken,
      chatId,
      text: message
    });
    if (telegramResult.success) {
      await updateSubmissionStatus(
        submission.id,
        "sent",
        void 0,
        telegramResult.message_id
      );
      await createLog({
        form_id,
        submission_id: submission.id,
        event_type: "telegram_send_success",
        metadata: {
          message_id: telegramResult.message_id,
          processing_time_ms: Date.now() - startTime
        }
      });
      return new Response(
        JSON.stringify({
          success: true,
          submission_id: submission.id,
          telegram_message_id: telegramResult.message_id
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      await updateSubmissionStatus(
        submission.id,
        "error",
        telegramResult.error
      );
      await createLog({
        form_id,
        submission_id: submission.id,
        event_type: "telegram_send_error",
        error_message: telegramResult.error,
        error_code: "TELEGRAM_API_ERROR"
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to send Telegram message",
          code: "TELEGRAM_ERROR",
          details: telegramResult.error
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("POST /api/telegram-form error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        code: "INTERNAL_ERROR"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
