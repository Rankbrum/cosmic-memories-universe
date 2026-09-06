CREATE POLICY "memories media readable" ON storage.objects FOR SELECT
  USING (bucket_id = 'memories');
CREATE POLICY "memories media admin insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'memories' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "memories media admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'memories' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "memories media admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'memories' AND public.has_role(auth.uid(), 'admin'));