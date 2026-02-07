-- Bank ingestion tables for universal statement import
create extension if not exists "pgcrypto";

create table if not exists bank_account (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Primary Account',
  bank_name text,
  account_name text,
  iban text,
  currency text not null default 'EUR',
  balance numeric not null default 0,
  available_balance numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references bank_account(id) on delete cascade,
  date date not null,
  description text not null,
  amount numeric not null,
  type text not null check (type in ('credit','debit')),
  reference text,
  hash text not null,
  created_at timestamptz not null default now()
);

-- Backfill hash if the column already exists but values are missing
alter table transactions add column if not exists hash text;
update transactions
   set hash = coalesce(
     hash,
     md5(
       coalesce(date::text,'') || '|' ||
       coalesce(round(amount::numeric,2)::text,'0') || '|' ||
       lower(coalesce(description,''))
     )
   )
 where hash is null;
alter table transactions alter column hash set not null;

create unique index if not exists transactions_hash_idx on transactions(hash);
create index if not exists transactions_account_idx on transactions(account_id, date desc);

-- helper to refresh balance if needed
create or replace function refresh_bank_balance(p_account uuid) returns void as $$
  update bank_account
     set balance = coalesce((select sum(amount) from transactions where account_id = p_account), 0),
         available_balance = coalesce((select sum(amount) from transactions where account_id = p_account), 0)
   where id = p_account;
$$ language sql;
