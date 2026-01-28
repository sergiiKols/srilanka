import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as n}from"./index.JXKNaeUN.js";import{u as _}from"./LanguageSwitcher.DNO4dlch.js";import{c as z}from"./index.DR2MMlUt.js";const B="https://mcmzdscpuoxwneuzsanu.supabase.co",N="sb_publishable_oqeTkwpUNEhCWHIkCfhwpA_YmqUWWEx";function P(){const a=_(),[l,g]=n.useState([]),[u,b]=n.useState(!0),[c,y]=n.useState("all"),[p,j]=n.useState(""),[t,x]=n.useState(null);z(B,N);const h=[{name:"telegram_accounts",size:"80 kB",columns:14,description:"Telegram accounts for publishing",category:"telegram_listing"},{name:"telegram_groups",size:"112 kB",columns:17,description:"Telegram groups/channels",category:"telegram_listing"},{name:"property_listings",size:"152 kB",columns:42,description:"Property listings from clients",category:"telegram_listing"},{name:"listing_publications",size:"120 kB",columns:14,description:"Publications in Telegram groups",category:"telegram_listing"},{name:"landlord_responses",size:"128 kB",columns:30,description:"Landlord responses to listings",category:"telegram_listing"},{name:"temperature_change_log",size:"56 kB",columns:9,description:"Temperature change log",category:"telegram_listing"},{name:"users",size:"64 kB",columns:28,description:"Extended user profiles with preferences and OAuth data",category:"superbase_crm"},{name:"landlords",size:"56 kB",columns:30,description:"Property owners with verification and subscription info",category:"superbase_crm"},{name:"properties",size:"120 kB",columns:50,description:"Rental properties with location, pricing, and amenities",category:"superbase_crm"},{name:"rental_requests",size:"104 kB",columns:43,description:"Client rental requests/needs",category:"superbase_crm"},{name:"offers",size:"64 kB",columns:17,description:"Connections between properties and rental requests",category:"superbase_crm"},{name:"messages",size:"64 kB",columns:19,description:"Direct messages between users",category:"superbase_crm"},{name:"client_maps",size:"48 kB",columns:15,description:"Personal maps for clients to view offers",category:"superbase_crm"},{name:"map_markers",size:"48 kB",columns:13,description:"Property markers on client maps",category:"superbase_crm"},{name:"subscriptions",size:"40 kB",columns:17,description:"Landlord subscription plans",category:"superbase_crm"},{name:"payments",size:"56 kB",columns:16,description:"Payment transaction history",category:"superbase_crm"},{name:"notifications",size:"40 kB",columns:17,description:"User notifications",category:"superbase_crm"},{name:"analytics_events",size:"48 kB",columns:22,description:"Analytics and tracking events",category:"superbase_crm"},{name:"reviews",size:"64 kB",columns:20,description:"Property and landlord reviews",category:"superbase_crm"},{name:"saved_properties",size:"40 kB",columns:5,description:"User favorite properties",category:"superbase_crm"},{name:"poi_locations",size:"4752 kB",columns:20,description:"Points of Interest - Tourist locations",category:"poi",recordsCount:6176},{name:"system_config",size:"48 kB",columns:6,description:"System configuration (keep-alive)",category:"system"},{name:"schema_migrations",size:"32 kB",columns:3,description:"Database migration history",category:"system"},{name:"spatial_ref_sys",size:"7144 kB",columns:5,description:"PostGIS spatial reference systems",category:"system"}];n.useEffect(()=>{w()},[]);async function w(){b(!0);try{const r=await(await fetch("/api/admin/tables")).json();if(r.tables&&r.tables.length>0){const d=r.tables.map(o=>({name:o.name,size:o.size||"Unknown",columns:o.columns||0,description:o.description||null,category:o.category||v(o.name),recordsCount:o.recordsCount}));g(d)}else console.warn("API returned no tables, using fallback data"),g(h)}catch(s){console.error("Error loading tables from API:",s),g(h)}finally{b(!1)}}function v(s){return s.includes("telegram")||s.includes("listing")||s.includes("publication")||s.includes("landlord")||s.includes("temperature")?"telegram_listing":s==="poi_locations"?"poi":s==="system_config"||s==="schema_migrations"||s==="spatial_ref_sys"?"system":"superbase_crm"}const m=[{id:"all",label:a==="ru"?"Все таблицы":"All Tables",icon:"🗄️"},{id:"telegram_listing",label:"Telegram Listing",icon:"📱"},{id:"superbase_crm",label:"Superbase CRM",icon:"🏢"},{id:"poi",label:"POI Locations",icon:"📍"},{id:"system",label:"System Tables",icon:"⚙️"}],f=l.filter(s=>{const r=c==="all"||s.category===c,d=!p||s.name.toLowerCase().includes(p.toLowerCase())||s.description&&s.description.toLowerCase().includes(p.toLowerCase());return r&&d}),i=s=>{switch(s){case"telegram_listing":return"#7C3AED";case"superbase_crm":return"#10B981";case"poi":return"#F59E0B";case"system":return"#6B7280";default:return"#6B7280"}},k=(()=>{const s={};return m.forEach(r=>{r.id==="all"?s[r.id]=l.length:s[r.id]=l.filter(d=>d.category===r.id).length}),s})();return e.jsxs("div",{className:"database-tables",children:[e.jsx("div",{className:"page-header",children:e.jsxs("div",{children:[e.jsx("h1",{children:a==="ru"?"🗄️ База данных Supabase":"🗄️ Supabase Database"}),e.jsx("p",{className:"subtitle",children:a==="ru"?`Всего таблиц: ${l.length} | Проверено: 2026-01-28`:`Total tables: ${l.length} | Verified: 2026-01-28`})]})}),e.jsx("div",{className:"category-pills",children:m.map(s=>e.jsxs("button",{className:`category-pill ${c===s.id?"active":""}`,onClick:()=>y(s.id),style:{borderColor:c===s.id?i(s.id==="all"?"telegram_listing":s.id):"#E5E7EB",background:c===s.id?`linear-gradient(135deg, ${i(s.id==="all"?"telegram_listing":s.id)}10, ${i(s.id==="all"?"telegram_listing":s.id)}05)`:"white"},children:[e.jsx("span",{className:"pill-icon",children:s.icon}),e.jsx("span",{className:"pill-label",children:s.label}),e.jsx("span",{className:"pill-badge",style:{backgroundColor:i(s.id==="all"?"telegram_listing":s.id),color:"white"},children:k[s.id]})]},s.id))}),e.jsx("div",{className:"search-box",children:e.jsx("input",{type:"text",className:"search-input",placeholder:a==="ru"?"🔍 Поиск по названию или описанию...":"🔍 Search by name or description...",value:p,onChange:s=>j(s.target.value)})}),u?e.jsxs("div",{className:"loading-container",children:[e.jsx("div",{className:"spinner"}),e.jsx("p",{children:a==="ru"?"Загрузка таблиц...":"Loading tables..."})]}):e.jsx("div",{className:"tables-grid",children:f.map(s=>e.jsxs("div",{className:"table-card",onClick:()=>x(s),style:{borderTop:`3px solid ${i(s.category)}`},children:[e.jsxs("div",{className:"table-card-header",children:[e.jsx("h3",{className:"table-name",children:e.jsx("code",{children:s.name})}),e.jsx("span",{className:"category-badge",style:{backgroundColor:i(s.category)},children:m.find(r=>r.id===s.category)?.icon})]}),e.jsxs("div",{className:"table-stats",children:[e.jsxs("div",{className:"stat-item",children:[e.jsx("span",{className:"stat-icon",children:"💾"}),e.jsx("span",{className:"stat-value",children:s.size})]}),e.jsxs("div",{className:"stat-item",children:[e.jsx("span",{className:"stat-icon",children:"📊"}),e.jsxs("span",{className:"stat-value",children:[s.columns," ",a==="ru"?"колонок":"columns"]})]}),s.recordsCount&&e.jsxs("div",{className:"stat-item",children:[e.jsx("span",{className:"stat-icon",children:"📝"}),e.jsxs("span",{className:"stat-value",children:[s.recordsCount.toLocaleString()," ",a==="ru"?"записей":"records"]})]})]}),s.description&&e.jsx("p",{className:"table-description",children:s.description}),e.jsx("div",{className:"table-card-footer",children:e.jsx("button",{className:"btn-ghost",children:a==="ru"?"Подробнее →":"Details →"})})]},s.name))}),f.length===0&&!u&&e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"empty-icon",children:"🔍"}),e.jsx("p",{children:a==="ru"?"Таблицы не найдены":"No tables found"})]}),t&&e.jsx("div",{className:"modal-overlay",onClick:()=>x(null),children:e.jsxs("div",{className:"modal-content",onClick:s=>s.stopPropagation(),children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("h2",{children:e.jsx("code",{children:t.name})}),e.jsx("button",{className:"modal-close",onClick:()=>x(null),children:"✕"})]}),e.jsxs("div",{className:"modal-body",children:[e.jsxs("div",{className:"detail-grid",children:[e.jsxs("div",{className:"detail-item",children:[e.jsx("span",{className:"detail-label",children:a==="ru"?"Категория:":"Category:"}),e.jsx("span",{className:"detail-value category-badge",style:{backgroundColor:i(t.category)},children:m.find(s=>s.id===t.category)?.label})]}),e.jsxs("div",{className:"detail-item",children:[e.jsx("span",{className:"detail-label",children:a==="ru"?"Размер:":"Size:"}),e.jsx("span",{className:"detail-value",children:t.size})]}),e.jsxs("div",{className:"detail-item",children:[e.jsx("span",{className:"detail-label",children:a==="ru"?"Колонок:":"Columns:"}),e.jsx("span",{className:"detail-value",children:t.columns})]}),t.recordsCount&&e.jsxs("div",{className:"detail-item",children:[e.jsx("span",{className:"detail-label",children:a==="ru"?"Записей:":"Records:"}),e.jsx("span",{className:"detail-value",children:t.recordsCount.toLocaleString()})]})]}),t.description&&e.jsxs("div",{className:"detail-section",children:[e.jsx("h4",{children:a==="ru"?"Описание:":"Description:"}),e.jsx("p",{children:t.description})]}),e.jsx("div",{className:"modal-actions",children:e.jsx("a",{href:`https://supabase.com/dashboard/project/mcmzdscpuoxwneuzsanu/editor/${t.name}`,target:"_blank",rel:"noopener noreferrer",className:"btn btn-primary",children:a==="ru"?"Открыть в Supabase →":"Open in Supabase →"})})]})]})}),e.jsx("style",{children:`
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
      `})]})}export{P as default};
