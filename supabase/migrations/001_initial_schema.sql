-- =============================================
-- SalvaPlato — Schema inicial
-- Aplicar en: Supabase > SQL Editor
-- =============================================

-- =============================================
-- EXTENSIONES
-- =============================================

create extension if not exists "uuid-ossp";


-- =============================================
-- ENUMS
-- =============================================

create type restaurant_status as enum ('pending', 'approved', 'suspended');
create type offer_status      as enum ('active', 'paused', 'closed', 'expired');
create type order_status      as enum ('pending', 'completed', 'expired', 'refunded');
create type device_platform   as enum ('ios', 'android');


-- =============================================
-- PROFILES
-- Extiende auth.users de Supabase
-- =============================================

create table profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  full_name          text not null default '',
  phone              text,
  zone               text,
  profile_photo_url  text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);


-- =============================================
-- RESTAURANTS
-- =============================================

create table restaurants (
  id                uuid primary key default uuid_generate_v4(),
  owner_id          uuid not null references auth.users(id) on delete cascade,
  name              text not null,
  rif               text not null,
  owner_name        text not null,
  phone             text not null,
  address           text not null,
  latitude          numeric(10, 7) not null,
  longitude         numeric(10, 7) not null,
  cuisine_type      text not null,
  schedule          jsonb,
  logo_url          text,
  cover_photo_url   text,
  description       text,
  instagram         text,
  status            restaurant_status not null default 'pending',
  stripe_account_id text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_restaurants_owner   on restaurants(owner_id);
create index idx_restaurants_status  on restaurants(status);
create index idx_restaurants_cuisine on restaurants(cuisine_type);
create index idx_restaurants_location on restaurants(latitude, longitude);


-- =============================================
-- OFFERS
-- =============================================

create table offers (
  id                  uuid primary key default uuid_generate_v4(),
  restaurant_id       uuid not null references restaurants(id) on delete cascade,
  title               text not null,
  description         text,
  original_price      numeric(10, 2) not null check (original_price > 0),
  offer_price         numeric(10, 2) not null check (offer_price > 0),
  quantity_total      int not null check (quantity_total > 0),
  quantity_available  int not null check (quantity_available >= 0),
  emoji               text,
  category            text,
  photo_url           text,
  pickup_deadline     timestamptz not null,
  status              offer_status not null default 'active',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint offer_price_lower    check (offer_price < original_price),
  constraint quantity_consistency check (quantity_available <= quantity_total)
);

create index idx_offers_restaurant on offers(restaurant_id);
create index idx_offers_status     on offers(status);
create index idx_offers_deadline   on offers(pickup_deadline);


-- =============================================
-- ORDERS
-- =============================================

create table orders (
  id                        uuid primary key default uuid_generate_v4(),
  order_code                text not null unique,
  consumer_id               uuid not null references auth.users(id) on delete restrict,
  offer_id                  uuid not null references offers(id) on delete restrict,
  restaurant_id             uuid not null references restaurants(id) on delete restrict,
  quantity                  int not null default 1 check (quantity > 0),
  unit_price                numeric(10, 2) not null,
  subtotal                  numeric(10, 2) not null,
  commission_rate           numeric(5, 4) not null,
  commission_amount         numeric(10, 2) not null,
  restaurant_payout         numeric(10, 2) not null,
  status                    order_status not null default 'pending',
  stripe_payment_intent_id  text,
  stripe_transfer_id        text,
  qr_token                  text not null unique default uuid_generate_v4()::text,
  pickup_deadline           timestamptz not null,
  scanned_at                timestamptz,
  rating                    smallint check (rating between 1 and 5),
  rated_at                  timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index idx_orders_consumer   on orders(consumer_id);
create index idx_orders_restaurant on orders(restaurant_id);
create index idx_orders_status     on orders(status);
create index idx_orders_qr_token   on orders(qr_token);
create index idx_orders_deadline   on orders(pickup_deadline);


-- =============================================
-- FAVORITES
-- =============================================

create table favorites (
  id             uuid primary key default uuid_generate_v4(),
  consumer_id    uuid not null references auth.users(id) on delete cascade,
  restaurant_id  uuid not null references restaurants(id) on delete cascade,
  created_at     timestamptz not null default now(),

  unique(consumer_id, restaurant_id)
);

create index idx_favorites_consumer on favorites(consumer_id);


-- =============================================
-- PUSH TOKENS
-- =============================================

create table push_tokens (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  token       text not null unique,
  platform    device_platform not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_push_tokens_user on push_tokens(user_id);


-- =============================================
-- FUNCIÓN: updated_at automático
-- =============================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger trg_restaurants_updated_at
  before update on restaurants
  for each row execute function update_updated_at();

create trigger trg_offers_updated_at
  before update on offers
  for each row execute function update_updated_at();

create trigger trg_orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

create trigger trg_push_tokens_updated_at
  before update on push_tokens
  for each row execute function update_updated_at();


-- =============================================
-- FUNCIÓN: descontar stock al crear orden
-- Previene race conditions con check atómico
-- =============================================

create or replace function decrement_offer_quantity()
returns trigger as $$
begin
  update offers
  set quantity_available = quantity_available - new.quantity
  where id = new.offer_id
    and quantity_available >= new.quantity;

  if not found then
    raise exception 'Stock insuficiente para esta oferta';
  end if;

  -- Auto-cerrar oferta si stock llega a 0
  update offers
  set status = 'closed'
  where id = new.offer_id
    and quantity_available = 0;

  return new;
end;
$$ language plpgsql;

create trigger trg_decrement_offer_quantity
  after insert on orders
  for each row execute function decrement_offer_quantity();


-- =============================================
-- FUNCIÓN: restaurar stock al reembolsar
-- =============================================

create or replace function restore_offer_quantity()
returns trigger as $$
begin
  if new.status = 'refunded' and old.status != 'refunded' then
    update offers
    set
      quantity_available = quantity_available + old.quantity,
      status = case when status = 'closed' then 'active' else status end
    where id = old.offer_id;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_restore_offer_quantity
  after update on orders
  for each row execute function restore_offer_quantity();


-- =============================================
-- FUNCIÓN: crear profile automáticamente
-- al registrarse un usuario nuevo
-- =============================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- =============================================
-- FUNCIÓN: generar order_code legible
-- Formato: SP-XXXXX (letras y números)
-- =============================================

create or replace function generate_order_code()
returns text as $$
declare
  chars  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code   text := 'SP-';
  i      int;
begin
  for i in 1..5 loop
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return code;
end;
$$ language plpgsql;


-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table profiles    enable row level security;
alter table restaurants enable row level security;
alter table offers      enable row level security;
alter table orders      enable row level security;
alter table favorites   enable row level security;
alter table push_tokens enable row level security;


-- PROFILES
create policy "profile: select own"
  on profiles for select using (auth.uid() = id);

create policy "profile: update own"
  on profiles for update using (auth.uid() = id);


-- RESTAURANTS
create policy "restaurant: select approved (public)"
  on restaurants for select using (status = 'approved');

create policy "restaurant: select own"
  on restaurants for select using (auth.uid() = owner_id);

create policy "restaurant: insert own"
  on restaurants for insert with check (auth.uid() = owner_id);

create policy "restaurant: update own"
  on restaurants for update using (auth.uid() = owner_id);


-- OFFERS
create policy "offer: select active (public)"
  on offers for select using (status = 'active');

create policy "offer: all by owner"
  on offers for all
  using (
    exists (
      select 1 from restaurants r
      where r.id = offers.restaurant_id and r.owner_id = auth.uid()
    )
  );


-- ORDERS
create policy "order: select own (consumer)"
  on orders for select using (auth.uid() = consumer_id);

create policy "order: insert own (consumer)"
  on orders for insert with check (auth.uid() = consumer_id);

create policy "order: select by restaurant owner"
  on orders for select
  using (
    exists (
      select 1 from restaurants r
      where r.id = orders.restaurant_id and r.owner_id = auth.uid()
    )
  );

create policy "order: update by restaurant owner (scan QR)"
  on orders for update
  using (
    exists (
      select 1 from restaurants r
      where r.id = orders.restaurant_id and r.owner_id = auth.uid()
    )
  );

create policy "order: update own (consumer rating)"
  on orders for update
  using (auth.uid() = consumer_id);


-- FAVORITES
create policy "favorite: all own"
  on favorites for all
  using (auth.uid() = consumer_id)
  with check (auth.uid() = consumer_id);


-- PUSH TOKENS
create policy "push_token: all own"
  on push_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
