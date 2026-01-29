# 🚀 БЫСТРЫЙ СТАРТ - Telegram Bot для Арендаторов

**Дата:** 2026-01-29  
**Статус БД:** ✅ Таблицы созданы, ❌ Storage bucket нужен

---

## ШАГ 1: Создать Storage Bucket (СЕЙЧАС!) ⚡

### Скопируйте и выполните в Supabase SQL Editor:

```sql
-- 1. Создать bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant-photos',
  'tenant-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Публичный доступ на чтение
CREATE POLICY "Public read access for tenant photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'tenant-photos');

-- 3. Сервис может загружать
CREATE POLICY "Service role can upload tenant photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tenant-photos' 
  AND (auth.role() = 'service_role' OR auth.role() = 'authenticated')
);

-- 4. Сервис может удалять
CREATE POLICY "Service role can delete tenant photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'tenant-photos' AND auth.role() = 'service_role');

-- 5. Проверка
SELECT id, name, public FROM storage.buckets WHERE id = 'tenant-photos';
```

### ✅ Должно вернуть:
```
id            | name          | public
tenant-photos | tenant-photos | true
```

---

## ШАГ 2: Начать разработку бота (ПОСЛЕ создания bucket)

### ✅ Что уже готово:
- Таблицы `tenants`, `saved_properties` ✅
- Функция `generate_token_6chars()` ✅
- Триггеры для счётчиков ✅
- Telegram Bot Token ✅

### 🆕 Что нужно создать:
1. `src/lib/tenant-bot-utils.ts` - утилиты
2. `src/lib/tenant-bot-db.ts` - работа с БД
3. `src/lib/telegram-forward-parser.ts` - парсинг forward
4. `src/lib/property-parser.ts` - парсинг описания
5. `src/lib/telegram-photo-uploader.ts` - загрузка фото
6. `src/pages/api/telegram-webhook.ts` - webhook endpoint

---

## 🎯 ТЕКУЩИЙ СТАТУС

```
✅ Таблицы БД           → ГОТОВО
✅ Функции БД           → ГОТОВО
✅ Триггеры             → ГОТОВО
✅ Telegram Bot Token   → ГОТОВО
❌ Storage Bucket       → НУЖНО СОЗДАТЬ (5 минут)
❌ Код бота             → СОЗДАДИМ ПОСЛЕ BUCKET
```

---

## 📋 ДЕЙСТВИЯ СЕЙЧАС

**1. Создайте Storage Bucket** (скрипт выше)  
**2. Покажите результат проверки**  
**3. Я начну создавать код бота!** 🚀

---

Готовы? Выполните скрипт создания bucket! ⚡
