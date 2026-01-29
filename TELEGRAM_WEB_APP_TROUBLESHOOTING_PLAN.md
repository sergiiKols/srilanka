# Telegram Web App Troubleshooting Plan

**Дата создания:** 29 января 2026  
**Основано на опыте:** Исправление команды `/start` бота  
**Цель:** Проверить и исправить Telegram Web App формы

---

## Текущее состояние

### Существующие Web App формы

1. **Tenant Request Form** - `/tenant-app`
   - Форма для арендаторов (поиск жилья)
   - Компонент: `TenantRequestForm.tsx`
   - API: `/api/tenant-request`
   - Статус: ❓ Требует проверки

2. **Telegram Dynamic Forms** - `/telegram-app?form_id=xxx`
   - Динамические формы
   - Компонент: `TelegramForm.tsx`
   - API: `/api/telegram-form`
   - Статус: ❓ Требует проверки

---

## План проверки (на основе опыта с /start)

### Этап 1: Проверка файловой структуры ✅

**Проблема из опыта:** Файлы создавались, но не попадали в git

**Действия:**
```bash
# 1. Проверить существование файлов
Test-Path "src/pages/tenant-app.astro"
Test-Path "src/pages/telegram-app.astro"
Test-Path "src/components/TenantRequestForm.tsx"
Test-Path "src/components/TelegramForm.tsx"

# 2. Проверить API endpoints
Test-Path "src/pages/api/tenant-request.ts"
Test-Path "src/pages/api/telegram-form.ts"

# 3. Проверить в git
git ls-files | grep -E "(tenant-app|telegram-app)"
```

**Статус:** ✅ Все файлы существуют и закоммичены

---

### Этап 2: Проверка сборки и деплоймента

**Проблема из опыта:** 
- `api/probe.ts` блокировал сборку
- Ошибки TypeScript останавливали деплоймент
- Деплойменты оставались в статусе "Staged"

**Действия:**

#### 2.1. Локальная сборка
```bash
# Проверить сборку локально
npm run build

# Искать ошибки связанные с Web App
# Обратить внимание на:
# - Missing imports
# - TypeScript errors
# - Environment variables
```

**Что проверять:**
- [ ] Сборка завершается без ошибок
- [ ] Нет предупреждений о missing modules
- [ ] Все импорты резолвятся
- [ ] TypeScript типы корректны

#### 2.2. Проверка зависимостей
```bash
# Проверить что все пакеты установлены
npm list react
npm list react-dom
npm list @types/react

# Проверить что нет лишних импортов
grep -r "from '@vercel/node'" src/
grep -r "import.*vercel" src/
```

**Возможные проблемы:**
- ❌ Отсутствующие зависимости
- ❌ Неправильные версии пакетов
- ❌ Конфликты типов

#### 2.3. Vercel Build Logs
```
1. Vercel Dashboard → Deployments
2. Найти последний деплоймент
3. Открыть Build Logs
4. Искать ошибки связанные с tenant-app или telegram-app
```

**Возможные ошибки:**
```
- error TS2307: Cannot find module 'X'
- Module not found: Can't resolve 'Y'
- Type 'Z' is not assignable
```

---

### Этап 3: Проверка runtime ошибок

**Проблема из опыта:**
- Код компилировался, но падал в runtime
- Переменные окружения не были установлены
- API возвращал ошибки, которые не логировались

**Действия:**

#### 3.1. Проверка переменных окружения

**В Vercel Settings → Environment Variables проверить:**
- [ ] `TELEGRAM_BOT_TOKEN` - установлен
- [ ] `TELEGRAM_ADMIN_CHAT_ID` - установлен
- [ ] `PUBLIC_SUPABASE_URL` - установлен
- [ ] `PUBLIC_SUPABASE_ANON_KEY` - установлен

