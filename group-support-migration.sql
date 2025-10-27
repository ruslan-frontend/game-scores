-- Миграция для поддержки групповых данных
-- Добавляем поле context_id для участников и игр

-- Добавляем колонку context_id к participants
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS context_id TEXT;

-- Добавляем колонку context_id к games
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS context_id TEXT;

-- Добавляем колонку context_id к game_participants
ALTER TABLE game_participants 
ADD COLUMN IF NOT EXISTS context_id TEXT;

-- Обновляем существующие записи, используя user_id как context_id для обратной совместимости
UPDATE participants 
SET context_id = (SELECT telegram_id::TEXT FROM users WHERE users.id = participants.user_id)
WHERE context_id IS NULL;

UPDATE games 
SET context_id = (SELECT telegram_id::TEXT FROM users WHERE users.id = games.user_id)
WHERE context_id IS NULL;

UPDATE game_participants 
SET context_id = (
  SELECT p.context_id 
  FROM participants p 
  WHERE p.id = game_participants.participant_id
)
WHERE context_id IS NULL;

-- Создаем индексы для оптимизации запросов по context_id
CREATE INDEX IF NOT EXISTS idx_participants_context_id ON participants(context_id);
CREATE INDEX IF NOT EXISTS idx_games_context_id ON games(context_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_context_id ON game_participants(context_id);

-- Обновляем политики RLS для работы с context_id
DROP POLICY IF EXISTS "Allow all for participants" ON participants;
DROP POLICY IF EXISTS "Allow all for games" ON games;
DROP POLICY IF EXISTS "Allow all for game_participants" ON game_participants;

-- Новые политики для групповых данных
CREATE POLICY "Allow context access for participants" ON participants 
FOR ALL USING (true);

CREATE POLICY "Allow context access for games" ON games 
FOR ALL USING (true);

CREATE POLICY "Allow context access for game_participants" ON game_participants 
FOR ALL USING (true);

-- Обновляем существующие функции для работы с context_id
CREATE OR REPLACE FUNCTION get_current_context_id()
RETURNS TEXT AS $$
BEGIN
  -- Возвращаем context_id из текущего сеанса
  -- В реальном приложении это будет передаваться через параметры
  RETURN current_setting('app.current_context_id', true);
END;
$$ LANGUAGE plpgsql;