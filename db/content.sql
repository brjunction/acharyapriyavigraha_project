-- Systematic content: audio, video, compilations, books, translations, WebFolio.
-- "search" columns hold lower-case text without diacritics, written by the app, for diacritic-free search.
create extension if not exists pg_trgm;

create table if not exists audios (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'lecture', type text,
  slug text not null unique,
  title text not null,
  date date, date_note text,
  place text, country text, occasion text,
  scripture text, canto int, chapter int, verse text,
  language text, series text, topics text[] not null default '{}',
  duration_sec int, audio_url text, audio_url_alt text,
  song text, song_author text, singer text,
  summary text, notes text,
  transcript jsonb not null default '[]', transcript_status text not null default 'none',
  position int not null default 0, status text not null default 'published',
  search text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists audios_kind_date on audios(kind, date desc);
create index if not exists audios_search on audios using gin (search gin_trgm_ops);

create table if not exists vocab (
  id uuid primary key default gen_random_uuid(),
  kind text not null, name text not null, extra jsonb not null default '{}',
  unique (kind, name)
);

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'lecture',
  slug text not null unique,
  title text not null, date date, youtube_id text, url text,
  place text, language text, series text, topics text[] not null default '{}',
  duration_sec int, description text, channel text,
  audio_id uuid references audios(id) on delete set null,
  position int not null default 0, status text not null default 'published',
  search text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists videos_kind_date on videos(kind, date desc);
create index if not exists videos_search on videos using gin (search gin_trgm_ops);

create table if not exists excerpts (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  slug text not null unique,
  title text not null default '', text text not null default '',
  audio_id uuid references audios(id) on delete set null, at_sec int,
  source text, verse_ref text, original text, transliteration text, translation text,
  author text, date date, day_of_year int, topics text[] not null default '{}',
  position int not null default 0, status text not null default 'published',
  search text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists excerpts_kind on excerpts(kind, position);
create index if not exists excerpts_search on excerpts using gin (search gin_trgm_ops);

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null, subtitle text, author text, category text,
  cover_url text, icon text, description text,
  layout text not null default 'classic',
  publisher text, year text, language text not null default 'en',
  position int not null default 0, status text not null default 'draft',
  settings jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists book_nodes (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  parent_id uuid references book_nodes(id) on delete cascade,
  kind text not null default 'chapter',
  position int not null default 0,
  title text not null, slug text not null,
  blocks jsonb not null default '[]',
  status text not null default 'published',
  search text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists book_nodes_tree on book_nodes(book_id, parent_id, position);
create index if not exists book_nodes_search on book_nodes using gin (search gin_trgm_ops);

create table if not exists translations (
  id uuid primary key default gen_random_uuid(),
  entity text not null, entity_id uuid not null, lang text not null,
  title text, blocks jsonb not null default '[]',
  status text not null default 'draft', translator text,
  search text not null default '',
  updated_at timestamptz not null default now(),
  unique (entity, entity_id, lang)
);

create table if not exists folio_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null, source text not null, config jsonb not null default '{}',
  position int not null default 0, enabled boolean not null default true
);

create table if not exists calendar_events (id uuid primary key default gen_random_uuid(), date date not null, title text not null, kind text not null default 'festival', fasting text, paran text, description text, location text not null default 'Bhubaneswar', link text, status text not null default 'published', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index if not exists calendar_events_date on calendar_events(location, date);
create table if not exists diary_entries (id uuid primary key default gen_random_uuid(), slug text not null unique, date date, date_note text, place text, title text, original text, original_lang text default 'or', translation text, scan_url text, notes text, volume text, page text, position int not null default 0, status text not null default 'published', search text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index if not exists diary_entries_date on diary_entries(date, position);
create index if not exists diary_search on diary_entries using gin (search gin_trgm_ops);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, subtitle text,
  author text, series text, series_part int, section text, date date, summary text, cover text,
  body jsonb not null default '[]', topics text[] not null default '{}', source text, source_url text,
  position int not null default 0, status text not null default 'published', search text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists articles_search on articles using gin (search gin_trgm_ops);
create index if not exists articles_author on articles(author);
create index if not exists articles_series on articles(series, series_part);

create table if not exists magazines (
  id uuid primary key default gen_random_uuid(), title text not null, publisher text, description text, cover text, url text,
  issues jsonb not null default '[]', position int not null default 0, status text not null default 'published',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
