-- Blog tables for EN/HE content
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null references public.locales(code),
  status text not null default 'draft' check (status in ('draft', 'published')),
  title text not null,
  subtitle text,
  excerpt text,
  content jsonb default '[]'::jsonb,
  read_time text,
  og_image text,
  meta_title text,
  meta_description text,
  meta_h1 text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists blog_posts_slug_locale_idx on public.blog_posts (slug, locale);
create index if not exists blog_posts_status_idx on public.blog_posts (status);
create index if not exists blog_posts_published_at_idx on public.blog_posts (published_at desc nulls last);

-- optional updated_at trigger (if you don't already have one)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();
