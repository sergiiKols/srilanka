import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';

function LanguageSwitcher() {
  const [lang, setLang] = useState("ru");
  useEffect(() => {
    const saved = localStorage.getItem("admin_lang");
    if (saved) setLang(saved);
  }, []);
  const toggleLang = () => {
    const newLang = lang === "en" ? "ru" : "en";
    setLang(newLang);
    localStorage.setItem("admin_lang", newLang);
    window.dispatchEvent(new CustomEvent("languageChange", { detail: newLang }));
    window.location.reload();
  };
  return /* @__PURE__ */ jsxs("button", { onClick: toggleLang, className: "lang-switcher", children: [
    lang === "en" ? "🇬🇧 EN" : "🇷🇺 RU",
    /* @__PURE__ */ jsx("style", { jsx: true, children: `
        .lang-switcher {
          padding: 8px 16px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .lang-switcher:hover {
          border-color: #3b82f6;
          background: #f9fafb;
        }
      ` })
  ] });
}
function useLang() {
  const [lang, setLang] = useState("ru");
  useEffect(() => {
    const saved = localStorage.getItem("admin_lang");
    if (saved) setLang(saved);
    const handleLangChange = (e) => {
      setLang(e.detail);
    };
    window.addEventListener("languageChange", handleLangChange);
    return () => window.removeEventListener("languageChange", handleLangChange);
  }, []);
  return lang;
}

