-- Optimize RLS policy predicates per Supabase advisor recommendation.
-- Replace auth.uid() with (select auth.uid()) to avoid per-row re-evaluation.

DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_delete_own" ON public.users;

CREATE POLICY "users_select_own" ON public.users
FOR SELECT TO authenticated
USING (auth_user_id = (select auth.uid()));

CREATE POLICY "users_insert_own" ON public.users
FOR INSERT TO authenticated
WITH CHECK (auth_user_id = (select auth.uid()));

CREATE POLICY "users_update_own" ON public.users
FOR UPDATE TO authenticated
USING (auth_user_id = (select auth.uid()))
WITH CHECK (auth_user_id = (select auth.uid()));

CREATE POLICY "users_delete_own" ON public.users
FOR DELETE TO authenticated
USING (auth_user_id = (select auth.uid()));

DROP POLICY IF EXISTS "participants_select_owner" ON public.participants;
DROP POLICY IF EXISTS "participants_insert_owner" ON public.participants;
DROP POLICY IF EXISTS "participants_update_owner" ON public.participants;
DROP POLICY IF EXISTS "participants_delete_owner" ON public.participants;

CREATE POLICY "participants_select_owner" ON public.participants
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = participants.user_id
      AND u.auth_user_id = (select auth.uid())
  )
);

CREATE POLICY "participants_insert_owner" ON public.participants
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = participants.user_id
      AND u.auth_user_id = (select auth.uid())
  )
);

CREATE POLICY "participants_update_owner" ON public.participants
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = participants.user_id
      AND u.auth_user_id = (select auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = participants.user_id
      AND u.auth_user_id = (select auth.uid())
  )
);

CREATE POLICY "participants_delete_owner" ON public.participants
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = participants.user_id
      AND u.auth_user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "games_select_owner" ON public.games;
DROP POLICY IF EXISTS "games_insert_owner" ON public.games;
DROP POLICY IF EXISTS "games_update_owner" ON public.games;
DROP POLICY IF EXISTS "games_delete_owner" ON public.games;

CREATE POLICY "games_select_owner" ON public.games
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = games.user_id
      AND u.auth_user_id = (select auth.uid())
  )
);

CREATE POLICY "games_insert_owner" ON public.games
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = games.user_id
      AND u.auth_user_id = (select auth.uid())
  )
);

CREATE POLICY "games_update_owner" ON public.games
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = games.user_id
      AND u.auth_user_id = (select auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = games.user_id
      AND u.auth_user_id = (select auth.uid())
  )
);

CREATE POLICY "games_delete_owner" ON public.games
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = games.user_id
      AND u.auth_user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "game_participants_select_owner" ON public.game_participants;
DROP POLICY IF EXISTS "game_participants_insert_owner" ON public.game_participants;
DROP POLICY IF EXISTS "game_participants_update_owner" ON public.game_participants;
DROP POLICY IF EXISTS "game_participants_delete_owner" ON public.game_participants;

CREATE POLICY "game_participants_select_owner" ON public.game_participants
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.games g
    JOIN public.users u ON u.id = g.user_id
    WHERE g.id = game_participants.game_id
      AND u.auth_user_id = (select auth.uid())
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
      AND u.auth_user_id = (select auth.uid())
  )
  AND EXISTS (
    SELECT 1
    FROM public.participants p
    JOIN public.users u ON u.id = p.user_id
    WHERE p.id = game_participants.participant_id
      AND u.auth_user_id = (select auth.uid())
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
      AND u.auth_user_id = (select auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.games g
    JOIN public.users u ON u.id = g.user_id
    WHERE g.id = game_participants.game_id
      AND u.auth_user_id = (select auth.uid())
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
      AND u.auth_user_id = (select auth.uid())
  )
);
