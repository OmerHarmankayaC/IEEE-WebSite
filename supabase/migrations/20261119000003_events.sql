-- Events: a post can now be an event with a date, a place and registrations.

create type public.post_kind as enum ('post', 'event');
create type public.event_registration_mode as enum ('none', 'site', 'external');

alter table public.posts
  add column kind public.post_kind not null default 'post',
  add column event_starts_at timestamptz,
  add column event_ends_at timestamptz,
  add column event_location text check (char_length(event_location) <= 200),
  add column event_location_url text check (char_length(event_location_url) <= 500 and event_location_url ~ '^https://'),
  add column event_committee text check (event_committee in ('cs', 'ras', 'wie')),
  add column event_registration public.event_registration_mode not null default 'none',
  add column event_registration_url text check (char_length(event_registration_url) <= 500 and event_registration_url ~ '^https://'),
  add column event_registration_closes_at timestamptz,
  add column event_capacity integer check (event_capacity between 1 and 10000),
  add column event_guide text check (char_length(event_guide) <= 100),
  add constraint event_needs_start check (kind = 'post' or event_starts_at is not null),
  add constraint event_ends_after_start check (event_ends_at is null or event_ends_at > event_starts_at),
  add constraint external_registration_needs_url check (event_registration <> 'external' or event_registration_url is not null);

create index posts_kind_starts_at_idx on public.posts (kind, event_starts_at);

-- Only one post or event can be featured on the home page at a time.
create unique index posts_one_featured_idx on public.posts (featured) where featured;

-- Registrations made through the form on the site.
create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) <= 200),
  department text check (char_length(department) <= 100),
  created_at timestamptz not null default now()
);

create unique index event_registrations_once_idx on public.event_registrations (post_id, lower(email));
create index event_registrations_created_at_idx on public.event_registrations (created_at);

alter table public.event_registrations enable row level security;

-- Visitors never read or write this table directly; they go through register_for_event.
create policy "Admins can read registrations"
  on public.event_registrations for select
  to authenticated
  using ((select private.is_admin()));

create policy "Admins can delete registrations"
  on public.event_registrations for delete
  to authenticated
  using ((select private.is_admin()));

-- Registers a visitor for an event. Returns 'ok' or a short reason the site can show.
create or replace function public.register_for_event(p_slug text, p_name text, p_email text, p_department text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_department text := nullif(btrim(coalesce(p_department, '')), '');
  v_event public.posts%rowtype;
  v_count integer;
begin
  if char_length(v_name) not between 2 and 100 then
    return 'invalid_name';
  end if;
  if char_length(v_email) > 200 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    return 'invalid_email';
  end if;
  if char_length(coalesce(v_department, '')) > 100 then
    return 'invalid_department';
  end if;

  -- Locking the event row makes concurrent registrations wait, so the capacity holds.
  select * into v_event
  from public.posts
  where slug = p_slug
    and kind = 'event'
    and status = 'published'
    and published_at <= now()
  for update;

  if not found or v_event.event_registration <> 'site' then
    return 'not_found';
  end if;
  if now() >= coalesce(v_event.event_registration_closes_at, v_event.event_starts_at) then
    return 'closed';
  end if;
  if exists (select 1 from public.event_registrations where post_id = v_event.id and lower(email) = v_email) then
    return 'duplicate';
  end if;
  if (select count(*) from public.event_registrations where lower(email) = v_email and created_at > now() - interval '1 hour') >= 5
     or (select count(*) from public.event_registrations where created_at > now() - interval '1 hour') >= 300 then
    return 'rate_limited';
  end if;

  select count(*) into v_count from public.event_registrations where post_id = v_event.id;
  if v_event.event_capacity is not null and v_count >= v_event.event_capacity then
    return 'full';
  end if;

  insert into public.event_registrations (post_id, name, email, department)
  values (v_event.id, v_name, v_email, v_department);
  return 'ok';
end;
$$;

revoke execute on function public.register_for_event(text, text, text, text) from public;
grant execute on function public.register_for_event(text, text, text, text) to anon, authenticated;

-- How many people registered for each published event. Counts only, no names.
create or replace function public.event_registration_counts()
returns table (post_id uuid, registered integer)
language sql
stable
security definer
set search_path = ''
as $$
  select r.post_id, count(*)::integer
  from public.event_registrations r
  join public.posts p on p.id = r.post_id
  where p.kind = 'event' and p.status = 'published' and p.published_at <= now()
  group by r.post_id;
$$;

revoke execute on function public.event_registration_counts() from public;
grant execute on function public.event_registration_counts() to anon, authenticated;