const translations = {
  en: {
    // Sidebar
    adminPanel: "Admin Panel",
    dashboard: "Dashboard",
    apiSettings: "API Settings",
    urlExpander: "URL Expander",
    poiManagement: "POI Management",
    parsingSystem: "Parsing System",
    users: "Users",
    settings: "Settings",
    telegramForms: "Telegram Forms",
    formsList: "Forms List",
    allSubmissions: "All Submissions",
    botSettings: "Bot Settings",
    backToSite: "Back to Site",
    toMap: "To Map",
    // Dashboard
    dashboardTitle: "Dashboard",
    dashboardSubtitle: "System overview and statistics",
    totalPOIs: "Total POIs",
    validatedPOIs: "Validated POIs",
    properties: "Properties",
    totalUsers: "Users",
    thisWeek: "this week",
    validationRate: "validation rate",
    today: "today",
    activeToday: "active today",
    // System Status
    systemStatus: "System Status",
    connected: "Connected",
    active: "Active",
    idle: "Idle",
    notConfigured: "Not configured",
    comingSoon: "Coming soon",
    lastPing: "Last ping",
    ago: "ago",
    quota: "Quota",
    tokensUsed: "tokens used",
    requestsToday: "requests today",
    lastRun: "Last run",
    // Recent Activity
    recentActivity: "Recent Activity",
    poiValidated: "POI Validated",
    newPOICreated: "New POI Created",
    propertyImported: "Property Imported",
    parsingCompleted: "Parsing Completed",
    newUserRegistered: "New User Registered",
    minutesAgo: "minutes ago",
    hour: "hour",
    hours: "hours",
    // Quick Actions
    quickActions: "Quick Actions",
    expandShortURL: "Expand Short URL",
    convertShortURLs: "Convert short URLs to full links",
    browsePOIs: "Browse POIs",
    viewManagePOIs: "View and manage all POIs",
    startParsing: "Start Parsing",
    parseNewPOIs: "Parse new POIs from sources",
    apiSettingsAction: "API Settings",
    manageAPIKeys: "Manage API keys and configs",
    // URL Expander
    urlExpanderTitle: "URL Expander Tool",
    urlExpanderSubtitle: "Expand short URLs and manage Telegram integrations",
    urlExpanderDescription: "Expand short URLs (bit.ly, goo.gl, t.co, etc.) to their full destination",
    shortURL: "Short URL",
    expandURL: "Expand URL",
    expanding: "Expanding...",
    expandedURL: "Expanded URL",
    time: "Time",
    openInNewTab: "Open in New Tab",
    clear: "Clear",
    exampleURLs: "Example URLs",
    clickToTest: "Click to test with example short URLs:",
    // Telegram
    telegramIntegration: "Telegram Integration Settings",
    futureFeature: "Future Feature",
    telegramWillBeAvailable: "Telegram bot and client API integration will be available soon",
    botConfiguration: "Bot Configuration",
    botToken: "Bot Token",
    botUsername: "Bot Username",
    webhookURL: "Webhook URL",
    getFrom: "Get from",
    userClientAPI: "User Client API",
    apiID: "API ID",
    apiHash: "API Hash",
    phoneNumber: "Phone Number",
    sessionString: "Session String",
    generatedAfterAuth: "Generated after first authentication (stored securely)",
    keepSecret: "Keep this secret! Has full database access.",
    channelsGroups: "Channels & Groups",
    mainChannelID: "Main Channel ID",
    forPosting: "For posting properties/POIs",
    adminChatID: "Admin Chat ID",
    forNotifications: "For notifications and logs",
    backupChannelID: "Backup Channel ID",
    optionalBackup: "Optional backup channel",
    features: "Features",
    enableAutoPosting: "Enable auto-posting to channel",
    sendParsingNotifications: "Send parsing notifications",
    enableInlineSearch: "Enable inline search via bot",
    allowUserSubmissions: "Allow user submissions via bot",
    autoExpandURLs: "Auto-expand short URLs in messages",
    botStatus: "Bot Status",
    messagesToday: "Messages Today",
    subscribers: "Subscribers",
    apiCalls: "API Calls",
    saveTelegramSettings: "Save Telegram Settings",
    testConnection: "Test Connection"
  },
  ru: {
    // Sidebar
    adminPanel: "Admin Panel",
    dashboard: "Dashboard",
    apiSettings: "API Settings",
    urlExpander: "URL Expander",
    poiManagement: "POI Management",
    parsingSystem: "Parsing System",
    users: "Users",
    settings: "Settings",
    telegramForms: "Telegram Forms",
    formsList: "Forms List",
    allSubmissions: "All Submissions",
    botSettings: "Bot Settings",
    backToSite: "Back to Site",
    toMap: "To Map",
    // Dashboard
    dashboardTitle: "Главная панель",
    dashboardSubtitle: "Обзор системы и статистика",
    totalPOIs: "Всего POI",
    validatedPOIs: "Проверенные POI",
    properties: "Объекты",
    totalUsers: "Пользователи",
    thisWeek: "на этой неделе",
    validationRate: "процент проверки",
    today: "сегодня",
    activeToday: "активны сегодня",
    // System Status
    systemStatus: "Статус системы",
    connected: "Подключено",
    active: "Активно",
    idle: "Простой",
    notConfigured: "Не настроено",
    comingSoon: "Скоро",
    lastPing: "Последний пинг",
    ago: "назад",
    quota: "Квота",
    tokensUsed: "токенов использовано",
    requestsToday: "запросов сегодня",
    lastRun: "Последний запуск",
    // Recent Activity
    recentActivity: "Последние действия",
    poiValidated: "POI проверен",
    newPOICreated: "Создан новый POI",
    propertyImported: "Импорт объекта",
    parsingCompleted: "Парсинг завершен",
    newUserRegistered: "Новый пользователь",
    minutesAgo: "минут назад",
    hour: "час",
    hours: "часов",
    // Quick Actions
    quickActions: "Быстрые действия",
    expandShortURL: "Развернуть ссылку",
    convertShortURLs: "Конвертировать короткие ссылки в полные",
    browsePOIs: "Просмотр POI",
    viewManagePOIs: "Просмотр и управление всеми POI",
    startParsing: "Запустить парсинг",
    parseNewPOIs: "Парсинг новых POI из источников",
    apiSettingsAction: "Настройки API",
    manageAPIKeys: "Управление API ключами и настройками",
    // URL Expander
    urlExpanderTitle: "Инструмент разворота ссылок",
    urlExpanderSubtitle: "Разворот коротких ссылок и управление Telegram интеграцией",
    urlExpanderDescription: "Разворачивайте короткие ссылки (bit.ly, goo.gl, t.co и др.) в полные URL",
    shortURL: "Короткая ссылка",
    expandURL: "Развернуть ссылку",
    expanding: "Разворачиваю...",
    expandedURL: "Развернутая ссылка",
    time: "Время",
    openInNewTab: "Открыть в новой вкладке",
    clear: "Очистить",
    exampleURLs: "Примеры ссылок",
    clickToTest: "Нажмите для тестирования с примерами коротких ссылок:",
    // Telegram
    telegramIntegration: "Настройки интеграции с Telegram",
    futureFeature: "Будущая функция",
    telegramWillBeAvailable: "Интеграция с Telegram ботом и Client API будет доступна в ближайшее время",
    botConfiguration: "Настройка бота",
    botToken: "Токен бота",
    botUsername: "Имя бота",
    webhookURL: "URL вебхука",
    getFrom: "Получить от",
    userClientAPI: "Client API пользователя",
    apiID: "API ID",
    apiHash: "API Hash",
    phoneNumber: "Номер телефона",
    sessionString: "Строка сессии",
    generatedAfterAuth: "Генерируется после первой аутентификации (хранится безопасно)",
    keepSecret: "Храните в секрете! Полный доступ к базе данных.",
    channelsGroups: "Каналы и группы",
    mainChannelID: "ID основного канала",
    forPosting: "Для публикации объектов/POI",
    adminChatID: "ID админского чата",
    forNotifications: "Для уведомлений и логов",
    backupChannelID: "ID резервного канала",
    optionalBackup: "Опциональный резервный канал",
    features: "Функции",
    enableAutoPosting: "Включить автопостинг в канал",
    sendParsingNotifications: "Отправлять уведомления о парсинге",
    enableInlineSearch: "Включить inline поиск через бота",
    allowUserSubmissions: "Разрешить добавление через бота",
    autoExpandURLs: "Автоматически разворачивать короткие ссылки",
    botStatus: "Статус бота",
    messagesToday: "Сообщений сегодня",
    subscribers: "Подписчики",
    apiCalls: "API вызовы",
    saveTelegramSettings: "Сохранить настройки Telegram",
    testConnection: "Проверить соединение"
  }
};
function t(key, lang = "ru") {
  return translations[lang][key] || key;
}

