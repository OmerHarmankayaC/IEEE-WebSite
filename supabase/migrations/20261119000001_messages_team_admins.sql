-- Contact messages, the board of directors and admin management.
-- Already applied to the production project; kept here so the database can be rebuilt.

-- Contact messages ------------------------------------------------------------

create type public.message_status as enum ('new', 'read');

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200),
  body text not null check (char_length(body) between 5 and 5000),
  status public.message_status not null default 'new',
  created_at timestamptz not null default now()
);

create index messages_created_at_idx on public.messages (created_at desc);
create index messages_email_created_at_idx on public.messages (email, created_at desc);

alter table public.messages enable row level security;

-- Visitors cannot write to the table directly; they go through public.send_message().
create policy "Admins can read messages"
  on public.messages for select
  to authenticated
  using ((select private.is_admin()));

create policy "Admins can update messages"
  on public.messages for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can delete messages"
  on public.messages for delete
  to authenticated
  using ((select private.is_admin()));

-- The only way to send a message: checks the fields and limits how many can arrive,
-- 3 an hour from one address and 30 an hour in total.
create or replace function public.send_message(p_name text, p_email text, p_body text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_body text := btrim(coalesce(p_body, ''));
begin
  if char_length(v_name) not between 1 and 100 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  if char_length(v_email) > 200 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'invalid_email' using errcode = '22023';
  end if;
  if char_length(v_body) not between 5 and 5000 then
    raise exception 'invalid_body' using errcode = '22023';
  end if;
  if (select count(*) from public.messages where email = v_email and created_at > now() - interval '1 hour') >= 3
     or (select count(*) from public.messages where created_at > now() - interval '1 hour') >= 30 then
    raise exception 'rate_limited' using errcode = '22023';
  end if;

  insert into public.messages (name, email, body) values (v_name, v_email, v_body);
end;
$$;

revoke all on function public.send_message(text, text, text) from public;
grant execute on function public.send_message(text, text, text) to anon, authenticated;

-- Board of directors ----------------------------------------------------------

create table public.team_terms (
  id text primary key check (id ~ '^[0-9]{4}-[0-9]{4}$'),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create type public.team_group as enum ('board', 'cs', 'ras', 'wie', 'media');
create type public.team_role as enum (
  'president', 'vicePresident', 'leader',
  'csMember', 'rasMember', 'wieMember', 'designMember', 'mediaMember'
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  term_id text not null references public.team_terms (id) on delete cascade,
  team public.team_group not null,
  role public.team_role not null,
  name text not null check (char_length(name) between 1 and 100),
  linkedin text check (linkedin is null or linkedin ~ '^https://'),
  -- A bundled photo under /images/team/ or a path in the team-photos bucket.
  photo_path text,
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index team_members_term_id_idx on public.team_members (term_id);

alter table public.team_terms enable row level security;
alter table public.team_members enable row level security;

create policy "Published terms are public, admins see all"
  on public.team_terms for select
  to anon, authenticated
  using (published or (select private.is_admin()));

create policy "Admins can add terms"
  on public.team_terms for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "Admins can edit terms"
  on public.team_terms for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can delete terms"
  on public.team_terms for delete
  to authenticated
  using ((select private.is_admin()));

create policy "Members of published terms are public, admins see all"
  on public.team_members for select
  to anon, authenticated
  using (
    exists (select 1 from public.team_terms t where t.id = term_id and t.published)
    or (select private.is_admin())
  );

create policy "Admins can add members"
  on public.team_members for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "Admins can edit members"
  on public.team_members for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can delete members"
  on public.team_members for delete
  to authenticated
  using ((select private.is_admin()));

create trigger team_members_touch_updated_at
  before update on public.team_members
  for each row execute function public.touch_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('team-photos', 'team-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Admins can see team photos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'team-photos' and (select private.is_admin()));

create policy "Admins can upload team photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'team-photos' and (select private.is_admin()));

create policy "Admins can replace team photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'team-photos' and (select private.is_admin()))
  with check (bucket_id = 'team-photos' and (select private.is_admin()));

create policy "Admins can delete team photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'team-photos' and (select private.is_admin()));

-- Admins ----------------------------------------------------------------------

create policy "Admins can read all admins"
  on public.admins for select
  to authenticated
  using ((select private.is_admin()));

-- An admin can remove other admins but never themselves, so the panel is never left empty.
create policy "Admins can remove other admins"
  on public.admins for delete
  to authenticated
  using ((select private.is_admin()) and user_id <> (select auth.uid()));

-- New admins are added by the invite-admin Edge Function, which runs with the service role.

-- Admin list with e-mail addresses, which live in auth.users and are not exposed otherwise.
create or replace function public.list_admins()
returns table (user_id uuid, email text, added_at timestamptz, last_sign_in_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select a.user_id, u.email::text, a.created_at, u.last_sign_in_at
  from public.admins a
  join auth.users u on u.id = a.user_id
  where (select private.is_admin())
  order by a.created_at;
$$;

revoke all on function public.list_admins() from public;
grant execute on function public.list_admins() to authenticated;

-- Supabase grants new functions to anon by default; the admin list is for signed-in admins only.
revoke execute on function public.list_admins() from anon;
