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

-- Включаем Row Level Security для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы users (пользователи могут видеть только свои данные)
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Политики для таблицы participants
CREATE POLICY "Users can view their own participants" ON participants
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own participants" ON participants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own participants" ON participants
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own participants" ON participants
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Политики для таблицы games
CREATE POLICY "Users can view their own games" ON games
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own games" ON games
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own games" ON games
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own games" ON games
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Политики для таблицы game_participants
CREATE POLICY "Users can view game participants for their games" ON game_participants
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert game participants for their games" ON game_participants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete game participants for their games" ON game_participants
  FOR DELETE USING (auth.uid() IS NOT NULL);