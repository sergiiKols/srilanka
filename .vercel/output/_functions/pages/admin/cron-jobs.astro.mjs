import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CZKHqJbe.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../chunks/Layout_ClCQ2Wja.mjs';
import { A as AdminLayout } from '../../chunks/AdminLayout_DTgBj3su.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from '../../chunks/supabase_CyZfh9_5.mjs';
/* empty css                                        */
export { renderers } from '../../renderers.mjs';

function KeepAliveToggle() {
  const [status, setStatus] = useState({
    enabled: false,
    lastRun: null,
    nextRun: null
  });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  useEffect(() => {
    loadStatus();
  }, []);
  const loadStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("system_config").select("config_value").eq("config_key", "keep_alive_enabled").single();
      if (error) throw error;
      setStatus({
        enabled: data.config_value,
        lastRun: null,
        // TODO: можно добавить таблицу для логов
        nextRun: null
      });
    } catch (error) {
      console.error("Error loading keep-alive status:", error);
    } finally {
      setLoading(false);
    }
  };
  const toggleKeepAlive = async () => {
    try {
      setToggling(true);
      const newValue = !status.enabled;
      const { error } = await supabase.from("system_config").update({
        config_value: newValue,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("config_key", "keep_alive_enabled");
      if (error) throw error;
      setStatus((prev) => ({ ...prev, enabled: newValue }));
      alert(
        newValue ? "✅ Keep-Alive включен! Тестовые записи будут создаваться каждые 3 дня." : "❌ Keep-Alive выключен. Автоматические тестовые записи остановлены."
      );
    } catch (error) {
      console.error("Error toggling keep-alive:", error);
      alert("Ошибка при изменении настройки");
    } finally {
      setToggling(false);
    }
  };
  const runManualTest = async () => {
    if (!confirm("Запустить тестовое создание записей сейчас?")) return;
    try {
      setToggling(true);
      const { data, error } = await supabase.rpc("keep_alive_test_records");
      if (error) throw error;
      console.log("Keep-alive test results:", data);
      const successCount = data?.filter((r) => r.status === "SUCCESS").length || 0;
      alert(`✅ Тест завершён!

Успешно создано записей: ${successCount}

Проверьте таблицы в Database Editor.`);
    } catch (error) {
      console.error("Error running manual test:", error);
      alert("Ошибка при запуске теста");
    } finally {
      setToggling(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg shadow p-6", children: /* @__PURE__ */ jsxs("div", { className: "animate-pulse", children: [
      /* @__PURE__ */ jsx("div", { className: "h-4 bg-gray-200 rounded w-1/4 mb-4" }),
      /* @__PURE__ */ jsx("div", { className: "h-8 bg-gray-200 rounded w-full" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "lumina-toggle-card", children: [
    /* @__PURE__ */ jsx("div", { className: "lumina-toggle-header", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: `lumina-status-indicator ${status.enabled ? "lumina-status-active" : "lumina-status-inactive"}` }),
        /* @__PURE__ */ jsx("div", { className: "lumina-icon-3d-small", children: "🔄" }),
        /* @__PURE__ */ jsx("h3", { className: "lumina-toggle-title", children: "Keep-Alive System" }),
        /* @__PURE__ */ jsx("span", { className: `lumina-badge ${status.enabled ? "lumina-badge-green" : "lumina-badge-gray"}`, children: status.enabled ? "Включено" : "Выключено" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowInfo(!showInfo),
          className: "lumina-info-button",
          children: showInfo ? "▼ Скрыть информацию" : "▶ Показать информацию"
        }
      )
    ] }) }),
    showInfo && /* @__PURE__ */ jsxs("div", { className: "lumina-info-panel", children: [
      /* @__PURE__ */ jsx("h4", { className: "lumina-info-panel-title", children: "ℹ️ Что это такое?" }),
      /* @__PURE__ */ jsxs("div", { className: "lumina-info-panel-text", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Keep-Alive" }),
          " - автоматическая система для поддержания активности базы данных Supabase на бесплатном тарифе."
        ] }),
        /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("strong", { children: "Как работает:" }) }),
        /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside ml-4 space-y-1", children: [
          /* @__PURE__ */ jsx("li", { children: "Каждые 3 дня создаются тестовые записи во всех таблицах" }),
          /* @__PURE__ */ jsxs("li", { children: [
            "Все записи помечены как ",
            /* @__PURE__ */ jsx("code", { className: "bg-blue-100 px-1 rounded", children: "test" }),
            " и неактивны"
          ] }),
          /* @__PURE__ */ jsx("li", { children: "Записи старше 30 дней автоматически удаляются" }),
          /* @__PURE__ */ jsx("li", { children: "Не влияет на работу приложения" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-3", children: [
          /* @__PURE__ */ jsx("strong", { children: "Зачем это нужно?" }),
          /* @__PURE__ */ jsx("br", {}),
          "Supabase паузирует бесплатные проекты после 7 дней неактивности. Keep-Alive предотвращает паузу, создавая минимальную активность в базе данных."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "lumina-toggle-controls", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("p", { className: "lumina-control-status", children: status.enabled ? "🟢 Автоматические тестовые записи активны. Создаются каждые 3 дня в 3:00." : "⚫ Автоматические тестовые записи отключены." }),
        status.enabled && /* @__PURE__ */ jsx("p", { className: "lumina-control-info", children: "Следующий запуск: каждые 3 дня (по расписанию Cron)" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: toggleKeepAlive,
            disabled: toggling,
            className: `lumina-button ${status.enabled ? "lumina-button-danger" : "lumina-button-success"} ${toggling ? "lumina-button-disabled" : ""}`,
            children: toggling ? "⏳ Сохранение..." : status.enabled ? "❌ Выключить" : "✅ Включить"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: runManualTest,
            disabled: toggling || !status.enabled,
            className: `lumina-button lumina-button-primary ${toggling || !status.enabled ? "lumina-button-disabled" : ""}`,
            title: !status.enabled ? "Включите Keep-Alive для запуска теста" : "Запустить тест сейчас",
            children: "🧪 Тест"
          }
        )
      ] })
    ] }) }),
    !status.enabled && /* @__PURE__ */ jsx("div", { className: "lumina-warning-panel", children: /* @__PURE__ */ jsxs("p", { className: "lumina-warning-text", children: [
      "⚠️ ",
      /* @__PURE__ */ jsx("strong", { children: "Внимание:" }),
      " При отключённом Keep-Alive проект может быть приостановлен через 7 дней неактивности на бесплатном тарифе Supabase."
    ] }) })
  ] });
}
const styles$1 = `
.lumina-toggle-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
}

.lumina-toggle-header {
  padding: 24px;
  border-bottom: 1px solid #E5E7EB;
}

.lumina-toggle-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
}

.lumina-status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.lumina-status-active {
  background: #10B981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.lumina-status-inactive {
  background: #9CA3AF;
  box-shadow: 0 0 0 4px rgba(156, 163, 175, 0.2);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.lumina-badge {
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  white-space: nowrap;
}

.lumina-badge-green {
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
  color: #065F46;
  border: 1px solid #A7F3D0;
}

.lumina-badge-gray {
  background: #F3F4F6;
  color: #4B5563;
  border: 1px solid #E5E7EB;
}

.lumina-info-button {
  color: #2563EB;
  font-size: 0.875rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.lumina-info-button:hover {
  color: #1D4ED8;
}

.lumina-info-panel {
  padding: 24px;
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  border-bottom: 1px solid #BFDBFE;
}

.lumina-info-panel-title {
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 12px;
  font-size: 0.9375rem;
}

.lumina-info-panel-text {
  font-size: 0.875rem;
  color: #1E40AF;
  line-height: 1.6;
}

.lumina-info-panel-text p {
  margin-bottom: 12px;
}

.lumina-info-panel-text ul {
  margin-left: 16px;
  margin-top: 8px;
  margin-bottom: 8px;
}

.lumina-info-panel-text li {
  margin-bottom: 4px;
}

.lumina-info-panel-text code {
  background: #DBEAFE;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.8125rem;
  border: 1px solid #BFDBFE;
}

.lumina-toggle-controls {
  padding: 24px;
}

.lumina-control-status {
  font-size: 0.9375rem;
  color: #374151;
  margin-bottom: 8px;
  line-height: 1.5;
}

.lumina-control-info {
  font-size: 0.8125rem;
  color: #6B7280;
  line-height: 1.4;
}

.lumina-button {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lumina-button-primary {
  background: #2563EB;
  color: #FFFFFF;
  border-color: #1D4ED8;
}

.lumina-button-primary:hover:not(.lumina-button-disabled) {
  background: #1D4ED8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.lumina-button-success {
  background: #10B981;
  color: #FFFFFF;
  border-color: #059669;
}

.lumina-button-success:hover:not(.lumina-button-disabled) {
  background: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.lumina-button-danger {
  background: #EF4444;
  color: #FFFFFF;
  border-color: #DC2626;
}

.lumina-button-danger:hover:not(.lumina-button-disabled) {
  background: #DC2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.lumina-button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lumina-warning-panel {
  padding: 16px 24px;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border-top: 1px solid #FCD34D;
}

.lumina-warning-text {
  font-size: 0.875rem;
  color: #78350F;
  line-height: 1.5;
}

.lumina-warning-text strong {
  font-weight: 600;
  color: #92400E;
}
`;
if (typeof document !== "undefined") {
  const styleId = "lumina-keep-alive-styles";
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = styles$1;
    document.head.appendChild(styleElement);
  }
}

