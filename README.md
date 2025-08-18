# IPEC v2

Современное веб-приложение, созданное с использованием новейших технологий.

## 🚀 Технологический стек

- **Next.js 15** - Фреймворк React с App Router
- **TypeScript** - Типизированный JavaScript
- **Tailwind CSS v4** - Утилитарный CSS фреймворк
- **Shadcn/UI** - Библиотека компонентов
- **Lucide React** - Иконки
- **next-intl** - Интернационализация (i18n)


## 📦 Установка и запуск

### Требования
- Node.js 18+ 
- Yarn

### Установка зависимостей
```bash
yarn install
```

### Запуск в режиме разработки
```bash
yarn dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере для просмотра результата.

### Сборка для production
```bash
yarn build
```

### Запуск production сборки
```bash
yarn start
```

## 🎨 Shadcn/UI компоненты

Для добавления новых компонентов используйте:

```bash
npx shadcn@latest add [component-name]
```

## 🌈 Фирменные цвета IPEC

В проекте настроены кастомные цвета бренда IPEC:

- `ipec-grey` - #6C6969 - Основной серый цвет IPEC
- `light-grey` - #DCE1E1 - Светло-серый цвет
- `ipec-blue` - #0063DC - Основной синий цвет IPEC
- `hover-ipec-blue` - #0015DC - Синий цвет для hover состояний

### Использование цветов

```html
<!-- Фон -->
<div className="bg-ipec-blue">Синий фон</div>
<div className="bg-ipec-grey">Серый фон</div>

<!-- Текст -->
<span className="text-ipec-blue">Синий текст</span>
<span className="text-ipec-grey">Серый текст</span>

<!-- Hover эффекты -->
<button className="bg-ipec-blue hover:bg-hover-ipec-blue">
  Кнопка с hover эффектом
</button>
```

Примеры доступных компонентов:
- `button` - Кнопки
- `card` - Карточки
- `input` - Поля ввода
- `dropdown-menu` - Выпадающие меню
- `dialog` - Модальные окна
- `toast` - Уведомления



## 🌐 Интернационализация (i18n)

Проект поддерживает три языка:
- **Русский** (ru) - язык по умолчанию
- **Казахский** (kk) 
- **Английский** (en)

### Особенности:
- Язык сохраняется в cookies (не в URL)
- Переключение языка через выпадающее меню в header
- Автоматическое определение системного языка
- Полная локализация интерфейса

### Файлы переводов:
- `messages/ru.json` - русский язык
- `messages/kk.json` - казахский язык  
- `messages/en.json` - английский язык

### Добавление переводов:
1. Добавьте ключи в файлы переводов
2. Используйте хук `useTranslations()` в компонентах
3. Пример: `const t = useTranslations('navigation'); t('services')`

## 📁 Структура проекта

```
src/
├── app/                    # App Router Next.js
│   ├── actions/           # Server Actions
│   ├── layout.tsx         # Корневой layout
│   ├── page.tsx          # Главная страница
│   └── globals.css       # Глобальные стили
├── components/            # React компоненты
│   ├── custom/           # Кастомные компоненты
│   │   ├── Header.tsx    # Шапка сайта
│   │   ├── NavLink.tsx   # Навигационная ссылка
│   │   └── LanguageSwitcher.tsx # Переключатель языков
│   └── ui/               # Shadcn/UI компоненты
├── i18n/                 # Конфигурация интернационализации
│   ├── config.ts         # Настройки языков
│   ├── request.ts        # Серверная конфигурация
│   └── utils.ts          # Утилиты для работы с локалью
├── lib/                  # Утилиты
│   ├── fonts.ts          # Настройки шрифтов
│   └── utils.ts          # Вспомогательные функции
└── messages/             # Файлы переводов
    ├── ru.json           # Русский язык
    ├── kk.json           # Казахский язык
    └── en.json           # Английский язык
```

## 🛠 Доступные скрипты

- `yarn dev` - Запуск сервера разработки
- `yarn build` - Создание production сборки
- `yarn start` - Запуск production сервера
- `yarn lint` - Проверка кода с ESLint
- `yarn lint:fix` - Автоматическое исправление ошибок линтинга

## 📚 Полезные ссылки

- [Next.js документация](https://nextjs.org/docs)
- [Tailwind CSS документация](https://tailwindcss.com/docs)
- [Shadcn/UI документация](https://ui.shadcn.com)
- [TypeScript документация](https://www.typescriptlang.org/docs)

## 🤝 Разработка

1. Клонируйте репозиторий
2. Установите зависимости: `yarn install`
3. Запустите сервер разработки: `yarn dev`
4. Внесите изменения
5. Проверьте линтинг: `yarn lint`
6. Создайте commit и push

Приятной разработки! 🎉