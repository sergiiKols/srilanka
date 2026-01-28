# 🚨 Vercel Deployment Troubleshooting Guide
## Руководство по решению проблем деплоя на Vercel

> **Цель:** Быстрая диагностика и решение ошибок деплоя Astro проектов на Vercel
> **Дата создания:** 28 января 2026
> **Основано на:** Реальном опыте устранения ошибки `ERR_MODULE_NOT_FOUND: entry.mjs`

---

## 📋 Checklist: Порядок проверки (сверху вниз!)

### 1️⃣ **ПЕРВЫМ ДЕЛОМ: Build Logs, НЕ Runtime Logs!**

❌ **НЕПРАВИЛЬНО:** Смотреть Runtime logs с ошибками типа:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/dist/server/entry.mjs'
```

✅ **ПРАВИЛЬНО:** Открыть **Build Logs** в Vercel Dashboard:
1. `Deployments` → последний деплой
2. Вкладка **"Building"** или **"Build Logs"**
3. Искать **реальную ошибку билда**

**Почему:** Runtime ошибка `entry.mjs not found` - это **последствие** упавшего билда, а не причина!

---

### 2️⃣ **Проверить: Закоммичена ли папка `.vercel/`?**

**Признак проблемы в Build Logs:**
```
Using prebuilt build artifacts from .vercel/output
```

**Решение:**
```bash
# 1. Удалить локально
rm -rf .vercel

# 2. Добавить в .gitignore
echo ".vercel/" >> .gitignore
echo "dist/" >> .gitignore
echo ".astro/" >> .gitignore

# 3. Удалить из Git
git rm -r --cached .vercel
git add .gitignore
git commit -m "Fix: Remove .vercel from repo, force fresh build"
git push
```

**Почему проблема:** Vercel использует старые закешированные артефакты вместо свежего билда!

---

### 3️⃣ **Проверить: Нет ли ошибок импорта (preact, недостающие модули)?**

**Признак в Build Logs:**
```
[vite]: Rollup failed to resolve import "preact" from "..."
Cannot find module 'some-package'
```

**Решение:**
```bash
# 1. Найти все импорты проблемного модуля
grep -r "from 'preact'" src/

# 2. Заменить на правильные импорты (например, React)
# 3. Или установить недостающий пакет
npm install missing-package

# 4. Проверить локальный билд
npm run build

# 5. Коммит и push
git add .
git commit -m "Fix: Replace preact with React"
git push
```

**Типичные проблемы:**
- Preact вместо React
- Забытые devDependencies в dependencies
- Импорты из несуществующих путей

---

### 4️⃣ **Проверить: astro.config.mjs правильно настроен?**

**Минимальная рабочая конфигурация:**

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server', // Для SSR
  adapter: vercel(),
  integrations: [react()],
  
  vite: {
    ssr: {
      noExternal: ['react', 'react-dom'] // Важно для Vercel!
    }
  }
});
```

**Частые ошибки:**
- ❌ `import vercel from '@astrojs/vercel/serverless'` (deprecated)
- ✅ `import vercel from '@astrojs/vercel'`

- ❌ `output: 'hybrid'` (устарело в новых версиях)
- ✅ `output: 'server'` или `output: 'static'`

---

### 5️⃣ **Проверить: vercel.json конфликтует?**

**Проблема:** `vercel.json` может конфликтовать с `@astrojs/vercel` adapter.

**Решение:**
```bash
# Удалить vercel.json (пусть Astro adapter управляет всем)
git rm vercel.json
git commit -m "Fix: Remove vercel.json, let Astro adapter handle config"
git push
```

**Когда нужен vercel.json:**
- Только для специфичных настроек (переменные окружения, redirects)
- Минимальная конфигурация:
```json
{
  "framework": "astro"
}
```

---

### 6️⃣ **Проверить: package.json имеет правильные scripts?**

**Обязательные скрипты:**
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

**Vercel по умолчанию запускает:** `npm run build`

---

### 7️⃣ **Проверить: .gitignore правильно настроен?**

**Минимальный .gitignore для Astro + Vercel:**
```
node_modules/

# Build output (НЕ должны быть в Git!)
dist/
.astro/
.vercel/

# Environment
.env
.env.local
.env.production

# OS
.DS_Store
```

**Проверка:**
```bash
git ls-files | grep -E "(dist/|.vercel/|.astro/)"
# Должно быть ПУСТО! Если что-то найдено - удалить из Git
```

---

### 8️⃣ **CSS Warnings (не критично, но раздражает)**

**Проблема:**
```
@import url('https://fonts.googleapis.com/css2?family=Inter...')
^-- @import rules must precede all rules aside from @charset
```

**Решение:** Перенести Google Fonts из CSS в HTML:

**global.css:**
```css
/* Удалить @import для шрифтов */
@import "tailwindcss";

:root {
  /* переменные */
}
```

**Layout.astro:**
```html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
```

---

### 9️⃣ **TypeScript Warnings**

**Проблема:**
```
[WARN] "DragEndEvent" is imported but never used
```

