
drop policy if exists "study materials read own" on storage.objects;
drop policy if exists "study materials insert own" on storage.objects;
drop policy if exists "study materials update own" on storage.objects;
drop policy if exists "study materials delete own" on storage.objects;

create policy "study materials read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'study-materials' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "study materials insert own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'study-materials' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "study materials update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'study-materials' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "study materials delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'study-materials' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.match_document_chunks(
  query_embedding extensions.vector(1536),
  match_count int default 8,
  p_subject_id uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  paper_id uuid,
  subject_id uuid,
  source_label text,
  source_kind text,
  page_number int,
  content text,
  similarity float
)
language sql
stable
set search_path = public, extensions
as $$
  select
    c.id,
    c.document_id,
    c.paper_id,
    c.subject_id,
    c.source_label,
    c.source_kind,
    c.page_number,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.document_chunks c
  where c.embedding is not null
    and (p_subject_id is null or c.subject_id = p_subject_id)
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

revoke all on function public.match_document_chunks(extensions.vector, int, uuid) from public, anon;
grant execute on function public.match_document_chunks(extensions.vector, int, uuid) to authenticated, service_role;
