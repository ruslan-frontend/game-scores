-- Add optional avatar image URL to participants.
ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create bucket for participant avatars.
INSERT INTO storage.buckets (id, name, public)
VALUES ('participant-avatars', 'participant-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload avatar files into their own folder.
DROP POLICY IF EXISTS "participant_avatars_insert_own" ON storage.objects;
CREATE POLICY "participant_avatars_insert_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'participant-avatars'
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Allow authenticated users to update avatar files in their own folder.
DROP POLICY IF EXISTS "participant_avatars_update_own" ON storage.objects;
CREATE POLICY "participant_avatars_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'participant-avatars'
  AND (storage.foldername(name))[1] = (select auth.uid())::text
)
WITH CHECK (
  bucket_id = 'participant-avatars'
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Allow authenticated users to delete avatar files in their own folder.
DROP POLICY IF EXISTS "participant_avatars_delete_own" ON storage.objects;
CREATE POLICY "participant_avatars_delete_own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'participant-avatars'
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);
