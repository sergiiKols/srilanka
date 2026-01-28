# LUMINA SYSTEM DESIGN MANIFESTO 2026

## 1. КОНЦЕПЦИЯ: BRIGHT CONFIDENCE

**Философия:** Интерфейс как прозрачный слой между ИИ и человеком.

**Цветовая палитра:**
- **AI Status (Индикаторы):** `#7C3AED` (Deep Violet)
- **Success:** `#10B981`
- **Warning:** `#F59E0B`
- **Error:** `#EF4444`

## 3. ТИПОГРАФИКА

**Шрифты интерфейса:**
- Inter / Roboto / System Sans-Serif

**Шрифты данных:**
- JetBrains Mono / Source Code Pro

**Параметры:**
- **Интерлиньяж:** 1.6 для основного текста (улучшенное сканирование)
- **Иерархия:**
  - H1: 32-40px Bold
  - H2: 24px Bold
  - Body: 16px Regular

## 4. ГРАФИЧЕСКИЕ ЭЛЕМЕНТЫ И ИКОНКИ (CLAYMORPHISM)

**Стиль:** 3D 'Inflated' формы (надутая геометрия)

**Формы:**
- Squircle (суперэллипс) с Corner Smoothing 60-80%

**Свет:**
- Основной источник Top-Left (блик 1px, 40% white)

**Внутренние тени:**
- Top-Left: White (20% opacity, Inset)
- Bottom-Right: Darker tone of base color (30% opacity, Inset)

**Внешние тени:**
- Мягкое парение (Y: 12px, Blur: 24px, #000000 0.08)

## 5. ИНТЕРФЕЙСНЫЕ ПАТТЕРНЫ (UX)

**Layout:**
- Bento Grid (модули 16px, 24px, 32px)

**Delineation:**
- Разделение блоков 1px рамками `#E5E7EB` вместо тяжелых теней

**Glassmorphism:**
- В светлой теме - Blur 20px, Opacity 0.4 (Frosted Glass)

**Контекстные панели:**
- Появляются только при фокусе (Contextual Toolbars)

## 6. ПРАВИЛА МАСШТАБИРОВАНИЯ

**Design Tokens:**
- Все значения выше должны быть выгружены в JSON

**Mobile-first:**
- Карточки Bento в мобильном приложении складываются вертикально

**Сквозная анимация:**
- 'Soft Scale Up' (300ms) для всех всплывающих элементов
