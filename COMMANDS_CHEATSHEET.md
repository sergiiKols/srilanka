# 🚀 Шпаргалка команд для настройки БД

## После запуска PostgreSQL контейнера:

### ШАГ 1: Открыть терминал
Нажать кнопку **"Open Terminal"** в интерфейсе БД

---

### ШАГ 2: Подключиться к базе данных
```bash
psql -U postgres -d srilanka
```
*(Введите пароль когда попросит)*

Должно появиться: `srilanka=#`

---

### ШАГ 3: Выполнить инициализацию БД

**Вариант A: Один большой блок (рекомендуется)**

Скопировать весь код из файла `SQL_READY_TO_PASTE.sql` и вставить в терминал.

**Вариант B: По частям (если Вариант A не работает)**

#### Часть 1: UUID расширение
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### Часть 2: Функция токенов
```sql
CREATE OR REPLACE FUNCTION generate_token_6chars()
RETURNS VARCHAR(6) AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(6) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

#### Часть 3: Таблица tenants
```sql
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_user_id BIGINT UNIQUE NOT NULL,
  map_secret_token VARCHAR(6) UNIQUE NOT NULL,
  personal_map_url TEXT UNIQUE,
  saved_properties_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_telegram_id ON tenants(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_token ON tenants(map_secret_token);
```

---

### ШАГ 4: Проверить результат
```sql
\dt
```

Должны увидеть:
```
          List of relations
 Schema |       Name        | Type  |  Owner   
--------+-------------------+-------+----------
 public | saved_properties  | table | postgres
 public | tenants           | table | postgres
```

---

### ШАГ 5: Выйти из psql
```sql
\q
```

---

## ✅ После успешного выполнения:

БД готова! Можно подключать приложение.

**Connection String:**
```
postgresql://postgres:ВАШ_ПАРОЛЬ@traveler-srilankadb-2ua1dz:5432/srilanka
```
