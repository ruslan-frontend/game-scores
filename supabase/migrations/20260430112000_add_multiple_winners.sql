-- Support ties: allow multiple winners per game.
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS winner_ids uuid[] NOT NULL DEFAULT '{}';

-- Backfill existing rows from legacy winner_id.
UPDATE public.games
SET winner_ids = ARRAY[winner_id]
WHERE winner_id IS NOT NULL
  AND (winner_ids IS NULL OR array_length(winner_ids, 1) IS NULL);

-- At least one winner, maximum three winners, and winner_id remains first winner for compatibility.
ALTER TABLE public.games
DROP CONSTRAINT IF EXISTS games_winner_ids_count_check;

ALTER TABLE public.games
ADD CONSTRAINT games_winner_ids_count_check
CHECK (array_length(winner_ids, 1) BETWEEN 1 AND 3);

UPDATE public.games
SET winner_id = winner_ids[1]
WHERE array_length(winner_ids, 1) >= 1
  AND winner_id IS DISTINCT FROM winner_ids[1];
