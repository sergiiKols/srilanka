## Name: Track Offer Metrics

## Description:
Логирование ключевых событий для аналитики

## Purpose:
Отслеживать события (offer создан, просмотрен, выбран) для расчёта метрик.

---

## НАЗНАЧЕНИЕ
Логирование событий в analytics таблицу

## КОГДА ЗАПУСКАЕТСЯ
- Когда создан offer (skill #2)
- Когда клиент открыл карту (skill #5)
- Когда клиент кликнул на маркер

## ЧТО НА ВХОДЕ
- `event_type` ('offer_created' | 'offer_viewed' | 'offer_clicked' | 'offer_contacted')
- `offer_id`
- `request_id`
- `landlord_id`
- `client_id`

## ЧТО НА ВЫХОДЕ
```json
{
  "event_id": 789,
  "logged": true
}
```

## ЧТО СИСТЕМА ДЕЛАЕТ
```sql
INSERT INTO analytics (
  event_type, offer_id, request_id,
  landlord_id, client_id, timestamp
) VALUES (...)
```

## Events:
- `offer_created`: Landlord создал offer
- `offer_viewed`: Клиент открыл карту
- `offer_clicked`: Клиент кликнул на маркер
- `offer_contacted`: Клиент написал в ТГ

## Expected Output
Event записан в БД
