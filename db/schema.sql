create extension if not exists pgcrypto;
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  password_hash text not null,
  role text not null default 'editor' check (role in ('owner','admin','editor','contributor','viewer')),
  active boolean not null default true,
  permissions jsonb not null default '{}',
  created_at timestamptz not null default now(),
  last_login timestamptz
);
create table if not exists sessions (
  id text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references pages(id) on delete cascade,
  slug text not null,
  path text not null unique,
  title text not null default 'Untitled',
  type text not null default 'page' check (type in ('page','book','chapter','collection','landing','home')),
  template text not null default 'blank',
  status text not null default 'draft' check (status in ('draft','published')),
  lang text not null default 'en',
  blocks jsonb not null default '[]',
  seo jsonb not null default '{}',
  settings jsonb not null default '{}',
  position int not null default 0,
  created_by uuid references users(id),
  updated_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
create index if not exists pages_parent_idx on pages(parent_id, position);
create table if not exists page_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  title text, blocks jsonb not null,
  saved_by uuid references users(id),
  created_at timestamptz not null default now()
);
create table if not exists dbs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  icon text default 'database',
  fields jsonb not null default '[]',
  views jsonb not null default '[]',
  public boolean not null default true,
  settings jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create table if not exists db_rows (
  id uuid primary key default gen_random_uuid(),
  db_id uuid not null references dbs(id) on delete cascade,
  slug text,
  title text not null default '',
  data jsonb not null default '{}',
  status text not null default 'published' check (status in ('draft','published')),
  position int not null default 0,
  seo jsonb not null default '{}',
  blocks jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  fts tsvector generated always as (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(data::text,''))) stored,
  unique (db_id, slug)
);
create index if not exists db_rows_fts_idx on db_rows using gin(fts);
create index if not exists db_rows_db_idx on db_rows(db_id, position);
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  mime text not null,
  size int not null,
  width int, height int,
  alt text not null default '',
  folder text not null default '',
  data bytea not null,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  kind text not null default 'notice',
  image_id uuid,
  cta_label text, cta_url text,
  starts_at timestamptz, ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists audit_log (
  id bigserial primary key,
  user_id uuid references users(id),
  action text not null, entity text, entity_id text,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);