**Решение:** Использовать `import type`:
```typescript
// ❌ Неправильно
import { DndContext, DragEndEvent } from '@dnd-kit/core';

// ✅ Правильно
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
```

---

### 🔟 **Триггер принудительного ребилда**

Если все исправлено, но Vercel все еще использует кеш:

**Вариант 1: Пустой коммит**
```bash
git commit --allow-empty -m "Trigger Vercel rebuild"
git push
```

**Вариант 2: Ручной Redeploy в Vercel Dashboard**
1. `Deployments` → последний деплой
2. `...` (меню) → **"Redeploy"**
3. Выбрать **"Redeploy"** (без использования кеша)

---

## 🧪 Тестирование перед деплоем

**Всегда проверять локально:**
```bash
# 1. Очистить кеш
rm -rf dist .astro node_modules/.vite

# 2. Чистый билд
npm run build

# 3. Проверить структуру
ls -la .vercel/output/_functions/
# Должен быть entry.mjs или render.func/

# 4. Preview
npm run preview
```

---

## 📊 Диагностика: Быстрый чеклист

```bash
# Проверка 1: Что в .gitignore?
cat .gitignore | grep -E "(vercel|dist|astro)"

# Проверка 2: Что закоммичено в Git?
git ls-files | grep -E "(vercel|dist)"

# Проверка 3: Локальный билд работает?
npm run build

# Проверка 4: Какой импорт Vercel adapter?
grep "from '@astrojs/vercel" astro.config.mjs

# Проверка 5: Есть ли preact?
grep -r "from 'preact'" src/

# Проверка 6: Структура билда правильная?
ls -R .vercel/output/
```

---

## 🎯 Решение типичных ошибок

### Ошибка: `ERR_MODULE_NOT_FOUND: entry.mjs`

**Причина:** Билд упал ДО создания entry.mjs

**Действия:**
1. ✅ Открыть **Build Logs** (не Runtime!)
2. ✅ Найти реальную ошибку (preact, missing module, etc.)
3. ✅ Исправить ошибку
4. ✅ Проверить `.vercel/` не в Git
5. ✅ Push и ждать нового деплоя

---

### Ошибка: `Rollup failed to resolve import "preact"`

**Причина:** Импорт несуществующего модуля

**Действия:**
1. ✅ Найти все импорты: `grep -r "from 'preact'" src/`
2. ✅ Заменить на React (если нужен React)
3. ✅ Или установить: `npm install preact`
4. ✅ Локальный тест: `npm run build`
5. ✅ Push

---

### Ошибка: `Using prebuilt build artifacts`

**Причина:** `.vercel/` закоммичена в Git

**Действия:**
1. ✅ `git rm -r --cached .vercel`
2. ✅ Добавить в `.gitignore`
3. ✅ Push

---

## 🚀 Финальный чеклист перед деплоем

- [ ] `.gitignore` содержит `.vercel/`, `dist/`, `.astro/`
- [ ] `git ls-files | grep .vercel` возвращает пусто
- [ ] `npm run build` работает локально без ошибок
- [ ] `astro.config.mjs` использует `@astrojs/vercel` (не `/serverless`)
- [ ] `vercel.json` удален (или минимальный)
- [ ] Нет импортов из несуществующих пакетов
- [ ] Build Logs на Vercel не содержат ошибок
- [ ] Runtime logs показывают успешный запуск

---

## 📝 Полезные команды

```bash
# Полная очистка и ребилд
rm -rf dist .astro .vercel node_modules/.vite && npm run build

# Проверка Git статуса build папок
git status --ignored | grep -E "(vercel|dist|astro)"

# Удалить из Git все build артефакты
git rm -r --cached .vercel dist .astro

# Триггер ребилда
git commit --allow-empty -m "Trigger rebuild" && git push

# Проверка импортов
grep -r "import.*from" src/ | grep -v node_modules
```

---

## 🎓 Lessons Learned

### ✅ Что сработало:
1. **Удаление `.vercel/` из репозитория** - критично!
2. **Build Logs > Runtime Logs** - смотреть причину, а не следствие
3. **Минимальная конфигурация** - меньше `vercel.json`, больше доверия Astro adapter
4. **Локальное тестирование** - `npm run build` перед каждым push

### ❌ Что НЕ работает:
1. **Смотреть только Runtime logs** - не покажут причину
2. **Коммитить build артефакты** - создает кеш-проблемы
3. **Сложные `vercel.json` конфиги** - конфликтуют с Astro adapter
4. **Игнорировать warnings** - могут скрывать серьезные проблемы

---

## 🔗 Полезные ссылки

- [Astro Vercel Adapter Docs](https://docs.astro.build/en/guides/integrations-guide/vercel/)
- [Vercel Build Output API](https://vercel.com/docs/build-output-api/v3)
- [Astro Server-side Rendering](https://docs.astro.build/en/guides/server-side-rendering/)

---

**Версия:** 1.0
**Последнее обновление:** 28.01.2026
**Автор:** AI Rovo Dev + Sergii (на основе реального troubleshooting)

---

> 💡 **Совет:** Добавьте этот файл в закладки! При проблемах с Vercel деплоем начинайте с шага 1 и идите по порядку.
