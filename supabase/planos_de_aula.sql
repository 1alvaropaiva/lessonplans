create table if not exists public.planos_de_aula (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tema text not null,
  ano_escolar text not null,
  disciplina text not null,
  introducao_ludica text not null,
  objetivo_bncc text not null,
  passo_a_passo text not null,
  rubrica_avaliacao jsonb not null,
  prompt_enviado text,
  created_at timestamptz not null default now()
);

create index if not exists idx_planos_user on public.planos_de_aula(user_id);
create index if not exists idx_planos_created_at on public.planos_de_aula(created_at desc);

alter table public.planos_de_aula enable row level security;

drop policy if exists "Select own planos" on public.planos_de_aula;
create policy "Select own planos" on public.planos_de_aula
  for select
  to authenticated
  using ( auth.uid() = user_id );

drop policy if exists "Insert own planos" on public.planos_de_aula;
create policy "Insert own planos" on public.planos_de_aula
  for insert
  to authenticated
  with check ( auth.uid() = user_id );

drop policy if exists "Update own planos" on public.planos_de_aula;
create policy "Update own planos" on public.planos_de_aula
  for update
  to authenticated
  using ( auth.uid() = user_id );

drop policy if exists "Delete own planos" on public.planos_de_aula;
create policy "Delete own planos" on public.planos_de_aula
  for delete
  to authenticated
  using ( auth.uid() = user_id );

