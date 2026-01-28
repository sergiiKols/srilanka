import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, n as defineScriptVars, h as addAttribute, m as maybeRenderHead } from '../../../../../chunks/astro/server_CZKHqJbe.mjs';
import 'piccolore';
import { j as jsxRuntimeExports, A as AdminLayout } from '../../../../../chunks/AdminLayout_xmS9cJRX.mjs';
import { a as reactExports } from '../../../../../chunks/_@astro-renderers_1ISMqT13.mjs';
export { r as renderers } from '../../../../../chunks/_@astro-renderers_1ISMqT13.mjs';
import toast from 'react-hot-toast';
import { E as ErrorBoundary } from '../../../../../chunks/ErrorBoundary_BH6ConEo.mjs';
import { r as requireAdminPage } from '../../../../../chunks/auth_DRVvN-zp.mjs';

function SubmissionsTable({ formId }) {
  const [submissions, setSubmissions] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [total, setTotal] = reactExports.useState(0);
  const [stats, setStats] = reactExports.useState(null);
  const [filters, setFilters] = reactExports.useState({
    form_id: formId,
    limit: 50,
    offset: 0,
    sort: "created_at",
    order: "desc"
  });
  const [selectedSubmission, setSelectedSubmission] = reactExports.useState(null);
  const [autoRefresh, setAutoRefresh] = reactExports.useState(false);
  const loadSubmissions = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== void 0 && value !== null) {
          params.append(key, String(value));
        }
      });
      const response = await fetch(`/api/admin/forms/${formId}/submissions?${params}`);
      const result = await response.json();
      if (result.success) {
        setSubmissions(result.data || []);
        setTotal(result.count || 0);
        setStats(result.stats || null);
      } else {
        toast.error("Ошибка загрузки заявок");
      }
    } catch (error) {
      console.error("Load submissions error:", error);
      toast.error("Ошибка загрузки заявок");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    loadSubmissions();
  }, [filters]);
  reactExports.useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadSubmissions();
    }, 1e4);
    return () => clearInterval(interval);
  }, [autoRefresh, filters]);
  const handleExport = async () => {
    try {
      toast.loading("Экспорт...", { id: "export" });
      const params = new URLSearchParams();
      params.append("export", "csv");
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== void 0 && value !== null && key !== "limit" && key !== "offset") {
          params.append(key, String(value));
        }
      });
      const response = await fetch(`/api/admin/forms/${formId}/submissions?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `submissions_${formId}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Экспорт завершен", { id: "export" });
      } else {
        toast.error("Ошибка экспорта", { id: "export" });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Ошибка экспорта", { id: "export" });
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Удалить эту заявку?")) return;
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        toast.success("Заявка удалена");
        loadSubmissions();
      } else {
        toast.error("Ошибка удаления");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Ошибка удаления");
    }
  };
  const currentPage = Math.floor(filters.offset / filters.limit) + 1;
  const totalPages = Math.ceil(total / filters.limit);
  const goToPage = (page) => {
    setFilters({
      ...filters,
      offset: (page - 1) * filters.limit
    });
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };
  const getStatusBadge = (status) => {
    const colors = {
      received: "bg-gray-100 text-gray-800",
      processing: "bg-blue-100 text-blue-800",
      sent: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800"
    };
    const labels = {
      received: "Получено",
      processing: "Обработка",
      sent: "Отправлено",
      error: "Ошибка"
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`, children: labels[status] });
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    stats && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-lg border border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-gray-900", children: stats.total }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: "Всего заявок" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-lg border border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-600", children: stats.sent }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: "Отправлено" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-lg border border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-red-600", children: stats.errors }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: "Ошибок" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-lg border border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [
          stats.success_rate,
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: "Успешность" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-lg border border-gray-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold", children: [
          "Заявки (",
          total,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: autoRefresh,
                onChange: (e) => setAutoRefresh(e.target.checked),
                className: "w-4 h-4 text-blue-600 rounded"
              }
            ),
            "Авто-обновление (10с)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => loadSubmissions(),
              className: "px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded",
              children: "🔄 Обновить"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleExport,
              className: "px-3 py-1 text-sm bg-green-600 text-white hover:bg-green-700 rounded",
              children: "📥 Экспорт CSV"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filters.status || "",
            onChange: (e) => setFilters({ ...filters, status: e.target.value || void 0, offset: 0 }),
            className: "px-3 py-2 border border-gray-300 rounded text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Все статусы" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "received", children: "Получено" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "processing", children: "Обработка" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "sent", children: "Отправлено" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "error", children: "Ошибка" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: filters.date_from || "",
            onChange: (e) => setFilters({ ...filters, date_from: e.target.value || void 0, offset: 0 }),
            className: "px-3 py-2 border border-gray-300 rounded text-sm",
            placeholder: "Дата от"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: filters.date_to || "",
            onChange: (e) => setFilters({ ...filters, date_to: e.target.value || void 0, offset: 0 }),
            className: "px-3 py-2 border border-gray-300 rounded text-sm",
            placeholder: "Дата до"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filters.limit,
            onChange: (e) => setFilters({ ...filters, limit: parseInt(e.target.value), offset: 0 }),
            className: "px-3 py-2 border border-gray-300 rounded text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "10", children: "10 на странице" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "25", children: "25 на странице" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "50", children: "50 на странице" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "100", children: "100 на странице" })
            ]
          }
        )
      ] })
    ] }),
    submissions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white p-12 rounded-lg border border-gray-200 text-center text-gray-500", children: "Заявок пока нет" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Дата" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Пользователь" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Статус" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Данные" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase", children: "Действия" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-200", children: submissions.map((submission) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm text-gray-900", children: formatDate(submission.created_at) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-gray-900", children: [
              submission.first_name,
              " ",
              submission.last_name
            ] }),
            submission.username && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-gray-500", children: [
              "@",
              submission.username
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-400", children: [
              "ID: ",
              submission.user_id
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm", children: getStatusBadge(submission.status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setSelectedSubmission(submission),
              className: "text-blue-600 hover:underline",
              children: "Просмотр"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleDelete(submission.id),
              className: "text-red-600 hover:underline",
              children: "Удалить"
            }
          ) })
        ] }, submission.id)) })
      ] }) }),
      totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-t border-gray-200 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-700", children: [
          "Показано ",
          filters.offset + 1,
          " - ",
          Math.min(filters.offset + filters.limit, total),
          " из ",
          total
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => goToPage(currentPage - 1),
              disabled: currentPage === 1,
              className: "px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50",
              children: "← Назад"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => goToPage(page),
                className: `px-3 py-1 border rounded text-sm ${currentPage === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-50"}`,
                children: page
              },
              page
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => goToPage(currentPage + 1),
              disabled: currentPage === totalPages,
              className: "px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50",
              children: "Вперёд →"
            }
          )
        ] })
      ] })
    ] }),
    selectedSubmission && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50",
        onClick: () => setSelectedSubmission(null),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto p-6",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold", children: "Детали заявки" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setSelectedSubmission(null),
                    className: "text-gray-400 hover:text-gray-600 text-2xl",
                    children: "×"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-500", children: "ID заявки" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-sm", children: selectedSubmission.id })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-500", children: "Дата создания" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: formatDate(selectedSubmission.created_at) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-500", children: "Пользователь" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    selectedSubmission.first_name,
                    " ",
                    selectedSubmission.last_name,
                    selectedSubmission.username && ` (@${selectedSubmission.username})`,
                    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
                      "Telegram ID: ",
                      selectedSubmission.user_id
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-500", children: "Статус" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: getStatusBadge(selectedSubmission.status) })
                ] }),
                selectedSubmission.error_message && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-500", children: "Ошибка" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-600 text-sm", children: selectedSubmission.error_message })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-500 mb-2", children: "Данные формы" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-50 rounded p-4 space-y-2", children: Object.entries(selectedSubmission.data).map(([key, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500 uppercase", children: key }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: String(value) })
                  ] }, key)) })
                ] }),
                selectedSubmission.telegram_message_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-500", children: "Telegram Message ID" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-sm", children: selectedSubmission.telegram_message_id })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setSelectedSubmission(null),
                  className: "px-4 py-2 bg-gray-200 rounded hover:bg-gray-300",
                  children: "Закрыть"
                }
              ) })
            ]
          }
        )
      }
    )
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Submissions = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Submissions;
  const authResult = await requireAdminPage(Astro2);
  if (authResult.redirect) return authResult.redirect;
  const user = authResult.user;
  const formId = Astro2.params.id;
  if (!formId) {
    return Astro2.redirect("/admin/forms/telegram");
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", AdminLayout, { "title": "\u0417\u0430\u044F\u0432\u043A\u0438 \u0444\u043E\u0440\u043C\u044B", "user": user }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="space-y-6"> <!-- \u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F --> <div class="flex items-center justify-between"> <div class="flex items-center gap-2 text-sm text-gray-600"> <a href="/admin/forms/telegram" class="hover:text-blue-600">\u0424\u043E\u0440\u043C\u044B</a> <span>/</span> <a', ' class="hover:text-blue-600">\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435</a> <span>/</span> <span class="text-gray-900">\u0417\u0430\u044F\u0432\u043A\u0438</span> </div> <a', ' class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">\n\u2190 \u041D\u0430\u0437\u0430\u0434 \u043A \u0444\u043E\u0440\u043C\u0435\n</a> </div> <!-- \u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A --> <div> <h1 class="text-3xl font-bold text-gray-900">\u0417\u0430\u044F\u0432\u043A\u0438 \u0444\u043E\u0440\u043C\u044B</h1> <p class="text-gray-600 mt-1" id="form-title-display">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...</p> </div> <!-- \u0422\u0430\u0431\u043B\u0438\u0446\u0430 \u0437\u0430\u044F\u0432\u043E\u043A --> ', " </div> <script>(function(){", "\n    // \u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0444\u043E\u0440\u043C\u044B\n    async function loadFormTitle() {\n      try {\n        const response = await fetch(`/api/admin/forms/${formId}`);\n        const result = await response.json();\n        \n        if (result.success && result.data) {\n          document.getElementById('form-title-display').textContent = result.data.title;\n        }\n      } catch (error) {\n        console.error('Load form title error:', error);\n      }\n    }\n\n    loadFormTitle();\n  })();<\/script> "], [" ", '<div class="space-y-6"> <!-- \u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F --> <div class="flex items-center justify-between"> <div class="flex items-center gap-2 text-sm text-gray-600"> <a href="/admin/forms/telegram" class="hover:text-blue-600">\u0424\u043E\u0440\u043C\u044B</a> <span>/</span> <a', ' class="hover:text-blue-600">\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435</a> <span>/</span> <span class="text-gray-900">\u0417\u0430\u044F\u0432\u043A\u0438</span> </div> <a', ' class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">\n\u2190 \u041D\u0430\u0437\u0430\u0434 \u043A \u0444\u043E\u0440\u043C\u0435\n</a> </div> <!-- \u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A --> <div> <h1 class="text-3xl font-bold text-gray-900">\u0417\u0430\u044F\u0432\u043A\u0438 \u0444\u043E\u0440\u043C\u044B</h1> <p class="text-gray-600 mt-1" id="form-title-display">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...</p> </div> <!-- \u0422\u0430\u0431\u043B\u0438\u0446\u0430 \u0437\u0430\u044F\u0432\u043E\u043A --> ', " </div> <script>(function(){", "\n    // \u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0444\u043E\u0440\u043C\u044B\n    async function loadFormTitle() {\n      try {\n        const response = await fetch(\\`/api/admin/forms/\\${formId}\\`);\n        const result = await response.json();\n        \n        if (result.success && result.data) {\n          document.getElementById('form-title-display').textContent = result.data.title;\n        }\n      } catch (error) {\n        console.error('Load form title error:', error);\n      }\n    }\n\n    loadFormTitle();\n  })();<\/script> "])), maybeRenderHead(), addAttribute(`/admin/forms/telegram/${formId}`, "href"), addAttribute(`/admin/forms/telegram/${formId}`, "href"), renderComponent($$result2, "ErrorBoundary", ErrorBoundary, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/ErrorBoundary.tsx", "client:component-export": "default" }, { "default": async ($$result3) => renderTemplate` ${renderComponent($$result3, "SubmissionsTable", SubmissionsTable, { "formId": formId, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/SubmissionsTable.tsx", "client:component-export": "default" })} ` }), defineScriptVars({ formId })) })}`;
}, "C:/Users/User/Desktop/sri/src/pages/admin/forms/telegram/[id]/submissions.astro", void 0);

const $$file = "C:/Users/User/Desktop/sri/src/pages/admin/forms/telegram/[id]/submissions.astro";
const $$url = "/admin/forms/telegram/[id]/submissions";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Submissions,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
