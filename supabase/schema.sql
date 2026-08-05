-- Executar isso no Supabase: SQL Editor > New query > Run

create table public.votes (
  id bigint generated always as identity primary key,
  fragrance_key text not null check (fragrance_key in ('cerejeira','lavanda','coco','orchid','brisa')),
  created_at timestamptz not null default now()
);

alter table public.votes enable row level security;

-- Site publico pode inserir voto (sem login)
create policy "public_insert_votes"
  on public.votes
  for insert
  to anon
  with check (true);

-- Site publico pode ler os votos para montar o ranking
create policy "public_read_votes"
  on public.votes
  for select
  to anon
  using (true);

-- Habilita atualizacao em tempo real do ranking entre todos os dispositivos
alter publication supabase_realtime add table public.votes;