function AdminLayout({
  children,
  title,
  subtitle,
  headerAction
}) {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const lang = useLang();
  const navItems = [
    { href: "/admin", icon: "📊", label: t("dashboard", lang) },
    { href: "/admin/api-settings", icon: "🔑", label: t("apiSettings", lang) },
    { href: "/admin/tools/url-expander", icon: "🔗", label: t("urlExpander", lang) },
    { href: "/admin/pois", icon: "📍", label: t("poiManagement", lang) },
    { href: "/admin/supabase", icon: "🗄️", label: "Supabase DB" },
    { href: "/admin/parsing", icon: "🔄", label: t("parsingSystem", lang) },
    { href: "/admin/cron-jobs", icon: "⏰", label: lang === "ru" ? "Cron Jobs" : "Cron Jobs" },
    { href: "/admin/users", icon: "👥", label: t("users", lang) },
    {
      icon: "📋",
      label: t("telegramForms", lang),
      submenu: [
        { href: "/admin/forms/telegram", label: t("formsList", lang) },
        { href: "/admin/forms/telegram/submissions", label: t("allSubmissions", lang) },
        { href: "/admin/forms/telegram/settings", label: t("botSettings", lang) }
      ]
    },
    { href: "/admin/skills", icon: "🤖", label: lang === "ru" ? "MCP Skills" : "MCP Skills" },
    { href: "/admin/settings", icon: "⚙️", label: t("settings", lang) }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "admin-container", children: [
    /* @__PURE__ */ jsxs("aside", { className: "admin-sidebar", children: [
      /* @__PURE__ */ jsxs("div", { className: "sidebar-header", children: [
        /* @__PURE__ */ jsxs("h2", { children: [
          "⚙️ ",
          t("adminPanel", lang)
        ] }),
        /* @__PURE__ */ jsx("p", { className: "version", children: "v0.1.0" })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "sidebar-nav", children: navItems.map((item, index) => item.submenu ? /* @__PURE__ */ jsxs("div", { className: "nav-group", children: [
        /* @__PURE__ */ jsxs("div", { className: "nav-item nav-group-header", children: [
          /* @__PURE__ */ jsx("span", { className: "icon", children: item.icon }),
          /* @__PURE__ */ jsx("span", { children: item.label })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "submenu", children: item.submenu.map((subitem) => /* @__PURE__ */ jsx(
          "a",
          {
            href: subitem.href,
            className: `nav-item submenu-item ${currentPath === subitem.href ? "active" : ""}`,
            children: /* @__PURE__ */ jsx("span", { children: subitem.label })
          },
          subitem.href
        )) })
      ] }, `submenu-${index}`) : /* @__PURE__ */ jsxs(
        "a",
        {
          href: item.href,
          className: `nav-item ${currentPath === item.href ? "active" : ""}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: "icon", children: item.icon }),
            /* @__PURE__ */ jsx("span", { children: item.label })
          ]
        },
        item.href
      )) }),
      /* @__PURE__ */ jsx("div", { className: "sidebar-footer", children: /* @__PURE__ */ jsxs("a", { href: "/map", className: "nav-item", children: [
        /* @__PURE__ */ jsx("span", { className: "icon", children: "🗺️" }),
        /* @__PURE__ */ jsx("span", { children: t("toMap", lang) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "admin-main", children: [
      /* @__PURE__ */ jsxs("header", { className: "admin-header", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { children: title || t("adminPanel", lang) }),
          subtitle && /* @__PURE__ */ jsx("p", { className: "subtitle", children: subtitle })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "header-actions", children: [
          /* @__PURE__ */ jsx(LanguageSwitcher, {}),
          headerAction
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "admin-content", children })
    ] }),
    /* @__PURE__ */ jsx("style", { jsx: true, children: `
        .admin-container {
          display: flex;
          min-height: 100vh;
          background: #f5f5f5;
        }

        .admin-sidebar {
          width: 260px;
          background: #1a1a1a;
          color: white;
          position: fixed;
          height: 100vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-header h2 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
        }

        .version {
          margin: 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 0;
        }

        .sidebar-footer {
          padding: 20px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .nav-item.active {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          border-left: 3px solid #3b82f6;
        }

        .nav-item .icon {
          font-size: 18px;
        }

        .nav-group {
          margin-bottom: 8px;
        }

        .nav-group-header {
          cursor: default;
          font-weight: 500;
        }

        .submenu {
          background: rgba(0, 0, 0, 0.2);
          border-left: 2px solid rgba(255, 255, 255, 0.1);
          margin-left: 20px;
        }

        .submenu-item {
          padding-left: 44px;
          font-size: 14px;
        }

        .submenu-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .submenu-item.active {
          background: rgba(59, 130, 246, 0.2);
          border-left: 3px solid #3b82f6;
        }

        .admin-main {
          flex: 1;
          margin-left: 260px;
        }

        .admin-header {
          background: white;
          padding: 30px 40px;
          border-bottom: 1px solid #e5e5e5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .admin-header h1 {
          margin: 0 0 5px 0;
          font-size: 28px;
          color: #1a1a1a;
        }

        .subtitle {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .admin-content {
          padding: 40px;
          max-width: 1200px;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .admin-sidebar {
            display: none;
          }
          
          .admin-main {
            margin-left: 0;
          }
          
          .admin-header {
            padding: 20px 16px;
          }
          
          .admin-header h1 {
            font-size: 22px;
          }
          
          .admin-content {
            padding: 20px 16px;
          }
        }
      ` })
  ] });
}

export { AdminLayout as A, t, useLang as u };
