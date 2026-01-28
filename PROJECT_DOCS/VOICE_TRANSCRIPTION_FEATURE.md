# 🎤 ГОЛОСОВЫЕ СООБЩЕНИЯ: ТЕХНИЧЕСКАЯ ДОКУМЕНТАЦИЯ

**Статус:** 📋 Готово к реализации (по запросу)  
**Ключевые слова:** `голос`, `голосовое сообщение`, `транскрибация`, `voice`, `transcription`, `whisper`

---

## 📋 КОНТЕКСТ

Возможность для клиентов оставлять **дополнительные пожелания** не только текстом, но и **голосовым сообщением** с автоматической транскрибацией в текст.

**Применение:**
- Форма запроса на бронирование (арендаторы)
- Быстрый ввод без набора текста
- Удобство для мобильных пользователей

---

## 🎯 ДВА ВАРИАНТА РЕАЛИЗАЦИИ

### **Вариант A: Через Telegram бота (РЕКОМЕНДУЕТСЯ для MVP)**

**Преимущества:**
- ✅ Не нужен доступ к микрофону в браузере
- ✅ Используем встроенную запись Telegram (качественная)
- ✅ Привычный UX для пользователей Telegram
- ✅ Автоматическое сжатие и оптимизация аудио

**Workflow:**
```
1. Клиент в Web App → "🎤 Записать голосом"
2. Показываем инструкцию: "Отправьте голосовое сообщение боту"
3. Клиент → отправляет voice message боту
4. Бот → скачивает файл (OGG format)
5. Отправка на Whisper API → транскрибация
6. Результат сохраняется и показывается в форме
7. Клиент → проверяет текст → может отредактировать
```

---

### **Вариант B: Web Audio API (автономная запись в форме)**

**Преимущества:**
- ✅ Не нужно переключаться между Web App и ботом
- ✅ Более быстрый процесс

**Минусы:**
- ⚠️ Нужно разрешение на микрофон (пугает пользователей)
- ⚠️ Разные форматы аудио в разных браузерах
- ⚠️ Дополнительная конвертация на сервере

**Код компонента:**

```typescript
// src/components/VoiceRecorder.tsx

import { useState, useRef } from 'react';

export function VoiceRecorder({ onTranscription }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorder = useRef(null);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      const chunks = [];
      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Отправка на транскрибацию
        await transcribeAudio(blob);
      };
      
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('Нет доступа к микрофону');
    }
  };
  
  const stopRecording = () => {
    mediaRecorder.current.stop();
    setIsRecording(false);
  };
  
  const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.webm');
    
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });
    
    const { text } = await response.json();
    onTranscription(text);
  };
  
  return (
    <div className="voice-recorder">
      {!isRecording ? (
        <button onClick={startRecording}>
          🎤 Записать голосом
        </button>
      ) : (
        <button onClick={stopRecording} className="recording">
          ⏹️ Остановить запись
        </button>
      )}
      
      {audioBlob && <p>✅ Запись готова, обрабатываем...</p>}
    </div>
  );
}
```

---

## 🤖 СЕРВИСЫ ТРАНСКРИБАЦИИ

### **1. Groq Whisper (РЕКОМЕНДУЕТСЯ для MVP)**

**Преимущества:**
- ✅ **БЕСПЛАТНО** (есть бесплатный tier)
- ✅ Быстрее OpenAI Whisper (оптимизированное железо)
- ✅ Та же модель Whisper, что у OpenAI
- ✅ Поддержка 50+ языков (RU, EN)

**Лимиты:** 14,400 минут/день (достаточно для большинства проектов)

**Код:**

```typescript
// src/services/transcription.ts

import Groq from 'groq-sdk';
import fs from 'fs';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function transcribeVoiceMessage(
  audioFilePath: string, 
  language: 'ru' | 'en' = 'ru'
) {
  const audioFile = fs.createReadStream(audioFilePath);
  
  const transcription = await groq.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-large-v3',
    language: language,
    response_format: 'json'
  });
  
  return transcription.text;
}
```

---