function CoolDownToggle() {
  const [status, setStatus] = useState({
    enabled: false,
    lastRun: null,
    totalCooledDown: 0
  });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [recentResults, setRecentResults] = useState([]);
  useEffect(() => {
    loadStatus();
  }, []);
  const loadStatus = async () => {
    try {
      setLoading(true);
      const { data: configData, error: configError } = await supabase.from("system_config").select("config_value").eq("config_key", "cool_down_enabled").maybeSingle();
      if (configError && configError.code !== "PGRST116") {
        throw configError;
      }
      if (!configData) {
        await supabase.from("system_config").insert({
          config_key: "cool_down_enabled",
          config_value: true,
          description: "Enable/disable automatic temperature cool-down every hour"
        });
        setStatus({ enabled: true, lastRun: null, totalCooledDown: 0 });
      } else {
        setStatus({
          enabled: configData.config_value,
          lastRun: null,
          totalCooledDown: 0
        });
      }
      const { data: logData } = await supabase.from("temperature_change_log").select("*").eq("change_reason", "auto_cooldown").order("changed_at", { ascending: false }).limit(5);
      if (logData && logData.length > 0) {
        const results = logData.map((log) => ({
          listing_id: log.listing_id,
          old_temp: log.old_temperature,
          new_temp: log.new_temperature,
          hours_elapsed: 0
        }));
        setRecentResults(results);
      }
    } catch (error) {
      console.error("Error loading cool-down status:", error);
    } finally {
      setLoading(false);
    }
  };
  const toggleCoolDown = async () => {
    try {
      setToggling(true);
      const newValue = !status.enabled;
      const { error } = await supabase.from("system_config").upsert({
        config_key: "cool_down_enabled",
        config_value: newValue,
        description: "Enable/disable automatic temperature cool-down every hour",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (error) throw error;
      setStatus((prev) => ({ ...prev, enabled: newValue }));
      alert(
        newValue ? "✅ Автоохлаждение включено! Объекты будут автоматически охлаждаться каждый час." : "❌ Автоохлаждение выключено. Температура объектов не будет меняться автоматически."
      );
    } catch (error) {
      console.error("Error toggling cool-down:", error);
      alert("Ошибка при изменении настройки");
    } finally {
      setToggling(false);
    }
  };
  const runManualCoolDown = async () => {
    if (!confirm("Запустить охлаждение объектов сейчас?")) return;
    try {
      setToggling(true);
      const { data, error } = await supabase.rpc("cool_down_objects");
      if (error) throw error;
      console.log("Cool-down results:", data);
      if (data && data.length > 0) {
        setRecentResults(data);
        alert(`✅ Охлаждение завершено!

Охлаждено объектов: ${data.length}

Проверьте temperature_change_log для деталей.`);
      } else {
        alert("ℹ️ Нет объектов для охлаждения.\n\nВсе объекты уже имеют актуальную температуру.");
      }
      await loadStatus();
    } catch (error) {
      console.error("Error running manual cool-down:", error);
      alert("Ошибка при запуске охлаждения");
    } finally {
      setToggling(false);
    }
  };
  const getTemperatureEmoji = (temp) => {
    switch (temp) {
      case "hot":
        return "🔴";
      case "warm":
        return "🟠";
      case "cool":
        return "🟡";
      case "cold":
        return "🔵";
      default:
        return "⚪";
    }
  };
  const getTemperatureLabel = (temp) => {
    switch (temp) {
      case "hot":
        return "Горячий";
      case "warm":
        return "Тёплый";
      case "cool":
        return "Прохладный";
      case "cold":
        return "Холодный";
      default:
        return temp;
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg shadow p-6", children: /* @__PURE__ */ jsxs("div", { className: "animate-pulse", children: [
      /* @__PURE__ */ jsx("div", { className: "h-4 bg-gray-200 rounded w-1/4 mb-4" }),
      /* @__PURE__ */ jsx("div", { className: "h-8 bg-gray-200 rounded w-full" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "lumina-toggle-card", children: [
    /* @__PURE__ */ jsx("div", { className: "lumina-toggle-header", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: `lumina-status-indicator ${status.enabled ? "lumina-status-active" : "lumina-status-inactive"}` }),
        /* @__PURE__ */ jsx("div", { className: "lumina-icon-3d-small", children: "🌡️" }),
        /* @__PURE__ */ jsx("h3", { className: "lumina-toggle-title", children: "Автоохлаждение Объектов" }),
        /* @__PURE__ */ jsx("span", { className: `lumina-badge ${status.enabled ? "lumina-badge-green" : "lumina-badge-gray"}`, children: status.enabled ? "Включено" : "Выключено" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowInfo(!showInfo),
          className: "lumina-info-button",
          children: showInfo ? "▼ Скрыть информацию" : "▶ Показать информацию"
        }
      )
    ] }) }),
    showInfo && /* @__PURE__ */ jsxs("div", { className: "lumina-info-panel", children: [
      /* @__PURE__ */ jsx("h4", { className: "lumina-info-panel-title", children: "ℹ️ Что это такое?" }),
      /* @__PURE__ */ jsxs("div", { className: "lumina-info-panel-text", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Автоохлаждение" }),
          " - автоматическая система изменения температуры (приоритета) объявлений о недвижимости по времени."
        ] }),
        /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("strong", { children: "Как работает система температуры:" }) }),
        /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside ml-4 space-y-1", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "🔴 Горячий (HOT)" }),
            " - 0-24 часа - Приоритет 4 - Всегда видим"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "🟠 Тёплый (WARM)" }),
            " - 24-72 часа - Приоритет 3 - Всегда видим"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "🟡 Прохладный (COOL)" }),
            " - 72-120 часов - Приоритет 2 - С фильтрами"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "🔵 Холодный (COLD)" }),
            " - 120+ часов - Приоритет 1 - Только с фильтрами"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-3", children: [
          /* @__PURE__ */ jsx("strong", { children: "Зачем это нужно?" }),
          /* @__PURE__ */ jsx("br", {}),
          'Новые объявления показываются с высоким приоритетом (🔴 горячие). Со временем они автоматически "охлаждаются", давая место новым объявлениям. Это обеспечивает справедливую ротацию объявлений на карте.'
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2", children: [
          /* @__PURE__ */ jsx("strong", { children: "Частота:" }),
          " Функция запускается каждый час через Cron Job и автоматически понижает температуру объектов по времени."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "lumina-toggle-controls", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("p", { className: "lumina-control-status", children: status.enabled ? "🟢 Автоматическое охлаждение активно. Температура объектов обновляется каждый час." : "⚫ Автоматическое охлаждение отключено. Температура объектов не изменяется." }),
        status.enabled && /* @__PURE__ */ jsx("p", { className: "lumina-control-info", children: "Следующий запуск: каждый час :00 минут (по расписанию Cron)" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: toggleCoolDown,
            disabled: toggling,
            className: `lumina-button ${status.enabled ? "lumina-button-danger" : "lumina-button-success"} ${toggling ? "lumina-button-disabled" : ""}`,
            children: toggling ? "⏳ Сохранение..." : status.enabled ? "❌ Выключить" : "✅ Включить"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: runManualCoolDown,
            disabled: toggling || !status.enabled,
            className: `lumina-button lumina-button-primary ${toggling || !status.enabled ? "lumina-button-disabled" : ""}`,
            title: !status.enabled ? "Включите автоохлаждение для запуска" : "Запустить охлаждение сейчас",
            children: "❄️ Охладить"
          }
        )
      ] })
    ] }) }),
    recentResults.length > 0 && /* @__PURE__ */ jsxs("div", { className: "lumina-results-panel", children: [
      /* @__PURE__ */ jsx("h4", { className: "lumina-results-title", children: "📊 Последние изменения температуры" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: recentResults.map((result, index) => /* @__PURE__ */ jsxs("div", { className: "lumina-result-item", children: [
        /* @__PURE__ */ jsxs("span", { className: "lumina-result-id", children: [
          result.listing_id.substring(0, 8),
          "..."
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "lumina-temp-display", children: [
          getTemperatureEmoji(result.old_temp),
          /* @__PURE__ */ jsx("span", { className: "lumina-temp-label", children: getTemperatureLabel(result.old_temp) })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "lumina-arrow", children: "→" }),
        /* @__PURE__ */ jsxs("span", { className: "lumina-temp-display", children: [
          getTemperatureEmoji(result.new_temp),
          /* @__PURE__ */ jsx("span", { className: "lumina-temp-label", children: getTemperatureLabel(result.new_temp) })
        ] }),
        result.hours_elapsed > 0 && /* @__PURE__ */ jsxs("span", { className: "lumina-result-time", children: [
          result.hours_elapsed,
          "ч назад"
        ] })
      ] }, index)) })
    ] }),
    !status.enabled && /* @__PURE__ */ jsx("div", { className: "lumina-warning-panel", children: /* @__PURE__ */ jsxs("p", { className: "lumina-warning-text", children: [
      "⚠️ ",
      /* @__PURE__ */ jsx("strong", { children: "Внимание:" }),
      " При отключённом автоохлаждении все объекты останутся с текущей температурой и не будут понижать приоритет со временем."
    ] }) })
  ] });
}
const styles = `
.lumina-toggle-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
}

.lumina-toggle-header {
  padding: 24px;
  border-bottom: 1px solid #E5E7EB;
}

.lumina-toggle-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
}

.lumina-status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.lumina-status-active {
  background: #10B981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.lumina-status-inactive {
  background: #9CA3AF;
  box-shadow: 0 0 0 4px rgba(156, 163, 175, 0.2);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.lumina-badge {
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  white-space: nowrap;
}

.lumina-badge-green {
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
  color: #065F46;
  border: 1px solid #A7F3D0;
}

.lumina-badge-gray {
  background: #F3F4F6;
  color: #4B5563;
  border: 1px solid #E5E7EB;
}

.lumina-info-button {
  color: #2563EB;
  font-size: 0.875rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.lumina-info-button:hover {
  color: #1D4ED8;
}

.lumina-info-panel {
  padding: 24px;
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  border-bottom: 1px solid #BFDBFE;
}

.lumina-info-panel-title {
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 12px;
  font-size: 0.9375rem;
}

.lumina-info-panel-text {
  font-size: 0.875rem;
  color: #1E40AF;
  line-height: 1.6;
}

.lumina-info-panel-text p {
  margin-bottom: 12px;
}

.lumina-info-panel-text ul {
  margin-left: 16px;
  margin-top: 8px;
  margin-bottom: 8px;
}

.lumina-info-panel-text li {
  margin-bottom: 4px;
}

.lumina-toggle-controls {
  padding: 24px;
}

.lumina-control-status {
  font-size: 0.9375rem;
  color: #374151;
  margin-bottom: 8px;
  line-height: 1.5;
}

.lumina-control-info {
  font-size: 0.8125rem;
  color: #6B7280;
  line-height: 1.4;
}

.lumina-button {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lumina-button-primary {
  background: #2563EB;
  color: #FFFFFF;
  border-color: #1D4ED8;
}

.lumina-button-primary:hover:not(.lumina-button-disabled) {
  background: #1D4ED8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.lumina-button-success {
  background: #10B981;
  color: #FFFFFF;
  border-color: #059669;
}

.lumina-button-success:hover:not(.lumina-button-disabled) {
  background: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.lumina-button-danger {
  background: #EF4444;
  color: #FFFFFF;
  border-color: #DC2626;
}

.lumina-button-danger:hover:not(.lumina-button-disabled) {
  background: #DC2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.lumina-button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lumina-results-panel {
  padding: 24px;
  border-top: 1px solid #E5E7EB;
  background: #FAFAFA;
}

.lumina-results-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
  font-size: 0.9375rem;
}

.lumina-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
}

.lumina-result-id {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.75rem;
  color: #6B7280;
  background: #F3F4F6;
  padding: 4px 8px;
  border-radius: 4px;
}

.lumina-temp-display {
  display: flex;
  align-items: center;
  gap: 6px;
}

.lumina-temp-label {
  color: #374151;
  font-weight: 500;
}

.lumina-arrow {
  color: #9CA3AF;
  font-weight: 300;
}

.lumina-result-time {
  margin-left: auto;
  font-size: 0.75rem;
  color: #9CA3AF;
}

.lumina-warning-panel {
  padding: 16px 24px;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border-top: 1px solid #FCD34D;
}

.lumina-warning-text {
  font-size: 0.875rem;
  color: #78350F;
  line-height: 1.5;
}

.lumina-warning-text strong {
  font-weight: 600;
  color: #92400E;
}
`;
if (typeof document !== "undefined") {
  const styleId = "lumina-cooldown-styles";
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}

