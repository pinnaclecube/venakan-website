# Supabase — Careers

This directory holds the database schema for the Careers feature. The careers
serverless functions (`api/openings.ts`, `api/apply.ts`) talk to Supabase using
the **service role key**, which bypasses Row Level Security.

## Migrations — apply in order

Apply **both** migrations (in the Supabase SQL editor or via the CLI) before the
feature works. `0002` is additive and does not touch `0001`'s objects.

- `migrations/0001_careers.sql` — `applications` table + private `resumes` bucket.
- `migrations/0002_opening_content.sql` — `opening_content` table that caches the
  AI-generated "witty" JD copy (one row per opening version). Without it, the
  careers listing still renders (it falls back to the original Zinterview copy),
  but every load would re-generate copy instead of using the cache. Same security
  model: RLS enabled, no policies, service-role-only.

## What the migration does

`migrations/0001_careers.sql`:

- Creates the `public.applications` table (one row per submitted application).
- Enables **RLS with no policies** — so the browser-side anon/authenticated keys
  can do nothing; only the service-role serverless function can read/write.
- Creates a **private** Storage bucket named `resumes` (resume files are uploaded
  server-side and are never publicly listable or downloadable).

## Applying it

### Option A — Supabase CLI (recommended)

```bash
# from the repo root, with the CLI linked to your project
supabase db push
# or apply the single file:
supabase db execute --file supabase/migrations/0001_careers.sql
```

### Option B — Dashboard SQL editor

1. Open your project → **SQL Editor** → paste the contents of
   `migrations/0001_careers.sql` → **Run**.
2. If the `insert into storage.buckets …` line errors in your environment
   (permissions on the storage schema vary), skip it and create the bucket
   manually (next section).

## Creating the `resumes` bucket manually (if needed)

Dashboard → **Storage** → **New bucket**:

- **Name:** `resumes`
- **Public bucket:** **OFF** (must stay private)

No bucket policies are required — uploads/downloads happen via the service role
in the serverless function.

## Environment variables

The functions read these (set them in Vercel → Project → Settings → Environment
Variables, and in a local gitignored `.env`; see `.env.example` at the repo root):

| Var | Where it's safe |
|-----|-----------------|
| `SUPABASE_URL` | server functions |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only — never the browser** |
| `ZINTERVIEW_API_KEY` | **server only — raw value, no `Bearer ` prefix** |
