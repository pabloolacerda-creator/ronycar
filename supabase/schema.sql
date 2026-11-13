-- Site Ronycar Automóveis — schema Supabase
-- Aplicar no SQL Editor do projeto Supabase.

-- ========== Tabelas ==========

create table if not exists public.veiculos (
  id          uuid primary key default gen_random_uuid(),
  tipo        text not null check (tipo in ('Carro','Caminhão','Máquina','Moto')),
  titulo      text not null,
  ano         int,
  preco       numeric,
  km          int,
  cambio      text check (cambio in ('Automático','Manual','Não se aplica')),
  combustivel text check (combustivel in ('Flex','Gasolina','Diesel','Elétrico','GNV','Não se aplica')),
  motorizacao text,
  cor         text,
  descricao   text,
  status      text not null default 'Disponível' check (status in ('Disponível','Vendido')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.veiculo_fotos (
  id         uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references public.veiculos(id) on delete cascade,
  url        text not null,
  ordem      int not null default 0
);

create index if not exists idx_fotos_veiculo on public.veiculo_fotos(veiculo_id);
create index if not exists idx_veiculos_status on public.veiculos(status);

-- ========== RLS ==========

alter table public.veiculos enable row level security;
alter table public.veiculo_fotos enable row level security;

-- Leitura pública
create policy "veiculos leitura publica"
  on public.veiculos for select using (true);
create policy "fotos leitura publica"
  on public.veiculo_fotos for select using (true);

-- Escrita só autenticado (a conta única da loja)
create policy "veiculos escrita autenticada"
  on public.veiculos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "fotos escrita autenticada"
  on public.veiculo_fotos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ========== Storage ==========
-- Bucket público de fotos.
insert into storage.buckets (id, name, public)
  values ('fotos','fotos', true)
  on conflict (id) do nothing;

create policy "fotos storage leitura publica"
  on storage.objects for select
  using (bucket_id = 'fotos');
create policy "fotos storage escrita autenticada"
  on storage.objects for insert
  with check (bucket_id = 'fotos' and auth.role() = 'authenticated');
create policy "fotos storage update autenticada"
  on storage.objects for update
  using (bucket_id = 'fotos' and auth.role() = 'authenticated');
create policy "fotos storage delete autenticada"
  on storage.objects for delete
  using (bucket_id = 'fotos' and auth.role() = 'authenticated');

-- ========== 2026-11-13: posição no feed (1º, 2º, 3º) ==========
alter table public.veiculos add column if not exists destaque int check (destaque in (1,2,3));
