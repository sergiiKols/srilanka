# 📚 UNMISSABLE RENTALS — Полная Документация Проекта

**Дата:** 25 января 2026  
**Структура:** 6 документов + 1 навигация  
**Всего слов:** ~29,000  
**Время чтения:** ~2 часа (или выборочно по ролям)

---

## 🚀 БЫСТРЫЙ СТАРТ

### Новичок в проекте? (45 минут)

1. **📖 [BUSINESS.md](BUSINESS.md)** (20 мин)
   - Суть платформы
   - Бизнес-модель
   - Целевая аудитория

2. **📖 [SYSTEM.md](SYSTEM.md)** → архитектура (10 мин)
   - Tech stack
   - High-level diagram
   - Основные компоненты

3. **📖 [FLOW.md](FLOW.md)** → User journey (15 мин)
   - 10 этапов пути клиента
   - Как это видят разные люди

**Результат:** Полное понимание проекта за 45 минут!

---

## 📖 ВСЕ ДОКУМЕНТЫ (6 файлов)

### 1️⃣ [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) ← СТАРТУЙ ОТСЮДА

**Назначение:** Навигационный указатель  
**Размер:** ~2K слов  
**Время:** 5 минут

**Содержит:**
- Описание всех 5 документов
- Рекомендуемый порядок чтения для каждой роли
- Карта связей между документами

---

### 2️⃣ [BUSINESS.md](BUSINESS.md) 📊

**Для кого?** Product Manager, Инвесторы, Маркетологи  
**Размер:** ~5.5K слов  
**Время:** 20-25 минут

**Содержит:**

✅ Суть проекта (Lead Aggregation, не marketplace)  
✅ 3 целевые сегменты (туристы 90%, крипто-кочевники 10%, собственники)  
✅ 3 Revenue streams (комиссия 4%, премиум $20/мес, спонсоры $50/мес)  
✅ Unit economics и LTV/CAC  
✅ 6 marketing каналов  
✅ 12-месячный roadmap  
✅ Финансовые прогнозы (Year 1-3)

---

### 3️⃣ [SYSTEM.md](SYSTEM.md) 🏗️

**Для кого?** Tech Lead, Backend, DevOps  
**Размер:** ~8K слов  
**Время:** 30-35 минут

**Содержит:**

✅ High-level архитектура (диаграмма)  
✅ Tech stack (Astro, React, Node.js, PostgreSQL, Supabase)  
✅ **ПОЛНАЯ SQL SCHEMA** (8 таблиц с constraints, indexes)  
✅ **REST API ENDPOINTS** (все методы с примерами curl)  
✅ Business logic (matching, posting, routing, bookings)

---

### 4️⃣ [FLOW.md](FLOW.md) 🔄

**Для кого?** Все разработчики, Product Manager, QA  
**Размер:** ~7K слов  
**Время:** 25-30 минут

**Содержит:**

✅ **10 этапов User Journey** (от Discovery до Deal)  
✅ Для каждого этапа: что видит юзер, что делает система, какие данные  
✅ **TELEGRAM BOT INTEGRATION** (commands, keyboards, templates)  
✅ **ADMIN DASHBOARD** (7 страниц управления)

---

### 5️⃣ [FRONTEND.md](FRONTEND.md) 🎨

**Для кого?** Frontend разработчик  
**Размер:** ~5K слов  
**Время:** 20-25 минут

**Содержит:**

✅ Routes & Components tree  
✅ Landing page структура  
✅ **ПОЛНЫЙ КОД ФОРМ** (Tourist + Nomad, 3 шага)  
✅ Map component (Leaflet)  
✅ Tailwind CSS примеры  
✅ Responsive design guidelines

---

### 6️⃣ [OPERATIONS.md](OPERATIONS.md) ⚙️

**Для кого?** DevOps, Security, System Admin  
**Размер:** ~3.5K слов  
**Время:** 15-20 минут

**Содержит:**

✅ Cloud infrastructure (Vercel, Railway, Supabase)  
✅ CI/CD Pipeline (GitHub Actions)  
✅ Database backups & recovery  
✅ GDPR compliance  
✅ Security & fraud prevention  
✅ Monitoring & logging (Sentry, Uptime Robot)  
✅ Deployment checklist

---

