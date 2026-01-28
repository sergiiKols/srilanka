-- ================================================
-- SEED: Тестовая форма для Telegram Web App
-- ================================================
-- Этот скрипт создаёт тестовую форму для проверки работы системы
-- Запуск: выполнить в Supabase SQL Editor

-- Тестовая форма #1: Форма обратной связи
INSERT INTO form_configs (title, description, fields, message_template, chat_id, is_active)
VALUES (
  'Форма обратной связи',
  'Свяжитесь с нами через эту форму',
  '[
    {
      "id": "name",
      "type": "text",
      "label": "Ваше имя",
      "placeholder": "Введите ваше имя",
      "required": true
    },
    {
      "id": "email",
      "type": "email",
      "label": "Email",
      "placeholder": "your@email.com",
      "required": true,
      "validation": {
        "pattern": "^[^@]+@[^@]+\\.[^@]+$",
        "message": "Введите корректный email"
      }
    },
    {
      "id": "phone",
      "type": "tel",
      "label": "Телефон",
      "placeholder": "+7 (999) 123-45-67",
      "required": false
    },
    {
      "id": "message",
      "type": "textarea",
      "label": "Сообщение",
      "placeholder": "Опишите ваш вопрос или предложение",
      "required": true,
      "validation": {
        "min": 10,
        "message": "Минимум 10 символов"
      }
    }
  ]'::jsonb,
  '🆕 Новая заявка из формы обратной связи

👤 Имя: {name}
📧 Email: {email}
📱 Телефон: {phone}
💬 Сообщение: {message}

🆔 Telegram ID: {userId}
👨‍💼 Username: @{username}',
  NULL, -- chat_id (будет использован из настроек)
  true
)
ON CONFLICT DO NOTHING;

-- Тестовая форма #2: Запрос на бронирование
INSERT INTO form_configs (title, description, fields, message_template, submit_text, is_active)
VALUES (
  'Бронирование недвижимости',
  'Оставьте заявку на просмотр объекта',
  '[
    {
      "id": "full_name",
      "type": "text",
      "label": "Полное имя",
      "placeholder": "Иван Иванов",
      "required": true
    },
    {
      "id": "email",
      "type": "email",
      "label": "Email для связи",
      "placeholder": "ivan@example.com",
      "required": true
    },
    {
      "id": "phone",
      "type": "tel",
      "label": "Телефон",
      "placeholder": "+7 (999) 123-45-67",
      "required": true
    },
    {
      "id": "property_type",
      "type": "select",
      "label": "Тип недвижимости",
      "required": true,
      "options": [
        {"value": "apartment", "label": "Квартира"},
        {"value": "house", "label": "Дом"},
        {"value": "villa", "label": "Вилла"},
        {"value": "land", "label": "Участок"}
      ]
    },
    {
      "id": "budget",
      "type": "select",
      "label": "Бюджет (USD/месяц)",
      "required": false,
      "options": [
        {"value": "300-500", "label": "$300-500"},
        {"value": "500-1000", "label": "$500-1000"},
        {"value": "1000-2000", "label": "$1000-2000"},
        {"value": "2000+", "label": "$2000+"}
      ]
    },
    {
      "id": "move_date",
      "type": "text",
      "label": "Желаемая дата заселения",
      "placeholder": "Например: 15 февраля",
      "required": false
    },
    {
      "id": "comments",
      "type": "textarea",
      "label": "Комментарии",
      "placeholder": "Дополнительные пожелания",
      "required": false
    },
    {
      "id": "agree",
      "type": "checkbox",
      "label": "Я согласен на обработку персональных данных",
      "required": true
    }
  ]'::jsonb,
  '🏠 НОВАЯ ЗАЯВКА НА БРОНИРОВАНИЕ

👤 Имя: {full_name}
📧 Email: {email}
📱 Телефон: {phone}

🏘️ Тип: {property_type}
💰 Бюджет: {budget}
📅 Дата заселения: {move_date}

💬 Комментарии:
{comments}

✅ Согласие на обработку: {agree}

🆔 Telegram: {userId} (@{username})',
  'Отправить заявку',
  true
)
ON CONFLICT DO NOTHING;

-- Тестовая форма #3: Опрос
INSERT INTO form_configs (title, description, fields, message_template, is_active)
VALUES (
  'Опрос о сервисе',
  'Помогите нам стать лучше - ответьте на несколько вопросов',
  '[
    {
      "id": "rating",
      "type": "radio",
      "label": "Как вы оцениваете наш сервис?",
      "required": true,
      "options": [
        {"value": "5", "label": "⭐⭐⭐⭐⭐ Отлично"},
        {"value": "4", "label": "⭐⭐⭐⭐ Хорошо"},
        {"value": "3", "label": "⭐⭐⭐ Удовлетворительно"},
        {"value": "2", "label": "⭐⭐ Плохо"},
        {"value": "1", "label": "⭐ Очень плохо"}
      ]
    },
    {
      "id": "recommend",
      "type": "radio",
      "label": "Порекомендуете ли нас друзьям?",
      "required": true,
      "options": [
        {"value": "yes", "label": "Да, обязательно"},
        {"value": "maybe", "label": "Возможно"},
        {"value": "no", "label": "Нет"}
      ]
    },
    {
      "id": "improvements",
      "type": "textarea",
      "label": "Что нам улучшить?",
      "placeholder": "Ваши предложения",
      "required": false
    },
    {
      "id": "contact",
      "type": "email",
      "label": "Email (если хотите получить ответ)",
      "placeholder": "your@email.com",
      "required": false
    }
  ]'::jsonb,
  '📊 НОВЫЙ ОТЗЫВ

⭐ Оценка: {rating}/5
👍 Рекомендация: {recommend}

💡 Предложения по улучшению:
{improvements}

📧 Контакт: {contact}

🆔 От: {firstName} {lastName} (@{username})',
  true
)
ON CONFLICT DO NOTHING;

-- Проверка: показать созданные формы
SELECT 
  id,
  title,
  description,
  jsonb_array_length(fields) as fields_count,
  is_active,
  created_at
FROM form_configs
ORDER BY created_at DESC
LIMIT 10;
