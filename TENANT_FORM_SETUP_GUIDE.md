# 🚀 TENANT REQUEST FORM: РУКОВОДСТВО ПО УСТАНОВКЕ

**Дата:** 2026-01-28  
**Статус:** ✅ Готово к деплою  

---

## 📦 ЧТО СОЗДАНО

### **1. Конфигурация и валидация:**
- ✅ `src/config/tenantValidationRules.ts` — правила валидации
- ✅ `src/services/tenantValidation.ts` — сервис валидации
- ✅ `src/utils/tenantTranslations.ts` — переводы RU/EN

### **2. React компонент:**
- ✅ `src/components/TenantRequestForm.tsx` — главная форма
- ✅ `src/styles/tenant-form.css` — стили (Lumina + Telegram)
- ✅ `src/pages/tenant-app.astro` — страница формы

### **3. Backend:**
- ✅ `src/pages/api/tenant-request.ts` — API endpoint
- ✅ `supabase_tenant_requests_schema.sql` — SQL миграция

### **4. Документация:**
- ✅ `Design/LUMINA_SYSTEM_DESIGN_MANIFESTO_2026.md`
- ✅ `Design/TENANT_FORM_MOCKUP.md`
- ✅ `Design/TELEGRAM_FORM_OPTIMIZATION_ANALYSIS.md`
- ✅ `Design/TENANT_FORM_FINAL_OPTIMIZED.md`
- ✅ `PROJECT_DOCS/VOICE_TRANSCRIPTION_FEATURE.md` (на будущее)

---

## 🔧 УСТАНОВКА

### **Шаг 1: SQL миграция**

```bash
# 1. Откройте Supabase Dashboard
# 2. SQL Editor → New Query
# 3. Скопируйте содержимое файла:
supabase_tenant_requests_schema.sql

# 4. Выполните SQL
# 5. Проверьте создание таблицы:
SELECT * FROM tenant_requests LIMIT 1;
```

**Что создаётся:**
- Таблица `tenant_requests`
- 5 индексов для быстрого поиска
- 3 триггера (updated_at, published_at)
- RLS политики
- 4 функции (get_user_active_requests, get_tenant_requests_stats, close_expired_requests, user_has_active_request)

---

### **Шаг 2: Environment Variables**

Добавьте в `.env`:

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ADMIN_CHAT_ID=your_admin_chat_id

# Supabase (уже должны быть)
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

### **Шаг 3: Установка зависимостей**

Все зависимости уже должны быть установлены из `package.json`:

```bash
npm install
```

**Проверьте наличие:**
- ✅ `react` >= 18
- ✅ `@supabase/supabase-js`
- ✅ TypeScript

---

### **Шаг 4: Деплой**

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production
npm run preview
```

---

## 🤖 НАСТРОЙКА TELEGRAM БОТА

### **1. Создание кнопки в боте**

В вашем Telegram боте добавьте кнопку:

```javascript
// Пример с node-telegram-bot-api
bot.sendMessage(chatId, 'Выберите действие:', {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: '🏠 Найти жильё',
          web_app: { 
            url: 'https://your-domain.com/tenant-app' 
          }
        }
      ]
    ]
  }
});
```

### **2. Установка Web App URL**

```bash
# 1. Откройте @BotFather
# 2. /mybots → Выберите бота → Bot Settings → Menu Button
# 3. Configure Menu Button → Введите URL:
https://your-domain.com/tenant-app
```

---

## 🧪 ТЕСТИРОВАНИЕ

### **1. Локальное тестирование**

```bash
# 1. Запустите dev server
npm run dev

# 2. Откройте в браузере
http://localhost:4321/tenant-app

# 3. Откройте DevTools Console
# 4. Имитируйте Telegram WebApp:
window.Telegram = {
  WebApp: {
    ready: () => console.log('ready'),
    expand: () => console.log('expand'),
    MainButton: {
      setText: (text) => console.log('setText:', text),
      show: () => console.log('show'),
      // ... остальные методы
    },
    themeParams: {
      bg_color: '#ffffff',
      button_color: '#7C3AED'
    },
    initData: 'mock_init_data',
    initDataUnsafe: {
      user: { id: 123456, first_name: 'Test' }
    }
  }
};
```

### **2. Тестирование в Telegram**

```bash
# 1. Задеплойте на production/staging
npm run build
# Deploy to Vercel/Netlify/etc

# 2. Обновите URL в боте (см. выше)

