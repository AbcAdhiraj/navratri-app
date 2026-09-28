-- Navratri NCR — core schema
-- Principles: explicit unknown states (NULL = "not confirmed"), provenance on every fact,
-- freshness timestamps, stable slugs, and RLS so nothing unpublished is publicly readable.

create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

-- ───────────────────────── Enums ─────────────────────────
create type public.area as enum ('delhi', 'dwarka', 'noida', 'gurugram', 'ghaziabad');
create type public.event_type as enum ('garba', 'dandiya', 'bollywood', 'dj_edm', 'ticketed', 'community', 'society_rwa');
create type public.music_style as enum ('traditional_garba', 'dandiya_beats', 'bollywood', 'dj_edm', 'live_band', 'folk', 'devotional');
create type public.vibe_tag as enum ('traditional_garba', 'bollywood_mix', 'dandiya_night', 'late_night', 'dj_night', 'live_music', 'family_friendly', 'large_scale');
create type public.source_kind as enum ('organizer', 'ticketing', 'venue', 'social', 'news', 'community');
create type public.event_status as enum ('draft', 'published', 'cancelled', 'archived');
create type public.price_status as enum ('unknown', 'free', 'paid');
create type public.event_scale as enum ('intimate', 'mid', 'large');
create type public.submission_kind as enum ('new_event', 'correction');
create type public.submission_status as enum ('pending', 'approved', 'rejected', 'duplicate');
create type public.moderation_action as enum ('approve', 'reject', 'mark_duplicate', 'publish', 'unpublish', 'edit');
create type public.admin_role as enum ('admin', 'editor');

-- ───────────────────────── Helpers ─────────────────────────
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ───────────────────────── Admin roles ─────────────────────────
create table public.admin_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.admin_role not null default 'editor',
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_roles where user_id = auth.uid());
$$;

-- Single-row settings. `allow_demo` gates whether DEMO fixtures are publicly readable.
create table public.site_settings (
  id boolean primary key default true check (id),
  allow_demo boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id, allow_demo) values (true, false);

-- ───────────────────────── Venues ─────────────────────────
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 140),
  address text,
  locality text not null check (char_length(locality) between 2 and 80),
  area public.area not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, locality, area)
);
create trigger venues_touch before update on public.venues for each row execute function public.touch_updated_at();
create index venues_area_idx on public.venues (area);
create index venues_locality_trgm on public.venues using gin (locality gin_trgm_ops);
create index venues_name_trgm on public.venues using gin (name gin_trgm_ops);

-- ───────────────────────── Events ─────────────────────────
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 140),
  status public.event_status not null default 'draft',
  is_demo boolean not null default false,
  tagline text check (char_length(tagline) <= 200),
  description text,
  types public.event_type[] not null default '{}',
  music public.music_style[] not null default '{}',
  organizer_name text,
  organizer_url text check (organizer_url is null or organizer_url ~ '^https?://'),
  venue_id uuid not null references public.venues (id) on delete restrict,

  -- Price: NULL/unknown is never rendered as ₹0.
  price_status public.price_status not null default 'unknown',
  price_min_inr integer check (price_min_inr is null or price_min_inr > 0),
  price_max_inr integer check (price_max_inr is null or price_max_inr > 0),
  price_note text,
  constraint price_consistent check (
    (price_status = 'free' and price_min_inr is null and price_max_inr is null)
    or (price_status = 'unknown' and price_min_inr is null and price_max_inr is null)
    or (price_status = 'paid')
  ),
  constraint price_range check (price_max_inr is null or price_min_inr is null or price_max_inr >= price_min_inr),

  -- Entry policy: tri-state booleans, NULL = not confirmed.
  entry_couples_only boolean,
  entry_groups_allowed boolean,
  entry_stags_allowed boolean,
  entry_families_welcome boolean,
  entry_min_age smallint check (entry_min_age is null or entry_min_age between 0 and 99),
  entry_dress_code text,
  entry_note text,

  food_available boolean,
  food_vegetarian_only boolean,
  food_note text,

  booking_url text check (booking_url is null or booking_url ~ '^https://'),
  booking_platform text,
  booking_verified boolean not null default false,
  constraint booking_verified_needs_url check (not booking_verified or booking_url is not null),

  verified_date boolean not null default false,
  verified_price boolean not null default false,
  verified_entry boolean not null default false,
  last_checked_at timestamptz,

  featured boolean not null default false,
  scale public.event_scale,

  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger events_touch before update on public.events for each row execute function public.touch_updated_at();
