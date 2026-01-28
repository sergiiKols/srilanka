async function m(){try{const n=await(await fetch("/api/admin/forms")).json();if(n.success){const s=n.data;document.getElementById("total-forms").textContent=s.length,document.getElementById("active-forms").textContent=s.filter(i=>i.is_active).length,g(s)}const o=await(await fetch("/api/admin/forms/submissions?limit=1000")).json();if(o.success){const s=o.pagination.total;document.getElementById("total-submissions").textContent=s;const i=new Date().toISOString().split("T")[0],d=o.data.filter(r=>r.created_at.startsWith(i)).length;document.getElementById("today-submissions").textContent=d}}catch(t){console.error("Ошибка загрузки настроек:",t)}}function g(t){const n=document.getElementById("forms-table");if(t.length===0){n.innerHTML='<div class="empty">Формы не найдены</div>';return}const e=`
          <table class="data-table">
            <thead>
              <tr>
                <th>Название формы</th>
                <th>Chat ID</th>
                <th>Статус</th>
                <th>Web App URL</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              ${t.map(o=>{const s=`${window.location.origin}/telegram-app?form_id=${o.id}`;return`
                  <tr>
                    <td><strong>${o.title}</strong></td>
                    <td>${o.chat_id||"По умолчанию"}</td>
                    <td>
                      <span class="status-badge ${o.is_active?"active":"inactive"}">
                        ${o.is_active?"✅ Активна":"❌ Неактивна"}
                      </span>
                    </td>
                    <td>
                      <code class="code-snippet">${s}</code>
                      <button class="btn-icon" onclick="copyToClipboard('${s}')" title="Копировать">
                        📋
                      </button>
                    </td>
                    <td>
                      <a href="/admin/forms/telegram/${o.id}" class="btn-sm">Редактировать</a>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        `;n.innerHTML=e}document.getElementById("toggle-token").addEventListener("click",()=>{const t=document.getElementById("default-bot-token");t.type=t.type==="password"?"text":"password"});document.getElementById("save-settings").addEventListener("click",async()=>{const t=document.getElementById("default-bot-token").value,n=document.getElementById("default-chat-id").value,e=document.getElementById("enable-notifications").checked,o=document.getElementById("enable-rate-limiting").checked;if(!t){a("Укажите Bot Token","error");return}try{localStorage.setItem("telegram_bot_token",t),localStorage.setItem("telegram_chat_id",n),localStorage.setItem("telegram_notifications",e),localStorage.setItem("telegram_rate_limiting",o),a("✅ Настройки успешно сохранены","success")}catch(s){a("❌ Ошибка сохранения настроек","error"),console.error(s)}});document.getElementById("test-connection").addEventListener("click",async()=>{const t=document.getElementById("default-bot-token").value;if(!t){a("Укажите Bot Token для проверки","error");return}try{const e=await(await fetch(`https://api.telegram.org/bot${t}/getMe`)).json();e.ok?a(`✅ Подключение успешно! Бот: @${e.result.username}`,"success"):a("❌ Ошибка подключения: "+e.description,"error")}catch(n){a("❌ Не удалось подключиться к Telegram API","error"),console.error(n)}});function a(t,n){const e=document.getElementById("message");e.textContent=t,e.className=`message ${n}`,e.classList.remove("hidden"),setTimeout(()=>{e.classList.add("hidden")},5e3)}window.copyToClipboard=t=>{navigator.clipboard.writeText(t),a("✅ URL скопирован в буфер обмена","success")};m();const c=localStorage.getItem("telegram_bot_token"),l=localStorage.getItem("telegram_chat_id"),u=localStorage.getItem("telegram_notifications")==="true",h=localStorage.getItem("telegram_rate_limiting")!=="false";c&&(document.getElementById("default-bot-token").value=c);l&&(document.getElementById("default-chat-id").value=l);document.getElementById("enable-notifications").checked=u;document.getElementById("enable-rate-limiting").checked=h;
