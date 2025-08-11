-- Add destinations table if it's missing in your database
create table if not exists destinations (
  id bigserial primary key,
  name text not null,
  image text not null,
  "order" int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists destinations_order_idx on destinations("order");
create index if not exists destinations_active_idx on destinations(is_active);