## 🎯 ПУТЬ РАЗРАБОТЧИКА

### Backend разработчик:

```
SYSTEM.md — Database schema + API (45 мин)
    ↓
FLOW.md — User journey для контекста (20 мин)
    ↓
BUSINESS.md — Бизнес-логика (15 мин)
```

**Стартовые задачи:**

- [ ] Создать DB schema в Supabase
- [ ] Реализовать `/api/rental-tasks` endpoint
- [ ] Реализовать Telegram bot integration
- [ ] Добавить JWT authentication

---

### Frontend разработчик:

```
FRONTEND.md — Routes + Components + Forms (25 мин)
    ↓
FLOW.md — User journey (15 мин)
    ↓
SYSTEM.md — API endpoints (20 мин)
```

**Стартовые задачи:**

- [ ] Создать landing page (Astro)
- [ ] Реализовать 3-step forms (React)
- [ ] Интегрировать Leaflet map
- [ ] Подключить TanStack Query

---

### DevOps / System Admin:

```
OPERATIONS.md — Infrastructure + CI/CD (20 мин)
    ↓
SYSTEM.md — Tech stack (10 мин)
    ↓
BUSINESS.md — KPIs & metrics (10 мин)
```

**Стартовые задачи:**

- [ ] Настроить Vercel frontend deployment
- [ ] Настроить Railway backend deployment
- [ ] Подключить Supabase PostgreSQL
- [ ] Настроить GitHub Actions CI/CD

---

### Product Manager:

```
BUSINESS.md — Весь документ (25 мин)
    ↓
FLOW.md — User journey (20 мин)
    ↓
SYSTEM.md — архитектура (10 мин)
```

**Ключевые метрики:**

- Users, Bookings, Revenue (см. [BUSINESS.md](BUSINESS.md))
- Conversion rate: 0.1-0.2%
- LTV/CAC ratio: 3.5x
- Breakeven: Month 9

---

## 📊 КРАТКИЙ БИЗНЕС-ОБЗОР

```
МОДЕЛЬ: Lead Aggregation Platform (не marketplace!)

ЦЕЛЕВАЯ АУДИТОРИЯ:
├─ Туристы (90%): $70-150/ночь, 3-14 дней
├─ Крипто-кочевники (10%, HIGH-VALUE): $500-2500/мес
└─ Собственники: источник предложений

REVENUE STREAMS:
├─ 4% комиссия с бронирований (основной доход)
├─ Premium $20/мес для собственников (30% adoption)
└─ Sponsored listing $50/мес (10% adoption)

ФИНАНСОВЫЕ ПРОГНОЗЫ (YEAR 1):
├─ Month 1: $320 revenue
├─ Month 6: $5.4K revenue (cumulative growing)
├─ Month 9: BREAKEVEN ($15K/месяц opex)
├─ Month 12: $21.1K revenue/месяц
└─ TOTAL YEAR 1: $450K - $900K (conservative - optimistic)

КЛЮЧЕВЫЕ ЦИФРЫ:
├─ LTV/CAC: 3.5x (very healthy)
├─ Gross margin: 90%+
├─ Net margin (at scale): 50%+
├─ Target Year 1: 50K users, 800 landlords, 1K+ bookings/месяц

КОНКУРЕНЦИЯ:
└─ NO DIRECT COMPETITORS (unique model combining Telegram + maps + direct payments)
```

---

## 💻 TECH STACK КРАТКИЙ ОБЗОР

```
FRONTEND:
├─ Astro 4 (static generation)
├─ React 18 (interactive components)
├─ Tailwind CSS (styling)
├─ Leaflet (maps)
├─ TanStack Query (data fetching)
└─ Deploy: Vercel

BACKEND:
├─ Node.js 18
├─ Express.js 4
├─ TypeScript
├─ Telegram Bot API (telegraf)
└─ Deploy: Railway.app

DATABASE:
├─ Supabase (PostgreSQL)
├─ 8 core tables
├─ Real-time subscriptions
└─ Automatic daily backups

INFRASTRUCTURE:
├─ Cloudflare (DNS, DDoS, WAF)
├─ Redis (sessions, cache)
├─ SendGrid (email)
├─ Sentry (error tracking)
├─ GitHub Actions (CI/CD)
└─ Cost: ~$100-150/месяц (small scale)
```

