-- Link application users to Supabase Auth identities.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id)
WHERE auth_user_id IS NOT NULL;

-- Remove permissive legacy policies.
DROP POLICY IF EXISTS "Allow all for now" ON public.users;
DROP POLICY IF EXISTS "Allow all for participants" ON public.participants;
DROP POLICY IF EXISTS "Allow all for games" ON public.games;
DROP POLICY IF EXISTS "Allow all for game_participants" ON public.game_participants;
DROP POLICY IF EXISTS "Allow context access for participants" ON public.participants;
DROP POLICY IF EXISTS "Allow context access for games" ON public.games;
DROP POLICY IF EXISTS "Allow context access for game_participants" ON public.game_participants;

-- users policies.
CREATE POLICY "users_select_own" ON public.users
FOR SELECT TO authenticated
USING (auth_user_id = auth.uid());

CREATE POLICY "users_insert_own" ON public.users
FOR INSERT TO authenticated
WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
FOR UPDATE TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "users_delete_own" ON public.users
FOR DELETE TO authenticated
USING (auth_user_id = auth.uid());

-- participants policies.
CREATE POLICY "participants_select_owner" ON public.participants
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = participants.user_id
      AND u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "participants_insert_owner" ON public.participants
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = participants.user_id
      AND u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "participants_update_owner" ON public.participants
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = participants.user_id
      AND u.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = participants.user_id
      AND u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "participants_delete_owner" ON public.participants
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = participants.user_id
      AND u.auth_user_id = auth.uid()
  )
);

-- games policies.
CREATE POLICY "games_select_owner" ON public.games
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = games.user_id
      AND u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "games_insert_owner" ON public.games
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = games.user_id
      AND u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "games_update_owner" ON public.games
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = games.user_id
      AND u.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = games.user_id
      AND u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "games_delete_owner" ON public.games
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = games.user_id
      AND u.auth_user_id = auth.uid()
  )
);

-- game_participants policies.
CREATE POLICY "game_participants_select_owner" ON public.game_participants
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.games g
    JOIN public.users u ON u.id = g.user_id
    WHERE g.id = game_participants.game_id
      AND u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "game_participants_insert_owner" ON public.game_participants
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.games g
    JOIN public.users u ON u.id = g.user_id
    WHERE g.id = game_participants.game_id
      AND u.auth_user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1
    FROM public.participants p
    JOIN public.users u ON u.id = p.user_id
    WHERE p.id = game_participants.participant_id
      AND u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "game_participants_update_owner" ON public.game_participants
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.games g
    JOIN public.users u ON u.id = g.user_id
    WHERE g.id = game_participants.game_id
      AND u.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.games g
    JOIN public.users u ON u.id = g.user_id
    WHERE g.id = game_participants.game_id
      AND u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "game_participants_delete_owner" ON public.game_participants
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.games g
    JOIN public.users u ON u.id = g.user_id
    WHERE g.id = game_participants.game_id
      AND u.auth_user_id = auth.uid()
  )
);

-- GraphQL is not used in this app; disabling it removes object discoverability warnings.
DROP EXTENSION IF EXISTS pg_graphql;