**Команда для проверки в коде:**
```typescript
// Добавить в начало API endpoints
console.log('🔍 Environment check:', {
  hasBotToken: !!import.meta.env.TELEGRAM_BOT_TOKEN,
  hasSupabaseUrl: !!import.meta.env.PUBLIC_SUPABASE_URL,
  hasSupabaseKey: !!import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
});
```

#### 3.2. Добавить детальное логирование

**В API endpoints** (`src/pages/api/tenant-request.ts`):
```typescript
export const POST: APIRoute = async ({ request }) => {
  console.log('📨 Tenant request received');
  
  try {
    const body = await request.json();
    console.log('📦 Request body keys:', Object.keys(body));
    
    const initData = body.initData;
    console.log('🔑 InitData present:', !!initData);
    
    // Валидация
    const isValid = await validateTelegramWebAppData(initData);
    console.log('✅ Validation result:', isValid);
    
    // ... rest of code
    
  } catch (error) {
    console.error('❌ Error in tenant-request:', error);
    console.error('Stack:', error.stack);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
};
```

**В компонентах React** (`TenantRequestForm.tsx`):
```typescript
const handleSubmit = async () => {
  console.log('🚀 Form submit started');
  console.log('📝 Form data:', formData);
  
  try {
    const initData = window.Telegram?.WebApp?.initData;
    console.log('🔑 Telegram initData present:', !!initData);
    
    const response = await fetch('/api/tenant-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, ...formData })
    });
    
    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📦 Response data:', data);
    
    if (data.success) {
      console.log('✅ Form submitted successfully');
    } else {
      console.error('❌ Form submission failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Submit error:', error);
  }
};
```

#### 3.3. Проверка Telegram Web App SDK

**В HTML страницах** (`tenant-app.astro`):
```html
<script>
  // Добавить детальную диагностику
  console.log('🔍 Telegram SDK check:', {
    sdkLoaded: !!window.Telegram,
    webAppLoaded: !!window.Telegram?.WebApp,
    version: window.Telegram?.WebApp?.version,
    platform: window.Telegram?.WebApp?.platform,
    initData: window.Telegram?.WebApp?.initData?.substring(0, 50) + '...',
    initDataLength: window.Telegram?.WebApp?.initData?.length,
  });
  
  if (!window.Telegram?.WebApp) {
    console.error('❌ Telegram Web App SDK not loaded!');
    console.log('Possible reasons:');
    console.log('1. Script blocked by ad blocker');
    console.log('2. Network error loading SDK');
    console.log('3. Not opened from Telegram');
  }
</script>
```

---

### Этап 4: Тестирование через Telegram

**Проблема из опыта:**
- Бот работал, но URL карты был неправильным
- Кнопки не работали из-за localhost URLs

**Действия:**

#### 4.1. Проверка Web App URL в боте

**Создать команду для получения Web App URL:**
```typescript
// В src/pages/api/telegram-webhook.ts
case '/form':
  const webAppUrl = 'https://srilanka-37u2.vercel.app/tenant-app';
  await sendTelegramMessage({
    botToken,
    chatId: chatId.toString(),
    text: '📝 Заполнить форму поиска жилья:',
    replyMarkup: {
      inline_keyboard: [[
        { 
          text: '📝 Открыть форму', 
          web_app: { url: webAppUrl }
        }
      ]]
    }
  });
  break;
```

**Важно:** Проверить что URL:
- [ ] Использует `https://` (не `http://`)
- [ ] Использует production домен (не `localhost`)
- [ ] Доступен публично (не за VPN/firewall)

#### 4.2. Тестовый сценарий

```
1. Открыть бот в Telegram
2. Отправить команду /form
3. Нажать кнопку "Открыть форму"
4. Проверить что форма открылась
5. Проверить консоль браузера (Telegram Desktop) или Telegram WebView Inspector
6. Заполнить форму
7. Нажать Submit
8. Проверить что данные сохранились в БД
9. Проверить что пришло уведомление админу
```

