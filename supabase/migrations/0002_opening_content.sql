-- 0002_opening_content.sql  (ADDITIVE — does not touch 0001 objects)
-- Caches AI-generated "witty" rewrites of each Zinterview opening so the copy is
-- generated ONCE per opening version, not on every page view.
--
-- SECURITY MODEL (same as 0001): every read/write happens EXCLUSIVELY from the
-- Vercel serverless function `api/openings.ts` using the Supabase SERVICE ROLE
-- key, which BYPASSES Row Level Security. RLS is enabled here with NO policies,
-- so the browser-side anon/authenticated keys can do nothing. Do NOT add anon
-- SELECT/INSERT policies.

create table if not exists public.opening_content (
  opening_id             text not null,           -- Zinterview opening _id
  source_hash            text not null,           -- hash of the source JD fields; changes when the JD is edited in Zinterview -> regenerate
  witty_intro            text,
  witty_responsibilities jsonb,                   -- array of reworded responsibility strings
  witty_traits           jsonb,                   -- array of { point, because, dimension }
  created_at             timestamptz not null default now(),
  constraint opening_content_opening_hash_key unique (opening_id, source_hash)
);

create index if not exists opening_content_opening_id_idx on public.opening_content (opening_id);

-- RLS enabled, intentionally WITHOUT policies -> only the service role can touch it.
alter table public.opening_content enable row level security;
