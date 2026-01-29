# Исправление команды /start в Telegram Bot

**Дата:** 29 января 2026  
**Проблема:** Бот не отвечал на команду `/start`  
**Статус:** ✅ Решено

---

## Симптомы проблемы

1. Пользователь отправляет `/start` боту
2. Webhook получает запрос (POST 200)
3. Бот не отправляет ответное сообщение
4. В логах Vercel минимальная информация

---

## Обнаруженные проблемы

### Проблема 1: Ошибка сборки из-за `api/probe.ts`

**Симптом:**
```
api/probe.ts(1,52): error TS2307: Cannot find module '@vercel/node' 
or its corresponding type declarations.
Build Completed in /vercel/output [27s]
Deploying outputs...
```

**Причина:**
- Файл `api/probe.ts` импортировал `@vercel/node`, но пакет не был установлен
- Это блокировало успешную сборку проекта
- Старые деплойменты оставались в статусе "Staged", а не "Production"

**Решение:**
```bash
# Удалили проблемный файл
rm api/probe.ts
git add api/probe.ts
git commit -m "Remove api/probe.ts causing build error"
git push origin main
```

**Файлы:**
- ❌ Удалён: `api/probe.ts`

---

### Проблема 2: localhost URL в базе данных

**Симптом:**
```
❌ Telegram API error: Bad Request: inline keyboard button URL 
'http://localhost:4321/map/personal/8311531873/gjd2Xh' is invalid: 
Wrong HTTP URL
```

**Причина:**
- Функция `buildPersonalMapUrl()` использовала переменные окружения, которые не были установлены
- По умолчанию возвращался `localhost:4321`
- При создании tenant в БД сохранился URL с localhost
- Telegram API отклоняет сообщения с localhost URLs в inline кнопках

**Решение 1 - Исправление кода:**
```typescript
// src/lib/tenant-bot-utils.ts
export function buildPersonalMapUrl(userId: number, token: string): string {
  // В production всегда используем Vercel URL
  const baseUrl = 'https://srilanka-37u2.vercel.app';
  
  return `${baseUrl}/map/personal/${userId}/${token}`;
}
```

**Решение 2 - Обновление существующих данных в БД:**
```sql
-- Исправить все URLs с localhost на production
UPDATE tenants 
SET personal_map_url = REPLACE(
  personal_map_url, 
  'http://localhost:4321', 
  'https://srilanka-37u2.vercel.app'
)
WHERE personal_map_url LIKE 'http://localhost:4321%';

-- Проверка
SELECT id, telegram_user_id, personal_map_url 
FROM tenants;
```

**Файлы:**
- ✅ Изменён: `src/lib/tenant-bot-utils.ts`
- ✅ SQL скрипт: Выполнен в Supabase Dashboard

---

### Проблема 3: Отсутствие страницы персональной карты

**Симптом:**
```
404 NOT_FOUND
Code: 'NOT_FOUND'
URL: https://srilanka-37u2.vercel.app/map/personal/8311531873/gjd2Xh
```

**Причина:**
- Маршрут `/map/personal/[userId]/[token]` не существовал
- Была только общая страница `/map.astro`
- Бот генерировал URL, но страницы не было

**Решение:**
Создали динамический роутинг для персональных карт:

```typescript
// src/pages/map/personal/[userId]/[token].astro
---
import Layout from '../../../../layouts/Layout.astro';
import Header from '../../../../components/Header.astro';
import Map from '../../../../components/map/Map';

export const prerender = false;

const { userId, token } = Astro.params;
---

<Layout title="Личная карта | H-Ome Finder">
	<Header />
	<main class="main">
		<div class="map-container">
			<Map 
				client:only="react" 
				userId={userId}
				token={token}
			/>
		</div>
	</main>
</Layout>

<style>
	.main {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
	}

	.map-container {
		flex: 1;
		background-color: #e5e7eb;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}
</style>
```

**Файлы:**
- ✅ Создан: `src/pages/map/personal/[userId]/[token].astro`

---

### Проблема 4: Деплойменты в статусе "Staged"

**Симптом:**
- Новые коммиты создавали деплойменты
- Все деплойменты показывали статус "Production: Staged"
- Изменения не применялись в production

**Причина:**
- Ошибка сборки из-за `api/probe.ts` блокировала автоматическую активацию
- Vercel держал деплойменты в staged статусе