create index events_status_idx on public.events (status);
create index events_venue_idx on public.events (venue_id);
create index events_types_gin on public.events using gin (types);
create index events_music_gin on public.events using gin (music);
create index events_title_trgm on public.events using gin (title gin_trgm_ops);
create index events_organizer_trgm on public.events using gin (organizer_name gin_trgm_ops);

create table public.event_occurrences (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  date date not null,
  start_time time,
  end_time time,
  note text,
  unique (event_id, date, start_time)
);
create index occurrences_date_idx on public.event_occurrences (date);
create index occurrences_event_idx on public.event_occurrences (event_id);

create table public.event_sources (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  kind public.source_kind not null,
  label text not null,
  url text not null check (url ~ '^https?://'),
  checked_at timestamptz,
  created_at timestamptz not null default now()
);
create index sources_event_idx on public.event_sources (event_id);

-- A vibe label only exists with factual evidence.
create table public.event_vibes (
  event_id uuid not null references public.events (id) on delete cascade,
  tag public.vibe_tag not null,
  evidence text not null check (char_length(evidence) >= 5),
  source_id uuid references public.event_sources (id) on delete set null,
  primary key (event_id, tag)
);

create table public.event_media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  url text not null,
  alt text not null check (char_length(alt) >= 3),
  credit text,
  year smallint,
  width integer,
  height integer,
  -- Only media with confirmed permission is ever public.
  authorized boolean not null default false,
  sort smallint not null default 0,
  created_at timestamptz not null default now()
);
create index media_event_idx on public.event_media (event_id, sort);

-- Crowd-perception reports: raw reports are private; only an aggregate with >= 3 reports is public.
create table public.crowd_reports (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  edition_year smallint not null,
  women_pct_estimate smallint not null check (women_pct_estimate between 0 and 100),
  status public.submission_status not null default 'pending',
  reporter_hash text,
  created_at timestamptz not null default now()
);
create index crowd_event_idx on public.crowd_reports (event_id, edition_year);

-- (crowd_summary view is defined after event_is_public below)

-- ───────────────────────── Submissions & moderation ─────────────────────────
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  kind public.submission_kind not null,
  status public.submission_status not null default 'pending',
  event_id uuid references public.events (id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  evidence_urls text[] not null default '{}',
  evidence_paths text[] not null default '{}',
  contact_email text check (contact_email is null or contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  submitter_note text check (char_length(submitter_note) <= 2000),
  created_at timestamptz not null default now(),
  constraint correction_needs_event check (kind <> 'correction' or event_id is not null)
);
create index submissions_status_idx on public.submissions (status, created_at desc);

create table public.revisions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  before jsonb,
  after jsonb not null,
  actor uuid references auth.users (id) on delete set null,
  actor_label text,
  submission_id uuid references public.submissions (id) on delete set null,
  created_at timestamptz not null default now()
);
create index revisions_event_idx on public.revisions (event_id, created_at desc);

create table public.moderation_decisions (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.submissions (id) on delete set null,
  event_id uuid references public.events (id) on delete set null,
  action public.moderation_action not null,
  note text,
  actor uuid references auth.users (id) on delete set null,
  actor_label text,
  created_at timestamptz not null default now()
);
create index decisions_created_idx on public.moderation_decisions (created_at desc);

