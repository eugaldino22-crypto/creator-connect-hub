-- SECRET storage hardening.
-- Keep both buckets private so storage.object RLS controls access.
UPDATE storage.buckets
SET public = false
WHERE id IN ('public-media','premium-media');

-- Reassert premium storage access at the object layer. Anonymous users must never
-- read premium objects even if a bucket flag is accidentally changed elsewhere.
DROP POLICY IF EXISTS "premium_media_read_entitled" ON storage.objects;
CREATE POLICY "premium_media_read_entitled" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'premium-media'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_admin()
    OR public.has_active_subscription(auth.uid(), ((storage.foldername(name))[1])::uuid)
  )
);

-- Public-media is also private now; users still receive short-lived signed URLs.
DROP POLICY IF EXISTS "public_media_read" ON storage.objects;
CREATE POLICY "public_media_read" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'public-media');

-- Do not allow direct client-side UPDATE/DELETE on objects outside the owner's
-- first-level folder. INSERT already enforces the same ownership rule.
DROP POLICY IF EXISTS "public_media_update_own" ON storage.objects;
CREATE POLICY "public_media_update_own" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'public-media' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'public-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "premium_media_update_own" ON storage.objects;
CREATE POLICY "premium_media_update_own" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'premium-media' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'premium-media' AND (storage.foldername(name))[1] = auth.uid()::text);
