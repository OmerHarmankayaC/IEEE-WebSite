-- Schema for the IEEE TEDU website blog. Already applied to the production project;
-- kept here so the database can be rebuilt from scratch.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- Admins: only users listed here can manage content.
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create policy "Admins can read their own row"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Kept outside the public schema so it is not exposed through the API.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_tr text not null,
  name_en text,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;

create policy "Categories are public"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Admins can add categories"
  on public.categories for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "Admins can edit categories"
  on public.categories for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can delete categories"
  on public.categories for delete
  to authenticated
  using ((select private.is_admin()));

-- Posts
create type public.post_status as enum ('draft', 'published');

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status public.post_status not null default 'draft',
  category_id uuid references public.categories (id) on delete set null,
  cover_path text,
  featured boolean not null default false,
  published_at timestamptz,
  title_tr text not null check (char_length(title_tr) between 1 and 200),
  excerpt_tr text check (char_length(excerpt_tr) <= 200),
  content_tr text not null default '',
  title_en text check (char_length(title_en) <= 200),
  excerpt_en text check (char_length(excerpt_en) <= 200),
  content_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_needs_date check (status = 'draft' or published_at is not null)
);

create index posts_status_published_at_idx on public.posts (status, published_at desc);
create index posts_category_id_idx on public.posts (category_id);

alter table public.posts enable row level security;

create policy "Published posts are public, admins see all"
  on public.posts for select
  to anon, authenticated
  using (
    (status = 'published' and published_at <= now())
    or (select private.is_admin())
  );

create policy "Admins can add posts"
  on public.posts for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "Admins can edit posts"
  on public.posts for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can delete posts"
  on public.posts for delete
  to authenticated
  using ((select private.is_admin()));

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- Image storage: public read through public URLs, writes only for admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

create policy "Admins can see blog images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'blog-images' and (select private.is_admin()));

create policy "Admins can upload blog images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images' and (select private.is_admin()));

create policy "Admins can replace blog images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images' and (select private.is_admin()))
  with check (bucket_id = 'blog-images' and (select private.is_admin()));

create policy "Admins can delete blog images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images' and (select private.is_admin()));

-- Starting categories
insert into public.categories (slug, name_tr, name_en) values
  ('atolye', 'Atölye', 'Workshop'),
  ('kariyer-soylesileri', 'Kariyer Söyleşileri', 'Career Talks'),
  ('mentorluk', 'Mentörlük', 'Mentorship'),
  ('proje-takimlari', 'Proje Takımları', 'Project Teams'),
  ('teknik-gezi', 'Teknik Gezi', 'Technical Trip');
