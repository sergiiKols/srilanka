import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as n}from"./index.JXKNaeUN.js";import{u as Z}from"./LanguageSwitcher.DNO4dlch.js";import{c as q}from"./index.DR2MMlUt.js";const re="https://mcmzdscpuoxwneuzsanu.supabase.co",ie="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXpkc2NwdW94d25ldXpzYW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNDAxMjEsImV4cCI6MjA4NDkxNjEyMX0.FINUETJbgsos3tJdrJp_cyAPVOPxqpT_XjWIeFywPzw";function le({isOpen:s,onClose:i}){const l=Z(),[b,P]=n.useState([]),[F,f]=n.useState(!0),[x,w]=n.useState(!1),[h,T]=n.useState(null),[k,j]=n.useState([]),[A,S]=n.useState(!1),[y,z]=n.useState(null),E=q(re,ie);n.useEffect(()=>{s&&(_(),S(!1),j([]))},[s]);async function _(){f(!0);try{const{data:a}=await E.from("keep_alive_config").select("*").order("priority"),{data:c}=await fetch("/api/admin/tables").then(u=>u.json()),{data:p}=await E.from("keep_alive_logs").select("created_at").order("created_at",{ascending:!1}).limit(1).single();p&&z(p.created_at);const d=[];if(a&&a.forEach(u=>{d.push({table_name:u.table_name,is_enabled:u.is_enabled,last_success_at:u.last_success_at,last_error:u.last_error,in_config:!0})}),c?.tables){const u=a?.map(m=>m.table_name)||[];c.tables.forEach(m=>{u.includes(m.name)||d.push({table_name:m.name,is_enabled:!1,last_success_at:null,last_error:null,in_config:!1})})}P(d)}catch(a){console.error("Error loading data:",a)}finally{f(!1)}}async function g(a){console.log("[KeepAlive] Testing single table:",a),T(a),j([]),S(!0);try{const c=await fetch("/api/admin/keep-alive/test-table",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tableName:a})});console.log("[KeepAlive] Response status:",c.status);const p=await c.json();console.log("[KeepAlive] Result:",p),j([{table_name:a,status:p.success?"SUCCESS":"ERROR",executionTime:p.executionTime,error:p.error}]),await _()}catch(c){console.error("[KeepAlive] Error testing table:",c),j([{table_name:a,status:"ERROR",error:c instanceof Error?c.message:"Unknown error"}])}finally{T(null)}}async function R(){console.log("[KeepAlive] Testing all tables..."),w(!0),j([]),S(!0);try{const{data:a,error:c}=await E.rpc("keep_alive_test_records_v2");if(console.log("[KeepAlive] RPC result:",{data:a,error:c}),!c&&a){const p=a.filter(d=>d.table_name!=="SUMMARY").map(d=>({table_name:d.table_name,status:d.status,executionTime:d.execution_time_ms,error:d.error_message}));console.log("[KeepAlive] Processed results:",p),j(p),await _()}else console.error("[KeepAlive] RPC error:",c),alert(l==="ru"?"Ошибка: "+c?.message:"Error: "+c?.message)}catch(a){console.error("[KeepAlive] Error testing all tables:",a),alert(l==="ru"?"Ошибка выполнения: "+(a instanceof Error?a.message:"Unknown"):"Execution error")}finally{w(!1)}}if(!s)return null;const v=b.filter(a=>a.is_enabled&&a.in_config).length,B=b.filter(a=>!a.in_config).length;return e.jsx("div",{className:"modal-overlay",onClick:i,children:e.jsxs("div",{className:"modal-container",onClick:a=>a.stopPropagation(),children:[e.jsxs("div",{className:"modal-header",children:[e.jsxs("div",{children:[e.jsx("h2",{children:"🔄 Keep-Alive System"}),e.jsx("p",{className:"modal-subtitle",children:l==="ru"?"Управление тестовыми записями":"Test records management"})]}),e.jsx("button",{className:"close-btn",onClick:i,children:"✕"})]}),e.jsxs("div",{className:"stats-bar",children:[e.jsxs("div",{className:"stat-item",children:[e.jsx("span",{className:"stat-label",children:l==="ru"?"Всего таблиц:":"Total tables:"}),e.jsx("span",{className:"stat-value",children:b.length})]}),e.jsxs("div",{className:"stat-item",children:[e.jsx("span",{className:"stat-label",children:l==="ru"?"В автоматике:":"In auto:"}),e.jsx("span",{className:"stat-value",style:{color:"#10B981"},children:v})]}),B>0&&e.jsxs("div",{className:"stat-item",children:[e.jsx("span",{className:"stat-label",children:l==="ru"?"Новые:":"New:"}),e.jsx("span",{className:"stat-value",style:{color:"#F59E0B"},children:B})]}),y&&e.jsxs("div",{className:"stat-item",children:[e.jsx("span",{className:"stat-label",children:l==="ru"?"Последний запуск:":"Last run:"}),e.jsx("span",{className:"stat-value",style:{fontSize:"13px"},children:new Date(y).toLocaleString(l==="ru"?"ru-RU":"en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})})]})]}),e.jsx("div",{className:"action-section",children:e.jsxs("button",{className:"test-all-btn",onClick:R,disabled:x||h!==null,children:[e.jsx("span",{className:"btn-icon",style:{animation:x?"spin 1s linear infinite":"none"},children:"🧪"}),e.jsx("span",{children:x?l==="ru"?"Тестирование...":"Testing...":l==="ru"?"Тест всех таблиц":"Test All Tables"})]})}),A&&k.length>0&&e.jsxs("div",{className:"results-panel",children:[e.jsxs("div",{className:"results-header",children:[e.jsx("span",{children:l==="ru"?"📊 Результаты тестирования":"📊 Test Results"}),e.jsx("button",{onClick:()=>S(!1),children:"✕"})]}),e.jsx("div",{className:"results-list",children:k.map(a=>e.jsxs("div",{className:`result-item ${a.status.toLowerCase()}`,children:[e.jsxs("div",{className:"result-name",children:[e.jsx("span",{className:"result-icon",children:a.status==="SUCCESS"?"✅":a.status==="ERROR"?"❌":"⏭️"}),e.jsx("code",{children:a.table_name})]}),e.jsx("div",{className:"result-details",children:a.status==="SUCCESS"?e.jsxs("span",{className:"success-text",children:[l==="ru"?"Успешно":"Success",a.executionTime&&` (${a.executionTime}ms)`]}):e.jsxs("span",{className:"error-text",title:a.error,children:[a.error?.substring(0,60)||"Error","..."]})})]},a.table_name))})]}),e.jsx("div",{className:"modal-body",children:F?e.jsxs("div",{className:"loading-state",children:[e.jsx("div",{className:"spinner"}),e.jsx("p",{children:l==="ru"?"Загрузка...":"Loading..."})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"tables-section",children:[e.jsxs("h3",{className:"section-title",children:["✅ ",l==="ru"?"Автоматические таблицы":"Automatic Tables"," (",v,")"]}),e.jsx("div",{className:"tables-list",children:b.filter(a=>a.in_config&&a.is_enabled).map(a=>e.jsxs("div",{className:"table-row",children:[e.jsxs("div",{className:"table-info",children:[e.jsx("code",{className:"table-name",children:a.table_name}),a.last_success_at&&e.jsxs("span",{className:"table-time",children:["🕒 ",new Date(a.last_success_at).toLocaleString(l==="ru"?"ru-RU":"en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})]})]}),e.jsx("button",{className:"test-btn",onClick:()=>g(a.table_name),disabled:h===a.table_name||x,children:h===a.table_name?"⏳":"▶️"})]},a.table_name))})]}),b.filter(a=>a.in_config&&!a.is_enabled).length>0&&e.jsxs("div",{className:"tables-section",children:[e.jsxs("h3",{className:"section-title",children:["⏸️ ",l==="ru"?"Отключённые таблицы":"Disabled Tables"]}),e.jsx("div",{className:"tables-list",children:b.filter(a=>a.in_config&&!a.is_enabled).map(a=>e.jsxs("div",{className:"table-row disabled",children:[e.jsxs("div",{className:"table-info",children:[e.jsx("code",{className:"table-name",children:a.table_name}),a.last_error&&e.jsxs("span",{className:"table-error",title:a.last_error,children:["⚠️ ",a.last_error.substring(0,40),"..."]})]}),e.jsx("button",{className:"test-btn",onClick:()=>g(a.table_name),disabled:h===a.table_name||x,children:h===a.table_name?"⏳":"▶️"})]},a.table_name))})]}),B>0&&e.jsxs("div",{className:"tables-section highlight",children:[e.jsxs("h3",{className:"section-title",children:["🆕 ",l==="ru"?"Новые таблицы (не в автоматике)":"New Tables (not automated)"]}),e.jsx("div",{className:"tables-list",children:b.filter(a=>!a.in_config).map(a=>e.jsxs("div",{className:"table-row new",children:[e.jsxs("div",{className:"table-info",children:[e.jsx("code",{className:"table-name",children:a.table_name}),e.jsx("span",{className:"new-badge",children:"NEW"})]}),e.jsx("button",{className:"test-btn",onClick:()=>g(a.table_name),disabled:h===a.table_name||x,children:h===a.table_name?"⏳":"▶️"})]},a.table_name))})]})]})}),e.jsx("div",{className:"modal-footer",children:e.jsx("a",{href:"/admin/keep-alive",className:"link-btn",children:l==="ru"?"Полная панель управления →":"Full dashboard →"})}),e.jsx("style",{children:`
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
        `})]})})}const O="https://mcmzdscpuoxwneuzsanu.supabase.co",U="sb_publishable_oqeTkwpUNEhCWHIkCfhwpA_YmqUWWEx",oe="sb_secret_3M8nfMu6ZdYVvg_8Jh0JGw_ONxcbcc9";function he(){const s=Z(),[i,l]=n.useState(null),[b,P]=n.useState([]),[F,f]=n.useState(!0),[x,w]=n.useState("connection"),[h,T]=n.useState(""),[k,j]=n.useState(""),[A,S]=n.useState(""),[y,z]=n.useState(1),[E,_]=n.useState("checking"),[g,R]=n.useState(!1),[v,B]=n.useState(!1),a=20,[c,p]=n.useState([]),[d,u]=n.useState("poi_locations"),[m,Q]=n.useState({columns:[],recordsCount:0,tableSize:"Unknown",sampleData:[],statistics:null}),[K,M]=n.useState(!1),[ee,W]=n.useState(!1),Y=q(O,U);n.useEffect(()=>{J(),ae(),te()},[]),n.useEffect(()=>{d&&$(d)},[d]);async function J(){try{const r=await(await fetch("/api/admin/tables")).json();r.tables&&p(r.tables)}catch(t){console.error("Error loading tables:",t)}}async function $(t){f(!0);try{const o=await(await fetch(`/api/admin/tables/${t}`)).json();o.tableName&&(Q({columns:o.columns||[],recordsCount:o.recordsCount||0,tableSize:o.tableSize||"Unknown",sampleData:o.sampleData||[],statistics:o.statistics||null}),t==="poi_locations"&&o.sampleData&&(setPoiData(o.sampleData),setFilteredData(o.sampleData),o.statistics&&l({total:o.recordsCount,withPhotos:o.sampleData.filter(N=>N.main_photo).length,withRating:o.sampleData.filter(N=>N.rating&&N.rating>0).length,categories:o.statistics.byCategory?.length||0,byCategory:o.statistics.byCategory||[],byLocation:o.statistics.byLocation||[]})))}catch(r){console.error(`Error loading table ${t}:`,r)}finally{f(!1)}}async function se(){M(!0),await J(),await $(d),M(!1)}async function ae(){try{const{error:t}=await Y.from("poi_locations").select("id").limit(1);if(t)throw t;_("connected")}catch(t){console.error("Connection error:",t),_("error")}}async function te(){try{f(!0);const{data:t,error:r}=await Y.from("poi_locations").select("*").order("rating",{ascending:!1,nullsLast:!0});if(r)throw r;const o=t.length,N=t.filter(C=>C.main_photo).length,ne=t.filter(C=>C.rating).length,L={},I={};t.forEach(C=>{const H=C.category||"Unknown",V=C.location||"Unknown";L[H]=(L[H]||0)+1,I[V]=(I[V]||0)+1}),l({total:o,withPhotos:N,withRating:ne,categories:L,locations:I}),P(t),f(!1)}catch(t){console.error("Error loading data:",t),f(!1)}}const X=b.filter(t=>{const r=!h||t.name.toLowerCase().includes(h.toLowerCase()),o=!k||t.category===k,N=!A||t.location===A;return r&&o&&N}),D=Math.ceil(X.length/a),G=X.slice((y-1)*a,y*a);return e.jsxs("div",{className:"dashboard supabase-admin-lumina",children:[e.jsxs("div",{className:"page-header-lumina",children:[e.jsxs("div",{className:"header-content",children:[e.jsxs("h1",{className:"header-title",children:["🗄️ ",s==="ru"?"База данных Supabase":"Supabase Database"]}),e.jsx("p",{className:"header-subtitle",children:s==="ru"?"Управление данными проекта Шри-Ланка":"Manage Sri Lanka Project Data"})]}),e.jsxs("div",{className:"header-actions",children:[e.jsxs("button",{onClick:()=>W(!0),className:"btn-keep-alive",children:[e.jsx("span",{className:"btn-icon",children:"🔄"}),e.jsx("span",{className:"btn-text",children:"Keep-Alive"})]}),e.jsxs("a",{href:"/admin/database",className:"btn-all-databases",children:[e.jsx("span",{className:"btn-icon",children:"🗄️"}),e.jsx("span",{className:"btn-text",children:s==="ru"?"Все базы":"All Databases"}),e.jsx("span",{className:"btn-badge",children:c.length||24})]})]})]}),e.jsxs("div",{className:"tabs",children:[e.jsxs("button",{className:`tab ${x==="connection"?"active":""}`,onClick:()=>w("connection"),children:["🔌 ",s==="ru"?"Подключение":"Connection"]}),e.jsxs("button",{className:`tab ${x==="stats"?"active":""}`,onClick:()=>w("stats"),children:["📊 ",s==="ru"?"Статистика":"Statistics"]}),e.jsxs("button",{className:`tab ${x==="data"?"active":""}`,onClick:()=>w("data"),children:["📋 ",s==="ru"?"Данные":"Data"]}),e.jsxs("button",{className:`tab ${x==="map"?"active":""}`,onClick:()=>w("map"),children:["🗺️ ",s==="ru"?"Карта":"Map"]})]}),x==="connection"&&e.jsxs("div",{className:"tab-content",children:[e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"},children:[e.jsxs("div",{className:"card",children:[e.jsxs("h3",{children:["📍 ",s==="ru"?"Туристические объекты (POI)":"Tourist POI Objects"]}),e.jsx("p",{style:{color:"#666",fontSize:"14px",marginBottom:"20px"},children:s==="ru"?"Таблица: poi_locations":"Table: poi_locations"}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:e.jsx("strong",{children:s==="ru"?"URL проекта:":"Project URL:"})}),e.jsx("input",{type:"text",className:"input",value:O,readOnly:!0,style:{background:"#f5f5f5"}})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:e.jsx("strong",{children:s==="ru"?"Название таблицы:":"Table Name:"})}),e.jsx("input",{type:"text",className:"input",value:"poi_locations",readOnly:!0,style:{background:"#f5f5f5"}})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:e.jsx("strong",{children:s==="ru"?"Публичный ключ API:":"Public API Key:"})}),e.jsxs("div",{style:{display:"flex",gap:"10px"},children:[e.jsx("input",{type:g?"text":"password",className:"input",value:U,readOnly:!0,style:{background:"#f5f5f5",flex:1}}),e.jsxs("button",{className:"btn btn-secondary",onClick:()=>R(!g),style:{minWidth:"100px"},children:[g?"🙈 ":"👁️ ",s==="ru"?g?"Скрыть":"Показать":g?"Hide":"Show"]})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:e.jsx("strong",{children:s==="ru"?"Сервисный ключ:":"Service Role Key:"})}),e.jsxs("div",{style:{display:"flex",gap:"10px"},children:[e.jsx("input",{type:v?"text":"password",className:"input",value:oe,readOnly:!0,style:{background:"#f5f5f5",flex:1}}),e.jsxs("button",{className:"btn btn-secondary",onClick:()=>B(!v),style:{minWidth:"100px"},children:[v?"🙈 ":"👁️ ",s==="ru"?v?"Скрыть":"Показать":v?"Hide":"Show"]})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:e.jsx("strong",{children:s==="ru"?"Статус подключения:":"Connection Status:"})}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",marginTop:"10px"},children:[E==="checking"&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"spinner",style:{width:"20px",height:"20px",borderWidth:"2px"}}),e.jsx("span",{children:s==="ru"?"Проверка...":"Checking..."})]}),E==="connected"&&e.jsxs(e.Fragment,{children:[e.jsx("span",{style:{fontSize:"24px"},children:"✅"}),e.jsx("span",{style:{color:"#28a745",fontWeight:"bold"},children:s==="ru"?"Подключено успешно":"Connected Successfully"})]}),E==="error"&&e.jsxs(e.Fragment,{children:[e.jsx("span",{style:{fontSize:"24px"},children:"❌"}),e.jsx("span",{style:{color:"#dc3545",fontWeight:"bold"},children:s==="ru"?"Ошибка подключения":"Connection Error"})]})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:e.jsx("strong",{children:s==="ru"?"Всего записей:":"Total Records:"})}),e.jsx("input",{type:"text",className:"input",value:i?.total.toLocaleString()||"...",readOnly:!0,style:{background:"#e8f5e9",fontWeight:"bold",fontSize:"18px"}})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:e.jsx("strong",{children:s==="ru"?"Регион:":"Region:"})}),e.jsx("input",{type:"text",className:"input",value:"Southwest Coast (Negombo → Tangalle)",readOnly:!0,style:{background:"#f5f5f5"}})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:e.jsx("strong",{children:s==="ru"?"Источник данных:":"Data Source:"})}),e.jsx("input",{type:"text",className:"input",value:"Google Places API",readOnly:!0,style:{background:"#f5f5f5"}})]})]}),e.jsxs("div",{className:"card",children:[e.jsxs("h3",{children:["👥 ",s==="ru"?"Объекты пользователей":"User Objects"]}),e.jsx("p",{style:{color:"#666",fontSize:"14px",marginBottom:"20px"},children:s==="ru"?"Таблица: user_objects (не создана)":"Table: user_objects (not created)"}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:e.jsx("strong",{children:s==="ru"?"URL проекта:":"Project URL:"})}),e.jsx("input",{type:"text",className:"input",value:O,readOnly:!0,style:{background:"#f5f5f5"}})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:e.jsx("strong",{children:s==="ru"?"Название таблицы:":"Table Name:"})}),e.jsx("input",{type:"text",className:"input",value:"user_objects",readOnly:!0,style:{background:"#fff3cd",border:"1px solid #ffc107"}}),e.jsxs("small",{style:{color:"#856404",display:"block",marginTop:"5px"},children:["⚠️ ",s==="ru"?"Таблица еще не создана":"Table not created yet"]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:e.jsx("strong",{children:s==="ru"?"Публичный ключ API:":"Public API Key:"})}),e.jsx("input",{type:"password",className:"input",value:U,readOnly:!0,style:{background:"#f5f5f5"}}),e.jsx("small",{style:{color:"#666",display:"block",marginTop:"5px"},children:s==="ru"?"Используется тот же ключ":"Same key as POI table"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:e.jsx("strong",{children:s==="ru"?"Статус подключения:":"Connection Status:"})}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",marginTop:"10px"},children:[e.jsx("span",{style:{fontSize:"24px"},children:"⚪"}),e.jsx("span",{style:{color:"#6c757d",fontWeight:"bold"},children:s==="ru"?"Не настроено":"Not Configured"})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:e.jsx("strong",{children:s==="ru"?"Всего записей:":"Total Records:"})}),e.jsx("input",{type:"text",className:"input",value:"0",readOnly:!0,style:{background:"#f8d7da",color:"#721c24",fontWeight:"bold",fontSize:"18px"}})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:e.jsx("strong",{children:s==="ru"?"Назначение:":"Purpose:"})}),e.jsx("input",{type:"text",className:"input",value:s==="ru"?"Пользовательские объекты":"User-generated objects",readOnly:!0,style:{background:"#f5f5f5"}})]}),e.jsx("div",{style:{marginTop:"30px",textAlign:"center"},children:e.jsxs("button",{className:"btn btn-primary",style:{width:"100%",padding:"12px"},onClick:()=>alert(s==="ru"?"Функция создания таблицы в разработке":"Table creation feature in development"),children:["+ ",s==="ru"?"Создать таблицу":"Create Table"]})})]})]}),e.jsxs("div",{className:"card",style:{marginTop:"20px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"16px",flex:1},children:[e.jsx("h3",{style:{margin:0},children:s==="ru"?"Структура таблицы:":"Table Structure:"}),e.jsx("select",{className:"table-selector-dropdown",style:{maxWidth:"400px"},value:d,onChange:t=>u(t.target.value),children:c.length>0?c.map(t=>e.jsx("option",{value:t.name,children:t.name},t.name)):e.jsx("option",{value:"poi_locations",children:"poi_locations"})})]}),e.jsx("button",{className:"btn-refresh",onClick:se,disabled:K,style:{padding:"8px 16px",fontSize:"14px"},children:e.jsx("span",{className:"refresh-icon",style:{display:"inline-block",animation:K?"spin 1s linear infinite":"none",fontSize:"16px"},children:"🔄"})})]}),e.jsx("div",{style:{marginBottom:"16px",padding:"12px",background:"#F9FAFB",borderRadius:"8px"},children:e.jsxs("div",{style:{display:"flex",gap:"24px",flexWrap:"wrap"},children:[e.jsxs("div",{children:[e.jsx("strong",{children:s==="ru"?"Колонок:":"Columns:"})," ",m.columns.length||0]}),e.jsxs("div",{children:[e.jsx("strong",{children:s==="ru"?"Записей:":"Records:"})," ",m.recordsCount?.toLocaleString()||0]}),e.jsxs("div",{children:[e.jsx("strong",{children:s==="ru"?"Размер:":"Size:"})," ",m.tableSize||"Unknown"]})]})}),e.jsx("div",{className:"table-container",children:F?e.jsxs("div",{className:"loading-container",children:[e.jsx("div",{className:"spinner",style:{width:"30px",height:"30px",borderWidth:"3px"}}),e.jsx("p",{children:s==="ru"?"Загрузка структуры...":"Loading structure..."})]}):m.columns.length>0?e.jsxs("table",{className:"data-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:s==="ru"?"Поле":"Field"}),e.jsx("th",{children:s==="ru"?"Тип":"Type"}),e.jsx("th",{children:"Nullable"}),e.jsx("th",{children:s==="ru"?"По умолчанию":"Default"})]})}),e.jsx("tbody",{children:m.columns.map((t,r)=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:t.column_name})}),e.jsx("td",{children:e.jsx("span",{className:"badge",children:t.data_type})}),e.jsx("td",{children:t.is_nullable==="YES"?"✅":"❌"}),e.jsx("td",{children:e.jsx("small",{children:t.column_default||"-"})})]},r))})]}):e.jsx("div",{style:{textAlign:"center",padding:"40px",color:"#6B7280"},children:s==="ru"?"Нет данных о структуре таблицы":"No table structure data available"})})]})]}),x==="stats"&&e.jsx("div",{className:"tab-content",children:F?e.jsxs("div",{className:"loading-container",children:[e.jsx("div",{className:"spinner"}),e.jsx("p",{children:s==="ru"?"Загрузка статистики...":"Loading statistics..."})]}):i&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"stats-grid",children:[e.jsxs("div",{className:"stat-card",children:[e.jsx("div",{className:"stat-icon",children:"📍"}),e.jsxs("div",{className:"stat-content",children:[e.jsx("div",{className:"stat-value",children:i.total.toLocaleString()}),e.jsx("div",{className:"stat-label",children:s==="ru"?"Всего объектов":"Total Objects"})]})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("div",{className:"stat-icon",children:"📸"}),e.jsxs("div",{className:"stat-content",children:[e.jsx("div",{className:"stat-value",children:i.withPhotos.toLocaleString()}),e.jsx("div",{className:"stat-label",children:s==="ru"?"С фотографиями":"With Photos"}),e.jsxs("div",{className:"stat-change",children:[(i.withPhotos/i.total*100).toFixed(1),"%"]})]})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("div",{className:"stat-icon",children:"⭐"}),e.jsxs("div",{className:"stat-content",children:[e.jsx("div",{className:"stat-value",children:i.withRating.toLocaleString()}),e.jsx("div",{className:"stat-label",children:s==="ru"?"С рейтингом":"With Rating"}),e.jsxs("div",{className:"stat-change",children:[(i.withRating/i.total*100).toFixed(1),"%"]})]})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("div",{className:"stat-icon",children:"🏷️"}),e.jsxs("div",{className:"stat-content",children:[e.jsx("div",{className:"stat-value",children:Object.keys(i.categories).length}),e.jsx("div",{className:"stat-label",children:s==="ru"?"Категорий":"Categories"})]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:s==="ru"?"По категориям":"By Categories"}),e.jsx("div",{className:"table-container",children:e.jsxs("table",{className:"data-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:s==="ru"?"Категория":"Category"}),e.jsx("th",{children:s==="ru"?"Количество":"Count"}),e.jsx("th",{children:s==="ru"?"Процент":"Percent"})]})}),e.jsx("tbody",{children:Object.entries(i.categories).sort((t,r)=>r[1]-t[1]).slice(0,10).map(([t,r])=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("span",{className:"badge",children:t})}),e.jsx("td",{children:e.jsx("strong",{children:r})}),e.jsxs("td",{children:[(r/i.total*100).toFixed(1),"%"]})]},t))})]})})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:s==="ru"?"По локациям":"By Locations"}),e.jsx("div",{className:"table-container",children:e.jsxs("table",{className:"data-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:s==="ru"?"Локация":"Location"}),e.jsx("th",{children:s==="ru"?"Количество":"Count"}),e.jsx("th",{children:s==="ru"?"Процент":"Percent"})]})}),e.jsx("tbody",{children:Object.entries(i.locations).sort((t,r)=>r[1]-t[1]).slice(0,10).map(([t,r])=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("strong",{children:t})}),e.jsx("td",{children:e.jsx("strong",{children:r})}),e.jsxs("td",{children:[(r/i.total*100).toFixed(1),"%"]})]},t))})]})})]})]})}),x==="data"&&e.jsx("div",{className:"tab-content",children:F&&b.length===0?e.jsxs("div",{className:"loading-container",children:[e.jsx("div",{className:"spinner"}),e.jsx("p",{children:s==="ru"?"Загрузка данных...":"Loading data..."})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"filters",children:[e.jsx("input",{type:"text",className:"input",placeholder:s==="ru"?"Поиск по названию...":"Search by name...",value:h,onChange:t=>T(t.target.value)}),e.jsxs("select",{className:"select",value:k,onChange:t=>j(t.target.value),children:[e.jsx("option",{value:"",children:s==="ru"?"Все категории":"All categories"}),i&&Object.keys(i.categories).sort().map(t=>e.jsx("option",{value:t,children:t},t))]}),e.jsxs("select",{className:"select",value:A,onChange:t=>S(t.target.value),children:[e.jsx("option",{value:"",children:s==="ru"?"Все локации":"All locations"}),i&&Object.keys(i.locations).sort().map(t=>e.jsx("option",{value:t,children:t},t))]})]}),e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"table-container",children:e.jsxs("table",{className:"data-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:s==="ru"?"Название":"Name"}),e.jsx("th",{children:s==="ru"?"Категория":"Category"}),e.jsx("th",{children:s==="ru"?"Локация":"Location"}),e.jsx("th",{children:s==="ru"?"Рейтинг":"Rating"}),e.jsx("th",{children:s==="ru"?"Отзывы":"Reviews"})]})}),e.jsx("tbody",{children:G.length>0?G.map(t=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("strong",{children:t.name})}),e.jsx("td",{children:e.jsx("span",{className:"badge",children:t.category||"-"})}),e.jsx("td",{children:t.location||"-"}),e.jsx("td",{children:t.rating?`${t.rating} ⭐`:"-"}),e.jsx("td",{children:t.total_reviews||0})]},t.id)):e.jsx("tr",{children:e.jsx("td",{colSpan:5,style:{textAlign:"center",padding:"40px"},children:s==="ru"?"Нет данных":"No data"})})})]})}),e.jsxs("div",{className:"pagination",children:[e.jsx("button",{className:"btn btn-secondary",onClick:()=>z(t=>Math.max(1,t-1)),disabled:y===1,children:"←"}),e.jsxs("span",{className:"pagination-info",children:[s==="ru"?"Страница":"Page"," ",y," ",s==="ru"?"из":"of"," ",D||1]}),e.jsx("button",{className:"btn btn-secondary",onClick:()=>z(t=>Math.min(D,t+1)),disabled:y===D,children:"→"})]})]})]})}),x==="map"&&e.jsx("div",{className:"tab-content",children:e.jsx("div",{className:"card",style:{padding:0,overflow:"hidden"},children:e.jsx("iframe",{src:"/map",style:{width:"100%",height:"700px",border:"none"},title:"POI Map"})})}),e.jsx(le,{isOpen:ee,onClose:()=>W(!1)}),e.jsx("style",{children:`
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
      `})]})}export{he as default};