### **2. OpenAI Whisper**

**Преимущества:**
- ✅ Отличное качество распознавания
- ✅ Поддержка 50+ языков
- ✅ Автоопределение языка
- ✅ Работает с Telegram voice format (OGG/Opus)

**Стоимость:** $0.006 за минуту (~$0.36 за час)

**Код:**

```typescript
// src/services/transcription.ts

import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function transcribeVoiceMessage(
  audioFilePath: string, 
  language: 'ru' | 'en' = 'ru'
) {
  const audioFile = fs.createReadStream(audioFilePath);
  
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: language,  // или 'auto' для автоопределения
    response_format: 'json'
  });
  
  return transcription.text;
}
```

---

### **3. Google Cloud Speech-to-Text**

**Преимущества:**
- ✅ Очень точное распознавание
- ✅ Поддержка контекстных подсказок
- ✅ Streaming (распознавание в реальном времени)

**Стоимость:** $0.024 за минуту (~$1.44 за час)

**Код:**

```typescript
// src/services/transcription.ts

import speech from '@google-cloud/speech';

const client = new speech.SpeechClient();

export async function transcribeVoiceMessage(
  audioBuffer: Buffer, 
  language: 'ru-RU' | 'en-US' = 'ru-RU'
) {
  const audio = {
    content: audioBuffer.toString('base64')
  };
  
  const config = {
    encoding: 'OGG_OPUS',  // Telegram format
    sampleRateHertz: 16000,
    languageCode: language,
    enableAutomaticPunctuation: true,
    model: 'latest_long'
  };
  
  const request = { audio, config };
  const [response] = await client.recognize(request);
  
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  
  return transcription;
}
```

---

### **4. Yandex SpeechKit**

**Преимущества:**
- ✅ Отличное качество для русского языка
- ✅ Дешевле конкурентов для RU

**Стоимость:** ₽0.24 за минуту (~₽14.4 за час)

---

## 💰 СРАВНЕНИЕ СТОИМОСТИ

| Сервис | Стоимость/мин | Качество RU | Качество EN | Free tier |
|--------|---------------|-------------|-------------|-----------|
| **Groq Whisper** | **FREE** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 14,400 мин/день |
| **OpenAI Whisper** | $0.006 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Нет |
| Google Speech | $0.024 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 60 мин/месяц |
| Yandex SpeechKit | ₽0.24 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Нет |

**Рекомендация:** **Groq Whisper** (бесплатно + отличное качество)

---

## 📊 СТРУКТУРА БД (дополнительные поля)

```sql
-- Добавить в таблицу tenant_requests:

ALTER TABLE tenant_requests ADD COLUMN IF NOT EXISTS
  additional_requirements TEXT,              -- текстовые пожелания
  voice_message_file_id TEXT,                -- Telegram file_id (если есть)
  voice_message_transcription TEXT,          -- распознанный текст
  voice_message_duration_seconds INT,        -- длительность записи
  voice_message_language TEXT,               -- язык записи (ru/en)
  has_voice_message BOOLEAN DEFAULT false,
  transcription_status TEXT DEFAULT 'none';  -- none, processing, completed, failed
```

---

## 🔄 ПОЛНЫЙ WORKFLOW (Вариант A — через бота)

```
1. Клиент заполняет форму в Web App
   └─> Доходит до поля "Дополнительные пожелания"

2. Клиент видит:
   ├─ 📝 Текстовое поле
   └─> 🎤 Кнопка "Записать голосом"

3. Клиент кликает "🎤 Записать голосом"
   └─> Показываем инструкцию:
       "Отправьте голосовое сообщение боту @YourBot"
       [✉️ Открыть бота]

4. Клиент → закрывает Web App → открывает бота
   └─> Записывает голосовое сообщение
   └─> Отправляет боту

5. Бот получает voice message:
   ├─ Telegram Bot API → file_id
   ├─ Скачиваем файл: getFile(file_id)
   ├─ Сохраняем временно в /tmp
   └─> Отправка на Groq Whisper API

6. Groq Whisper → возвращает текст:
   "Нужна детская кроватка и тихое место подальше от дороги"

7. Бот → сохраняет транскрипцию:
   ├─ UPDATE tenant_requests SET voice_message_transcription = '...'
   └─> transcription_status = 'completed'

8. Клиент → возвращается в Web App
   └─> Polling проверяет статус транскрибации
   └─> Автоматически подтягивается текст
   └─> Показывается в поле "Дополнительные пожелания"

9. Клиент → проверяет/редактирует текст → Submit
```