const $$CronJobs = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Cron Jobs - \u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435", "data-astro-cid-k6aizuot": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminLayout", AdminLayout, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/AdminLayout.tsx", "client:component-export": "default", "data-astro-cid-k6aizuot": true }, { "default": ($$result3) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto py-10 px-6" data-astro-cid-k6aizuot> <!-- Hero Header with LUMINA styling --> <div class="mb-10" data-astro-cid-k6aizuot> <div class="flex items-center gap-4 mb-3" data-astro-cid-k6aizuot> <div class="lumina-icon-3d" data-astro-cid-k6aizuot>⏰</div> <h1 class="lumina-heading-primary" data-astro-cid-k6aizuot>
Cron Jobs - Автоматические Задачи
</h1> </div> <p class="lumina-text-description" data-astro-cid-k6aizuot>
Управление автоматическими процессами и фоновыми задачами
</p> </div> <!-- Bento Grid Layout --> <div class="lumina-bento-grid" data-astro-cid-k6aizuot> <!-- Cron Job 1: Автоохлаждение объектов --> <div class="lumina-bento-item" data-astro-cid-k6aizuot> ${renderComponent($$result3, "CoolDownToggle", CoolDownToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/CoolDownToggle.tsx", "client:component-export": "default", "data-astro-cid-k6aizuot": true })} </div> <!-- Cron Job 2: Keep-Alive --> <div class="lumina-bento-item" data-astro-cid-k6aizuot> ${renderComponent($$result3, "KeepAliveToggle", KeepAliveToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/KeepAliveToggle.tsx", "client:component-export": "default", "data-astro-cid-k6aizuot": true })} </div> </div> <!-- Статистика с Airy Gradients --> <div class="lumina-card mt-8" data-astro-cid-k6aizuot> <div class="flex items-center gap-3 mb-6" data-astro-cid-k6aizuot> <div class="lumina-icon-3d-small" data-astro-cid-k6aizuot>📊</div> <h2 class="lumina-heading-secondary" data-astro-cid-k6aizuot>
Сводка по Cron Jobs
</h2> </div> <div class="grid grid-cols-1 md:grid-cols-4 gap-4" data-astro-cid-k6aizuot> <div class="lumina-stat-card lumina-gradient-blue" data-astro-cid-k6aizuot> <div class="lumina-stat-value" data-astro-cid-k6aizuot>2</div> <div class="lumina-stat-label" data-astro-cid-k6aizuot>Всего задач</div> </div> <div class="lumina-stat-card lumina-gradient-green" data-astro-cid-k6aizuot> <div class="lumina-stat-value" data-astro-cid-k6aizuot>Каждый час</div> <div class="lumina-stat-label" data-astro-cid-k6aizuot>Охлаждение</div> </div> <div class="lumina-stat-card lumina-gradient-purple" data-astro-cid-k6aizuot> <div class="lumina-stat-value" data-astro-cid-k6aizuot>Каждые 3 дня</div> <div class="lumina-stat-label" data-astro-cid-k6aizuot>Keep-Alive</div> </div> <div class="lumina-stat-card lumina-gradient-orange" data-astro-cid-k6aizuot> <div class="lumina-stat-value" data-astro-cid-k6aizuot>Авто</div> <div class="lumina-stat-label" data-astro-cid-k6aizuot>Режим работы</div> </div> </div> </div> <!-- Инструкция по настройке обоих Cron --> <div class="lumina-card mt-8 lumina-gradient-instructions" data-astro-cid-k6aizuot> <div class="flex items-center gap-3 mb-6" data-astro-cid-k6aizuot> <div class="lumina-icon-3d-small" data-astro-cid-k6aizuot>📖</div> <h2 class="lumina-heading-secondary" data-astro-cid-k6aizuot>
Настройка Cron Jobs в Supabase
</h2> </div> <div class="space-y-6" data-astro-cid-k6aizuot> <!-- Cron #1: Cool Down --> <div class="lumina-inner-card" data-astro-cid-k6aizuot> <div class="flex items-center gap-3 mb-4" data-astro-cid-k6aizuot> <div class="lumina-icon-3d-small" data-astro-cid-k6aizuot>🌡️</div> <h3 class="lumina-heading-tertiary" data-astro-cid-k6aizuot>
Cron Job #1: Автоохлаждение объектов
</h3> </div> <div class="space-y-3 lumina-text-body" data-astro-cid-k6aizuot> <div data-astro-cid-k6aizuot><strong class="lumina-text-strong" data-astro-cid-k6aizuot>Name:</strong> <code class="lumina-code-inline" data-astro-cid-k6aizuot>cool-down-objects</code></div> <div data-astro-cid-k6aizuot><strong class="lumina-text-strong" data-astro-cid-k6aizuot>Schedule:</strong> <code class="lumina-code-inline" data-astro-cid-k6aizuot>0 * * * *</code> (каждый час)</div> <div data-astro-cid-k6aizuot><strong class="lumina-text-strong" data-astro-cid-k6aizuot>SQL Command:</strong></div> <pre class="lumina-code-block" data-astro-cid-k6aizuot>SELECT * FROM cool_down_objects();</pre> <div class="lumina-info-text" data-astro-cid-k6aizuot>
ℹ️ Запускается каждый час в :00 минут. Автоматически понижает температуру объектов: hot→warm→cool→cold
</div> </div> </div> <!-- Cron #2: Keep-Alive --> <div class="lumina-inner-card" data-astro-cid-k6aizuot> <div class="flex items-center gap-3 mb-4" data-astro-cid-k6aizuot> <div class="lumina-icon-3d-small" data-astro-cid-k6aizuot>🔄</div> <h3 class="lumina-heading-tertiary" data-astro-cid-k6aizuot>
Cron Job #2: Keep-Alive
</h3> </div> <div class="space-y-3 lumina-text-body" data-astro-cid-k6aizuot> <div data-astro-cid-k6aizuot><strong class="lumina-text-strong" data-astro-cid-k6aizuot>Name:</strong> <code class="lumina-code-inline" data-astro-cid-k6aizuot>keep-alive-test-records</code></div> <div data-astro-cid-k6aizuot><strong class="lumina-text-strong" data-astro-cid-k6aizuot>Schedule:</strong> <code class="lumina-code-inline" data-astro-cid-k6aizuot>0 3 */3 * *</code> (каждые 3 дня)</div> <div data-astro-cid-k6aizuot><strong class="lumina-text-strong" data-astro-cid-k6aizuot>SQL Command:</strong></div> <pre class="lumina-code-block" data-astro-cid-k6aizuot>SELECT * FROM keep_alive_test_records();</pre> <div class="lumina-info-text" data-astro-cid-k6aizuot>
ℹ️ Запускается каждые 3 дня в 3:00. Создаёт тестовые записи для поддержания активности БД.
</div> </div> </div> <!-- Шаги настройки --> <div class="lumina-divider" data-astro-cid-k6aizuot> <div class="flex items-center gap-3 mb-4" data-astro-cid-k6aizuot> <div class="lumina-icon-3d-small" data-astro-cid-k6aizuot>🛠️</div> <h3 class="lumina-heading-tertiary" data-astro-cid-k6aizuot>Пошаговая настройка</h3> </div> <ol class="lumina-ordered-list" data-astro-cid-k6aizuot> <li data-astro-cid-k6aizuot>Откройте <a href="https://supabase.com/dashboard/project/mcmzdscpuoxwneuzsanu/database/cron-jobs" target="_blank" class="lumina-link" data-astro-cid-k6aizuot>Supabase Dashboard → Database → Cron Jobs</a></li> <li data-astro-cid-k6aizuot>Нажмите <strong class="lumina-text-accent-green" data-astro-cid-k6aizuot>Enable Cron</strong> (если ещё не включено)</li> <li data-astro-cid-k6aizuot>Нажмите <strong class="lumina-text-accent-blue" data-astro-cid-k6aizuot>Create a new cron job</strong></li> <li data-astro-cid-k6aizuot>Создайте первый job для <strong class="lumina-text-strong" data-astro-cid-k6aizuot>охлаждения</strong> (параметры выше)</li> <li data-astro-cid-k6aizuot>Создайте второй job для <strong class="lumina-text-strong" data-astro-cid-k6aizuot>Keep-Alive</strong> (параметры выше)</li> <li data-astro-cid-k6aizuot>Сохраните оба job'а</li> <li data-astro-cid-k6aizuot>Готово! ✅ Оба процесса будут работать автоматически</li> </ol> </div> </div> </div> <!-- Проверка статуса Cron --> <div class="lumina-card mt-8" data-astro-cid-k6aizuot> <div class="flex items-center gap-3 mb-6" data-astro-cid-k6aizuot> <div class="lumina-icon-3d-small" data-astro-cid-k6aizuot>🔍</div> <h2 class="lumina-heading-secondary" data-astro-cid-k6aizuot>
Проверка статуса Cron Jobs
</h2> </div> <p class="lumina-text-description mb-6" data-astro-cid-k6aizuot>
Выполните эти SQL команды в Supabase SQL Editor для проверки:
</p> <div class="space-y-6" data-astro-cid-k6aizuot> <div data-astro-cid-k6aizuot> <div class="lumina-text-body mb-3" data-astro-cid-k6aizuot><strong class="lumina-text-strong" data-astro-cid-k6aizuot>Посмотреть все Cron Jobs:</strong></div> <pre class="lumina-code-block" data-astro-cid-k6aizuot>SELECT * FROM cron.job;</pre> </div> <div data-astro-cid-k6aizuot> <div class="lumina-text-body mb-3" data-astro-cid-k6aizuot><strong class="lumina-text-strong" data-astro-cid-k6aizuot>Посмотреть историю запусков:</strong></div> <pre class="lumina-code-block" data-astro-cid-k6aizuot>SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;</pre> </div> </div> </div> </div> ` })} ` })} `;
}, "C:/Users/User/Desktop/sri/src/pages/admin/cron-jobs.astro", void 0);

const $$file = "C:/Users/User/Desktop/sri/src/pages/admin/cron-jobs.astro";
const $$url = "/admin/cron-jobs";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$CronJobs,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
