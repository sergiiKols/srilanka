import { s as supabase } from './supabase_CyZfh9_5.mjs';

async function getAllForms(activeOnly = false) {
  let query = supabase.from("form_configs").select("*").order("created_at", { ascending: false });
  if (activeOnly) {
    query = query.eq("is_active", true);
  }
  return await query;
}
async function getFormById(id) {
  return await supabase.from("form_configs").select("*").eq("id", id).single();
}
async function createForm(form, userId) {
  return await supabase.from("form_configs").insert([{
    ...form,
    created_by: userId
  }]).select().single();
}
async function updateForm(id, updates) {
  return await supabase.from("form_configs").update(updates).eq("id", id).select().single();
}
async function deleteForm(id) {
  return await supabase.from("form_configs").delete().eq("id", id);
}
async function getSubmissions(filters = {}) {
  const {
    form_id,
    user_id,
    status,
    date_from,
    date_to,
    limit = 50,
    offset = 0,
    sort = "created_at",
    order = "desc"
  } = filters;
  let query = supabase.from("form_submissions").select("*", { count: "exact" }).neq("status", "deleted");
  if (form_id) {
    query = query.eq("form_id", form_id);
  }
  if (user_id) {
    query = query.eq("user_id", user_id);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (date_from) {
    query = query.gte("created_at", date_from);
  }
  if (date_to) {
    query = query.lte("created_at", date_to);
  }
  query = query.order(sort, { ascending: order === "asc" }).range(offset, offset + limit - 1);
  return await query;
}
async function createSubmission(submission) {
  return await supabase.from("form_submissions").insert([submission]).select().single();
}
async function updateSubmissionStatus(id, status, errorMessage, telegramMessageId) {
  return await supabase.from("form_submissions").update({
    status,
    error_message: errorMessage,
    telegram_message_id: telegramMessageId,
    processed_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", id).select().single();
}
async function deleteSubmission(id) {
  return await supabase.from("form_submissions").update({ status: "deleted" }).eq("id", id).select().single();
}
async function getFormsStats() {
  const { data: forms, error: formsError } = await supabase.from("form_configs").select("id, is_active, total_submissions");
  if (formsError || !forms) {
    return { error: formsError };
  }
  const totalForms = forms.length;
  const activeForms = forms.filter((f) => f.is_active).length;
  const totalSubmissions = forms.reduce((sum, f) => sum + (f.total_submissions || 0), 0);
  const now = /* @__PURE__ */ new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3).toISOString();
  const { count: submissionsToday } = await supabase.from("form_submissions").select("*", { count: "exact", head: true }).gte("created_at", today);
  const { count: submissionsThisWeek } = await supabase.from("form_submissions").select("*", { count: "exact", head: true }).gte("created_at", weekAgo);
  const { count: submissionsThisMonth } = await supabase.from("form_submissions").select("*", { count: "exact", head: true }).gte("created_at", monthAgo);
  return {
    data: {
      total_forms: totalForms,
      active_forms: activeForms,
      total_submissions: totalSubmissions,
      submissions_today: submissionsToday || 0,
      submissions_this_week: submissionsThisWeek || 0,
      submissions_this_month: submissionsThisMonth || 0
    }
  };
}
async function getFormStats(formId) {
  const { data: submissions, error } = await supabase.from("form_submissions").select("status, created_at").eq("form_id", formId);
  if (error || !submissions) {
    return { error };
  }
  const total = submissions.length;
  const received = submissions.filter((s) => s.status === "received").length;
  const sent = submissions.filter((s) => s.status === "sent").length;
  const errors = submissions.filter((s) => s.status === "error").length;
  return {
    data: {
      total,
      received,
      sent,
      errors,
      success_rate: total > 0 ? (sent / total * 100).toFixed(1) : "0"
    }
  };
}
async function createLog(log) {
  return await supabase.from("form_logs").insert([log]);
}
async function checkRateLimitDB(formId, userId) {
  const { data, error } = await supabase.rpc("check_form_rate_limit", {
    p_form_id: formId,
    p_user_id: userId,
    p_max_attempts: 5,
    p_window_seconds: 300
  });
  if (error) {
    console.error("Rate limit check error:", error);
    return false;
  }
  return data === true;
}

export { getFormStats as a, getFormById as b, createLog as c, deleteForm as d, getAllForms as e, createForm as f, getSubmissions as g, getFormsStats as h, deleteSubmission as i, checkRateLimitDB as j, createSubmission as k, updateSubmissionStatus as l, updateForm as u };
