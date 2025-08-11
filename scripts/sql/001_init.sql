-- Enable required extensions
create extension if not exists pgcrypto;

-- Users and sessions
create table if not exists users (
  id bigserial primary key,
  username text not null unique,
  password_hash text not null,
  role text not null default 'user',
  security_question text,
  security_answer text,
  created_at timestamptz not null default now()
);

create table if not exists app_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists app_sessions_user_idx on app_sessions(user_id);
create index if not exists app_sessions_expires_idx on app_sessions(expires_at);

-- Home settings and slides
create table if not exists home_settings (
  id int primary key default 1,
  hero_title text,
  hero_subtitle text,
  hero_button_text text,
  updated_at timestamptz not null default now()
);

create table if not exists hero_slides (
  id bigserial primary key,
  image text not null,
  alt text not null,
  "order" int not null default 1,
  is_active boolean not null default true,
  settings_id int not null default 1 references home_settings(id) on delete cascade,
  updated_at timestamptz not null default now()
);
create index if not exists hero_slides_order_idx on hero_slides("order");

-- Music
create table if not exists music_tracks (
  id bigserial primary key,
  name text not null,
  artist text not null,
  cover_image text not null,
  youtube_url text not null,
  "order" int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists music_tracks_order_idx on music_tracks("order");

-- Culture video
create table if not exists culture_video (
  id int primary key default 1,
  title text not null,
  description text not null,
  youtube_url text default '',
  thumbnail text default '',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Blog
create table if not exists blog_categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  "order" int not null default 1
);

create table if not exists blog_posts (
  id bigserial primary key,
  title text not null,
  excerpt text not null,
  content text not null,
  image text,
  category text not null references blog_categories(id),
  slug text not null unique,
  published_at timestamptz not null default now(),
  read_time int not null default 5,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists blog_posts_active_idx on blog_posts(is_active);
create index if not exists blog_posts_published_idx on blog_posts(published_at desc);

-- News
create table if not exists news (
  id bigserial primary key,
  title text not null,
  excerpt text not null,
  content text not null,
  image text not null,
  category text not null,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists news_active_idx on news(is_active);
create index if not exists news_published_idx on news(published_at desc);

-- News widgets
create table if not exists news_widgets (
  id bigserial primary key,
  type text not null check (type in ('time','safety','emergency','embassy','tourist-help','custom')),
  title text not null,
  is_active boolean not null default true,
  "order" int not null default 1,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists news_widgets_active_idx on news_widgets(is_active);
create index if not exists news_widgets_order_idx on news_widgets("order");
