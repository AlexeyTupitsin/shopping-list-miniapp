# Shopping List Mini App для Telegram

Совместное приложение для создания и управления списками покупок в Telegram.

## Структура проекта

```
ShoppingList/
├── bot/          # Telegram бот (Node.js + grammY)
├── webapp/       # Mini App (React + TypeScript + Vite)
├── supabase/     # База данных и миграции
└── README.md
```

## Технологический стек

- **Frontend**: React, TypeScript, Vite, Telegram UI Kit
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Bot**: Node.js, grammY
- **Local Development**: Docker, Supabase CLI

## Этап 1: Регистрация бота

### 1. Создайте бота через @BotFather

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Придумайте имя для бота (например: `Shopping List`)
4. Придумайте username (должен заканчиваться на `bot`, например: `my_shopping_list_bot`)
5. Сохраните токен, который даст вам BotFather (формат: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Настройте Mini App

**⚠️ ВАЖНО:** Telegram требует HTTPS для Mini Apps. Для локальной разработки используем **localtunnel**.

#### Шаги настройки:

1. Запустите ваш webapp:
   ```bash
   cd webapp
   npm run dev
   ```

2. В **новом терминале** запустите localtunnel:
   ```bash
   npx localtunnel --port 5173
   ```

3. Вы получите HTTPS URL (например: `https://funny-cats-12345.loca.lt`)
   - При первом посещении нажмите "Continue" для подтверждения IP
   - **Сохраните этот URL** — он понадобится для @BotFather

4. В чате с @BotFather отправьте `/mybots`
5. Выберите вашего бота
6. Нажмите **Bot Settings** → **Menu Button**
7. Выберите **Configure menu button**
8. Введите текст кнопки: `Открыть Shopping List`
9. Введите URL из localtunnel: `https://funny-cats-12345.loca.lt`

**Примечание:** URL от localtunnel меняется при каждом запуске. Для стабильной разработки можно:
- Использовать `npx localtunnel --port 5173 --subdomain your-name` (требует платный аккаунт)
- Или задеплоить на Vercel для постоянного URL

### 3. Настройте описание бота

1. В чате с @BotFather отправьте `/setdescription`
2. Введите описание:
   ```
   Создавайте списки покупок и делитесь ими с друзьями и семьёй.
   Совместное редактирование в реальном времени!
   ```

3. Отправьте `/setabouttext` и введите краткий текст:
   ```
   Совместные списки покупок для всей семьи
   ```

### 4. Добавьте аватар (опционально)

1. Отправьте `/setuserpic`
2. Загрузите изображение (512x512px, формат JPG/PNG)

## Этап 2: Настройка локального окружения

### 1. Создайте файл `.env` для бота

```bash
cd bot
cp .env.example .env
```

Отредактируйте `bot/.env`:
```env
BOT_TOKEN=ваш_токен_от_BotFather
WEBAPP_URL=https://your-tunnel-url.loca.lt
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=будет_получен_после_запуска_supabase
```

**ВАЖНО:** `WEBAPP_URL` должен совпадать с URL из localtunnel (с HTTPS)

### 2. Создайте файл `.env` для webapp

```bash
cd webapp
cp .env.example .env
```

Отредактируйте `webapp/.env`:
```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=будет_получен_после_запуска_supabase
```

### 3. Запустите Supabase локально

```bash
# В корневой директории проекта
npx supabase start
```

После запуска вы увидите:
```
API URL: http://127.0.0.1:54321
anon key: eyJ... (скопируйте этот ключ)
service_role key: eyJ...
Studio URL: http://127.0.0.1:54323
```

Скопируйте `anon key` и вставьте в `.env` файлы бота и webapp.

### 4. Установите зависимости

```bash
# Бот
cd bot
npm install

# Webapp
cd ../webapp
npm install
```

## Этап 3: Запуск приложения

Откройте **4 терминала**:

### Терминал 1: Supabase
```bash
npx supabase start
```

### Терминал 2: Webapp
```bash
cd webapp
npm run dev
```
Webapp будет доступен на `http://localhost:5173`

### Терминал 3: Localtunnel (HTTPS туннель)
```bash
npx localtunnel --port 5173
```
Скопируйте HTTPS URL (например: `https://abc123.loca.lt`) и используйте его:
- В настройках бота у @BotFather
- В `bot/.env` файле как `WEBAPP_URL`

### Терминал 4: Бот
```bash
cd bot
npm run dev
```

## Проверка работы

1. Откройте Telegram и найдите вашего бота
2. Отправьте команду `/start`
3. Нажмите кнопку "Открыть Shopping List"
4. Должно открыться Mini App с приветствием

## Доступ к Supabase Studio

Локальная панель управления БД доступна по адресу:
http://127.0.0.1:54323

Здесь вы можете:
- Просматривать таблицы
- Выполнять SQL-запросы
- Тестировать RLS политики
- Просматривать логи

## Полезные команды

### Supabase
```bash
npx supabase start         # Запуск
npx supabase stop          # Остановка
npx supabase status        # Статус
npx supabase db reset      # Пересоздать БД
```

### Разработка
```bash
# Бот
cd bot && npm run dev      # Режим разработки с hot reload

# Webapp
cd webapp && npm run dev   # Vite dev server
cd webapp && npm run build # Production build
```

## Следующие шаги

После завершения Этапа 1:

- **Этап 2**: Реализация функционала списков (создание, просмотр)
- **Этап 3**: Добавление элементов в список
- **Этап 4**: Real-time синхронизация
- **Этап 5**: Совместный доступ (шаринг списков)
- **Этап 6**: Деплой на Vercel и Railway

## Troubleshooting

### Бот не отвечает
- Проверьте правильность `BOT_TOKEN` в `.env`
- Убедитесь, что бот запущен (`npm run dev` в папке bot)

### Mini App не открывается
- Проверьте, что webapp запущен (`npm run dev` в папке webapp)
- Убедитесь, что localtunnel запущен (`npx localtunnel --port 5173`)
- В настройках бота у @BotFather должен быть HTTPS URL от localtunnel
- Проверьте, что `WEBAPP_URL` в `bot/.env` совпадает с URL от localtunnel

### BotFather не принимает URL
- Telegram требует **только HTTPS**. `http://localhost` не работает
- Используйте localtunnel для получения HTTPS URL
- При первом открытии localtunnel URL нажмите "Continue" для подтверждения IP

### Localtunnel перестал работать
- URL от localtunnel меняется при каждом перезапуске
- Перезапустите localtunnel: `npx localtunnel --port 5173`
- Обновите URL в настройках бота у @BotFather
- Обновите `WEBAPP_URL` в `bot/.env` и перезапустите бота

### Localtunnel показывает промежуточную страницу
При первом открытии Mini App через Telegram, localtunnel может показать страницу "This is your localtunnel URL" с кнопкой "Continue":

**Решение 1: Клик по "Click to Continue"**
- При первом открытии нажмите "Click to Continue"
- После этого страница должна работать нормально
- Это происходит только при первом подключении с нового IP

**Решение 2: Использовать ngrok (рекомендуется)**
ngrok не показывает промежуточную страницу и работает стабильнее:

1. Установите ngrok: https://ngrok.com/download
2. Зарегистрируйтесь и получите authtoken
3. Запустите:
   ```bash
   ngrok http 5173
   ```
4. Скопируйте HTTPS URL (например: `https://abc123.ngrok-free.app`)
5. Обновите URL в @BotFather и в `bot/.env`

**Решение 3: Тестирование без туннеля**
Если у вас локальная сеть:
1. Узнайте свой локальный IP: `ipconfig` (Windows) или `ifconfig` (Mac/Linux)
2. Откройте `http://ваш-ip:5173` на телефоне в той же WiFi сети
3. Это работает только для локального тестирования, @BotFather всё равно требует HTTPS

### Ошибки с БД
- Убедитесь, что Supabase запущен (`npx supabase status`)
- Проверьте `SUPABASE_ANON_KEY` в `.env` файлах

## Поддержка

Для вопросов и предложений создавайте Issues в репозитории.
