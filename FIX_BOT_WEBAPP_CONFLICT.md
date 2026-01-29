# 🔧 ИСПРАВЛЕНИЕ: Конфликт Web App и Webhook

**Проблема:** У бота настроено Web App, которое конфликтует с webhook!

---

## 📱 ШАГ 1: Отключить Web App через BotFather

1. **Откройте Telegram**
2. **Найдите @BotFather**
3. **Отправьте:** `/mybots`
4. **Выберите вашего бота** (AI_Tech_Lab или как он называется)
5. **Нажмите:** `Bot Settings`
6. **Нажмите:** `Menu Button`
7. **Выберите:** `Remove Menu Button` или `Commands`

---

## 🔗 ШАГ 2: Настроить Commands вместо Web App

В BotFather:

1. **Выберите бота**
2. **Нажмите:** `Edit Commands`
3. **Отправьте список команд:**

```
start - Начать работу сботом
help - Помощь
stats - Статистика
map - Моя карта
```

4. **Отправьте**

---

## ✅ ШАГ 3: Очистить pending updates

После отключения Web App, очистите очередь сообщений:

**PowerShell:**
```powershell
$botToken = "7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8"

# Удалить webhook временно
Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/deleteWebhook" -Method Post

# Получить и пропустить pending updates
Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getUpdates?offset=-1" -Method Get

# Установить webhook заново
$webhookUrl = "https://srilanka-37u2-a7jurihfa-sergiis-projects-48df2a28.vercel.app/api/telegram-webhook"
Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/setWebhook" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{url = $webhookUrl} | ConvertTo-Json)
```

---

## 🧪 ШАГ 4: Тест

1. Отправьте боту: `/start`
2. Бот должен ответить!

---

## 📋 АЛЬТЕРНАТИВА: Если не хотите отключать Web App

Можно оставить Web App, но настроить его правильно:

1. **BotFather → Bot Settings → Menu Button**
2. **Выберите:** `Edit Menu Button URL`
3. **Введите URL:** `https://srilanka-37u2-a7jurihfa-sergiis-projects-48df2a28.vercel.app/tenant-app`
4. **Введите текст кнопки:** `🏠 Найти жильё`

Тогда:
- Кнопка Web App будет работать
- Команды /start, /help тоже будут работать через webhook

---

Попробуйте! 🚀