---

## 📝 КОД ДЛЯ ИНТЕГРАЦИИ В ФОРМУ

```typescript
// src/components/TenantRequestForm.tsx

export function TenantRequestForm() {
  const [additionalReqs, setAdditionalReqs] = useState('');
  const [voiceTranscription, setVoiceTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const requestId = useRef(generateUUID());
  
  const handleVoiceRecording = () => {
    // Перенаправление в бота с уникальным ID запроса
    const botUrl = `https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}?start=voice_${requestId.current}`;
    window.open(botUrl, '_blank');
    
    // Начинаем polling для проверки транскрипции
    pollForTranscription(requestId.current);
  };
  
  const pollForTranscription = async (reqId: string) => {
    setIsTranscribing(true);
    
    const interval = setInterval(async () => {
      const response = await fetch(`/api/check-transcription?id=${reqId}`);
      const { transcription, status } = await response.json();
      
      if (status === 'completed') {
        setVoiceTranscription(transcription);
        setIsTranscribing(false);
        clearInterval(interval);
      } else if (status === 'failed') {
        alert('Ошибка транскрибации. Попробуйте ещё раз.');
        setIsTranscribing(false);
        clearInterval(interval);
      }
    }, 2000);  // проверяем каждые 2 секунды
    
    // Таймаут 5 минут
    setTimeout(() => {
      clearInterval(interval);
      setIsTranscribing(false);
    }, 5 * 60 * 1000);
  };
  
  return (
    <form>
      {/* ... предыдущие поля ... */}
      
      <div className="additional-requirements">
        <label>{t('additional_requirements')}</label>
        
        <textarea
          value={additionalReqs || voiceTranscription}
          onChange={(e) => setAdditionalReqs(e.target.value)}
          placeholder={t('additional_requirements_placeholder')}
          rows={4}
        />
        
        <button 
          type="button" 
          onClick={handleVoiceRecording}
          disabled={isTranscribing}
          className="voice-button"
        >
          {isTranscribing ? (
            <>🔄 Обрабатываем запись...</>
          ) : (
            <>🎤 Записать голосом</>
          )}
        </button>
        
        {voiceTranscription && (
          <div className="transcription-result">
            ✅ Распознано: "{voiceTranscription}"
            <small>Вы можете отредактировать текст выше</small>
          </div>
        )}
        
        <div className="examples">
          <small>
            Примеры:
            <ul>
              <li>"Нужна детская кроватка"</li>
              <li>"Предпочитаем тихое место"</li>
              <li>"Работаем удалённо, нужен хороший WiFi"</li>
            </ul>
          </small>
        </div>
      </div>
      
      <button type="submit">🚀 Найти жильё</button>
    </form>
  );
}
```

---

## 🛠️ API ENDPOINTS

### **POST /api/transcribe**

Обработка голосового сообщения от Telegram бота.

