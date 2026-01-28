## Name: Validate Property Data

## Description:
Проверка корректности данных объекта недвижимости перед показом клиенту

## Purpose:
Перед показом property на карте проверить что все данные заполнены корректно.

---

## НАЗНАЧЕНИЕ
Проверка качества данных property перед показом клиенту

## КОГДА ЗАПУСКАЕТСЯ
- После skill #2 (parse-landlord-offer), когда property создана
- Или отдельная проверка перед показом на карте

## ЧТО НА ВХОДЕ
- `property_id` (какой объект проверять)

## ЧТО НА ВЫХОДЕ
```json
{
  "is_valid": true,
  "errors": [],
  "warnings": ["Нет описания"],
  "validation_status": "valid"
}
```

## ЧТО СИСТЕМА ДЕЛАЕТ

### Проверки:
```javascript
const checks = {
  hasName: property.name && property.name.length > 3,
  bedroomsValid: property.bedrooms > 0 && property.bedrooms < 20,
  priceValid: property.price > 0 && property.price < 10000,
  hasPhotos: property.photos && property.photos.length > 0,
  hasAmenities: property.amenities && property.amenities.length > 0,
  coordsValid: isValidCoords(property.lat, property.lng),
  coordsInSriLanka: isInSriLanka(property.lat, property.lng, 20)
};
```

### Обработка результатов:
```javascript
if (!checks.hasName || !checks.hasPhotos) {
  // INVALID - не показывать
  await supabase
    .from('properties')
    .update({ validation_status: 'invalid' })
    .eq('id', property_id);
    
  await notifyLandlord(property.landlord_id, errors);
}
```

## ВАЖНЫЕ ВОПРОСЫ
- **Диапазоны:** Спальни 1-20, Цена $1-10000
- **Радиус Sri Lanka:** 20 км
- **Проверка спама:** Нет (пока)
- **Невалидные данные:** Сохранять как черновик, просить исправить

## Expected Output
Обновлённый статус валидации в БД
