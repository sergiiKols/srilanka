import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as d}from"./index.JXKNaeUN.js";import{u as F}from"./LanguageSwitcher.DNO4dlch.js";import{c as B}from"./index.DR2MMlUt.js";const A="https://mcmzdscpuoxwneuzsanu.supabase.co",z="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXpkc2NwdW94d25ldXpzYW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNDAxMjEsImV4cCI6MjA4NDkxNjEyMX0.FINUETJbgsos3tJdrJp_cyAPVOPxqpT_XjWIeFywPzw";function K(){const t=F(),[i,h]=d.useState([]),[g,E]=d.useState([]),[w,m]=d.useState(!0),[b,f]=d.useState(!1),[n,j]=d.useState(!0),[u,v]=d.useState("tables"),l=B(A,z);d.useEffect(()=>{p()},[]);async function p(){m(!0);try{const{data:s,error:a}=await l.from("keep_alive_stats").select("*").order("priority",{ascending:!0});!a&&s?h(s):a&&(console.warn("keep_alive_stats view not found, using fallback:",a),h([]));const{data:o,error:r}=await l.from("keep_alive_logs").select("*").order("created_at",{ascending:!1}).limit(50);!r&&o&&E(o);const{data:c}=await l.from("system_config").select("config_value").eq("config_key","keep_alive_enabled").single();c&&j(c.config_value)}catch(s){console.error("Error loading keep-alive data:",s)}finally{m(!1)}}async function _(){if(console.log("[KeepAlive] Toggling ALL tables from",n,"to",!n),!confirm(n?t==="ru"?`Вы уверены что хотите ВЫКЛЮЧИТЬ все таблицы?

Это отключит автоматическое создание тестовых записей для всех 24 таблиц.`:`Are you sure you want to DISABLE all tables?

This will stop automatic test records creation for all 24 tables.`:t==="ru"?`Вы уверены что хотите ВКЛЮЧИТЬ все таблицы?

Это включит автоматическое создание тестовых записей для всех enabled таблиц.`:`Are you sure you want to ENABLE all tables?

This will start automatic test records creation for all enabled tables.`)){console.log("[KeepAlive] User cancelled system toggle");return}try{const a=!n,{data:o,error:r}=await l.from("system_config").update({config_value:a,updated_at:new Date().toISOString()}).eq("config_key","keep_alive_enabled").select();if(console.log("[KeepAlive] System config update:",{configData:o,configError:r}),r){console.error("[KeepAlive] System toggle error:",r),alert(`Error: ${r.message}

Note: You may need SERVICE_ROLE_KEY permissions to modify system_config`);return}const{data:c,error:x}=await l.from("keep_alive_config").update({is_enabled:a,updated_at:new Date().toISOString()}).neq("table_name","spatial_ref_sys").select();console.log("[KeepAlive] All tables toggle result:",{count:c?.length,error:x}),x?(console.error("[KeepAlive] Tables toggle error:",x),alert(`Error toggling tables: ${x.message}`)):(console.log("[KeepAlive] Successfully toggled all tables"),j(a),await p(),alert(t==="ru"?`✅ Успешно! ${a?"Включено":"Выключено"} ${c?.length||0} таблиц.`:`✅ Success! ${a?"Enabled":"Disabled"} ${c?.length||0} tables.`))}catch(a){console.error("[KeepAlive] Exception toggling system:",a),alert("Error toggling system: "+(a instanceof Error?a.message:"Unknown"))}}async function y(s,a){console.log("[KeepAlive] Toggling table:",s,"from",a,"to",!a);try{const{data:o,error:r}=await l.from("keep_alive_config").update({is_enabled:!a,updated_at:new Date().toISOString()}).eq("table_name",s).select();console.log("[KeepAlive] Toggle result:",{data:o,error:r}),r?(console.error("[KeepAlive] Toggle error:",r),alert(`Error: ${r.message}

Note: You may need SERVICE_ROLE_KEY permissions to modify keep_alive_config`)):(console.log("[KeepAlive] Successfully toggled, reloading data..."),await p())}catch(o){console.error("[KeepAlive] Exception toggling table:",o),alert("Error toggling table: "+(o instanceof Error?o.message:"Unknown"))}}async function N(){f(!0);try{const{data:s,error:a}=await l.rpc("keep_alive_test_records_v2");a?alert("Error: "+a.message):(alert(t==="ru"?`Готово! Обработано ${s?.length||0} таблиц`:`Done! Processed ${s?.length||0} tables`),await p())}catch(s){console.error("Error running keep-alive:",s),alert("Execution error")}finally{f(!1)}}const k=i.filter(s=>s.is_enabled).length,S=i.length>0?Math.round(i.filter(s=>s.success_count>0).length/i.length*100):0;return e.jsxs("div",{className:"keep-alive-dynamic",children:[e.jsxs("div",{className:"header",children:[e.jsxs("div",{children:[e.jsx("h1",{children:"🔄 Keep-Alive System v2.0"}),e.jsx("p",{className:"subtitle",children:"Dynamic keep-alive for all Supabase tables"})]}),e.jsxs("div",{className:"header-actions",children:[e.jsxs("button",{className:`toggle-btn ${n?"active":""}`,onClick:_,children:[e.jsx("span",{className:"toggle-icon",children:n?"✅":"⏸️"}),e.jsx("span",{children:n?t==="ru"?"Включено":"Enabled":t==="ru"?"Выключено":"Disabled"})]}),e.jsxs("button",{className:"run-btn",onClick:N,disabled:b||!n,children:[e.jsx("span",{className:"run-icon",style:{animation:b?"spin 1s linear infinite":"none"},children:"▶️"}),e.jsx("span",{children:b?t==="ru"?"Запуск...":"Running...":t==="ru"?"Запустить сейчас":"Run Now"})]})]})]}),e.jsxs("div",{className:"stats-grid",children:[e.jsxs("div",{className:"stat-card",children:[e.jsx("div",{className:"stat-value",children:i.length}),e.jsx("div",{className:"stat-label",children:"Total Tables"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("div",{className:"stat-value",style:{color:"#10B981"},children:k}),e.jsx("div",{className:"stat-label",children:"Enabled"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsxs("div",{className:"stat-value",style:{color:"#7C3AED"},children:[S,"%"]}),e.jsx("div",{className:"stat-label",children:"Success Rate"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("div",{className:"stat-value",style:{color:"#F59E0B"},children:g.filter(s=>s.created_at>new Date(Date.now()-10080*60*1e3).toISOString()).length}),e.jsx("div",{className:"stat-label",children:"Logs (7 days)"})]})]}),e.jsxs("div",{className:"tabs",children:[e.jsxs("button",{className:`tab ${u==="tables"?"active":""}`,onClick:()=>v("tables"),children:["📊 Tables (",i.length,")"]}),e.jsxs("button",{className:`tab ${u==="logs"?"active":""}`,onClick:()=>v("logs"),children:["📋 Logs (",g.length,")"]})]}),w?e.jsxs("div",{className:"loading",children:[e.jsx("div",{className:"spinner"}),e.jsx("p",{children:"Loading..."})]}):i.length===0?e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"empty-icon",children:"⚠️"}),e.jsx("h3",{children:"Keep-Alive system not installed"}),e.jsx("p",{className:"empty-description",children:t==="ru"?"Необходимо выполнить SQL скрипт установки в Supabase":"You need to execute the installation SQL script in Supabase"}),e.jsxs("div",{className:"install-steps",children:[e.jsx("h4",{children:t==="ru"?"📋 Инструкция по установке:":"📋 Installation steps:"}),e.jsxs("ol",{children:[e.jsx("li",{children:t==="ru"?"Откройте Supabase Dashboard → SQL Editor":"Open Supabase Dashboard → SQL Editor"}),e.jsxs("li",{children:[t==="ru"?"Скопируйте содержимое файла":"Copy contents of file"," ",e.jsx("code",{children:"supabase_keep_alive_DYNAMIC.sql"})]}),e.jsx("li",{children:t==="ru"?"Выполните скрипт (Execute/Run)":"Execute the script (Execute/Run)"}),e.jsx("li",{children:t==="ru"?"Обновите эту страницу":"Refresh this page"})]})]}),e.jsxs("div",{className:"install-info",children:[e.jsx("p",{children:e.jsx("strong",{children:t==="ru"?"Что создаётся:":"What will be created:"})}),e.jsxs("ul",{children:[e.jsxs("li",{children:["📊 Таблица ",e.jsx("code",{children:"keep_alive_config"})," (22 записи)"]}),e.jsxs("li",{children:["📋 Таблица ",e.jsx("code",{children:"keep_alive_logs"})]}),e.jsxs("li",{children:["⚙️ Функция ",e.jsx("code",{children:"keep_alive_test_records_v2()"})]}),e.jsxs("li",{children:["🔧 Функция ",e.jsx("code",{children:"replace_placeholders()"})]}),e.jsxs("li",{children:["➕ Функция ",e.jsx("code",{children:"add_table_to_keepalive()"})]}),e.jsxs("li",{children:["🗑️ Функция ",e.jsx("code",{children:"cleanup_keepalive_records_v2()"})]}),e.jsxs("li",{children:["📈 View ",e.jsx("code",{children:"keep_alive_stats"})]})]})]}),e.jsx("a",{href:"https://supabase.com/dashboard/project/mcmzdscpuoxwneuzsanu/sql/new",target:"_blank",rel:"noopener noreferrer",className:"btn-install",children:t==="ru"?"🚀 Открыть SQL Editor в Supabase":"🚀 Open SQL Editor in Supabase"})]}):u==="tables"?e.jsx("div",{className:"tables-grid",children:i.map((s,a)=>e.jsxs("div",{className:`table-card ${s.is_enabled?"":"disabled"}`,children:[e.jsxs("div",{className:"table-card-header",children:[e.jsxs("div",{className:"table-name",children:[e.jsx("code",{children:s.table_name}),s.priority<=10&&e.jsxs("span",{className:"badge priority",children:["P",s.priority]})]}),e.jsx("button",{className:`toggle-switch ${s.is_enabled?"on":"off"}`,onClick:()=>y(s.table_name,s.is_enabled),title:s.is_enabled?"Click to disable":"Click to enable",children:e.jsx("span",{className:"toggle-slider"})})]}),e.jsxs("div",{className:"table-stats",children:[e.jsxs("div",{className:"stat-row",children:[e.jsxs("span",{className:"stat-label",children:["✅ ",t==="ru"?"Успешно:":"Success:"]}),e.jsx("span",{className:"stat-value",children:s.success_count})]}),e.jsxs("div",{className:"stat-row",children:[e.jsxs("span",{className:"stat-label",children:["❌ ",t==="ru"?"Ошибок:":"Errors:"]}),e.jsx("span",{className:"stat-value",children:s.error_count})]}),e.jsxs("div",{className:"stat-row",children:[e.jsxs("span",{className:"stat-label",children:["📊 ",t==="ru"?"За 7 дней:":"7 days:"]}),e.jsx("span",{className:"stat-value",children:s.logs_last_7days})]})]}),s.last_success_at&&e.jsxs("div",{className:"last-success",children:["🕒 ",new Date(s.last_success_at).toLocaleString(t==="ru"?"ru-RU":"en-US")]}),s.last_error&&e.jsxs("div",{className:"error-message",children:["⚠️ ",s.last_error.substring(0,60),"..."]})]},s.id||`table-${a}`))}):e.jsx("div",{className:"logs-container",children:e.jsxs("table",{className:"logs-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Time"}),e.jsx("th",{children:"Table"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Exec Time"}),e.jsx("th",{children:"Message"})]})}),e.jsx("tbody",{children:g.map((s,a)=>e.jsxs("tr",{children:[e.jsx("td",{children:new Date(s.created_at).toLocaleString(t==="ru"?"ru-RU":"en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}),e.jsx("td",{children:e.jsx("code",{children:s.table_name})}),e.jsx("td",{children:e.jsxs("span",{className:`status-badge ${s.status.toLowerCase()}`,children:[s.status==="SUCCESS"?"✅":s.status==="ERROR"?"❌":"⏭️"," ",s.status]})}),e.jsxs("td",{children:[s.execution_time_ms,"ms"]}),e.jsx("td",{className:"error-cell",children:s.error_message?e.jsxs("span",{className:"error-text",title:s.error_message,children:[s.error_message.substring(0,50),"..."]}):e.jsx("span",{className:"success-text",children:"OK"})})]},s.id||`log-${a}`))})]})}),e.jsx("style",{children:`
        .keep-alive-dynamic {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
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

        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #111827;
        }

        .subtitle {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .toggle-btn.active {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          border-color: #10B981;
        }

        .toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .run-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .run-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
        }

        .run-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          border: 1px solid #E5E7EB;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #6B7280;
        }

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

        .tab.active {
          background: white;
          color: #7C3AED;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .tables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .table-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          border: 2px solid #E5E7EB;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .table-card.disabled {
          opacity: 0.6;
          border-color: #F3F4F6;
        }

        .table-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .table-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .table-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .table-name code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .badge {
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
        }

        .badge.priority {
          background: #7C3AED;
          color: white;
        }

        .toggle-switch {
          width: 50px;
          height: 26px;
          background: #E5E7EB;
          border-radius: 13px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
        }

        .toggle-switch.on {
          background: #10B981;
        }

        .toggle-slider {
          position: absolute;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          top: 3px;
          left: 3px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-switch.on .toggle-slider {
          left: 27px;
        }

        .table-stats {
          margin-bottom: 12px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #F3F4F6;
          font-size: 13px;
        }

        .stat-row:last-child {
          border-bottom: none;
        }

        .last-success {
          font-size: 12px;
          color: #10B981;
          padding: 8px;
          background: #F0FDF4;
          border-radius: 8px;
          margin-top: 12px;
        }

        .error-message {
          font-size: 12px;
          color: #EF4444;
          padding: 8px;
          background: #FEF2F2;
          border-radius: 8px;
          margin-top: 8px;
        }

        .logs-container {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          overflow-x: auto;
        }

        .logs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .logs-table th {
          text-align: left;
          padding: 12px;
          background: #F9FAFB;
          font-weight: 600;
          font-size: 13px;
          color: #6B7280;
          border-bottom: 2px solid #E5E7EB;
        }

        .logs-table td {
          padding: 12px;
          border-bottom: 1px solid #F3F4F6;
          font-size: 14px;
        }

        .logs-table tbody tr:hover {
          background: #F9FAFB;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.success {
          background: #D1FAE5;
          color: #065F46;
        }

        .status-badge.error {
          background: #FEE2E2;
          color: #991B1B;
        }

        .status-badge.skipped {
          background: #FEF3C7;
          color: #92400E;
        }

        .error-cell {
          max-width: 300px;
        }

        .error-text {
          color: #EF4444;
          font-size: 12px;
        }

        .success-text {
          color: #10B981;
          font-weight: 500;
        }

        .loading {
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

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 40px;
          max-width: 800px;
          margin: 0 auto;
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 24px;
        }

        .empty-state h3 {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 12px 0;
        }

        .empty-description {
          font-size: 16px;
          color: #6B7280;
          margin-bottom: 32px;
        }

        .install-steps {
          background: #F9FAFB;
          border-radius: 16px;
          padding: 24px;
          text-align: left;
          margin-bottom: 24px;
        }

        .install-steps h4 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 16px 0;
        }

        .install-steps ol {
          margin: 0;
          padding-left: 24px;
        }

        .install-steps li {
          margin-bottom: 12px;
          font-size: 14px;
          color: #374151;
          line-height: 1.6;
        }

        .install-steps code {
          background: #EDE9FE;
          color: #5B21B6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
        }

        .install-info {
          background: #EEF2FF;
          border-radius: 16px;
          padding: 20px;
          text-align: left;
          margin-bottom: 32px;
        }

        .install-info p {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #374151;
        }

        .install-info ul {
          margin: 0;
          padding-left: 24px;
          list-style: none;
        }

        .install-info li {
          margin-bottom: 8px;
          font-size: 13px;
          color: #6B7280;
          line-height: 1.5;
        }

        .install-info code {
          background: white;
          color: #5B21B6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
        }

        .btn-install {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 32px;
          background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .btn-install:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
        }

        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 16px;
          }

          .header-actions {
            width: 100%;
            flex-direction: column;
          }

          .toggle-btn, .run-btn {
            width: 100%;
            justify-content: center;
          }

          .tables-grid {
            grid-template-columns: 1fr;
          }
        }
      `})]})}export{K as default};
