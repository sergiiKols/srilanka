# 🎛️ Админ-панель H-Ome Finder - Руководство

## ✅ Что уже создано

### 1. **Структура админ-панели**
```
src/
├── components/admin/
│   ├── AdminLayout.tsx          ✅ Базовый layout с sidebar
│   └── URLExpander.tsx          ✅ Компонент разворота ссылок
│
└── pages/admin/
    ├── index.astro              ✅ Dashboard (главная)
    └── tools/
        └── url-expander.astro   ✅ Страница URL Expander
```

### 2. **Доступные страницы**

#### 📊 Dashboard - `/admin`
- Статистика: POI, Properties, Users
- Статус системы (Supabase, Google Maps, Groq, Perplexity, Telegram)
- Последние активности
- Быстрые действия

#### 🔗 URL Expander - `/admin/tools/url-expander`
- **Работающая функция**: разворот коротких ссылок через Perplexity API
- Примеры для тестирования
- **Раздел Telegram (неактивный)**: 
  - Bot Token
  - API ID/Hash
  - Phone Number
  - Session String
  - Channel/Group IDs
  - Настройки функций

---

## 🚀 Как запустить

### Запуск dev сервера:
```bash
npm run dev
# или
npx astro dev
```

Сервер запустится на: **http://localhost:4321**

### Страницы для тестирования:
- 📊 Dashboard: http://localhost:4321/admin
- 🔗 URL Expander: http://localhost:4321/admin/tools/url-expander

---

## 🔑 Функционал URL Expander

### Что работает:
✅ Разворот коротких ссылок (bit.ly, goo.gl, t.co, tinyurl)
✅ Использует Perplexity API
✅ Показывает время обработки
✅ Копирование результата в буфер
✅ Открытие в новой вкладке

### Пример использования:
1. Открыть `/admin/tools/url-expander`
2. Вставить короткую ссылку: `https://bit.ly/3example`
3. Нажать "🔗 Expand URL"
4. Получить развернутую ссылку

---

## 📱 Telegram Integration (будущее)

### Поля для настройки (пока неактивны):

#### 🤖 Bot Configuration
- **Bot Token** - токен от @BotFather
- **Bot Username** - имя бота (@YourBot)
- **Webhook URL** - для получения обновлений

#### 👤 User Client API
- **API ID** - от my.telegram.org
- **API Hash** - хеш приложения
- **Phone Number** - номер аккаунта
- **Session String** - строка сессии (генерируется)

#### 📢 Channels & Groups
- **Main Channel ID** - основной канал (-1001234567890)
- **Admin Chat ID** - админский чат для логов
- **Backup Channel ID** - резервный канал

#### ⚙️ Features (чекбоксы)
- Enable auto-posting to channel
- Send parsing notifications
- Enable inline search via bot
- Allow user submissions via bot
- Auto-expand short URLs in messages

---

## 🎨 Дизайн и UI

### Sidebar Navigation
- 📊 Dashboard
- 🔑 API Settings (будет создана)
- 🔗 URL Expander ✅
- 📍 POI Management (будет создана)
- 🔄 Parsing System (будет создана)
- 👥 Users (будет создана)
- ⚙️ Settings (будет создана)

### Цветовая схема
- Фон: `#f5f5f5`
- Sidebar: `#1a1a1a`
- Активный пункт: `#3b82f6`
- Карточки: белые с тенями
- Статусы: зеленый (active), желтый (idle), красный (inactive)

---

## 🔐 Security (TODO)

### Требуется добавить:
```typescript
// src/middleware/adminAuth.ts
export async function requireAdmin(request: Request) {
  const session = await getSession(request);
  
  if (!session) {
    return Response.redirect('/login');
  }
  
  const { data: user } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', session.user.id)
    .single();
  
  if (user?.role !== 'admin') {
    return Response.redirect('/?error=unauthorized');
  }
  
  return null;
}
```

В каждой странице админки:
```astro
---
// В начале файла
import { requireAdmin } from '../../middleware/adminAuth';
const authCheck = await requireAdmin(Astro.request);
if (authCheck) return authCheck;
---
```

---

## 📋 Следующие шаги

### Приоритет 1 (MVP - 1 неделя):
- [ ] Добавить authentication middleware
- [ ] Создать `/admin/api-settings` - управление API ключами
- [ ] Подключить реальные данные к Dashboard (из Supabase)
- [ ] Создать `/admin/pois` - таблица POI с фильтрами

### Приоритет 2 (2 недели):
- [ ] Создать `/admin/parsing` - управление парсингом
- [ ] Добавить POI Editor
- [ ] Создать `/admin/users` - управление пользователями
- [ ] Analytics Dashboard

### Приоритет 3 (когда будет готов Telegram):
- [ ] Активировать Telegram поля
- [ ] Создать API endpoints для Telegram
- [ ] Добавить BotFather integration
- [ ] Session management для Client API

---

## 🐛 Известные ограничения

1. **Нет аутентификации** - сейчас любой может зайти на `/admin`
2. **Статичные данные** - Dashboard показывает моковые данные
3. **Telegram неактивен** - все поля disabled
4. **Нет real-time обновлений** - нужен WebSocket для live logs

---

## 💡 Полезные команды

```bash
# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build

# Preview prod build
npm run preview

# Парсинг POI
npm run parse:negombo-tangalle

# Проверка типов
npx astro check
```

---

## 📚 Документация

- **Полная структура**: `ADMIN_PANEL_STRUCTURE.md`
- **Astro Docs**: https://docs.astro.build
- **React Components**: используем React 19
- **Styling**: TailwindCSS + styled-jsx

---

## 🤝 Вопросы?

Если нужна помощь:
1. Проверь `ADMIN_PANEL_STRUCTURE.md` - там детальный план
2. Посмотри `src/components/admin/URLExpander.tsx` - пример рабочего компонента
3. Изучи `src/pages/admin/index.astro` - Dashboard как reference

---

## 🎉 Готово к использованию!

Админ-панель создана и готова к расширению. URL Expander Tool работает прямо сейчас!

**Запускай и тестируй**: `npm run dev` → http://localhost:4321/admin
