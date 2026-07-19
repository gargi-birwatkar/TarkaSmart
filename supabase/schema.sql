-- =========================================================
-- TarkaSmart — Database Schema
-- Run this in the Supabase SQL Editor to set up your database.
-- =========================================================

-- 1. Extensions
-- Required for vector embedding storage + similarity search.
create extension if not exists vector;
create extension if not exists pgcrypto; -- provides gen_random_uuid()


-- =========================================================
-- 2. Tables
-- =========================================================

-- Stores encrypted Google OAuth session data per user.
create table if not exists user_sessions (
  google_user_id  text primary key,
  email           text,
  name            text,
  refresh_token   text, -- stored Fernet-encrypted at the application layer
  updated_at      timestamp with time zone not null default now()
);

-- Stores metadata for each document a user has staged from Google Drive.
create table if not exists documents (
  id                uuid primary key default gen_random_uuid(),
  google_drive_id   text not null unique,
  google_user_id    text not null references user_sessions(google_user_id),
  file_name         text not null,
  subject_category  text not null default 'General',
  mime_type         text,
  view_url          text not null,
  is_vectorized     boolean default false,
  created_at        timestamp with time zone not null default timezone('utc', now())
);

-- Stores chunked + embedded text for each document, used in RAG retrieval.
create table if not exists document_chunks (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid references documents(id) on delete cascade,
  content       text not null,
  embedding     vector(768), -- 768-dim, matches the Gemini embedding model used
  source_name   text,
  pg_no         integer,
  created_at    timestamp with time zone not null default timezone('utc', now())
);


-- =========================================================
-- 3. Indexes
-- =========================================================

-- Speeds up lookups of a user's documents/chunks (used by match_document_chunks' user_id_filter).
create index if not exists idx_documents_google_user_id
  on documents (google_user_id);

-- Approximate nearest-neighbor index for fast cosine-similarity vector search.
create index if not exists idx_document_chunks_embedding
  on document_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Full-text search index to speed up the keyword half of hybrid retrieval.
create index if not exists idx_document_chunks_content_fts
  on document_chunks using gin (to_tsvector('english', content));


-- =========================================================
-- 4. Functions
-- =========================================================

-- Hybrid retrieval: weighted combination of semantic (cosine) similarity
-- and keyword (full-text) rank, scoped to a single user's documents.
create or replace function public.match_document_chunks(
  query_embedding vector,
  query_text text,
  match_threshold double precision,
  match_count integer,
  user_id_filter text
)
returns table (
  id uuid,
  content text,
  source_name text,
  pg_no integer,
  similarity double precision
)
language sql
as $function$
  select
    dc.id,
    dc.content,
    dc.source_name,
    dc.pg_no,
    -- Combined score: 70% semantic similarity, 30% keyword rank
    ((1 - (dc.embedding <=> query_embedding)) * 0.7) +
    (ts_rank(to_tsvector('english', dc.content), plainto_tsquery('english', query_text)) * 0.3) as similarity
  from document_chunks dc
  join documents d on dc.document_id = d.id
  where
    d.google_user_id = user_id_filter
    and (
      (1 - (dc.embedding <=> query_embedding)) > match_threshold
      or to_tsvector('english', dc.content) @@ plainto_tsquery('english', query_text)
    )
  order by similarity desc
  limit match_count;
$function$;