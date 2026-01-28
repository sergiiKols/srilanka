import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_CZKHqJbe.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../chunks/Layout_ClCQ2Wja.mjs';
import { u as useLang, A as AdminLayout } from '../../chunks/AdminLayout_DTgBj3su.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
export { renderers } from '../../renderers.mjs';

const SUPABASE_URL$1 = "https://mcmzdscpuoxwneuzsanu.supabase.co";
const SUPABASE_KEY$1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXpkc2NwdW94d25ldXpzYW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNDAxMjEsImV4cCI6MjA4NDkxNjEyMX0.FINUETJbgsos3tJdrJp_cyAPVOPxqpT_XjWIeFywPzw";
function KeepAliveModal({ isOpen, onClose }) {
  const lang = useLang();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingAll, setTestingAll] = useState(false);
  const [testingTable, setTestingTable] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [lastRunTime, setLastRunTime] = useState(null);
  const supabase = createClient(SUPABASE_URL$1, SUPABASE_KEY$1);
  useEffect(() => {
    if (isOpen) {
      loadData();
      setShowResults(false);
      setTestResults([]);
    }
  }, [isOpen]);
  async function loadData() {
    setLoading(true);
    try {
      const { data: configData } = await supabase.from("keep_alive_config").select("*").order("priority");
      const { data: allTablesData } = await fetch("/api/admin/tables").then((r) => r.json());
      const { data: lastLog } = await supabase.from("keep_alive_logs").select("created_at").order("created_at", { ascending: false }).limit(1).single();
      if (lastLog) {
        setLastRunTime(lastLog.created_at);
      }
      const allTables = [];
      if (configData) {
        configData.forEach((config) => {
          allTables.push({
            table_name: config.table_name,
            is_enabled: config.is_enabled,
            last_success_at: config.last_success_at,
            last_error: config.last_error,
            in_config: true
          });
        });
      }
      if (allTablesData?.tables) {
        const configTableNames = configData?.map((c) => c.table_name) || [];
        allTablesData.tables.forEach((table) => {
          if (!configTableNames.includes(table.name)) {
            allTables.push({
              table_name: table.name,
              is_enabled: false,
              last_success_at: null,
              last_error: null,
              in_config: false
            });
          }
        });
      }
      setTables(allTables);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }
  async function testSingleTable(tableName) {
    console.log("[KeepAlive] Testing single table:", tableName);
    setTestingTable(tableName);
    setTestResults([]);
    setShowResults(true);
    try {
      const response = await fetch("/api/admin/keep-alive/test-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableName })
      });
      console.log("[KeepAlive] Response status:", response.status);
      const result = await response.json();
      console.log("[KeepAlive] Result:", result);
      setTestResults([{
        table_name: tableName,
        status: result.success ? "SUCCESS" : "ERROR",
        executionTime: result.executionTime,
        error: result.error
      }]);
      await loadData();
    } catch (error) {
      console.error("[KeepAlive] Error testing table:", error);
      setTestResults([{
        table_name: tableName,
        status: "ERROR",
        error: error instanceof Error ? error.message : "Unknown error"
      }]);
    } finally {
      setTestingTable(null);
    }
  }
  async function testAllTables() {
    console.log("[KeepAlive] Testing all tables...");
    setTestingAll(true);
    setTestResults([]);
    setShowResults(true);
    try {
      const { data, error } = await supabase.rpc("keep_alive_test_records_v2");
      console.log("[KeepAlive] RPC result:", { data, error });
      if (!error && data) {
        const results = data.filter((r) => r.table_name !== "SUMMARY").map((r) => ({
          table_name: r.table_name,
          status: r.status,
          executionTime: r.execution_time_ms,
          error: r.error_message
        }));
        console.log("[KeepAlive] Processed results:", results);
        setTestResults(results);
        await loadData();
      } else {
        console.error("[KeepAlive] RPC error:", error);
        alert(lang === "ru" ? "Ошибка: " + error?.message : "Error: " + error?.message);
      }
    } catch (error) {
      console.error("[KeepAlive] Error testing all tables:", error);
      alert(lang === "ru" ? "Ошибка выполнения: " + (error instanceof Error ? error.message : "Unknown") : "Execution error");
    } finally {
      setTestingAll(false);
    }
  }
  if (!isOpen) return null;
  const enabledCount = tables.filter((t) => t.is_enabled && t.in_config).length;
  const newTablesCount = tables.filter((t) => !t.in_config).length;
  return /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "modal-container", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { children: "🔄 Keep-Alive System" }),
        /* @__PURE__ */ jsx("p", { className: "modal-subtitle", children: lang === "ru" ? "Управление тестовыми записями" : "Test records management" })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "close-btn", onClick: onClose, children: "✕" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "stats-bar", children: [
      /* @__PURE__ */ jsxs("div", { className: "stat-item", children: [
        /* @__PURE__ */ jsx("span", { className: "stat-label", children: lang === "ru" ? "Всего таблиц:" : "Total tables:" }),
        /* @__PURE__ */ jsx("span", { className: "stat-value", children: tables.length })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "stat-item", children: [
        /* @__PURE__ */ jsx("span", { className: "stat-label", children: lang === "ru" ? "В автоматике:" : "In auto:" }),
        /* @__PURE__ */ jsx("span", { className: "stat-value", style: { color: "#10B981" }, children: enabledCount })
      ] }),
      newTablesCount > 0 && /* @__PURE__ */ jsxs("div", { className: "stat-item", children: [
        /* @__PURE__ */ jsx("span", { className: "stat-label", children: lang === "ru" ? "Новые:" : "New:" }),
        /* @__PURE__ */ jsx("span", { className: "stat-value", style: { color: "#F59E0B" }, children: newTablesCount })
      ] }),
      lastRunTime && /* @__PURE__ */ jsxs("div", { className: "stat-item", children: [
        /* @__PURE__ */ jsx("span", { className: "stat-label", children: lang === "ru" ? "Последний запуск:" : "Last run:" }),
        /* @__PURE__ */ jsx("span", { className: "stat-value", style: { fontSize: "13px" }, children: new Date(lastRunTime).toLocaleString(lang === "ru" ? "ru-RU" : "en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "action-section", children: /* @__PURE__ */ jsxs(
      "button",
      {
        className: "test-all-btn",
        onClick: testAllTables,
        disabled: testingAll || testingTable !== null,
        children: [
          /* @__PURE__ */ jsx("span", { className: "btn-icon", style: {
            animation: testingAll ? "spin 1s linear infinite" : "none"
          }, children: "🧪" }),
          /* @__PURE__ */ jsx("span", { children: testingAll ? lang === "ru" ? "Тестирование..." : "Testing..." : lang === "ru" ? "Тест всех таблиц" : "Test All Tables" })
        ]
      }
    ) }),
    showResults && testResults.length > 0 && /* @__PURE__ */ jsxs("div", { className: "results-panel", children: [
      /* @__PURE__ */ jsxs("div", { className: "results-header", children: [
        /* @__PURE__ */ jsx("span", { children: lang === "ru" ? "📊 Результаты тестирования" : "📊 Test Results" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setShowResults(false), children: "✕" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "results-list", children: testResults.map((result) => /* @__PURE__ */ jsxs("div", { className: `result-item ${result.status.toLowerCase()}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "result-name", children: [
          /* @__PURE__ */ jsx("span", { className: "result-icon", children: result.status === "SUCCESS" ? "✅" : result.status === "ERROR" ? "❌" : "⏭️" }),
          /* @__PURE__ */ jsx("code", { children: result.table_name })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "result-details", children: result.status === "SUCCESS" ? /* @__PURE__ */ jsxs("span", { className: "success-text", children: [
          lang === "ru" ? "Успешно" : "Success",
          result.executionTime && ` (${result.executionTime}ms)`
        ] }) : /* @__PURE__ */ jsxs("span", { className: "error-text", title: result.error, children: [
          result.error?.substring(0, 60) || "Error",
          "..."
        ] }) })
      ] }, result.table_name)) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "modal-body", children: loading ? /* @__PURE__ */ jsxs("div", { className: "loading-state", children: [
      /* @__PURE__ */ jsx("div", { className: "spinner" }),
      /* @__PURE__ */ jsx("p", { children: lang === "ru" ? "Загрузка..." : "Loading..." })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "tables-section", children: [
        /* @__PURE__ */ jsxs("h3", { className: "section-title", children: [
          "✅ ",
          lang === "ru" ? "Автоматические таблицы" : "Automatic Tables",
          " (",
          enabledCount,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "tables-list", children: tables.filter((t) => t.in_config && t.is_enabled).map((table) => /* @__PURE__ */ jsxs("div", { className: "table-row", children: [
          /* @__PURE__ */ jsxs("div", { className: "table-info", children: [
            /* @__PURE__ */ jsx("code", { className: "table-name", children: table.table_name }),
            table.last_success_at && /* @__PURE__ */ jsxs("span", { className: "table-time", children: [
              "🕒 ",
              new Date(table.last_success_at).toLocaleString(lang === "ru" ? "ru-RU" : "en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "test-btn",
              onClick: () => testSingleTable(table.table_name),
              disabled: testingTable === table.table_name || testingAll,
              children: testingTable === table.table_name ? "⏳" : "▶️"
            }
          )
        ] }, table.table_name)) })
      ] }),
      tables.filter((t) => t.in_config && !t.is_enabled).length > 0 && /* @__PURE__ */ jsxs("div", { className: "tables-section", children: [
        /* @__PURE__ */ jsxs("h3", { className: "section-title", children: [
          "⏸️ ",
          lang === "ru" ? "Отключённые таблицы" : "Disabled Tables"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "tables-list", children: tables.filter((t) => t.in_config && !t.is_enabled).map((table) => /* @__PURE__ */ jsxs("div", { className: "table-row disabled", children: [
          /* @__PURE__ */ jsxs("div", { className: "table-info", children: [
            /* @__PURE__ */ jsx("code", { className: "table-name", children: table.table_name }),
            table.last_error && /* @__PURE__ */ jsxs("span", { className: "table-error", title: table.last_error, children: [
              "⚠️ ",
              table.last_error.substring(0, 40),
              "..."
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "test-btn",
              onClick: () => testSingleTable(table.table_name),
              disabled: testingTable === table.table_name || testingAll,
              children: testingTable === table.table_name ? "⏳" : "▶️"
            }
          )
        ] }, table.table_name)) })
      ] }),
      newTablesCount > 0 && /* @__PURE__ */ jsxs("div", { className: "tables-section highlight", children: [
        /* @__PURE__ */ jsxs("h3", { className: "section-title", children: [
          "🆕 ",
          lang === "ru" ? "Новые таблицы (не в автоматике)" : "New Tables (not automated)"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "tables-list", children: tables.filter((t) => !t.in_config).map((table) => /* @__PURE__ */ jsxs("div", { className: "table-row new", children: [
          /* @__PURE__ */ jsxs("div", { className: "table-info", children: [
            /* @__PURE__ */ jsx("code", { className: "table-name", children: table.table_name }),
            /* @__PURE__ */ jsx("span", { className: "new-badge", children: "NEW" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "test-btn",
              onClick: () => testSingleTable(table.table_name),
              disabled: testingTable === table.table_name || testingAll,
              children: testingTable === table.table_name ? "⏳" : "▶️"
            }
          )
        ] }, table.table_name)) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "modal-footer", children: /* @__PURE__ */ jsx("a", { href: "/admin/keep-alive", className: "link-btn", children: lang === "ru" ? "Полная панель управления →" : "Full dashboard →" }) }),
    /* @__PURE__ */ jsx("style", { children: `
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
          }

          .modal-container {
            background: white;
            border-radius: 20px;
            max-width: 700px;
            width: 90%;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: scaleUp 0.3s ease;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 24px;
            border-bottom: 1px solid #E5E7EB;
          }

          .modal-header h2 {
            font-size: 22px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 4px 0;
          }

          .modal-subtitle {
            font-size: 14px;
            color: #6B7280;
            margin: 0;
          }

          .close-btn {
            width: 32px;
            height: 32px;
            border: none;
            background: #F3F4F6;
            border-radius: 8px;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s ease;
            color: #6B7280;
          }

          .close-btn:hover {
            background: #E5E7EB;
            transform: rotate(90deg);
          }

          .stats-bar {
            display: flex;
            gap: 20px;
            padding: 16px 24px;
            background: #F9FAFB;
            border-bottom: 1px solid #E5E7EB;
            flex-wrap: wrap;
          }

          .stat-item {
            display: flex;
            gap: 8px;
            align-items: center;
          }

          .stat-label {
            font-size: 13px;
            color: #6B7280;
          }

          .stat-value {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
          }

          .action-section {
            padding: 20px 24px;
            border-bottom: 1px solid #E5E7EB;
          }

          .test-all-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 14px 24px;
            background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
          }

          .test-all-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
          }

          .test-all-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .btn-icon {
            font-size: 20px;
          }

          .results-panel {
            margin: 0 24px 20px;
            background: #F9FAFB;
            border-radius: 12px;
            overflow: hidden;
          }

          .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: #EDE9FE;
            font-weight: 600;
            font-size: 14px;
            color: #5B21B6;
          }

          .results-header button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            color: #6B7280;
          }

          .results-list {
            max-height: 200px;
            overflow-y: auto;
          }

          .result-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 16px;
            border-bottom: 1px solid #E5E7EB;
          }

          .result-item:last-child {
            border-bottom: none;
          }

          .result-name {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .result-name code {
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
          }

          .result-details {
            font-size: 12px;
          }

          .success-text {
            color: #10B981;
            font-weight: 500;
          }

          .error-text {
            color: #EF4444;
          }

          .modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px 24px;
          }

          .tables-section {
            margin-bottom: 24px;
          }

          .tables-section.highlight {
            padding: 16px;
            background: #FEF3C7;
            border-radius: 12px;
          }

          .section-title {
            font-size: 15px;
            font-weight: 600;
            color: #374151;
            margin: 0 0 12px 0;
          }

          .tables-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .table-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 10px;
            transition: all 0.2s ease;
          }

          .table-row:hover {
            border-color: #7C3AED;
            box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
          }

          .table-row.disabled {
            opacity: 0.6;
          }

          .table-row.new {
            border: 2px solid #F59E0B;
          }

          .table-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
          }

          .table-name {
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            font-weight: 600;
            color: #111827;
          }

          .table-time {
            font-size: 12px;
            color: #10B981;
          }

          .table-error {
            font-size: 12px;
            color: #EF4444;
          }

          .new-badge {
            display: inline-block;
            padding: 2px 8px;
            background: #F59E0B;
            color: white;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
          }

          .test-btn {
            padding: 8px 12px;
            background: #F3F4F6;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s ease;
          }

          .test-btn:hover:not(:disabled) {
            background: #7C3AED;
            transform: scale(1.1);
          }

          .test-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .modal-footer {
            padding: 16px 24px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
          }

          .link-btn {
            color: #7C3AED;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
          }

          .link-btn:hover {
            text-decoration: underline;
          }

          .loading-state {
            text-align: center;
            padding: 40px 20px;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #E5E7EB;
            border-top-color: #7C3AED;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes scaleUp {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        ` })
  ] }) });
}

const SUPABASE_URL = "https://mcmzdscpuoxwneuzsanu.supabase.co";
const SUPABASE_KEY = "sb_publishable_oqeTkwpUNEhCWHIkCfhwpA_YmqUWWEx";
const SERVICE_ROLE_KEY = "sb_secret_3M8nfMu6ZdYVvg_8Jh0JGw_ONxcbcc9";
function SupabaseAdmin() {
  const lang = useLang();
  const [stats, setStats] = useState(null);
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("connection");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [showServiceKey, setShowServiceKey] = useState(false);
  const itemsPerPage = 20;
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("poi_locations");
  const [currentTableData, setCurrentTableData] = useState({
    columns: [],
    recordsCount: 0,
    tableSize: "Unknown",
    sampleData: [],
    statistics: null
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showKeepAliveModal, setShowKeepAliveModal] = useState(false);
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  useEffect(() => {
    loadAvailableTables();
    checkConnection();
    loadPOIData();
  }, []);
  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  }, [selectedTable]);
  async function loadAvailableTables() {
    try {
      const response = await fetch("/api/admin/tables");
      const data = await response.json();
      if (data.tables) {
        setAvailableTables(data.tables);
      }
    } catch (error) {
      console.error("Error loading tables:", error);
    }
  }
  async function loadTableData(tableName) {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/tables/${tableName}`);
      const data = await response.json();
      if (data.tableName) {
        setCurrentTableData({
          columns: data.columns || [],
          recordsCount: data.recordsCount || 0,
          tableSize: data.tableSize || "Unknown",
          sampleData: data.sampleData || [],
          statistics: data.statistics || null
        });
        if (tableName === "poi_locations" && data.sampleData) {
          setPoiData(data.sampleData);
          setFilteredData(data.sampleData);
          if (data.statistics) {
            setStats({
              total: data.recordsCount,
              withPhotos: data.sampleData.filter((p) => p.main_photo).length,
              withRating: data.sampleData.filter((p) => p.rating && p.rating > 0).length,
              categories: data.statistics.byCategory?.length || 0,
              byCategory: data.statistics.byCategory || [],
              byLocation: data.statistics.byLocation || []
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error loading table ${tableName}:`, error);
    } finally {
      setLoading(false);
    }
  }
  async function handleRefresh() {
    setRefreshing(true);
    await loadAvailableTables();
    await loadTableData(selectedTable);
    setRefreshing(false);
  }
  async function checkConnection() {
    try {
      const { error } = await supabase.from("poi_locations").select("id").limit(1);
      if (error) throw error;
      setConnectionStatus("connected");
    } catch (err) {
      console.error("Connection error:", err);
      setConnectionStatus("error");
    }
  }
  async function loadPOIData() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("poi_locations").select("*").order("rating", { ascending: false, nullsLast: true });
      if (error) throw error;
      const total = data.length;
      const withPhotos = data.filter((item) => item.main_photo).length;
      const withRating = data.filter((item) => item.rating).length;
      const categories = {};
      const locations = {};
      data.forEach((item) => {
        const cat = item.category || "Unknown";
        const loc = item.location || "Unknown";
        categories[cat] = (categories[cat] || 0) + 1;
        locations[loc] = (locations[loc] || 0) + 1;
      });
      setStats({ total, withPhotos, withRating, categories, locations });
      setPois(data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setLoading(false);
    }
  }
  const filteredPois = pois.filter((poi) => {
    const matchSearch = !searchTerm || poi.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !filterCategory || poi.category === filterCategory;
    const matchLocation = !filterLocation || poi.location === filterLocation;
    return matchSearch && matchCategory && matchLocation;
  });
  const totalPages = Math.ceil(filteredPois.length / itemsPerPage);
  const paginatedPois = filteredPois.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return /* @__PURE__ */ jsxs("div", { className: "dashboard supabase-admin-lumina", children: [
    /* @__PURE__ */ jsxs("div", { className: "page-header-lumina", children: [
      /* @__PURE__ */ jsxs("div", { className: "header-content", children: [
        /* @__PURE__ */ jsxs("h1", { className: "header-title", children: [
          "🗄️ ",
          lang === "ru" ? "База данных Supabase" : "Supabase Database"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "header-subtitle", children: lang === "ru" ? "Управление данными проекта Шри-Ланка" : "Manage Sri Lanka Project Data" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "header-actions", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowKeepAliveModal(true),
            className: "btn-keep-alive",
            children: [
              /* @__PURE__ */ jsx("span", { className: "btn-icon", children: "🔄" }),
              /* @__PURE__ */ jsx("span", { className: "btn-text", children: lang === "ru" ? "Keep-Alive" : "Keep-Alive" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("a", { href: "/admin/database", className: "btn-all-databases", children: [
          /* @__PURE__ */ jsx("span", { className: "btn-icon", children: "🗄️" }),
          /* @__PURE__ */ jsx("span", { className: "btn-text", children: lang === "ru" ? "Все базы" : "All Databases" }),
          /* @__PURE__ */ jsx("span", { className: "btn-badge", children: availableTables.length || 24 })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "tabs", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: `tab ${activeTab === "connection" ? "active" : ""}`,
          onClick: () => setActiveTab("connection"),
          children: [
            "🔌 ",
            lang === "ru" ? "Подключение" : "Connection"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: `tab ${activeTab === "stats" ? "active" : ""}`,
          onClick: () => setActiveTab("stats"),
          children: [
            "📊 ",
            lang === "ru" ? "Статистика" : "Statistics"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: `tab ${activeTab === "data" ? "active" : ""}`,
          onClick: () => setActiveTab("data"),
          children: [
            "📋 ",
            lang === "ru" ? "Данные" : "Data"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: `tab ${activeTab === "map" ? "active" : ""}`,
          onClick: () => setActiveTab("map"),
          children: [
            "🗺️ ",
            lang === "ru" ? "Карта" : "Map"
          ]
        }
      )
    ] }),
    activeTab === "connection" && /* @__PURE__ */ jsxs("div", { className: "tab-content", children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "card", children: [
          /* @__PURE__ */ jsxs("h3", { children: [
            "📍 ",
            lang === "ru" ? "Туристические объекты (POI)" : "Tourist POI Objects"
          ] }),
          /* @__PURE__ */ jsx("p", { style: { color: "#666", fontSize: "14px", marginBottom: "20px" }, children: lang === "ru" ? "Таблица: poi_locations" : "Table: poi_locations" }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { children: /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "URL проекта:" : "Project URL:" }) }),
            /* @__PURE__ */ jsx("input", { type: "text", className: "input", value: SUPABASE_URL, readOnly: true, style: { background: "#f5f5f5" } })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { children: /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "Название таблицы:" : "Table Name:" }) }),
            /* @__PURE__ */ jsx("input", { type: "text", className: "input", value: "poi_locations", readOnly: true, style: { background: "#f5f5f5" } })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { children: /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "Публичный ключ API:" : "Public API Key:" }) }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "10px" }, children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: showPublicKey ? "text" : "password",
                  className: "input",
                  value: SUPABASE_KEY,
                  readOnly: true,
                  style: { background: "#f5f5f5", flex: 1 }
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "btn btn-secondary",
                  onClick: () => setShowPublicKey(!showPublicKey),
                  style: { minWidth: "100px" },
                  children: [
                    showPublicKey ? "🙈 " : "👁️ ",
                    lang === "ru" ? showPublicKey ? "Скрыть" : "Показать" : showPublicKey ? "Hide" : "Show"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { children: /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "Сервисный ключ:" : "Service Role Key:" }) }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "10px" }, children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: showServiceKey ? "text" : "password",
                  className: "input",
                  value: SERVICE_ROLE_KEY,
                  readOnly: true,
                  style: { background: "#f5f5f5", flex: 1 }
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "btn btn-secondary",
                  onClick: () => setShowServiceKey(!showServiceKey),
                  style: { minWidth: "100px" },
                  children: [
                    showServiceKey ? "🙈 " : "👁️ ",
                    lang === "ru" ? showServiceKey ? "Скрыть" : "Показать" : showServiceKey ? "Hide" : "Show"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { children: /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "Статус подключения:" : "Connection Status:" }) }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }, children: [
              connectionStatus === "checking" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { className: "spinner", style: { width: "20px", height: "20px", borderWidth: "2px" } }),
                /* @__PURE__ */ jsx("span", { children: lang === "ru" ? "Проверка..." : "Checking..." })
              ] }),
              connectionStatus === "connected" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { style: { fontSize: "24px" }, children: "✅" }),
                /* @__PURE__ */ jsx("span", { style: { color: "#28a745", fontWeight: "bold" }, children: lang === "ru" ? "Подключено успешно" : "Connected Successfully" })
              ] }),
              connectionStatus === "error" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { style: { fontSize: "24px" }, children: "❌" }),
                /* @__PURE__ */ jsx("span", { style: { color: "#dc3545", fontWeight: "bold" }, children: lang === "ru" ? "Ошибка подключения" : "Connection Error" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { children: /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "Всего записей:" : "Total Records:" }) }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "input",
                value: stats?.total.toLocaleString() || "...",
                readOnly: true,
                style: { background: "#e8f5e9", fontWeight: "bold", fontSize: "18px" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { children: /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "Регион:" : "Region:" }) }),
            /* @__PURE__ */ jsx("input", { type: "text", className: "input", value: "Southwest Coast (Negombo → Tangalle)", readOnly: true, style: { background: "#f5f5f5" } })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { children: /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "Источник данных:" : "Data Source:" }) }),
            /* @__PURE__ */ jsx("input", { type: "text", className: "input", value: "Google Places API", readOnly: true, style: { background: "#f5f5f5" } })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "card", children: [
          /* @__PURE__ */ jsxs("h3", { children: [
            "👥 ",
            lang === "ru" ? "Объекты пользователей" : "User Objects"
          ] }),
          /* @__PURE__ */ jsx("p", { style: { color: "#666", fontSize: "14px", marginBottom: "20px" }, children: lang === "ru" ? "Таблица: user_objects (не создана)" : "Table: user_objects (not created)" }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { children: /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "URL проекта:" : "Project URL:" }) }),
            /* @__PURE__ */ jsx("input", { type: "text", className: "input", value: SUPABASE_URL, readOnly: true, style: { background: "#f5f5f5" } })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { children: /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "Название таблицы:" : "Table Name:" }) }),
            /* @__PURE__ */ jsx("input", { type: "text", className: "input", value: "user_objects", readOnly: true, style: { background: "#fff3cd", border: "1px solid #ffc107" } }),
            /* @__PURE__ */ jsxs("small", { style: { color: "#856404", display: "block", marginTop: "5px" }, children: [
              "⚠️ ",
              lang === "ru" ? "Таблица еще не создана" : "Table not created yet"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { children: /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "Публичный ключ API:" : "Public API Key:" }) }),
            /* @__PURE__ */ jsx("input", { type: "password", className: "input", value: SUPABASE_KEY, readOnly: true, style: { background: "#f5f5f5" } }),
            /* @__PURE__ */ jsx("small", { style: { color: "#666", display: "block", marginTop: "5px" }, children: lang === "ru" ? "Используется тот же ключ" : "Same key as POI table" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { children: /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "Статус подключения:" : "Connection Status:" }) }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }, children: [
              /* @__PURE__ */ jsx("span", { style: { fontSize: "24px" }, children: "⚪" }),
              /* @__PURE__ */ jsx("span", { style: { color: "#6c757d", fontWeight: "bold" }, children: lang === "ru" ? "Не настроено" : "Not Configured" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { children: /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "Всего записей:" : "Total Records:" }) }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "input",
                value: "0",
                readOnly: true,
                style: { background: "#f8d7da", color: "#721c24", fontWeight: "bold", fontSize: "18px" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { children: /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "Назначение:" : "Purpose:" }) }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "input",
                value: lang === "ru" ? "Пользовательские объекты" : "User-generated objects",
                readOnly: true,
                style: { background: "#f5f5f5" }
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { style: { marginTop: "30px", textAlign: "center" }, children: /* @__PURE__ */ jsxs(
            "button",
            {
              className: "btn btn-primary",
              style: { width: "100%", padding: "12px" },
              onClick: () => alert(lang === "ru" ? "Функция создания таблицы в разработке" : "Table creation feature in development"),
              children: [
                "+ ",
                lang === "ru" ? "Создать таблицу" : "Create Table"
              ]
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", style: { marginTop: "20px" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }, children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "16px", flex: 1 }, children: [
            /* @__PURE__ */ jsx("h3", { style: { margin: 0 }, children: lang === "ru" ? "Структура таблицы:" : "Table Structure:" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                className: "table-selector-dropdown",
                style: { maxWidth: "400px" },
                value: selectedTable,
                onChange: (e) => setSelectedTable(e.target.value),
                children: availableTables.length > 0 ? availableTables.map((table) => /* @__PURE__ */ jsx("option", { value: table.name, children: table.name }, table.name)) : /* @__PURE__ */ jsx("option", { value: "poi_locations", children: "poi_locations" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn-refresh",
              onClick: handleRefresh,
              disabled: refreshing,
              style: { padding: "8px 16px", fontSize: "14px" },
              children: /* @__PURE__ */ jsx("span", { className: "refresh-icon", style: {
                display: "inline-block",
                animation: refreshing ? "spin 1s linear infinite" : "none",
                fontSize: "16px"
              }, children: "🔄" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { style: { marginBottom: "16px", padding: "12px", background: "#F9FAFB", borderRadius: "8px" }, children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "24px", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "Колонок:" : "Columns:" }),
            " ",
            currentTableData.columns.length || 0
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "Записей:" : "Records:" }),
            " ",
            currentTableData.recordsCount?.toLocaleString() || 0
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: lang === "ru" ? "Размер:" : "Size:" }),
            " ",
            currentTableData.tableSize || "Unknown"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "table-container", children: loading ? /* @__PURE__ */ jsxs("div", { className: "loading-container", children: [
          /* @__PURE__ */ jsx("div", { className: "spinner", style: { width: "30px", height: "30px", borderWidth: "3px" } }),
          /* @__PURE__ */ jsx("p", { children: lang === "ru" ? "Загрузка структуры..." : "Loading structure..." })
        ] }) : currentTableData.columns.length > 0 ? /* @__PURE__ */ jsxs("table", { className: "data-table", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: lang === "ru" ? "Поле" : "Field" }),
            /* @__PURE__ */ jsx("th", { children: lang === "ru" ? "Тип" : "Type" }),
            /* @__PURE__ */ jsx("th", { children: lang === "ru" ? "Nullable" : "Nullable" }),
            /* @__PURE__ */ jsx("th", { children: lang === "ru" ? "По умолчанию" : "Default" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: currentTableData.columns.map((col, idx) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("code", { children: col.column_name }) }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: "badge", children: col.data_type }) }),
            /* @__PURE__ */ jsx("td", { children: col.is_nullable === "YES" ? "✅" : "❌" }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("small", { children: col.column_default || "-" }) })
          ] }, idx)) })
        ] }) : /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "40px", color: "#6B7280" }, children: lang === "ru" ? "Нет данных о структуре таблицы" : "No table structure data available" }) })
      ] })
    ] }),
    activeTab === "stats" && /* @__PURE__ */ jsx("div", { className: "tab-content", children: loading ? /* @__PURE__ */ jsxs("div", { className: "loading-container", children: [
      /* @__PURE__ */ jsx("div", { className: "spinner" }),
      /* @__PURE__ */ jsx("p", { children: lang === "ru" ? "Загрузка статистики..." : "Loading statistics..." })
    ] }) : stats && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "stats-grid", children: [
        /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsx("div", { className: "stat-icon", children: "📍" }),
          /* @__PURE__ */ jsxs("div", { className: "stat-content", children: [
            /* @__PURE__ */ jsx("div", { className: "stat-value", children: stats.total.toLocaleString() }),
            /* @__PURE__ */ jsx("div", { className: "stat-label", children: lang === "ru" ? "Всего объектов" : "Total Objects" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsx("div", { className: "stat-icon", children: "📸" }),
          /* @__PURE__ */ jsxs("div", { className: "stat-content", children: [
            /* @__PURE__ */ jsx("div", { className: "stat-value", children: stats.withPhotos.toLocaleString() }),
            /* @__PURE__ */ jsx("div", { className: "stat-label", children: lang === "ru" ? "С фотографиями" : "With Photos" }),
            /* @__PURE__ */ jsxs("div", { className: "stat-change", children: [
              (stats.withPhotos / stats.total * 100).toFixed(1),
              "%"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsx("div", { className: "stat-icon", children: "⭐" }),
          /* @__PURE__ */ jsxs("div", { className: "stat-content", children: [
            /* @__PURE__ */ jsx("div", { className: "stat-value", children: stats.withRating.toLocaleString() }),
            /* @__PURE__ */ jsx("div", { className: "stat-label", children: lang === "ru" ? "С рейтингом" : "With Rating" }),
            /* @__PURE__ */ jsxs("div", { className: "stat-change", children: [
              (stats.withRating / stats.total * 100).toFixed(1),
              "%"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsx("div", { className: "stat-icon", children: "🏷️" }),
          /* @__PURE__ */ jsxs("div", { className: "stat-content", children: [
            /* @__PURE__ */ jsx("div", { className: "stat-value", children: Object.keys(stats.categories).length }),
            /* @__PURE__ */ jsx("div", { className: "stat-label", children: lang === "ru" ? "Категорий" : "Categories" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("h3", { children: lang === "ru" ? "По категориям" : "By Categories" }),
        /* @__PURE__ */ jsx("div", { className: "table-container", children: /* @__PURE__ */ jsxs("table", { className: "data-table", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: lang === "ru" ? "Категория" : "Category" }),
            /* @__PURE__ */ jsx("th", { children: lang === "ru" ? "Количество" : "Count" }),
            /* @__PURE__ */ jsx("th", { children: lang === "ru" ? "Процент" : "Percent" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: Object.entries(stats.categories).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([category, count]) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: "badge", children: category }) }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("strong", { children: count }) }),
            /* @__PURE__ */ jsxs("td", { children: [
              (count / stats.total * 100).toFixed(1),
              "%"
            ] })
          ] }, category)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("h3", { children: lang === "ru" ? "По локациям" : "By Locations" }),
        /* @__PURE__ */ jsx("div", { className: "table-container", children: /* @__PURE__ */ jsxs("table", { className: "data-table", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: lang === "ru" ? "Локация" : "Location" }),
            /* @__PURE__ */ jsx("th", { children: lang === "ru" ? "Количество" : "Count" }),
            /* @__PURE__ */ jsx("th", { children: lang === "ru" ? "Процент" : "Percent" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: Object.entries(stats.locations).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([location, count]) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("strong", { children: location }) }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("strong", { children: count }) }),
            /* @__PURE__ */ jsxs("td", { children: [
              (count / stats.total * 100).toFixed(1),
              "%"
            ] })
          ] }, location)) })
        ] }) })
      ] })
    ] }) }),
    activeTab === "data" && /* @__PURE__ */ jsx("div", { className: "tab-content", children: loading && pois.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "loading-container", children: [
      /* @__PURE__ */ jsx("div", { className: "spinner" }),
      /* @__PURE__ */ jsx("p", { children: lang === "ru" ? "Загрузка данных..." : "Loading data..." })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "filters", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "input",
            placeholder: lang === "ru" ? "Поиск по названию..." : "Search by name...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            className: "select",
            value: filterCategory,
            onChange: (e) => setFilterCategory(e.target.value),
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: lang === "ru" ? "Все категории" : "All categories" }),
              stats && Object.keys(stats.categories).sort().map((cat) => /* @__PURE__ */ jsx("option", { value: cat, children: cat }, cat))
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            className: "select",
            value: filterLocation,
            onChange: (e) => setFilterLocation(e.target.value),
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: lang === "ru" ? "Все локации" : "All locations" }),
              stats && Object.keys(stats.locations).sort().map((loc) => /* @__PURE__ */ jsx("option", { value: loc, children: loc }, loc))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("div", { className: "table-container", children: /* @__PURE__ */ jsxs("table", { className: "data-table", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: lang === "ru" ? "Название" : "Name" }),
            /* @__PURE__ */ jsx("th", { children: lang === "ru" ? "Категория" : "Category" }),
            /* @__PURE__ */ jsx("th", { children: lang === "ru" ? "Локация" : "Location" }),
            /* @__PURE__ */ jsx("th", { children: lang === "ru" ? "Рейтинг" : "Rating" }),
            /* @__PURE__ */ jsx("th", { children: lang === "ru" ? "Отзывы" : "Reviews" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: paginatedPois.length > 0 ? paginatedPois.map((poi) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("strong", { children: poi.name }) }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: "badge", children: poi.category || "-" }) }),
            /* @__PURE__ */ jsx("td", { children: poi.location || "-" }),
            /* @__PURE__ */ jsx("td", { children: poi.rating ? `${poi.rating} ⭐` : "-" }),
            /* @__PURE__ */ jsx("td", { children: poi.total_reviews || 0 })
          ] }, poi.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, style: { textAlign: "center", padding: "40px" }, children: lang === "ru" ? "Нет данных" : "No data" }) }) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "pagination", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn-secondary",
              onClick: () => setCurrentPage((p) => Math.max(1, p - 1)),
              disabled: currentPage === 1,
              children: "←"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "pagination-info", children: [
            lang === "ru" ? "Страница" : "Page",
            " ",
            currentPage,
            " ",
            lang === "ru" ? "из" : "of",
            " ",
            totalPages || 1
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn-secondary",
              onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
              disabled: currentPage === totalPages,
              children: "→"
            }
          )
        ] })
      ] })
    ] }) }),
    activeTab === "map" && /* @__PURE__ */ jsx("div", { className: "tab-content", children: /* @__PURE__ */ jsx("div", { className: "card", style: { padding: 0, overflow: "hidden" }, children: /* @__PURE__ */ jsx(
      "iframe",
      {
        src: "/map",
        style: { width: "100%", height: "700px", border: "none" },
        title: "POI Map"
      }
    ) }) }),
    /* @__PURE__ */ jsx(
      KeepAliveModal,
      {
        isOpen: showKeepAliveModal,
        onClose: () => setShowKeepAliveModal(false)
      }
    ),
    /* @__PURE__ */ jsx("style", { children: `
        /* Lumina Design System for Supabase Admin */
        .supabase-admin-lumina {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        /* Header with Button - Lumina Style */
        .page-header-lumina {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding: 24px;
          background: linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%);
          border-radius: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          border: 1px solid #E5E7EB;
        }

        .header-content {
          flex: 1;
        }

        .header-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #111827;
          letter-spacing: -0.5px;
        }

        .header-subtitle {
          font-size: 16px;
          color: #6B7280;
          margin: 0;
          font-weight: 400;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        /* "All Databases" Button - Lumina Claymorphism */
        /* Keep-Alive Button - Green Theme */
        .btn-keep-alive {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          text-decoration: none;
          border: none;
          border-radius: 16px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 
            0 4px 16px rgba(16, 185, 129, 0.3),
            inset 0 -2px 8px rgba(0, 0, 0, 0.15),
            inset 0 2px 8px rgba(255, 255, 255, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .btn-keep-alive::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .btn-keep-alive:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 
            0 8px 24px rgba(16, 185, 129, 0.4),
            inset 0 -2px 8px rgba(0, 0, 0, 0.15),
            inset 0 2px 8px rgba(255, 255, 255, 0.2);
        }

        .btn-keep-alive:hover::before {
          opacity: 1;
        }

        .btn-keep-alive:active {
          transform: translateY(-1px) scale(0.98);
          box-shadow: 
            0 4px 12px rgba(16, 185, 129, 0.35),
            inset 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        /* All Databases Button - Purple Theme */
        .btn-all-databases {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
          color: white;
          text-decoration: none;
          border-radius: 16px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 
            0 4px 16px rgba(124, 58, 237, 0.3),
            inset 0 -2px 8px rgba(0, 0, 0, 0.15),
            inset 0 2px 8px rgba(255, 255, 255, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .btn-all-databases::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .btn-all-databases:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 
            0 8px 24px rgba(124, 58, 237, 0.4),
            inset 0 -2px 8px rgba(0, 0, 0, 0.15),
            inset 0 2px 8px rgba(255, 255, 255, 0.2);
        }

        .btn-all-databases:hover::before {
          opacity: 1;
        }

        .btn-all-databases:active {
          transform: translateY(-1px) scale(0.98);
          box-shadow: 
            0 4px 12px rgba(124, 58, 237, 0.35),
            inset 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .btn-all-databases .btn-icon {
          font-size: 20px;
          line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .btn-all-databases .btn-text {
          font-weight: 600;
          letter-spacing: 0.3px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
        }

        .btn-all-databases .btn-badge {
          padding: 3px 10px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.15),
            inset 0 1px 2px rgba(255, 255, 255, 0.3);
        }

        /* Tabs Enhancement - Lumina Style */
        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          padding: 6px;
          background: #F9FAFB;
          border-radius: 16px;
          border: 1px solid #E5E7EB;
        }

        .tab {
          flex: 1;
          padding: 12px 24px;
          background: transparent;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab:hover {
          background: rgba(124, 58, 237, 0.08);
          color: #7C3AED;
        }

        .tab.active {
          background: white;
          color: #7C3AED;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        /* Card Enhancement - Lumina Claymorphism */
        .card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.06),
            inset 0 -1px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid #E5E7EB;
          transition: all 0.3s ease;
        }

        .card:hover {
          box-shadow: 
            0 8px 24px rgba(0, 0, 0, 0.1),
            inset 0 -1px 0 rgba(0, 0, 0, 0.05);
        }

        .card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 16px 0;
        }

        /* Stats Grid Enhancement */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          border: 1px solid #E5E7EB;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          font-size: 36px;
          line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #6B7280;
          font-weight: 500;
        }

        .stat-change {
          font-size: 13px;
          color: #10B981;
          font-weight: 600;
          margin-top: 4px;
        }

        /* Input & Select Enhancement */
        .input, .select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.3s ease;
          background: white;
        }

        .input:focus, .select:focus {
          outline: none;
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        /* Button Enhancement */
        .btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
        }

        .btn-secondary {
          background: #F3F4F6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #E5E7EB;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Badge Enhancement */
        .badge {
          display: inline-block;
          padding: 4px 12px;
          background: #EDE9FE;
          color: #7C3AED;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        /* Table Enhancement */
        .data-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .data-table thead {
          background: #F9FAFB;
        }

        .data-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #E5E7EB;
        }

        .data-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #F3F4F6;
          font-size: 14px;
          color: #374151;
        }

        .data-table tbody tr {
          transition: all 0.2s ease;
        }

        .data-table tbody tr:hover {
          background: #F9FAFB;
        }

        /* Pagination Enhancement */
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }

        .pagination-info {
          font-size: 14px;
          color: #6B7280;
          font-weight: 500;
        }

        /* Loading Enhancement */
        .loading-container {
          text-align: center;
          padding: 60px 20px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #E5E7EB;
          border-top-color: #7C3AED;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Table Selector Dropdown (в секции Structure) */
        .table-selector-dropdown {
          padding: 10px 14px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          color: #111827;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', 'Source Code Pro', monospace;
        }

        .table-selector-dropdown:hover {
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        .table-selector-dropdown:focus {
          outline: none;
          border-color: #7C3AED;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.15);
        }

        /* Refresh Button - Lumina Style */
        .btn-refresh {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          white-space: nowrap;
        }

        .btn-refresh:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }

        .btn-refresh:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .btn-refresh:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .refresh-icon {
          font-size: 18px;
          line-height: 1;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .page-header-lumina {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .header-actions {
            width: 100%;
          }

          .btn-all-databases {
            width: 100%;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      ` })
  ] });
}

const $$Astro = createAstro();
const $$Supabase = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Supabase;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Supabase Database - Admin Panel" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminLayout", AdminLayout, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/AdminLayout", "client:component-export": "default" }, { "default": async ($$result3) => renderTemplate` ${renderComponent($$result3, "SupabaseAdmin", SupabaseAdmin, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/SupabaseAdmin", "client:component-export": "default" })} ` })} ` })}`;
}, "C:/Users/User/Desktop/sri/src/pages/admin/supabase.astro", void 0);

const $$file = "C:/Users/User/Desktop/sri/src/pages/admin/supabase.astro";
const $$url = "/admin/supabase";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Supabase,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
