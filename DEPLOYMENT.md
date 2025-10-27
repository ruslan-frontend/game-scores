# Деплой Telegram Mini App

## Шаг 1: Деплой на хостинг

### Вариант A: Vercel (Рекомендуется)

1. Создайте аккаунт на [vercel.com](https://vercel.com)
2. Установите Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. Войдите в аккаунт:
   ```bash
   vercel login
   ```
4. Задеплойте проект:
   ```bash
   vercel --prod
   ```
5. Скопируйте полученный URL (например: `https://game-scores-xxx.vercel.app`)

### Вариант B: Netlify

1. Создайте аккаунт на [netlify.com](https://netlify.com)
2. Перетащите папку `dist` в Netlify Dashboard
3. Скопируйте полученный URL

### Вариант C: GitHub Pages

1. Установите gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```
2. Добавьте скрипт в package.json:
   ```json
   "deploy": "gh-pages -d dist"
   ```
3. Задеплойте:
   ```bash
   npm run deploy
   ```

## Шаг 2: Создание Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Введите название бота (например: "Game Scores Bot")
4. Введите username бота (например: "game_scores_bot")
5. Сохраните токен бота

## Шаг 3: Настройка Mini App

1. В чате с @BotFather отправьте `/newapp`
2. Выберите созданного бота
3. Введите название Mini App (например: "Game Scores")
4. Введите описание
5. **Введите URL вашего деплоя** (из Шага 1)
6. Загрузите иконку (512x512 PNG)
7. Загрузите GIF превью (опционально)

## Шаг 4: Тестирование

1. Откройте чат с вашим ботом
2. Нажмите кнопку "Menu" или отправьте команду для запуска Mini App
3. Проверьте работу всех функций

## Важные требования для Mini App:

- ✅ HTTPS обязательно (Vercel/Netlify предоставляют автоматически)
- ✅ Скрипт Telegram WebApp подключен
- ✅ Адаптивный дизайн для мобильных устройств
- ✅ Инициализация с `Telegram.WebApp.ready()`

## Полезные команды для BotFather:

- `/editapp` - редактировать Mini App
- `/deleteapp` - удалить Mini App
- `/myapps` - список ваших Mini Apps

## Отладка:

Если Mini App не работает, проверьте:
1. URL доступен по HTTPS
2. Нет ошибок в консоли браузера
3. Скрипт telegram-web-app.js загружается
4. Вызывается Telegram.WebApp.ready()