---

## ⚠️ ВАЖНО ПЕРЕД СТАРТОМ

### Что НЕ делать ❌

❌ Не берём платежи (платят собственники напрямую)  
❌ Не загружаем фото на сервер (только ссылки)  
❌ Не гарантируем качество (как Craigslist, не Airbnb)  
❌ Не требуем верификацию от туристов (только собственники)

### Что ДЕЛАЕМ ✅

✅ Собираем потребность в форме (клиенты)  
✅ Публикуем в Telegram каналы (автоматизированно)  
✅ Собираем предложения от собственников  
✅ Показываем на персональной карте (Leaflet)  
✅ Облегчаем коммуникацию (Telegram + email)

---

## 🔍 ПОИСК В ДОКУМЕНТАХ

| Нужно найти | Смотреть |
|-----------|---------|
| **Код?** | → [SYSTEM.md](SYSTEM.md) (SQL schema, API examples) + [FRONTEND.md](FRONTEND.md) (React/Astro code) |
| **Бизнес-план?** | → [BUSINESS.md](BUSINESS.md) (всё) |
| **Архитектура?** | → [SYSTEM.md](SYSTEM.md) (диаграмма + tech stack) |
| **Процесс?** | → [FLOW.md](FLOW.md) (user journey, telegram, admin) |
| **DevOps?** | → [OPERATIONS.md](OPERATIONS.md) (deploy, monitoring, security) |
| **Формы?** | → [FRONTEND.md](FRONTEND.md) (complete 3-step form code) |
| **БД?** | → [SYSTEM.md](SYSTEM.md) → DATABASE SCHEMA (полная SQL) |
| **API endpoints?** | → [SYSTEM.md](SYSTEM.md) → API ENDPOINTS (curl примеры) |

---

## 📈 NEXT STEPS (Roadmap)

### Week 1: Подготовка

- [ ] Чтение документов (по ролям)
- [ ] Настройка infrastructure (Railway, Vercel, Supabase)
- [ ] GitHub repo с initial setup

### Week 2-3: Backend Development

- [ ] PostgreSQL schema в Supabase
- [ ] Express.js API setup
- [ ] Telegram Bot basics
- [ ] Database migration scripts

### Week 4: Frontend Development

- [ ] Landing page (Astro)
- [ ] Search forms (React, 3-step)
- [ ] Form validation & submission
- [ ] Map viewer (Leaflet)

### Week 5: Integration & Testing

- [ ] Connect frontend to backend
- [ ] Telegram posting from tasks
- [ ] Email notifications
- [ ] Admin dashboard basics

### Week 6: Launch

- [ ] Deploy to production
- [ ] First 10 users
- [ ] Test end-to-end flow
- [ ] 5-10 landlords onboarding

---

## 📞 ВОПРОСЫ?

Каждый документ организован по темам:

- **Оглавление в начале** (быстрая навигация)
- **Четкие секции** (одна тема = один раздел)
- **Примеры кода** (TypeScript, React, SQL)
- **Диаграммы** (ascii art)
- **Таблицы** (сравнения, конфигурация)

**Если не нашел ответ** → проверь оглавление в нужном документе!

---

## ✅ СТАТУС

```
✅ BUSINESS.md — ГОТОВО
✅ SYSTEM.md — ГОТОВО  
✅ FLOW.md — ГОТОВО
✅ FRONTEND.md — ГОТОВО
✅ OPERATIONS.md — ГОТОВО
✅ DOCUMENTATION_INDEX.md — ГОТОВО

🎯 ИТОГО: 6 документов, ~29K слов, все части проекта покрыты
```

---

## 🎉 НАЧНИ ОТСЮДА!

1. **Открой [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** → выбери свою роль
2. **Прочитай документы** по указанному порядку
3. **Начни с первой задачи** из своего раздела
4. **Возвращайся к документам** при вопросах

**Всё что тебе нужно — здесь!**

---

**Документы готовы к использованию разработчиками, лидами, менеджерами и операционным людьми. Каждый документ может быть прочитан независимо или как часть целого.**

---

**Создано:** 25 января 2026  
**Версия:** 2.0 (ОПЦИЯ 2: 5 модульных файлов)  
**Статус:** PRODUCTION READY ✅
