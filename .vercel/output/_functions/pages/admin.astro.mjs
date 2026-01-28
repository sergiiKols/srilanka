import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_CZKHqJbe.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_lp9ZR76Z.mjs';
import { u as useLang, j as jsxRuntimeExports, t, A as AdminLayout } from '../chunks/AdminLayout_xmS9cJRX.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_1ISMqT13.mjs';

function DashboardRu() {
  const lang = useLang();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dashboard", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats-grid", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "📍" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: "1,234" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: t("totalPOIs", lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-change positive", children: [
            "+45 ",
            t("thisWeek", lang)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "✅" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: "892" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: t("validatedPOIs", lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-change", children: [
            "72% ",
            t("validationRate", lang)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "🏠" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: "156" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: t("properties", lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-change positive", children: [
            "+12 ",
            t("today", lang)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "👥" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: "23" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: t("totalUsers", lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-change", children: [
            "5 ",
            t("activeToday", lang)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", onClick: () => window.location.href = "/admin/forms/telegram", style: { cursor: "pointer" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "📋" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: "5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Telegram Forms" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-change positive", children: [
            "+3 ",
            t("thisWeek", lang)
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { children: [
        "🚦 ",
        t("systemStatus", lang)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-grid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-indicator active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-name", children: "Supabase Database" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-info", children: [
              t("connected", lang),
              " • ",
              t("lastPing", lang),
              ": 2s ",
              t("ago", lang)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-action", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-icon", children: "🔄" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-indicator active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-name", children: "Google Maps API" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-info", children: [
              t("active", lang),
              " • ",
              t("quota", lang),
              ": 1,234/5,000 ",
              t("today", lang)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-action", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/admin/api-settings", className: "btn-icon", children: "⚙️" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-indicator active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-name", children: "Groq AI (Парсинг)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-info", children: [
              t("active", lang),
              " • 45K/100K ",
              t("tokensUsed", lang)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-action", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/admin/api-settings", className: "btn-icon", children: "⚙️" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-indicator active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-name", children: "Perplexity API" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-info", children: [
              t("active", lang),
              " • 12/50 ",
              t("requestsToday", lang)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-action", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/admin/tools/url-expander", className: "btn-icon", children: "🔗" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-indicator idle" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-name", children: t("parsingSystem", lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-info", children: [
              t("idle", lang),
              " • ",
              t("lastRun", lang),
              ": 2 ",
              t("hours", lang),
              " ",
              t("ago", lang)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-action", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/admin/parsing", className: "btn-icon", children: "▶️" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-indicator active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-name", children: "Telegram Bot" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-info", children: [
              t("active", lang),
              " • 5 forms configured"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-action", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/admin/forms/telegram", className: "btn-icon", children: "📋" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-indicator active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-name", children: "Telegram Forms" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-info", children: [
              t("active", lang),
              " • 5 active forms"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-action", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/admin/forms/telegram/submissions", className: "btn-icon", children: "📊" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-indicator active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-name", children: "Cron Jobs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-info", children: [
              t("active", lang),
              " • 2 автоматические задачи"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-action", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/admin/cron-jobs", className: "btn-icon", children: "⏰" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-indicator active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-name", children: "Database Tables" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-info", children: [
              t("active", lang),
              " • 24 tables | 12.7 MB total"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-action", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/admin/database", className: "btn-icon", children: "🗄️" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { children: [
        "📋 ",
        t("recentActivity", lang)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-list", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-icon", children: "✅" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-title", children: t("poiValidated", lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-description", children: '"Unawatuna Beach Hotel" проверен администратором' }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-time", children: [
              "5 ",
              t("minutesAgo", lang)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-icon", children: "📍" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-title", children: t("newPOICreated", lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-description", children: '"Sunset Bar & Grill" добавлен в регион Негомбо' }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-time", children: [
              "23 ",
              t("minutesAgo", lang)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-icon", children: "🏠" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-title", children: t("propertyImported", lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-description", children: "3 новых объекта импортировано через AI инструмент" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-time", children: [
              "1 ",
              t("hour", lang),
              " ",
              t("ago", lang)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-icon", children: "🔄" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-title", children: t("parsingCompleted", lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-description", children: "Pass 1: 127/150 POI обработано успешно" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-time", children: [
              "2 ",
              t("hours", lang),
              " ",
              t("ago", lang)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-icon", children: "👤" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-title", children: t("newUserRegistered", lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "activity-description", children: "user@example.com присоединился к платформе" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "activity-time", children: [
              "3 ",
              t("hours", lang),
              " ",
              t("ago", lang)
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { children: [
        "⚡ ",
        t("quickActions", lang)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "actions-grid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/admin/tools/url-expander", className: "action-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-icon", children: "🔗" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-title", children: t("expandShortURL", lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-description", children: t("convertShortURLs", lang) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/admin/pois", className: "action-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-icon", children: "📍" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-title", children: t("browsePOIs", lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-description", children: t("viewManagePOIs", lang) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/admin/parsing", className: "action-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-icon", children: "🔄" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-title", children: t("startParsing", lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-description", children: t("parseNewPOIs", lang) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/admin/api-settings", className: "action-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-icon", children: "🔑" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-title", children: t("apiSettingsAction", lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-description", children: t("manageAPIKeys", lang) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/admin/database", className: "action-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-icon", children: "🗄️" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-title", children: lang === "ru" ? "База данных" : "Database Tables" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-description", children: lang === "ru" ? "Просмотр всех 24 таблиц Supabase" : "View all 24 Supabase tables" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/admin/supabase", className: "action-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-icon", children: "📊" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-title", children: lang === "ru" ? "Supabase POI" : "Supabase POI" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-description", children: lang === "ru" ? "Статистика POI объектов (6,176)" : "POI Statistics (6,176)" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { jsx: true, children: `
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .stat-icon {
          font-size: 32px;
          line-height: 1;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .stat-change {
          font-size: 12px;
          color: #6b7280;
        }

        .stat-change.positive {
          color: #10b981;
          font-weight: 500;
        }

        .section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section h2 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: #1a1a1a;
        }

        .status-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .status-item:hover {
          background: #f3f4f6;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-indicator.active {
          background: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
        }

        .status-indicator.idle {
          background: #f59e0b;
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
        }

        .status-indicator.inactive {
          background: #ef4444;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
        }

        .status-content {
          flex: 1;
        }

        .status-name {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .status-info {
          font-size: 13px;
          color: #6b7280;
        }

        .status-action {
          flex-shrink: 0;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .activity-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .activity-description {
          font-size: 14px;
          color: #4b5563;
          margin-bottom: 4px;
        }

        .activity-time {
          font-size: 12px;
          color: #9ca3af;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .action-card:nth-child(2) {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .action-card:nth-child(3) {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .action-card:nth-child(4) {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        .action-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }

        .action-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .action-description {
          font-size: 13px;
          opacity: 0.9;
        }

        .btn-icon {
          padding: 8px 12px;
          background: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
          text-decoration: none;
          display: inline-block;
        }

        .btn-icon:hover {
          background: #f3f4f6;
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .actions-grid {
            grid-template-columns: 1fr;
          }
          
          .stat-card {
            padding: 16px;
          }
        }
      ` })
  ] });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u0410\u0434\u043C\u0438\u043D-\u043F\u0430\u043D\u0435\u043B\u044C" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminLayout", AdminLayout, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/AdminLayout", "client:component-export": "default" }, { "default": async ($$result3) => renderTemplate` ${renderComponent($$result3, "DashboardRu", DashboardRu, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/DashboardRu", "client:component-export": "default" })} ` })} ` })}`;
}, "C:/Users/User/Desktop/sri/src/pages/admin/index.astro", void 0);

const $$file = "C:/Users/User/Desktop/sri/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
