## Name: Geocode Property Location

## Description:
Проверка соответствия текстового адреса и координат property

## Purpose:
Проверить что координаты совпадают с указанным местом, выявить потенциальный обман.

---

## НАЗНАЧЕНИЕ
Проверка соответствия location_text и coords

## КОГДА ЗАПУСКАЕТСЯ
После skill #10 (validate-property-data) или параллельно

## ЧТО НА ВХОДЕ
- `location_text` ("Negombo, Sri Lanka")
- `coords` (lat: 6.927, lng: 80.123)
- `property_id`

## ЧТО НА ВЫХОДЕ
```json
{
  "is_match": true,
  "distance_km": 2.5,
  "verified": true
}
```

## ЧТО СИСТЕМА ДЕЛАЕТ
1. Отправить location_text в Google Geocoding API
2. Получить координаты места
3. Сравнить с введёнными:
   - < 5км → OK
   - 5-50км → warning
   - > 50км → error
4. Уведомить landlord если не совпадает

## Expected Output
Результат проверки + обновление в БД
