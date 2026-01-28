# 🏗️ ПОЛНАЯ АРХИТЕКТУРА ПРОЕКТА: UNMISSABLE RENTALS

**Версия:** 1.0  
**Дата:** 25 января 2026  
**Статус:** БАЗОВЫЙ ДОКУМЕНТ ДЛЯ РАЗРАБОТКИ  
**Аудитория:** Разработчики, Product Manager, Tech Lead

---

## 📋 ОГЛАВЛЕНИЕ

1. [Обзор Проекта](#обзор-проекта)
2. [Бизнес-Модель](#бизнес-модель)
3. [Целевая Аудитория](#целевая-аудитория)
4. [Архитектура Системы](#архитектура-системы)
5. [Flow: От Клиента к Сделке](#flow-от-клиента-к-сделке)
6. [Структура Базы Данных](#структура-базы-данных)
7. [Frontend: Веб-Сайт](#frontend-веб-сайт)
8. [Frontend: Telegram Web App](#frontend-telegram-web-app)
9. [Backend: API & Logic](#backend-api--logic)
10. [Telegram Integration](#telegram-integration)
11. [Админка: Dashboard](#админка-dashboard)
12. [Маркетинг & Распределение](#маркетинг--распределение)
13. [Monetization Strategy](#monetization-strategy)
14. [Security & Compliance](#security--compliance)
15. [Deployment & DevOps](#deployment--devops)
16. [Roadmap: 12 месяцев](#roadmap-12-месяцев)

---

## 📌 ОБЗОР ПРОЕКТА

### Суть Проекта

**UNMISSABLE RENTALS** — это **платформа агрегирования спроса и предложения** для краткосрочной и среднесрочной аренды жилья.

```
КЛИЕНТ ЗАПОЛНЯЕТ ФОРМУ
    ↓
ЗАДАЧА В TELEGRAM КАНАЛ
    ↓
СОБСТВЕННИКИ ОТКЛИКАЮТСЯ
    ↓
МАРКЕР НА ПЕРСОНАЛЬНОЙ КАРТЕ
    ↓
КЛИЕНТ ВИДИТ И ВЫБИРАЕТ
    ↓
ПРЯМАЯ СВЯЗЬ В TELEGRAM
    ↓
DEAL (вне платформы)
```

### Ключевые Особенности

| Аспект | Описание |
|--------|----------|
| **Модель** | Lead Aggregation + Communication Platform (НЕ marketplace) |
| **Платежи** | Вне платформы (клиент и собственник договариваются напрямую) |
| **Монетизация** | Premium подписка для собственников ИЛИ плата за размещение запроса |
| **Основная аудитория** | Туристы (90%) + Крипто-кочевники (10%, но high-value) |
| **География** | Bali, Thailand, Sri Lanka (и расширение) |
| **Каналы дистрибуции** | Telegram, Web, Google Search, Nomad List, Reddit |

---

## 💰 БИЗНЕС-МОДЕЛЬ

### Как Это Работает: Экономика

```
┌────────────────────────────────────────────────┐
│           REVENUE STREAMS (2 варианта)        │
├────────────────────────────────────────────────┤
│                                                │
│ OPTION 1: LANDLORD PREMIUM (Рекомендуется)   │
│  ├─ Собственники платят $20-50/месяц за     │
│  │  доступ к запросам клиентов              │
│  ├─ "Verified landlord" бейдж + приоритет   │
│  ├─ 500 собственников = $10K-25K/месяц      │
│  └─ Passive income, легко масштабировать    │
│                                                │
│ OPTION 2: PAY-PER-REQUEST                     │
│  ├─ Клиенты платят $5-10 за размещение      │
│  │  запроса в целевых группах               │
│  ├─ Или Freemium: 3 бесплатных, далее $10   │
│  ├─ 1,000 запросов/месяц = $5K-10K          │
│  └─ Простая модель, без tracking сделок     │
│                                                │
│ OPTION 3: SPONSORED LISTINGS (Дополнение)     │
│  ├─ Премиум собственники платят за           │
│  │  "Featured" на карте (красный маркер)    │
│  ├─ Цена: $50-100/месяц за объект           │
│  └─ Дополнительный доход                    │
│                                                │
└────────────────────────────────────────────────┘
```

### Unit Economics (Год 1)

```
ASSUMPTIONS:
  Monthly Requests: 200 (month 1) → 1,000 (month 12)
  Landlords: 50 (month 1) → 500 (month 12)
  Premium Landlord Price: $30/month
  Pay-per-Request: $7/request (50% платят)

MONTH 1:
  Requests: 200 × 50% × $7 = $700
  Premium Landlords: 20 × $30 = $600
  Revenue: $1,300/month

MONTH 6:
  Requests: 600 × 50% × $7 = $2,100
  Premium Landlords: 200 × $30 = $6,000
  Revenue: $8,100/month

MONTH 12:
  Requests: 1,000 × 50% × $7 = $3,500
  Premium Landlords: 500 × $30 = $15,000
  Sponsored Listings: 50 × $75 = $3,750
  Revenue: $22,250/month

ANNUAL REVENUE (Year 1): ~$100,000 - $150,000
  (реалистичная оценка без tracking бронирований)
```

### Profit Margins

```
Revenue: $100,000 (Year 1)
  ├─ Server/Infrastructure: -$2,000 (2%)
  ├─ Payment Processing: -$2,000 (2%)
  ├─ Marketing: -$15,000 (15%)
  ├─ Team (1 dev, 1 support): -$30,000 (30%)
  └─ Contingency: -$5,000 (5%)
  ──────────────────────
  NET PROFIT: $46,000 (46%)

By Year 3 (with $500K-800K revenue):
  Profit margin: 60-70% (subscription model более прибыльный)
```

---

