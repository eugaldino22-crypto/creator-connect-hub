
CREATE POLICY "public_media_read" ON storage.objects FOR SELECT
USING (bucket_id = 'public-media');

CREATE POLICY "public_media_insert_own" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'public-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "public_media_update_own" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'public-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "public_media_delete_own" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'public-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "premium_media_read_entitled" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'premium-media' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_admin()
    OR public.has_active_subscription(auth.uid(), ((storage.foldername(name))[1])::uuid)
  )
);

CREATE POLICY "premium_media_insert_own" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'premium-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "premium_media_update_own" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'premium-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "premium_media_delete_own" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'premium-media' AND (storage.foldername(name))[1] = auth.uid()::text);