#### 4.3. Проверка в базе данных

```sql
-- Проверить последние заявки
SELECT * FROM tenant_requests 
ORDER BY created_at DESC 
LIMIT 10;

-- Проверить что все поля заполнены
SELECT 
  id,
  telegram_user_id,
  check_in_date,
  check_out_date,
  status,
  created_at
FROM tenant_requests
WHERE created_at > NOW() - INTERVAL '1 hour';
```

---

### Этап 5: Проверка URL и роутинга

**Проблема из опыта:**
- Страница `/map/personal/[userId]/[token]` не существовала (404)
- Динамические роуты не работали

**Действия:**

#### 5.1. Тест доступности страниц

```bash
# Прямой доступ к страницам
curl -I https://srilanka-37u2.vercel.app/tenant-app
curl -I https://srilanka-37u2.vercel.app/telegram-app?form_id=test

# Ожидаемый результат: HTTP 200
# Если 404 - страница не существует
# Если 500 - ошибка сервера
```

#### 5.2. Проверка в браузере

```
1. Открыть https://srilanka-37u2.vercel.app/tenant-app
2. Открыть DevTools → Console
3. Проверить ошибки JavaScript
4. Проверить ошибки загрузки ресурсов
5. Проверить Network tab для API запросов
```

**Возможные проблемы:**
- ❌ 404 - файл не задеплоился
- ❌ 500 - ошибка в коде
- ❌ Blank page - ошибка React rendering
- ❌ CORS errors - проблема с API

---

## Чеклист проверки Web App

### Перед деплоем
- [ ] Локальная сборка успешна (`npm run build`)
- [ ] Нет TypeScript ошибок
- [ ] Все зависимости установлены
- [ ] `.env.example` обновлён с нужными переменными
- [ ] Git коммит включает все файлы

### После деплоя
- [ ] Vercel деплоймент в статусе "Ready" (не "Staged")
- [ ] Build logs без ошибок
- [ ] Runtime logs без критических ошибок
- [ ] Переменные окружения установлены в Vercel

### Функциональное тестирование
- [ ] Страница открывается через браузер
- [ ] Страница открывается через Telegram Web App
- [ ] Форма рендерится корректно
- [ ] Валидация работает
- [ ] Submit отправляет данные в API
- [ ] API сохраняет в БД
- [ ] Уведомления приходят админу
- [ ] Пользователь получает подтверждение

---

## Известные проблемы и решения

### Проблема 1: Form не отображается

**Симптомы:**
- Страница загружается, но форма не видна
- Белый экран или вечный спиннер

**Возможные причины:**
1. React компонент не загружается (`client:only="react"`)
2. Ошибка в компоненте (проверить Console)
3. CSS скрывает форму

**Решение:**
```typescript
// Добавить fallback для React
<div id="app">
  <TenantRequestForm client:only="react" />
  <noscript>
    JavaScript is required for this form
  </noscript>
</div>

// Добавить error boundary
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({error}) {
  return (
    <div style={{padding: 20}}>
      <h2>❌ Form Error</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <TenantRequestForm />
</ErrorBoundary>
```

### Проблема 2: Telegram initData отсутствует

**Симптомы:**
- API возвращает "Missing Telegram initData"
- Валидация не проходит

**Возможные причины:**
1. Форма открыта не через Telegram
2. Telegram SDK не загрузился
3. initData не передаётся в запрос

**Решение:**
```typescript
// Проверить наличие initData
const initData = window.Telegram?.WebApp?.initData;

if (!initData) {
  console.error('❌ No Telegram initData');
  console.log('Opening method:', window.Telegram?.WebApp ? 'Telegram' : 'Browser');
  
  // Для разработки можно использовать mock
  if (import.meta.env.DEV) {
    console.warn('Using mock initData for development');
    // Use test data
  }
}
```

### Проблема 3: CORS ошибки