# 3. Откройте бота в Telegram
# 4. Нажмите кнопку "Найти жильё"
# 5. Проверьте:
   ✅ MainButton внизу экрана
   ✅ Haptic feedback при кликах
   ✅ Автосохранение черновика
   ✅ Прогресс заполнения в MainButton
   ✅ Успешная отправка формы
```

### **3. Тестовые сценарии**

```
Сценарий 1: Полное заполнение
├─ Заполнить все поля
├─ Проверить прогресс (должен быть 100%)
├─ MainButton должна стать активной
└─ Отправить → проверить успешное сохранение в БД

Сценарий 2: Частичное заполнение + черновик
├─ Заполнить 50% полей
├─ Закрыть Web App
├─ Открыть снова
├─ Должен появиться popup "Восстановить черновик?"
└─ Восстановить → данные должны загрузиться

Сценарий 3: Валидация
├─ Ввести дату выезда раньше заезда
├─ Должна появиться ошибка
└─ MainButton должна быть неактивна

Сценарий 4: Переключение языка
├─ Переключить RU → EN
├─ Все тексты должны измениться
└─ MainButton текст должен быть на английском
```

---

## 📊 ПРОВЕРКА РАБОТЫ БД

```sql
-- 1. Проверка таблицы
SELECT * FROM tenant_requests ORDER BY created_at DESC LIMIT 10;

-- 2. Статистика заявок
SELECT get_tenant_requests_stats();

-- 3. Активные заявки пользователя
SELECT * FROM get_user_active_requests(123456789);

-- 4. Закрытие устаревших заявок
SELECT close_expired_requests();
```

---

## 🔍 TROUBLESHOOTING

### **Проблема: MainButton не появляется**

```javascript
// Проверьте в console:
console.log(window.Telegram?.WebApp?.MainButton);

// Если undefined → скрипт Telegram не загрузился
// Решение: проверьте подключение скрипта в <head>:
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

### **Проблема: Форма не отправляется**

```javascript
// 1. Проверьте Network в DevTools
// 2. Ищите запрос POST /api/tenant-request
// 3. Проверьте Response:
{
  "success": false,
  "error": "Invalid Telegram signature"
}

// Решение: В dev режиме отключите проверку подписи:
// В src/pages/api/tenant-request.ts:
if (!BOT_TOKEN) {
  console.warn('Skipping signature validation in dev');
  return true; // Временно для разработки
}
```

### **Проблема: Черновик не сохраняется**

```javascript
// Проверьте CloudStorage:
window.Telegram.WebApp.CloudStorage.getKeys((err, keys) => {
  console.log('CloudStorage keys:', keys);
});

// Если пустой массив → CloudStorage не работает
// Причина: Нужен реальный Telegram (не работает в эмуляторе)
```

### **Проблема: Стили не применяются**

```css
/* Проверьте импорт в tenant-app.astro: */
import '@/styles/tenant-form.css';

/* Если не работает, используйте полный путь: */
import '../styles/tenant-form.css';
```

---

## 🚀 СЛЕДУЮЩИЕ ШАГИ

### **Phase 3: Обработка откликов (следующая задача)**

После успешного деплоя формы арендаторов, следующие задачи:

1. **Публикация запросов** в Telegram канал/группу
2. **Форма для арендодателей** (отклик на запрос)
3. **Матчинг** арендаторов и арендодателей
4. **Уведомления** через бота
5. **Админ-панель** для управления запросами

---

## 📚 ПОЛЕЗНЫЕ ССЫЛКИ

- [Telegram WebApp Documentation](https://core.telegram.org/bots/webapps)
- [Supabase Documentation](https://supabase.com/docs)
- [Lumina Design Manifesto](Design/LUMINA_SYSTEM_DESIGN_MANIFESTO_2026.md)
- [Telegram Form Analysis](Design/TELEGRAM_FORM_OPTIMIZATION_ANALYSIS.md)

---

## ✅ ЧЕКЛИСТ ДЕПЛОЯ

- [ ] SQL миграция выполнена в Supabase
- [ ] Environment variables настроены
- [ ] Приложение задеплоено (production URL)
- [ ] Telegram бот настроен (Web App URL)
- [ ] Тестирование в Telegram успешно
- [ ] MainButton работает корректно
- [ ] HapticFeedback срабатывает
- [ ] CloudStorage сохраняет черновики
- [ ] Форма отправляется и сохраняется в БД
- [ ] Уведомления админу приходят (если настроено)

---

**ГОТОВО К PRODUCTION! 🎉**

*Создано: 2026-01-28*
*Phase 2: COMPLETED ✅*
