
create extension if not exists vector;

alter table public.documents
  add column if not exists unit_id uuid references public.units(id) on delete set null,
  add column if not exists topic_id uuid references public.topics(id) on delete set null,
  add column if not exists mime_type text,
  add column if not exists error_message text,
  add column if not exists processed_at timestamptz,
  add column if not exists extracted_text text,
  add column if not exists chunk_count integer not null default 0;

alter table public.question_papers
  add column if not exists filename text,
  add column if not exists size_bytes bigint,
  add column if not exists mime_type text,
  add column if not exists paper_type text not null default 'end_semester',
  add column if not exists page_count integer not null default 0,
  add column if not exists extracted_text text,
  add column if not exists error_message text,
  add column if not exists chunk_count integer not null default 0;

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  document_id uuid references public.documents(id) on delete cascade,
  paper_id uuid references public.question_papers(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  source_label text not null default 'Document',
  source_kind text not null default 'document',
  chunk_index integer not null default 0,
  page_number integer,
  content text not null,
  token_estimate integer not null default 0,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.document_chunks to authenticated;
grant all on public.document_chunks to service_role;

alter table public.document_chunks enable row level security;

drop policy if exists "Users manage own chunks" on public.document_chunks;
create policy "Users manage own chunks" on public.document_chunks
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists document_chunks_user_idx on public.document_chunks(user_id);
create index if not exists document_chunks_subject_idx on public.document_chunks(subject_id);
create index if not exists document_chunks_document_idx on public.document_chunks(document_id);
create index if not exists document_chunks_paper_idx on public.document_chunks(paper_id);
create index if not exists document_chunks_embedding_idx
  on public.document_chunks using hnsw (embedding vector_cosine_ops);

create or replace function public.match_document_chunks(
  query_embedding vector(1536),
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
set search_path = public
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

revoke all on function public.match_document_chunks(vector, int, uuid) from public, anon;
grant execute on function public.match_document_chunks(vector, int, uuid) to authenticated, service_role;
