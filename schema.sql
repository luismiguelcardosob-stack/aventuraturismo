-- AVENTURA TURISMO - SUPABASE
create extension if not exists pgcrypto;

create table if not exists boats (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into boats(name)
select 'Capitão Gancho'
where not exists (select 1 from boats where name='Capitão Gancho');

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text not null check (sector in ('BAR','COZINHA')),
  price numeric(12,2) not null default 0,
  stock numeric(12,3) not null default 0,
  min_stock numeric(12,3) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists tabs (
  id uuid primary key default gen_random_uuid(),
  boat_id uuid references boats(id),
  number text not null,
  customer text,
  status text not null default 'ABERTA' check(status in ('ABERTA','FECHADA','CANCELADA')),
  total numeric(12,2) not null default 0,
  opened_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  tab_id uuid not null references tabs(id) on delete restrict,
  status text not null default 'ENVIADO',
  total numeric(12,2) not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete restrict,
  product_id uuid not null references products(id),
  product_name text not null,
  sector text not null,
  qty numeric(12,3) not null,
  unit_price numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  tab_id uuid not null references tabs(id),
  method text not null check(method in ('PIX','DINHEIRO','CARTAO')),
  amount numeric(12,2) not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  kind text not null check(kind in ('ENTRADA','VENDA','PERDA','AJUSTE','CORTESIA')),
  qty numeric(12,3) not null,
  reason text,
  reference_id uuid,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  entity text not null,
  entity_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table boats enable row level security;
alter table products enable row level security;
alter table tabs enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table stock_movements enable row level security;
alter table audit_log enable row level security;

-- MVP: usuários autenticados podem operar.
-- Em produção, substitua por políticas por função (ADMIN, GERENTE, GARCOM, BAR, COZINHA).
create policy "auth read boats" on boats for select to authenticated using (true);
create policy "auth read products" on products for select to authenticated using (true);
create policy "auth write products" on products for all to authenticated using (true) with check (true);
create policy "auth tabs" on tabs for all to authenticated using (true) with check (true);
create policy "auth orders" on orders for all to authenticated using (true) with check (true);
create policy "auth order_items" on order_items for all to authenticated using (true) with check (true);
create policy "auth payments" on payments for all to authenticated using (true) with check (true);
create policy "auth stock" on stock_movements for all to authenticated using (true) with check (true);
create policy "auth audit read" on audit_log for select to authenticated using (true);
create policy "auth audit insert" on audit_log for insert to authenticated with check (true);
