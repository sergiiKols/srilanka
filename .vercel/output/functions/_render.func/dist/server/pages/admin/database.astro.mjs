import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_CZKHqJbe.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../chunks/Layout_lp9ZR76Z.mjs';
import { u as useLang, A as AdminLayout } from '../../chunks/AdminLayout_DTgBj3su.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
export { renderers } from '../../renderers.mjs';

const SUPABASE_URL = "https://mcmzdscpuoxwneuzsanu.supabase.co";
const SUPABASE_KEY = "sb_publishable_oqeTkwpUNEhCWHIkCfhwpA_YmqUWWEx";
function DatabaseTables() {
  const lang = useLang();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState(null);
  createClient(SUPABASE_URL, SUPABASE_KEY);
  const fallbackTablesData = [
    // TELEGRAM LISTING SYSTEM (6 таблиц)
    { name: "telegram_accounts", size: "80 kB", columns: 14, description: "Telegram accounts for publishing", category: "telegram_listing" },
    { name: "telegram_groups", size: "112 kB", columns: 17, description: "Telegram groups/channels", category: "telegram_listing" },
    { name: "property_listings", size: "152 kB", columns: 42, description: "Property listings from clients", category: "telegram_listing" },
    { name: "listing_publications", size: "120 kB", columns: 14, description: "Publications in Telegram groups", category: "telegram_listing" },
    { name: "landlord_responses", size: "128 kB", columns: 30, description: "Landlord responses to listings", category: "telegram_listing" },
    { name: "temperature_change_log", size: "56 kB", columns: 9, description: "Temperature change log", category: "telegram_listing" },
    // SUPERBASE CRM SYSTEM (14 таблиц)
    { name: "users", size: "64 kB", columns: 28, description: "Extended user profiles with preferences and OAuth data", category: "superbase_crm" },
    { name: "landlords", size: "56 kB", columns: 30, description: "Property owners with verification and subscription info", category: "superbase_crm" },
    { name: "properties", size: "120 kB", columns: 50, description: "Rental properties with location, pricing, and amenities", category: "superbase_crm" },
    { name: "rental_requests", size: "104 kB", columns: 43, description: "Client rental requests/needs", category: "superbase_crm" },
    { name: "offers", size: "64 kB", columns: 17, description: "Connections between properties and rental requests", category: "superbase_crm" },
    { name: "messages", size: "64 kB", columns: 19, description: "Direct messages between users", category: "superbase_crm" },
    { name: "client_maps", size: "48 kB", columns: 15, description: "Personal maps for clients to view offers", category: "superbase_crm" },
    { name: "map_markers", size: "48 kB", columns: 13, description: "Property markers on client maps", category: "superbase_crm" },
    { name: "subscriptions", size: "40 kB", columns: 17, description: "Landlord subscription plans", category: "superbase_crm" },
    { name: "payments", size: "56 kB", columns: 16, description: "Payment transaction history", category: "superbase_crm" },
    { name: "notifications", size: "40 kB", columns: 17, description: "User notifications", category: "superbase_crm" },
    { name: "analytics_events", size: "48 kB", columns: 22, description: "Analytics and tracking events", category: "superbase_crm" },
    { name: "reviews", size: "64 kB", columns: 20, description: "Property and landlord reviews", category: "superbase_crm" },
    { name: "saved_properties", size: "40 kB", columns: 5, description: "User favorite properties", category: "superbase_crm" },
    // POI SYSTEM (1 таблица)
    { name: "poi_locations", size: "4752 kB", columns: 20, description: "Points of Interest - Tourist locations", category: "poi", recordsCount: 6176 },
    // SYSTEM TABLES (3 таблицы)
    { name: "system_config", size: "48 kB", columns: 6, description: "System configuration (keep-alive)", category: "system" },
    { name: "schema_migrations", size: "32 kB", columns: 3, description: "Database migration history", category: "system" },
    { name: "spatial_ref_sys", size: "7144 kB", columns: 5, description: "PostGIS spatial reference systems", category: "system" }
  ];
  useEffect(() => {
    loadTables();
  }, []);
  async function loadTables() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/tables");
      const data = await response.json();
      if (data.tables && data.tables.length > 0) {
        const mappedTables = data.tables.map((table) => ({
          name: table.name,
          size: table.size || "Unknown",
          columns: table.columns || 0,
          description: table.description || null,
          category: table.category || categorizeTable(table.name),
          recordsCount: table.recordsCount
        }));
        setTables(mappedTables);
      } else {
        console.warn("API returned no tables, using fallback data");
        setTables(fallbackTablesData);
      }
    } catch (error) {
      console.error("Error loading tables from API:", error);
      setTables(fallbackTablesData);
    } finally {
      setLoading(false);
    }
  }
  function categorizeTable(tableName) {
    if (tableName.includes("telegram") || tableName.includes("listing") || tableName.includes("publication") || tableName.includes("landlord") || tableName.includes("temperature")) {
      return "telegram_listing";
    } else if (tableName === "poi_locations") {
      return "poi";
    } else if (tableName === "system_config" || tableName === "schema_migrations" || tableName === "spatial_ref_sys") {
      return "system";
    } else {
      return "superbase_crm";
    }
  }
  const categories = [
    { id: "all", label: lang === "ru" ? "Все таблицы" : "All Tables", icon: "🗄️" },
    { id: "telegram_listing", label: lang === "ru" ? "Telegram Listing" : "Telegram Listing", icon: "📱" },
    { id: "superbase_crm", label: lang === "ru" ? "Superbase CRM" : "Superbase CRM", icon: "🏢" },
    { id: "poi", label: lang === "ru" ? "POI Locations" : "POI Locations", icon: "📍" },
    { id: "system", label: lang === "ru" ? "System Tables" : "System Tables", icon: "⚙️" }
  ];
  const filteredTables = tables.filter((table) => {
    const matchCategory = selectedCategory === "all" || table.category === selectedCategory;
    const matchSearch = !searchTerm || table.name.toLowerCase().includes(searchTerm.toLowerCase()) || table.description && table.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });
  const getCategoryColor = (category) => {
    switch (category) {
      case "telegram_listing":
        return "#7C3AED";
      // Deep Violet (AI Status)
      case "superbase_crm":
        return "#10B981";
      // Success Green
      case "poi":
        return "#F59E0B";
      // Warning Orange
      case "system":
        return "#6B7280";
      // Gray
      default:
        return "#6B7280";
    }
  };
  const getCategoryStats = () => {
    const stats = {};
    categories.forEach((cat) => {
      if (cat.id === "all") {
        stats[cat.id] = tables.length;
      } else {
        stats[cat.id] = tables.filter((t) => t.category === cat.id).length;
      }
    });
    return stats;
  };
  const categoryStats = getCategoryStats();
  return /* @__PURE__ */ jsxs("div", { className: "database-tables", children: [
    /* @__PURE__ */ jsx("div", { className: "page-header", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { children: lang === "ru" ? "🗄️ База данных Supabase" : "🗄️ Supabase Database" }),
      /* @__PURE__ */ jsx("p", { className: "subtitle", children: lang === "ru" ? `Всего таблиц: ${tables.length} | Проверено: 2026-01-28` : `Total tables: ${tables.length} | Verified: 2026-01-28` })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "category-pills", children: categories.map((cat) => /* @__PURE__ */ jsxs(
      "button",
      {
        className: `category-pill ${selectedCategory === cat.id ? "active" : ""}`,
        onClick: () => setSelectedCategory(cat.id),
        style: {
          borderColor: selectedCategory === cat.id ? getCategoryColor(cat.id === "all" ? "telegram_listing" : cat.id) : "#E5E7EB",
          background: selectedCategory === cat.id ? `linear-gradient(135deg, ${getCategoryColor(cat.id === "all" ? "telegram_listing" : cat.id)}10, ${getCategoryColor(cat.id === "all" ? "telegram_listing" : cat.id)}05)` : "white"
        },
        children: [
          /* @__PURE__ */ jsx("span", { className: "pill-icon", children: cat.icon }),
          /* @__PURE__ */ jsx("span", { className: "pill-label", children: cat.label }),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "pill-badge",
              style: {
                backgroundColor: getCategoryColor(cat.id === "all" ? "telegram_listing" : cat.id),
                color: "white"
              },
              children: categoryStats[cat.id]
            }
          )
        ]
      },
      cat.id
    )) }),
    /* @__PURE__ */ jsx("div", { className: "search-box", children: /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        className: "search-input",
        placeholder: lang === "ru" ? "🔍 Поиск по названию или описанию..." : "🔍 Search by name or description...",
        value: searchTerm,
        onChange: (e) => setSearchTerm(e.target.value)
      }
    ) }),
    loading ? /* @__PURE__ */ jsxs("div", { className: "loading-container", children: [
      /* @__PURE__ */ jsx("div", { className: "spinner" }),
      /* @__PURE__ */ jsx("p", { children: lang === "ru" ? "Загрузка таблиц..." : "Loading tables..." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "tables-grid", children: filteredTables.map((table) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "table-card",
        onClick: () => setSelectedTable(table),
        style: {
          borderTop: `3px solid ${getCategoryColor(table.category)}`
        },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "table-card-header", children: [
            /* @__PURE__ */ jsx("h3", { className: "table-name", children: /* @__PURE__ */ jsx("code", { children: table.name }) }),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "category-badge",
                style: { backgroundColor: getCategoryColor(table.category) },
                children: categories.find((c) => c.id === table.category)?.icon
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "table-stats", children: [
            /* @__PURE__ */ jsxs("div", { className: "stat-item", children: [
              /* @__PURE__ */ jsx("span", { className: "stat-icon", children: "💾" }),
              /* @__PURE__ */ jsx("span", { className: "stat-value", children: table.size })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "stat-item", children: [
              /* @__PURE__ */ jsx("span", { className: "stat-icon", children: "📊" }),
              /* @__PURE__ */ jsxs("span", { className: "stat-value", children: [
                table.columns,
                " ",
                lang === "ru" ? "колонок" : "columns"
              ] })
            ] }),
            table.recordsCount && /* @__PURE__ */ jsxs("div", { className: "stat-item", children: [
              /* @__PURE__ */ jsx("span", { className: "stat-icon", children: "📝" }),
              /* @__PURE__ */ jsxs("span", { className: "stat-value", children: [
                table.recordsCount.toLocaleString(),
                " ",
                lang === "ru" ? "записей" : "records"
              ] })
            ] })
          ] }),
          table.description && /* @__PURE__ */ jsx("p", { className: "table-description", children: table.description }),
          /* @__PURE__ */ jsx("div", { className: "table-card-footer", children: /* @__PURE__ */ jsx("button", { className: "btn-ghost", children: lang === "ru" ? "Подробнее →" : "Details →" }) })
        ]
      },
      table.name
    )) }),
    filteredTables.length === 0 && !loading && /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
      /* @__PURE__ */ jsx("div", { className: "empty-icon", children: "🔍" }),
      /* @__PURE__ */ jsx("p", { children: lang === "ru" ? "Таблицы не найдены" : "No tables found" })
    ] }),
    selectedTable && /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: () => setSelectedTable(null), children: /* @__PURE__ */ jsxs("div", { className: "modal-content", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
        /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("code", { children: selectedTable.name }) }),
        /* @__PURE__ */ jsx("button", { className: "modal-close", onClick: () => setSelectedTable(null), children: "✕" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "modal-body", children: [
        /* @__PURE__ */ jsxs("div", { className: "detail-grid", children: [
          /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
            /* @__PURE__ */ jsx("span", { className: "detail-label", children: lang === "ru" ? "Категория:" : "Category:" }),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "detail-value category-badge",
                style: { backgroundColor: getCategoryColor(selectedTable.category) },
                children: categories.find((c) => c.id === selectedTable.category)?.label
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
            /* @__PURE__ */ jsx("span", { className: "detail-label", children: lang === "ru" ? "Размер:" : "Size:" }),
            /* @__PURE__ */ jsx("span", { className: "detail-value", children: selectedTable.size })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
            /* @__PURE__ */ jsx("span", { className: "detail-label", children: lang === "ru" ? "Колонок:" : "Columns:" }),
            /* @__PURE__ */ jsx("span", { className: "detail-value", children: selectedTable.columns })
          ] }),
          selectedTable.recordsCount && /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
            /* @__PURE__ */ jsx("span", { className: "detail-label", children: lang === "ru" ? "Записей:" : "Records:" }),
            /* @__PURE__ */ jsx("span", { className: "detail-value", children: selectedTable.recordsCount.toLocaleString() })
          ] })
        ] }),
        selectedTable.description && /* @__PURE__ */ jsxs("div", { className: "detail-section", children: [
          /* @__PURE__ */ jsx("h4", { children: lang === "ru" ? "Описание:" : "Description:" }),
          /* @__PURE__ */ jsx("p", { children: selectedTable.description })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "modal-actions", children: /* @__PURE__ */ jsx(
          "a",
          {
            href: `https://supabase.com/dashboard/project/mcmzdscpuoxwneuzsanu/editor/${selectedTable.name}`,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "btn btn-primary",
            children: lang === "ru" ? "Открыть в Supabase →" : "Open in Supabase →"
          }
        ) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("style", { children: `
        .database-tables {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-header h1 {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #111827;
        }

        .subtitle {
          font-size: 14px;
          color: #6B7280;
        }

        /* Category Pills (Lumina Design) */
        .category-pills {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .category-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .category-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
        }

        .category-pill.active {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        .pill-icon {
          font-size: 18px;
        }

        .pill-label {
          font-weight: 500;
          color: #374151;
        }

        .pill-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          min-width: 24px;
          text-align: center;
        }

        /* Search Box */
        .search-box {
          margin-bottom: 32px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        /* Tables Grid (Bento Layout) */
        .tables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        /* Table Card (Claymorphism) */
        .table-card {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .table-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        }

        .table-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .table-name {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          font-family: 'JetBrains Mono', 'Source Code Pro', monospace;
        }

        .category-badge {
          padding: 4px 8px;
          border-radius: 8px;
          color: white;
          font-size: 14px;
        }

        .table-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #F9FAFB;
          border-radius: 8px;
          font-size: 13px;
        }

        .stat-icon {
          font-size: 16px;
        }

        .stat-value {
          font-weight: 500;
          color: #374151;
        }

        .table-description {
          font-size: 14px;
          color: #6B7280;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .table-card-footer {
          padding-top: 12px;
          border-top: 1px solid #E5E7EB;
        }

        .btn-ghost {
          background: none;
          border: none;
          color: #7C3AED;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
        }

        .btn-ghost:hover {
          transform: translateX(4px);
        }

        /* Modal (Glassmorphism) */
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

        .modal-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: scaleUp 0.3s ease;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #E5E7EB;
        }

        .modal-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        }

        .modal-close {
          background: #F3F4F6;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: #E5E7EB;
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 24px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-label {
          font-size: 12px;
          color: #6B7280;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 16px;
          color: #111827;
          font-weight: 500;
        }

        .detail-section {
          margin-bottom: 24px;
        }

        .detail-section h4 {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 8px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .detail-section p {
          font-size: 14px;
          color: #374151;
          line-height: 1.6;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #E5E7EB;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 500;
          text-decoration: none;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          font-size: 14px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          color: white;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-state p {
          color: #6B7280;
          font-size: 16px;
        }

        /* Loading */
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

        /* Animations */
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

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .tables-grid {
            grid-template-columns: 1fr;
          }

          .category-pills {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 8px;
          }

          .modal-content {
            width: 95%;
            max-height: 90vh;
          }
        }
      ` })
  ] });
}

const $$Astro = createAstro();
const $$Database = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Database;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Database Tables - Admin Panel" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminLayout", AdminLayout, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/AdminLayout", "client:component-export": "default" }, { "default": async ($$result3) => renderTemplate` ${renderComponent($$result3, "DatabaseTables", DatabaseTables, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/DatabaseTables", "client:component-export": "default" })} ` })} ` })}`;
}, "C:/Users/User/Desktop/sri/src/pages/admin/database.astro", void 0);

const $$file = "C:/Users/User/Desktop/sri/src/pages/admin/database.astro";
const $$url = "/admin/database";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Database,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
