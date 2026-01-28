import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as o}from"./index.JXKNaeUN.js";import{s as c}from"./supabase.BaSUsDRT.js";import"./index.DR2MMlUt.js";function w(){const[n,l]=o.useState({enabled:!1,lastRun:null,nextRun:null}),[m,u]=o.useState(!0),[i,s]=o.useState(!1),[r,g]=o.useState(!1);o.useEffect(()=>{p()},[]);const p=async()=>{try{u(!0);const{data:a,error:t}=await c.from("system_config").select("config_value").eq("config_key","keep_alive_enabled").single();if(t)throw t;l({enabled:a.config_value,lastRun:null,nextRun:null})}catch(a){console.error("Error loading keep-alive status:",a)}finally{u(!1)}},b=async()=>{try{s(!0);const a=!n.enabled,{error:t}=await c.from("system_config").update({config_value:a,updated_at:new Date().toISOString()}).eq("config_key","keep_alive_enabled");if(t)throw t;l(d=>({...d,enabled:a})),alert(a?"✅ Keep-Alive включен! Тестовые записи будут создаваться каждые 3 дня.":"❌ Keep-Alive выключен. Автоматические тестовые записи остановлены.")}catch(a){console.error("Error toggling keep-alive:",a),alert("Ошибка при изменении настройки")}finally{s(!1)}},x=async()=>{if(confirm("Запустить тестовое создание записей сейчас?"))try{s(!0);const{data:a,error:t}=await c.rpc("keep_alive_test_records");if(t)throw t;console.log("Keep-alive test results:",a);const d=a?.filter(h=>h.status==="SUCCESS").length||0;alert(`✅ Тест завершён!

Успешно создано записей: ${d}

Проверьте таблицы в Database Editor.`)}catch(a){console.error("Error running manual test:",a),alert("Ошибка при запуске теста")}finally{s(!1)}};return m?e.jsx("div",{className:"bg-white rounded-lg shadow p-6",children:e.jsxs("div",{className:"animate-pulse",children:[e.jsx("div",{className:"h-4 bg-gray-200 rounded w-1/4 mb-4"}),e.jsx("div",{className:"h-8 bg-gray-200 rounded w-full"})]})}):e.jsxs("div",{className:"lumina-toggle-card",children:[e.jsx("div",{className:"lumina-toggle-header",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:`lumina-status-indicator ${n.enabled?"lumina-status-active":"lumina-status-inactive"}`}),e.jsx("div",{className:"lumina-icon-3d-small",children:"🔄"}),e.jsx("h3",{className:"lumina-toggle-title",children:"Keep-Alive System"}),e.jsx("span",{className:`lumina-badge ${n.enabled?"lumina-badge-green":"lumina-badge-gray"}`,children:n.enabled?"Включено":"Выключено"})]}),e.jsx("button",{onClick:()=>g(!r),className:"lumina-info-button",children:r?"▼ Скрыть информацию":"▶ Показать информацию"})]})}),r&&e.jsxs("div",{className:"lumina-info-panel",children:[e.jsx("h4",{className:"lumina-info-panel-title",children:"ℹ️ Что это такое?"}),e.jsxs("div",{className:"lumina-info-panel-text",children:[e.jsxs("p",{children:[e.jsx("strong",{children:"Keep-Alive"})," - автоматическая система для поддержания активности базы данных Supabase на бесплатном тарифе."]}),e.jsx("p",{children:e.jsx("strong",{children:"Как работает:"})}),e.jsxs("ul",{className:"list-disc list-inside ml-4 space-y-1",children:[e.jsx("li",{children:"Каждые 3 дня создаются тестовые записи во всех таблицах"}),e.jsxs("li",{children:["Все записи помечены как ",e.jsx("code",{className:"bg-blue-100 px-1 rounded",children:"test"})," и неактивны"]}),e.jsx("li",{children:"Записи старше 30 дней автоматически удаляются"}),e.jsx("li",{children:"Не влияет на работу приложения"})]}),e.jsxs("p",{className:"mt-3",children:[e.jsx("strong",{children:"Зачем это нужно?"}),e.jsx("br",{}),"Supabase паузирует бесплатные проекты после 7 дней неактивности. Keep-Alive предотвращает паузу, создавая минимальную активность в базе данных."]})]})]}),e.jsx("div",{className:"lumina-toggle-controls",children:e.jsxs("div",{className:"flex items-center justify-between gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"lumina-control-status",children:n.enabled?"🟢 Автоматические тестовые записи активны. Создаются каждые 3 дня в 3:00.":"⚫ Автоматические тестовые записи отключены."}),n.enabled&&e.jsx("p",{className:"lumina-control-info",children:"Следующий запуск: каждые 3 дня (по расписанию Cron)"})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx("button",{onClick:b,disabled:i,className:`lumina-button ${n.enabled?"lumina-button-danger":"lumina-button-success"} ${i?"lumina-button-disabled":""}`,children:i?"⏳ Сохранение...":n.enabled?"❌ Выключить":"✅ Включить"}),e.jsx("button",{onClick:x,disabled:i||!n.enabled,className:`lumina-button lumina-button-primary ${i||!n.enabled?"lumina-button-disabled":""}`,title:n.enabled?"Запустить тест сейчас":"Включите Keep-Alive для запуска теста",children:"🧪 Тест"})]})]})}),!n.enabled&&e.jsx("div",{className:"lumina-warning-panel",children:e.jsxs("p",{className:"lumina-warning-text",children:["⚠️ ",e.jsx("strong",{children:"Внимание:"})," При отключённом Keep-Alive проект может быть приостановлен через 7 дней неактивности на бесплатном тарифе Supabase."]})})]})}const f=`
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
`;if(typeof document<"u"){const n="lumina-keep-alive-styles";if(!document.getElementById(n)){const l=document.createElement("style");l.id=n,l.textContent=f,document.head.appendChild(l)}}export{w as default};
