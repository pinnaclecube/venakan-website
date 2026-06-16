-- 0001_careers.sql
-- Careers / job-application schema for the Venakan website.
--
-- SECURITY MODEL
-- ──────────────
-- Every read/write to this table and to the `resumes` storage bucket happens
-- EXCLUSIVELY from the Vercel serverless function `api/apply.ts`, using the
-- Supabase SERVICE ROLE key. The service role BYPASSES Row Level Security.
-- We therefore enable RLS with NO policies, which denies the browser-side anon
-- and authenticated keys all access. Never ship the service role key to the
-- client, and do NOT add anon SELECT/INSERT policies here.

create extension if not exists "pgcrypto";

create table if not exists public.applications (
  id                      uuid primary key default gen_random_uuid(),
  opening_id              text not null,            -- Zinterview opening _id
  opening_title           text,
  zinterview_candidate_id text,                     -- _id returned by Zinterview create-candidate
  first_name              text not null,
  last_name               text not null,
  email                   text not null,
  phone                   text not null,
  experience              numeric,
  resume_path             text not null,            -- path in the private `resumes` storage bucket
  created_at              timestamptz not null default now()
);

create index if not exists applications_opening_id_idx on public.applications (opening_id);
create index if not exists applications_created_at_idx on public.applications (created_at desc);

-- RLS enabled, intentionally WITHOUT policies → only the service role can touch it.
alter table public.applications enable row level security;

-- Private storage bucket for resumes (NOT public). Files are uploaded
-- server-side via the service role and are never publicly listable/downloadable.
-- If your migration runner has access to the storage schema this will create the
-- bucket; otherwise create it manually per supabase/README.md.
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;