**Симптомы:**
```
Access to fetch at '/api/tenant-request' from origin 'https://srilanka-37u2.vercel.app' 
has been blocked by CORS policy
```

**Решение:**
```typescript
// В API endpoint добавить CORS headers
export const POST: APIRoute = async ({ request }) => {
  // ... обработка
  
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
};

// Добавить OPTIONS handler
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
};
```

### Проблема 4: База данных не обновляется

**Симптомы:**
- API возвращает success
- Но данные не в БД

**Решение:**
```typescript
// Добавить детальное логирование в DB операции
const { data, error } = await supabase
  .from('tenant_requests')
  .insert(requestData)
  .select();

console.log('💾 Supabase insert:', {
  success: !error,
  error: error?.message,
  data: data?.[0]?.id
});

if (error) {
  console.error('❌ Supabase error details:', {
    code: error.code,
    details: error.details,
    hint: error.hint,
    message: error.message
  });
}
```

---

## Пошаговый план действий

### День 1: Диагностика

1. **Проверить сборку и деплоймент** (30 мин)
   - [ ] Запустить `npm run build`
   - [ ] Проверить Vercel Build Logs
   - [ ] Убедиться что нет ошибок типа `api/probe.ts`

2. **Добавить логирование** (1 час)
   - [ ] В `tenant-app.astro` добавить SDK диагностику
   - [ ] В `api/tenant-request.ts` добавить детальные логи
   - [ ] В `TenantRequestForm.tsx` добавить логи submit
   - [ ] Закоммитить и задеплоить

3. **Проверить переменные окружения** (15 мин)
   - [ ] Открыть Vercel Settings → Environment Variables
   - [ ] Проверить все необходимые переменные
   - [ ] Добавить недостающие

### День 2: Тестирование

4. **Тест через браузер** (30 мин)
   - [ ] Открыть `/tenant-app` в браузере
   - [ ] Проверить Console на ошибки
   - [ ] Попробовать заполнить форму
   - [ ] Проверить Network tab

5. **Тест через Telegram** (1 час)
   - [ ] Добавить команду `/form` в бот
   - [ ] Открыть форму через Web App кнопку
   - [ ] Заполнить и отправить
   - [ ] Проверить данные в БД
   - [ ] Проверить уведомления

6. **Исправить найденные проблемы** (2-4 часа)
   - Использовать этот документ как справочник
   - Документировать новые проблемы

### День 3: Документация

7. **Обновить документацию** (30 мин)
   - [ ] Записать найденные проблемы
   - [ ] Записать решения
   - [ ] Обновить README

---

## Команды для быстрой диагностики

```bash
# Проверка файлов
ls -la src/pages/tenant-app.astro
ls -la src/pages/api/tenant-request.ts
ls -la src/components/TenantRequestForm.tsx

# Проверка в git
git status
git ls-files | grep tenant

# Локальная сборка
npm run build 2>&1 | tee build.log

# Проверка доступности
curl -I https://srilanka-37u2.vercel.app/tenant-app

# Проверка Telegram webhook
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

## SQL для проверки

```sql
-- Проверить структуру таблицы
\d tenant_requests

-- Последние заявки
SELECT * FROM tenant_requests ORDER BY created_at DESC LIMIT 5;

-- Статистика
SELECT 
  COUNT(*) as total,
  COUNT(DISTINCT telegram_user_id) as unique_users,
  MAX(created_at) as last_request
FROM tenant_requests;
```

---

## Связанные документы

- `TELEGRAM_BOT_START_COMMAND_FIX.md` - Опыт исправления команды /start
- `TENANT_FORM_SETUP_GUIDE.md` - Первоначальная настройка формы
- `TELEGRAM_WEB_APP_ANALYSIS_2026-01-29.md` - Анализ Web App

---

**Статус документа:** ✅ Готов к использованию  
**Последнее обновление:** 29 января 2026  
**Автор:** Rovo Dev