```typescript
// src/pages/api/transcribe.ts

import { transcribeVoiceMessage } from '@/services/transcription';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { file_id, request_id, user_id, language } = await req.json();
  
  try {
    // 1. Скачиваем файл из Telegram
    const fileUrl = await getTelegramFileUrl(file_id);
    const audioBuffer = await downloadFile(fileUrl);
    
    // 2. Сохраняем временно
    const tempPath = `/tmp/${file_id}.ogg`;
    await fs.promises.writeFile(tempPath, audioBuffer);
    
    // 3. Транскрибация
    const transcription = await transcribeVoiceMessage(tempPath, language);
    
    // 4. Сохраняем в БД
    await supabase
      .from('tenant_requests')
      .update({
        voice_message_file_id: file_id,
        voice_message_transcription: transcription,
        transcription_status: 'completed',
        has_voice_message: true
      })
      .eq('id', request_id);
    
    // 5. Удаляем временный файл
    await fs.promises.unlink(tempPath);
    
    return Response.json({ success: true, transcription });
    
  } catch (error) {
    console.error('Transcription error:', error);
    
    await supabase
      .from('tenant_requests')
      .update({ transcription_status: 'failed' })
      .eq('id', request_id);
    
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

---

### **GET /api/check-transcription**

Проверка статуса транскрибации (для polling).

```typescript
// src/pages/api/check-transcription.ts

import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get('id');
  
  const { data, error } = await supabase
    .from('tenant_requests')
    .select('voice_message_transcription, transcription_status')
    .eq('id', requestId)
    .single();
  
  if (error) {
    return Response.json({ status: 'not_found' }, { status: 404 });
  }
  
  return Response.json({
    status: data.transcription_status,
    transcription: data.voice_message_transcription
  });
}
```

---

## 📦 НЕОБХОДИМЫЕ ПАКЕТЫ

```bash
# Для Groq Whisper
npm install groq-sdk

# Для OpenAI Whisper
npm install openai

# Для Google Speech-to-Text
npm install @google-cloud/speech

# Для работы с файлами
npm install node-fetch
```

---

## 🔐 ENVIRONMENT VARIABLES

```bash
# .env

# Groq (рекомендуется)
GROQ_API_KEY=gsk_xxxxxxxxxxxxx

# Или OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Или Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Telegram Bot
TELEGRAM_BOT_TOKEN=xxxx:yyyyyyyyyyy
NEXT_PUBLIC_BOT_USERNAME=YourBotUsername
```

---

## 🎯 ПЛАН ВНЕДРЕНИЯ (когда понадобится)

### **Шаг 1: Подготовка (30 мин)**
- [ ] Установить `groq-sdk`
- [ ] Получить API ключ Groq
- [ ] Добавить поля в таблицу `tenant_requests`

### **Шаг 2: Сервис транскрибации (1 час)**
- [ ] Создать `src/services/transcription.ts`
- [ ] Реализовать функцию `transcribeVoiceMessage()`
- [ ] Добавить обработку ошибок

### **Шаг 3: API Endpoints (1.5 часа)**
- [ ] Создать `/api/transcribe` для обработки голоса
- [ ] Создать `/api/check-transcription` для polling
- [ ] Интеграция с Telegram Bot API

### **Шаг 4: UI компонент (2 часа)**
- [ ] Добавить кнопку "🎤 Записать голосом"
- [ ] Реализовать polling механизм
- [ ] Показ статуса "Обрабатываем..."
- [ ] Автозаполнение поля транскрипцией

### **Шаг 5: Telegram Bot Handler (1 час)**
- [ ] Обработчик voice message в боте
- [ ] Привязка к request_id
- [ ] Вызов API транскрибации

### **Шаг 6: Тестирование (1 час)**
- [ ] Тест на русском языке
- [ ] Тест на английском языке
- [ ] Тест редактирования транскрипции
- [ ] Тест таймаутов и ошибок

**Итого:** ~7 часов разработки

---

## 🚀 БУДУЩИЕ УЛУЧШЕНИЯ

1. **Streaming транскрипция** — показываем текст в реальном времени
2. **AI улучшение** — исправление ошибок, форматирование
3. **Голосовые команды** — "Добавить фильтр: только виллы"
4. **Поддержка других языков** — французский, немецкий, испанский
5. **Прямая запись в Web App** (без перехода в бота)

---

## 📚 ПОЛЕЗНЫЕ ССЫЛКИ

- [Groq Whisper Documentation](https://console.groq.com/docs/speech-text)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [Telegram Bot API - Voice Messages](https://core.telegram.org/bots/api#voice)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**Документ готов к использованию при необходимости добавления голосовых сообщений!**

*Последнее обновление: 2026-01-28*