-- Duplicate detection: trigram similarity on title + same area/date overlap boosts.
create or replace function public.find_duplicate_events(p_title text, p_area public.area default null, p_dates date[] default null)
returns table (event_id uuid, slug text, title text, score real)
language sql stable security definer set search_path = public as $$
  select e.id, e.slug, e.title,
    least(1.0,
      similarity(e.title, p_title) * 0.7
      + case when p_area is not null and v.area = p_area then 0.15 else 0 end
      + case when p_dates is not null and exists (
          select 1 from event_occurrences o where o.event_id = e.id and o.date = any (p_dates)) then 0.15 else 0 end
    )::real as score
  from events e join venues v on v.id = e.venue_id
  where public.is_admin() and similarity(e.title, p_title) > 0.2
  order by score desc
  limit 10;
$$;

-- ───────────────────────── Row-level security ─────────────────────────
alter table public.admin_roles enable row level security;
alter table public.site_settings enable row level security;
alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.event_occurrences enable row level security;
alter table public.event_sources enable row level security;
alter table public.event_vibes enable row level security;
alter table public.event_media enable row level security;
alter table public.crowd_reports enable row level security;
alter table public.submissions enable row level security;
alter table public.revisions enable row level security;
alter table public.moderation_decisions enable row level security;

-- Public visibility of an event: published, and never a demo fixture unless explicitly allowed.
create or replace function public.event_is_public(e_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from events e
    where e.id = e_id and e.status = 'published'
      and (not e.is_demo or (select allow_demo from site_settings where id))
  );
$$;

create or replace view public.crowd_summary
with (security_invoker = false) as
  select
    r.event_id,
    r.edition_year,
    (r.edition_year::text || ' edition') as edition_label,
    (floor(percentile_cont(0.25) within group (order by r.women_pct_estimate) / 5) * 5)::int as women_pct_low,
    (ceil(percentile_cont(0.75) within group (order by r.women_pct_estimate) / 5) * 5)::int as women_pct_high,
    count(*)::int as report_count
  from public.crowd_reports r
  where r.status = 'approved' and public.event_is_public(r.event_id)
  group by r.event_id, r.edition_year
  having count(*) >= 3;

create policy "public read published events" on public.events for select
  using (public.event_is_public(id) or public.is_admin());
create policy "public read venues" on public.venues for select using (true);
create policy "public read occurrences" on public.event_occurrences for select
  using (public.event_is_public(event_id) or public.is_admin());
create policy "public read sources" on public.event_sources for select
  using (public.event_is_public(event_id) or public.is_admin());
create policy "public read vibes" on public.event_vibes for select
  using (public.event_is_public(event_id) or public.is_admin());
create policy "public read authorized media" on public.event_media for select
  using ((authorized and public.event_is_public(event_id)) or public.is_admin());
create policy "settings readable" on public.site_settings for select using (true);

-- Anyone may submit; nobody but admins may read submissions back.
create policy "anyone can submit" on public.submissions for insert
  with check (status = 'pending');
create policy "anyone can report crowd" on public.crowd_reports for insert
  with check (status = 'pending');

-- Admin full access.
create policy "admin all events" on public.events for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all venues" on public.venues for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all occurrences" on public.event_occurrences for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all sources" on public.event_sources for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all vibes" on public.event_vibes for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all media" on public.event_media for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all crowd" on public.crowd_reports for all using (public.is_admin()) with check (public.is_admin());
create policy "admin read submissions" on public.submissions for select using (public.is_admin());
create policy "admin update submissions" on public.submissions for update using (public.is_admin()) with check (public.is_admin());
create policy "admin all revisions" on public.revisions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all decisions" on public.moderation_decisions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin read roles" on public.admin_roles for select using (public.is_admin());
create policy "admin update settings" on public.site_settings for update using (public.is_admin()) with check (public.is_admin());

grant select on public.crowd_summary to anon, authenticated;

-- ───────────────────────── Storage ─────────────────────────
-- evidence: private uploads attached to submissions (written server-side with the service role).
-- event-media: public images, only uploaded by admins once permission is confirmed.
insert into storage.buckets (id, name, public) values ('evidence', 'evidence', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('event-media', 'event-media', true) on conflict do nothing;

create policy "admins read evidence" on storage.objects for select
  using (bucket_id = 'evidence' and public.is_admin());
create policy "admins write event media" on storage.objects for insert
  with check (bucket_id = 'event-media' and public.is_admin());
