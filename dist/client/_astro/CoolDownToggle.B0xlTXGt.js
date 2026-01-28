import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as o}from"./index.JXKNaeUN.js";import{s as r}from"./supabase.BaSUsDRT.js";import"./index.DR2MMlUt.js";function D(){const[a,t]=o.useState({enabled:!1,lastRun:null,totalCooledDown:0}),[f,m]=o.useState(!0),[s,d]=o.useState(!1),[c,w]=o.useState(!1),[g,p]=o.useState([]);o.useEffect(()=>{b()},[]);const b=async()=>{try{m(!0);const{data:n,error:l}=await r.from("system_config").select("config_value").eq("config_key","cool_down_enabled").maybeSingle();if(l&&l.code!=="PGRST116")throw l;n?t({enabled:n.config_value,lastRun:null,totalCooledDown:0}):(await r.from("system_config").insert({config_key:"cool_down_enabled",config_value:!0,description:"Enable/disable automatic temperature cool-down every hour"}),t({enabled:!0,lastRun:null,totalCooledDown:0}));const{data:i}=await r.from("temperature_change_log").select("*").eq("change_reason","auto_cooldown").order("changed_at",{ascending:!1}).limit(5);if(i&&i.length>0){const y=i.map(u=>({listing_id:u.listing_id,old_temp:u.old_temperature,new_temp:u.new_temperature,hours_elapsed:0}));p(y)}}catch(n){console.error("Error loading cool-down status:",n)}finally{m(!1)}},j=async()=>{try{d(!0);const n=!a.enabled,{error:l}=await r.from("system_config").upsert({config_key:"cool_down_enabled",config_value:n,description:"Enable/disable automatic temperature cool-down every hour",updated_at:new Date().toISOString()});if(l)throw l;t(i=>({...i,enabled:n})),alert(n?"✅ Автоохлаждение включено! Объекты будут автоматически охлаждаться каждый час.":"❌ Автоохлаждение выключено. Температура объектов не будет меняться автоматически.")}catch(n){console.error("Error toggling cool-down:",n),alert("Ошибка при изменении настройки")}finally{d(!1)}},F=async()=>{if(confirm("Запустить охлаждение объектов сейчас?"))try{d(!0);const{data:n,error:l}=await r.rpc("cool_down_objects");if(l)throw l;console.log("Cool-down results:",n),n&&n.length>0?(p(n),alert(`✅ Охлаждение завершено!

Охлаждено объектов: ${n.length}

Проверьте temperature_change_log для деталей.`)):alert(`ℹ️ Нет объектов для охлаждения.

Все объекты уже имеют актуальную температуру.`),await b()}catch(n){console.error("Error running manual cool-down:",n),alert("Ошибка при запуске охлаждения")}finally{d(!1)}},x=n=>{switch(n){case"hot":return"🔴";case"warm":return"🟠";case"cool":return"🟡";case"cold":return"🔵";default:return"⚪"}},h=n=>{switch(n){case"hot":return"Горячий";case"warm":return"Тёплый";case"cool":return"Прохладный";case"cold":return"Холодный";default:return n}};return f?e.jsx("div",{className:"bg-white rounded-lg shadow p-6",children:e.jsxs("div",{className:"animate-pulse",children:[e.jsx("div",{className:"h-4 bg-gray-200 rounded w-1/4 mb-4"}),e.jsx("div",{className:"h-8 bg-gray-200 rounded w-full"})]})}):e.jsxs("div",{className:"lumina-toggle-card",children:[e.jsx("div",{className:"lumina-toggle-header",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:`lumina-status-indicator ${a.enabled?"lumina-status-active":"lumina-status-inactive"}`}),e.jsx("div",{className:"lumina-icon-3d-small",children:"🌡️"}),e.jsx("h3",{className:"lumina-toggle-title",children:"Автоохлаждение Объектов"}),e.jsx("span",{className:`lumina-badge ${a.enabled?"lumina-badge-green":"lumina-badge-gray"}`,children:a.enabled?"Включено":"Выключено"})]}),e.jsx("button",{onClick:()=>w(!c),className:"lumina-info-button",children:c?"▼ Скрыть информацию":"▶ Показать информацию"})]})}),c&&e.jsxs("div",{className:"lumina-info-panel",children:[e.jsx("h4",{className:"lumina-info-panel-title",children:"ℹ️ Что это такое?"}),e.jsxs("div",{className:"lumina-info-panel-text",children:[e.jsxs("p",{children:[e.jsx("strong",{children:"Автоохлаждение"})," - автоматическая система изменения температуры (приоритета) объявлений о недвижимости по времени."]}),e.jsx("p",{children:e.jsx("strong",{children:"Как работает система температуры:"})}),e.jsxs("ul",{className:"list-disc list-inside ml-4 space-y-1",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"🔴 Горячий (HOT)"})," - 0-24 часа - Приоритет 4 - Всегда видим"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"🟠 Тёплый (WARM)"})," - 24-72 часа - Приоритет 3 - Всегда видим"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"🟡 Прохладный (COOL)"})," - 72-120 часов - Приоритет 2 - С фильтрами"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"🔵 Холодный (COLD)"})," - 120+ часов - Приоритет 1 - Только с фильтрами"]})]}),e.jsxs("p",{className:"mt-3",children:[e.jsx("strong",{children:"Зачем это нужно?"}),e.jsx("br",{}),'Новые объявления показываются с высоким приоритетом (🔴 горячие). Со временем они автоматически "охлаждаются", давая место новым объявлениям. Это обеспечивает справедливую ротацию объявлений на карте.']}),e.jsxs("p",{className:"mt-2",children:[e.jsx("strong",{children:"Частота:"})," Функция запускается каждый час через Cron Job и автоматически понижает температуру объектов по времени."]})]})]}),e.jsx("div",{className:"lumina-toggle-controls",children:e.jsxs("div",{className:"flex items-center justify-between gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"lumina-control-status",children:a.enabled?"🟢 Автоматическое охлаждение активно. Температура объектов обновляется каждый час.":"⚫ Автоматическое охлаждение отключено. Температура объектов не изменяется."}),a.enabled&&e.jsx("p",{className:"lumina-control-info",children:"Следующий запуск: каждый час :00 минут (по расписанию Cron)"})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx("button",{onClick:j,disabled:s,className:`lumina-button ${a.enabled?"lumina-button-danger":"lumina-button-success"} ${s?"lumina-button-disabled":""}`,children:s?"⏳ Сохранение...":a.enabled?"❌ Выключить":"✅ Включить"}),e.jsx("button",{onClick:F,disabled:s||!a.enabled,className:`lumina-button lumina-button-primary ${s||!a.enabled?"lumina-button-disabled":""}`,title:a.enabled?"Запустить охлаждение сейчас":"Включите автоохлаждение для запуска",children:"❄️ Охладить"})]})]})}),g.length>0&&e.jsxs("div",{className:"lumina-results-panel",children:[e.jsx("h4",{className:"lumina-results-title",children:"📊 Последние изменения температуры"}),e.jsx("div",{className:"space-y-2",children:g.map((n,l)=>e.jsxs("div",{className:"lumina-result-item",children:[e.jsxs("span",{className:"lumina-result-id",children:[n.listing_id.substring(0,8),"..."]}),e.jsxs("span",{className:"lumina-temp-display",children:[x(n.old_temp),e.jsx("span",{className:"lumina-temp-label",children:h(n.old_temp)})]}),e.jsx("span",{className:"lumina-arrow",children:"→"}),e.jsxs("span",{className:"lumina-temp-display",children:[x(n.new_temp),e.jsx("span",{className:"lumina-temp-label",children:h(n.new_temp)})]}),n.hours_elapsed>0&&e.jsxs("span",{className:"lumina-result-time",children:[n.hours_elapsed,"ч назад"]})]},l))})]}),!a.enabled&&e.jsx("div",{className:"lumina-warning-panel",children:e.jsxs("p",{className:"lumina-warning-text",children:["⚠️ ",e.jsx("strong",{children:"Внимание:"})," При отключённом автоохлаждении все объекты останутся с текущей температурой и не будут понижать приоритет со временем."]})})]})}const E=`
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
`;if(typeof document<"u"){const a="lumina-cooldown-styles";if(!document.getElementById(a)){const t=document.createElement("style");t.id=a,t.textContent=E,document.head.appendChild(t)}}export{D as default};
