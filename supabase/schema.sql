-- SasBarbería — Supabase Schema
-- Ejecutar en el SQL Editor de Supabase

-- ─────────────────────────────────────────
-- PROFILES (linked to auth.users)
-- ─────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'employee')),
  barbershop_id uuid,
  barbershop_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, barbershop_name, barbershop_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'barbershop_name',
    new.id  -- use user id as barbershop_id for single-owner setup
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null,
  full_name text not null,
  phone text,
  age integer check (age >= 0 and age <= 120),
  birthday date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Users manage their clients"
  on public.clients for all
  using (barbershop_id = auth.uid())
  with check (barbershop_id = auth.uid());

create index on public.clients (barbershop_id);

-- ─────────────────────────────────────────
-- PRODUCTS / INVENTORY
-- ─────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null,
  name text not null,
  category text,
  purchase_price numeric(10,2) not null default 0,
  sale_price numeric(10,2) not null default 0,
  stock integer not null default 0,
  min_stock integer not null default 3,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Users manage their products"
  on public.products for all
  using (barbershop_id = auth.uid())
  with check (barbershop_id = auth.uid());

create index on public.products (barbershop_id);

-- ─────────────────────────────────────────
-- TRANSACTIONS (income & expenses)
-- ─────────────────────────────────────────
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(10,2) not null,
  description text not null,
  category text,
  client_id uuid references public.clients(id) on delete set null,
  date date not null default current_date,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users manage their transactions"
  on public.transactions for all
  using (barbershop_id = auth.uid())
  with check (barbershop_id = auth.uid());

create index on public.transactions (barbershop_id, date desc);

-- ─────────────────────────────────────────
-- MEMBERSHIPS
-- ─────────────────────────────────────────
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null,
  client_id uuid not null references public.clients(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'quarterly', 'annual')),
  price numeric(10,2) not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.memberships enable row level security;

create policy "Users manage their memberships"
  on public.memberships for all
  using (barbershop_id = auth.uid())
  with check (barbershop_id = auth.uid());

create index on public.memberships (barbershop_id, status);
