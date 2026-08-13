-- SECRET Phase 1: enforce premium post visibility at the database layer.
-- Public posts are readable by everyone; subscriber posts require an active subscription.
DROP POLICY IF EXISTS "posts_read" ON public.posts;

CREATE POLICY "posts_read" ON public.posts
FOR SELECT
USING (
  creator_id = auth.uid()
  OR public.is_admin()
  OR (
    is_published
    AND NOT is_removed
    AND (
      visibility = 'public'
      OR (
        visibility = 'subscribers'
        AND public.has_active_subscription(auth.uid(), creator_id)
      )
    )
  )
);
