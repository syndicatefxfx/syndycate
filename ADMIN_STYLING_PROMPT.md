# Промпт для стилизации админки сайта Syndycate

## Общая концепция дизайна

Админка должна строго соответствовать существующему дизайну основного сайта Syndycate. Используй темную минималистичную тему с акцентами в голубом цвете (cyan), характерную для финансовых/трейдинговых платформ.

## Цветовая палитра

### Основные цвета (CSS переменные):

- **Primary (акцентный)**: `rgba(14, 254, 242, 1)` - яркий голубой/cyan (#0EFEF2)
- **Secondary (текст)**: `rgba(255, 255, 255, 1)` - белый
- **Dark (фон)**: `rgba(2, 2, 2, 1)` - почти черный (#020202)
- **Dark-secondary (карточки)**: `rgba(10, 10, 10, 1)` - темно-серый (#0A0A0A)
- **Gray (вторичный текст)**: `rgba(125, 125, 125, 1)` - серый (#7D7D7D)

### Дополнительные цвета:

- **Границы**: `#2c2c2c` (темные карточки), `#3a3a3a` (инпуты)
- **Приглушенный текст**: `#9d9d9d`, `#7a7a7a`
- **Ошибки**: `#ff6b6b`
- **Фон страницы**: радиальный градиент от `#0c0c0c` через `#050505` к `#020202`

## Типографика

### Шрифты:

- **Заголовки**: `var(--font-stencil)` или `"Stencil"` - для крупных заголовков и логотипов
- **Основной текст**: `var(--font-inter)` или `"Inter"` - для всего остального
- **Fallback**: `system-ui, -apple-system, sans-serif`

### Стили текста:

- **Заголовки**: uppercase, letter-spacing 0.08em-0.18em
- **Кнопки**: uppercase, letter-spacing 0.04em, font-weight 600
- **Мелкие метки**: letter-spacing 0.18em, font-size 12px
- **Основной текст**: letter-spacing -0.03em (для Inter)

## Компоненты и их стилизация

### Фон страницы:

```css
background: radial-gradient(
  circle at 20% 20%,
  #0c0c0c 0%,
  #050505 45%,
  #020202 100%
);
min-height: 100vh;
```

### Карточки и панели:

- **Фон**: `var(--color-dark-secondary)` (#0A0A0A)
- **Граница**: `1px solid #2c2c2c`
- **Скругление**: `border-radius: 14px` (панели), `12px` (маленькие карточки)
- **Отступы**: `24px` (панели), `14px` (маленькие карточки)
- **Тень**: `0 12px 40px rgba(0, 0, 0, 0.45)`
- **Hover эффект**: граница меняется на `var(--color-primary)`, тень с голубым свечением `rgba(14, 254, 242, 0.15)`

### Формы и инпуты:

- **Фон инпута**: `#0a0a0a`
- **Граница**: `1px solid #3a3a3a`
- **Цвет текста**: `var(--color-secondary)` (белый)
- **Скругление**: `border-radius: 10px`
- **Отступы**: `10px 12px`
- **Focus состояние**:
  - Граница: `var(--color-primary)`
  - Тень: `0 0 0 2px rgba(14, 254, 242, 0.12)`

### Кнопки:

#### Primary кнопка:

- **Фон**: `var(--color-primary)` (#0EFEF2)
- **Цвет текста**: `#020202` (почти черный)
- **Граница**: `1px solid var(--color-primary)`
- **Тень**: `0 8px 20px rgba(14, 254, 242, 0.25)`
- **Скругление**: `10px`
- **Отступы**: `10px 14px`
- **Disabled**: `opacity: 0.7`, `cursor: not-allowed`

#### Secondary кнопка:

- **Фон**: `transparent`
- **Цвет текста**: `var(--color-secondary)` (белый)
- **Граница**: `1px solid #3a3a3a`
- **Hover**: граница → `var(--color-primary)`, цвет текста → `var(--color-primary)`

#### Link кнопка:

- **Фон**: `none`
- **Цвет**: `var(--color-primary)`
- **Граница**: `transparent`
- **Отступы**: `6px 8px`
- **Hover**: граница → `var(--color-primary)`

### Заголовки:

- **Kicker (маленький заголовок сверху)**:
  - `font-size: 12px`
  - `letter-spacing: 0.18em`
  - `text-transform: uppercase`
  - `color: var(--color-primary)`
- **Основной заголовок**:
  - `font-family: var(--font-stencil)`
  - `font-size: clamp(26px, 4vw, 40px)`
  - `letter-spacing: 0.08em`
  - `color: var(--color-secondary)`

### Сетки:

- **Card grid**: `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`
- **Items grid**: `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))`
- **Gap**: `16px`

### Акценты и индикаторы:

- **Primary акцент**: цвет `var(--color-primary)`, используется для:

  - Активных элементов
  - Индексов/номеров (`font-weight: 700`, `letter-spacing: 0.12em`)
  - Hover состояний
  - Успешных сообщений

- **Muted текст**: `color: #7a7a7a`, `font-size: 13px` - для второстепенной информации

### Сообщения:

- **Успех**: `color: var(--color-primary)`
- **Ошибка**: `color: #ff6b6b`
- **Отступ сверху**: `margin-top: 8px`

## Адаптивность

### Breakpoints:

- **Mobile**: `max-width: 640px`
  - TopBar: `flex-direction: column`, `align-items: flex-start`
  - Actions: `width: 100%`

### Responsive элементы:

- Заголовки: `clamp(26px, 4vw, 40px)`
- Padding страницы: `clamp(16px, 4vw, 48px)`
- Grid колонки: `auto-fit` с `minmax`

## Переходы и анимации

- **Все интерактивные элементы**: `transition: all 0.15s ease`
- **Hover эффекты**: плавное изменение цвета границы и текста
- **Focus состояния**: мягкое свечение вокруг элементов

## Примеры использования

### Карточка с акцентом:

```css
.cardAccent {
  color: var(--color-primary);
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  font-family: "stencil";
}
```

### Breadcrumbs:

```css
.breadcrumbs {
  color: #9d9d9d;
  font-size: 14px;
  margin-top: 6px;
}
```

## Важные принципы

1. **Консистентность**: Все элементы должны использовать одинаковые значения для скруглений, отступов, теней
2. **Контраст**: Достаточный контраст для читаемости на темном фоне
3. **Минимализм**: Чистый, не перегруженный интерфейс
4. **Акценты**: Используй primary цвет экономно, только для важных элементов и состояний
5. **Типографика**: Строгое следование правилам uppercase и letter-spacing для заголовков и кнопок

## Запрещено

- Яркие цвета кроме primary
- Светлые фоны
- Резкие переходы без анимаций
- Отклонения от цветовой палитры
- Использование других шрифтов кроме Stencil и Inter
