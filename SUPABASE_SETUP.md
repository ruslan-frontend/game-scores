# Интеграция с Supabase - Пошаговая инструкция

## 🗄️ Создание Supabase проекта

### 1. Создайте аккаунт и проект
1. Перейдите на [supabase.com](https://supabase.com)
2. Нажмите "Start your project"
3. Войдите через GitHub
4. Нажмите "New project"
5. Выберите организацию
6. Заполните данные:
   - **Name**: `game-scores`
   - **Database Password**: сгенерируйте надежный пароль
   - **Region**: выберите ближайший регион
7. Нажмите "Create new project"

### 2. Получите учетные данные
После создания проекта:
1. Перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** (например: `https://abc123.supabase.co`)
   - **anon public key** (начинается с `eyJ...`)

### 3. Создайте файл окружения
```bash
# В корне проекта создайте .env.local
touch .env.local
```

Добавьте в `.env.local`:
```env
VITE_SUPABASE_URL=ваш_project_url
VITE_SUPABASE_ANON_KEY=ваш_anon_key
```

### 4. Установите зависимости
```bash
npm install @supabase/supabase-js
```

## 🗃️ Создание базы данных

### SQL для создания таблиц

Перейдите в **SQL Editor** в Supabase Dashboard и выполните:

```sql
-- Создание таблицы пользователей
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы участников
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#4299e1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы игр
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  winner_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы участников игр (many-to-many)
CREATE TABLE game_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, participant_id)
);

-- Создание индексов для оптимизации
CREATE INDEX idx_participants_user_id ON participants(user_id);
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_winner_id ON games(winner_id);
CREATE INDEX idx_game_participants_game_id ON game_participants(game_id);
CREATE INDEX idx_game_participants_participant_id ON game_participants(participant_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Настройка Row Level Security (RLS)

```sql
-- Включаем RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы users
CREATE POLICY "Пользователи могут видеть только свои данные" ON users
  FOR ALL USING (telegram_id = (current_setting('request.jwt.claims'))::json->>'telegram_id')::bigint;

-- Политики для таблицы participants
CREATE POLICY "Пользователи могут управлять только своими участниками" ON participants
  FOR ALL USING (user_id = (current_setting('request.jwt.claims'))::json->>'sub')::uuid);

-- Политики для таблицы games
CREATE POLICY "Пользователи могут управлять только своими играми" ON games
  FOR ALL USING (user_id = (current_setting('request.jwt.claims'))::json->>'sub')::uuid);

-- Политики для таблицы game_participants
CREATE POLICY "Доступ к участникам игр через владение игрой" ON game_participants
  FOR ALL USING (
    game_id IN (
      SELECT id FROM games 
      WHERE user_id = (current_setting('request.jwt.claims'))::json->>'sub')::uuid
    )
  );
```

## 🔑 Настройка аутентификации

В Supabase Dashboard:
1. Перейдите в **Authentication** → **Settings**
2. В разделе **Auth Providers** отключите все провайдеры
3. Мы будем использовать кастомную аутентификацию через Telegram

## 📝 Готово к интеграции!

После выполнения всех шагов у вас будет:
- ✅ Настроенный Supabase проект
- ✅ База данных с правильной схемой
- ✅ Система безопасности (RLS)
- ✅ Переменные окружения

Теперь можно переходить к интеграции с фронтендом!