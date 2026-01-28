## Name: Rate Limit Actions (FUTURE)

## Description:
Защита от спама - ограничение количества действий пользователя

## Purpose:
Предотвратить спам заявками/офферами, ограничив количество действий в день.

---

## НАЗНАЧЕНИЕ
Проверка лимитов действий пользователя

## КОГДА ЗАПУСКАЕТСЯ
- Перед созданием заявки (skill #1)
- Перед созданием offer (skill #2)

## ЧТО НА ВХОДЕ
- `user_id`
- `action_type` ('create_request' | 'create_offer')

## ЧТО НА ВЫХОДЕ
```json
{
  "allowed": true,
  "remaining_count": 7
}
```

## ЧТО СИСТЕМА ДЕЛАЕТ
1. Проверить COUNT действий сегодня:
   ```sql
   SELECT COUNT(*) FROM rental_requests
   WHERE client_id = ? AND DATE(created_at) = TODAY
   ```
2. Сравнить с лимитом
3. Если превышен → блокировать

## Лимиты:
- Клиент: max 10 requests/день
- Landlord: max 100 offers/день
- Клиент: max 3 active requests одновременно
- Landlord: max 50 properties

## Expected Output
allowed: true/false + remaining_count
