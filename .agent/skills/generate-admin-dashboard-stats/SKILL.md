## Name: Generate Admin Dashboard Stats

## Description:
Сбор метрик для админ-панели

## Purpose:
Собрать сводные цифры: заявки, офферы, конверсия, активные пользователи.

---

## НАЗНАЧЕНИЕ
Генерация метрик для админ-панели

## КОГДА ЗАПУСКАЕТСЯ
- По расписанию (каждые 4 часа)
- При запросе из админ-панели

## ЧТО НА ВХОДЕ
- `period` ('today' | 'week' | 'month')

## ЧТО НА ВЫХОДЕ
```json
{
  "total_requests": 42,
  "total_offers": 156,
  "active_landlords": 23,
  "active_clients": 18,
  "conversion_rate": 3.7,
  "top_locations": [...]
}
```

## ЧТО СИСТЕМА ДЕЛАЕТ
1. COUNT requests за period
2. COUNT offers за period
3. COUNT DISTINCT landlords
4. Расчёт conversion (offers/requests * 100)
5. GROUP BY location
6. Кеширование результатов

## Expected Output
JSON с метриками для панели
