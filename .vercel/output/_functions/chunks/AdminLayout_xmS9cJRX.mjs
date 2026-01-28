import { b as requireReact, a as reactExports } from './_@astro-renderers_1ISMqT13.mjs';

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production = {};

/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production;

function requireReactJsxRuntime_production () {
	if (hasRequiredReactJsxRuntime_production) return reactJsxRuntime_production;
	hasRequiredReactJsxRuntime_production = 1;
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
	  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
	  var key = null;
	  void 0 !== maybeKey && (key = "" + maybeKey);
	  void 0 !== config.key && (key = "" + config.key);
	  if ("key" in config) {
	    maybeKey = {};
	    for (var propName in config)
	      "key" !== propName && (maybeKey[propName] = config[propName]);
	  } else maybeKey = config;
	  config = maybeKey.ref;
	  return {
	    $$typeof: REACT_ELEMENT_TYPE,
	    type: type,
	    key: key,
	    ref: void 0 !== config ? config : null,
	    props: maybeKey
	  };
	}
	reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE;
	reactJsxRuntime_production.jsx = jsxProd;
	reactJsxRuntime_production.jsxs = jsxProd;
	return reactJsxRuntime_production;
}

var reactJsxRuntime_development = {};

/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_development;

function requireReactJsxRuntime_development () {
	if (hasRequiredReactJsxRuntime_development) return reactJsxRuntime_development;
	hasRequiredReactJsxRuntime_development = 1;
	"production" !== process.env.NODE_ENV &&
	  (function () {
	    function getComponentNameFromType(type) {
	      if (null == type) return null;
	      if ("function" === typeof type)
	        return type.$$typeof === REACT_CLIENT_REFERENCE
	          ? null
	          : type.displayName || type.name || null;
	      if ("string" === typeof type) return type;
	      switch (type) {
	        case REACT_FRAGMENT_TYPE:
	          return "Fragment";
	        case REACT_PROFILER_TYPE:
	          return "Profiler";
	        case REACT_STRICT_MODE_TYPE:
	          return "StrictMode";
	        case REACT_SUSPENSE_TYPE:
	          return "Suspense";
	        case REACT_SUSPENSE_LIST_TYPE:
	          return "SuspenseList";
	        case REACT_ACTIVITY_TYPE:
	          return "Activity";
	      }
	      if ("object" === typeof type)
	        switch (
	          ("number" === typeof type.tag &&
	            console.error(
	              "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
	            ),
	          type.$$typeof)
	        ) {
	          case REACT_PORTAL_TYPE:
	            return "Portal";
	          case REACT_CONTEXT_TYPE:
	            return type.displayName || "Context";
	          case REACT_CONSUMER_TYPE:
	            return (type._context.displayName || "Context") + ".Consumer";
	          case REACT_FORWARD_REF_TYPE:
	            var innerType = type.render;
	            type = type.displayName;
	            type ||
	              ((type = innerType.displayName || innerType.name || ""),
	              (type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef"));
	            return type;
	          case REACT_MEMO_TYPE:
	            return (
	              (innerType = type.displayName || null),
	              null !== innerType
	                ? innerType
	                : getComponentNameFromType(type.type) || "Memo"
	            );
	          case REACT_LAZY_TYPE:
	            innerType = type._payload;
	            type = type._init;
	            try {
	              return getComponentNameFromType(type(innerType));
	            } catch (x) {}
	        }
	      return null;
	    }
	    function testStringCoercion(value) {
	      return "" + value;
	    }
	    function checkKeyStringCoercion(value) {
	      try {
	        testStringCoercion(value);
	        var JSCompiler_inline_result = !1;
	      } catch (e) {
	        JSCompiler_inline_result = true;
	      }
	      if (JSCompiler_inline_result) {
	        JSCompiler_inline_result = console;
	        var JSCompiler_temp_const = JSCompiler_inline_result.error;
	        var JSCompiler_inline_result$jscomp$0 =
	          ("function" === typeof Symbol &&
	            Symbol.toStringTag &&
	            value[Symbol.toStringTag]) ||
	          value.constructor.name ||
	          "Object";
	        JSCompiler_temp_const.call(
	          JSCompiler_inline_result,
	          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
	          JSCompiler_inline_result$jscomp$0
	        );
	        return testStringCoercion(value);
	      }
	    }
	    function getTaskName(type) {
	      if (type === REACT_FRAGMENT_TYPE) return "<>";
	      if (
	        "object" === typeof type &&
	        null !== type &&
	        type.$$typeof === REACT_LAZY_TYPE
	      )
	        return "<...>";
	      try {
	        var name = getComponentNameFromType(type);
	        return name ? "<" + name + ">" : "<...>";
	      } catch (x) {
	        return "<...>";
	      }
	    }
	    function getOwner() {
	      var dispatcher = ReactSharedInternals.A;
	      return null === dispatcher ? null : dispatcher.getOwner();
	    }
	    function UnknownOwner() {
	      return Error("react-stack-top-frame");
	    }
	    function hasValidKey(config) {
	      if (hasOwnProperty.call(config, "key")) {
	        var getter = Object.getOwnPropertyDescriptor(config, "key").get;
	        if (getter && getter.isReactWarning) return false;
	      }
	      return void 0 !== config.key;
	    }
	    function defineKeyPropWarningGetter(props, displayName) {
	      function warnAboutAccessingKey() {
	        specialPropKeyWarningShown ||
	          ((specialPropKeyWarningShown = true),
	          console.error(
	            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
	            displayName
	          ));
	      }
	      warnAboutAccessingKey.isReactWarning = true;
	      Object.defineProperty(props, "key", {
	        get: warnAboutAccessingKey,
	        configurable: true
	      });
	    }
	    function elementRefGetterWithDeprecationWarning() {
	      var componentName = getComponentNameFromType(this.type);
	      didWarnAboutElementRef[componentName] ||
	        ((didWarnAboutElementRef[componentName] = true),
	        console.error(
	          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
	        ));
	      componentName = this.props.ref;
	      return void 0 !== componentName ? componentName : null;
	    }
	    function ReactElement(type, key, props, owner, debugStack, debugTask) {
	      var refProp = props.ref;
	      type = {
	        $$typeof: REACT_ELEMENT_TYPE,
	        type: type,
	        key: key,
	        props: props,
	        _owner: owner
	      };
	      null !== (void 0 !== refProp ? refProp : null)
	        ? Object.defineProperty(type, "ref", {
	            enumerable: false,
	            get: elementRefGetterWithDeprecationWarning
	          })
	        : Object.defineProperty(type, "ref", { enumerable: false, value: null });
	      type._store = {};
	      Object.defineProperty(type._store, "validated", {
	        configurable: false,
	        enumerable: false,
	        writable: true,
	        value: 0
	      });
	      Object.defineProperty(type, "_debugInfo", {
	        configurable: false,
	        enumerable: false,
	        writable: true,
	        value: null
	      });
	      Object.defineProperty(type, "_debugStack", {
	        configurable: false,
	        enumerable: false,
	        writable: true,
	        value: debugStack
	      });
	      Object.defineProperty(type, "_debugTask", {
	        configurable: false,
	        enumerable: false,
	        writable: true,
	        value: debugTask
	      });
	      Object.freeze && (Object.freeze(type.props), Object.freeze(type));
	      return type;
	    }
	    function jsxDEVImpl(
	      type,
	      config,
	      maybeKey,
	      isStaticChildren,
	      debugStack,
	      debugTask
	    ) {
	      var children = config.children;
	      if (void 0 !== children)
	        if (isStaticChildren)
	          if (isArrayImpl(children)) {
	            for (
	              isStaticChildren = 0;
	              isStaticChildren < children.length;
	              isStaticChildren++
	            )
	              validateChildKeys(children[isStaticChildren]);
	            Object.freeze && Object.freeze(children);
	          } else
	            console.error(
	              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
	            );
	        else validateChildKeys(children);
	      if (hasOwnProperty.call(config, "key")) {
	        children = getComponentNameFromType(type);
	        var keys = Object.keys(config).filter(function (k) {
	          return "key" !== k;
	        });
	        isStaticChildren =
	          0 < keys.length
	            ? "{key: someKey, " + keys.join(": ..., ") + ": ...}"
	            : "{key: someKey}";
	        didWarnAboutKeySpread[children + isStaticChildren] ||
	          ((keys =
	            0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}"),
	          console.error(
	            'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',
	            isStaticChildren,
	            children,
	            keys,
	            children
	          ),
	          (didWarnAboutKeySpread[children + isStaticChildren] = true));
	      }
	      children = null;
	      void 0 !== maybeKey &&
	        (checkKeyStringCoercion(maybeKey), (children = "" + maybeKey));
	      hasValidKey(config) &&
	        (checkKeyStringCoercion(config.key), (children = "" + config.key));
	      if ("key" in config) {
	        maybeKey = {};
	        for (var propName in config)
	          "key" !== propName && (maybeKey[propName] = config[propName]);
	      } else maybeKey = config;
	      children &&
	        defineKeyPropWarningGetter(
	          maybeKey,
	          "function" === typeof type
	            ? type.displayName || type.name || "Unknown"
	            : type
	        );
	      return ReactElement(
	        type,
	        children,
	        maybeKey,
	        getOwner(),
	        debugStack,
	        debugTask
	      );
	    }
	    function validateChildKeys(node) {
	      isValidElement(node)
	        ? node._store && (node._store.validated = 1)
	        : "object" === typeof node &&
	          null !== node &&
	          node.$$typeof === REACT_LAZY_TYPE &&
	          ("fulfilled" === node._payload.status
	            ? isValidElement(node._payload.value) &&
	              node._payload.value._store &&
	              (node._payload.value._store.validated = 1)
	            : node._store && (node._store.validated = 1));
	    }
	    function isValidElement(object) {
	      return (
	        "object" === typeof object &&
	        null !== object &&
	        object.$$typeof === REACT_ELEMENT_TYPE
	      );
	    }
	    var React = requireReact(),
	      REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
	      REACT_PORTAL_TYPE = Symbol.for("react.portal"),
	      REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"),
	      REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"),
	      REACT_PROFILER_TYPE = Symbol.for("react.profiler"),
	      REACT_CONSUMER_TYPE = Symbol.for("react.consumer"),
	      REACT_CONTEXT_TYPE = Symbol.for("react.context"),
	      REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"),
	      REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"),
	      REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"),
	      REACT_MEMO_TYPE = Symbol.for("react.memo"),
	      REACT_LAZY_TYPE = Symbol.for("react.lazy"),
	      REACT_ACTIVITY_TYPE = Symbol.for("react.activity"),
	      REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"),
	      ReactSharedInternals =
	        React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
	      hasOwnProperty = Object.prototype.hasOwnProperty,
	      isArrayImpl = Array.isArray,
	      createTask = console.createTask
	        ? console.createTask
	        : function () {
	            return null;
	          };
	    React = {
	      react_stack_bottom_frame: function (callStackForError) {
	        return callStackForError();
	      }
	    };
	    var specialPropKeyWarningShown;
	    var didWarnAboutElementRef = {};
	    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(
	      React,
	      UnknownOwner
	    )();
	    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
	    var didWarnAboutKeySpread = {};
	    reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
	    reactJsxRuntime_development.jsx = function (type, config, maybeKey) {
	      var trackActualOwner =
	        1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
	      return jsxDEVImpl(
	        type,
	        config,
	        maybeKey,
	        false,
	        trackActualOwner
	          ? Error("react-stack-top-frame")
	          : unknownOwnerDebugStack,
	        trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
	      );
	    };
	    reactJsxRuntime_development.jsxs = function (type, config, maybeKey) {
	      var trackActualOwner =
	        1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
	      return jsxDEVImpl(
	        type,
	        config,
	        maybeKey,
	        true,
	        trackActualOwner
	          ? Error("react-stack-top-frame")
	          : unknownOwnerDebugStack,
	        trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
	      );
	    };
	  })();
	return reactJsxRuntime_development;
}

var hasRequiredJsxRuntime;

function requireJsxRuntime () {
	if (hasRequiredJsxRuntime) return jsxRuntime.exports;
	hasRequiredJsxRuntime = 1;

	if (process.env.NODE_ENV === 'production') {
	  jsxRuntime.exports = requireReactJsxRuntime_production();
	} else {
	  jsxRuntime.exports = requireReactJsxRuntime_development();
	}
	return jsxRuntime.exports;
}

var jsxRuntimeExports = requireJsxRuntime();

function LanguageSwitcher() {
  const [lang, setLang] = reactExports.useState("ru");
  reactExports.useEffect(() => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: toggleLang, className: "lang-switcher", children: [
    lang === "en" ? "🇬🇧 EN" : "🇷🇺 RU",
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { jsx: true, children: `
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
  const [lang, setLang] = reactExports.useState("ru");
  reactExports.useEffect(() => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "admin-container", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "admin-sidebar", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sidebar-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { children: [
          "⚙️ ",
          t("adminPanel", lang)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "version", children: "v0.1.0" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "sidebar-nav", children: navItems.map((item, index) => item.submenu ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "nav-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "nav-item nav-group-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "icon", children: item.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "submenu", children: item.submenu.map((subitem) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: subitem.href,
            className: `nav-item submenu-item ${currentPath === subitem.href ? "active" : ""}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: subitem.label })
          },
          subitem.href
        )) })
      ] }, `submenu-${index}`) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: item.href,
          className: `nav-item ${currentPath === item.href ? "active" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "icon", children: item.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label })
          ]
        },
        item.href
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sidebar-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/map", className: "nav-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "icon", children: "🗺️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("toMap", lang) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "admin-main", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "admin-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: title || t("adminPanel", lang) }),
          subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "subtitle", children: subtitle })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageSwitcher, {}),
          headerAction
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "admin-content", children })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { jsx: true, children: `
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

export { AdminLayout as A, jsxRuntimeExports as j, t, useLang as u };