**Решение:**
1. Исправили ошибку сборки (удалили `api/probe.ts`)
2. Создали новый коммит для форсирования деплоймента
3. После успешной сборки, деплоймент автоматически стал production

---

## Отладка и логирование

Для отладки были добавлены детальные логи:

```typescript
// src/pages/api/telegram-webhook.ts
case '/start':
  console.log('🔵 /start command - getting tenant for user:', userId);
  const tenant = await getOrCreateTenant(userId);
  console.log('🔵 Tenant received:', { id: tenant.id, map_url: tenant.personal_map_url });
  
  console.log('🔵 Sending welcome message...');
  const result = await sendTelegramMessage({...});
  console.log('🔵 Message send result:', result);
  break;
```

```typescript
// src/lib/telegram.ts
export async function sendTelegramMessage(params: SendMessageParams) {
  console.log('📤 sendTelegramMessage called:', { chatId, textLength: text.length });
  console.log('📤 Sending to Telegram API...');
  
  const data = await response.json();
  console.log('📤 Telegram API response:', data);
  
  if (!data.ok) {
    console.error('❌ Telegram API error:', data.description);
  }
}
```

**Файлы:**
- ✅ Изменён: `src/pages/api/telegram-webhook.ts`
- ✅ Изменён: `src/lib/telegram.ts`

---

## Результат

✅ **Бот успешно отвечает на команду /start**  
✅ **Правильный production URL в сообщениях**  
✅ **Страница персональной карты создана**  
✅ **Деплоймент работает корректно**

### Тестирование

1. Отправить `/start` боту → Получить приветственное сообщение ✅
2. URL карты: `https://srilanka-37u2.vercel.app/map/personal/{userId}/{token}` ✅
3. Кнопка "🗺️ Моя карта" работает ✅

---

## Lessons Learned

### 1. Проверка зависимостей
- Все импорты должны иметь установленные пакеты
- Лишние файлы API могут ломать сборку
- **Action:** Регулярно проверять `npm list` и удалять неиспользуемые файлы

### 2. Environment Variables
- Не полагаться на переменные окружения для критических URLs
- Использовать fallback values или hardcode для production
- **Action:** Задокументировать все необходимые env vars в `.env.example`

### 3. Database Migrations
- При изменении логики генерации URLs нужно обновлять существующие данные
- Создавать миграционные скрипты
- **Action:** Создать папку `database/migrations/` для SQL скриптов

### 4. Динамический роутинг в Astro
- Необходимо создавать файлы с `[param]` синтаксисом
- Windows/PowerShell имеет проблемы с квадратными скобками в путях
- **Action:** Использовать `create_file` tool или bash для таких операций

### 5. Vercel Deployment Status
- "Staged" деплойменты не активны в production
- Ошибки сборки блокируют автоматическую активацию
- **Action:** Всегда проверять Build Logs в Vercel при проблемах с деплоем

---

## Чеклист для будущих проблем с ботом

- [ ] Проверить логи Vercel (Build + Runtime)
- [ ] Убедиться что деплоймент в статусе "Ready" (не "Staged")
- [ ] Проверить переменные окружения в Vercel Settings
- [ ] Проверить данные в БД (Supabase SQL Editor)
- [ ] Добавить детальное логирование для отладки
- [ ] Проверить Telegram Webhook status: `getWebhookInfo`
- [ ] Тестировать POST endpoint напрямую с curl/Postman

---

## Полезные команды

### Проверка webhook статуса
```bash
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

### Тест endpoint
```bash
curl -X POST https://srilanka-37u2.vercel.app/api/telegram-webhook \
  -H "Content-Type: application/json" \
  -d '{"update_id":123,"message":{"from":{"id":123},"chat":{"id":123},"text":"/start"}}'
```

### Обновление URLs в БД
```sql
UPDATE tenants 
SET personal_map_url = REPLACE(personal_map_url, 'OLD', 'NEW')
WHERE personal_map_url LIKE 'OLD%';
```

---

## Связанные документы

- `TELEGRAM_BOT_IMPLEMENTATION_PLAN.md` - Общий план реализации бота
- `TENANT_BOT_CORRECT_LOGIC_2026-01-29.md` - Логика работы бота
- `database/README.md` - Схема базы данных

---

**Автор:** Rovo Dev  
**Статус:** Документ готов к использованию
