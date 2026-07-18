create extension if not exists pgcrypto;

create table if not exists public.learning_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text not null,
  subject text not null,
  summary text not null,
  source_notes text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.concepts (
  id uuid primary key default gen_random_uuid(),
  learning_entry_id uuid not null references public.learning_entries(id) on delete cascade,
  concept_text text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid not null references public.concepts(id) on delete cascade,
  prompt_style text not null check (prompt_style in ('definition', 'why', 'comparison', 'scenario', 'reverse')),
  prompt text not null,
  answer text not null,
  current_interval_days integer not null default 1,
  ease numeric(3,2) not null default 2.30,
  streak integer not null default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.card_tags (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  tag text not null
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  rating text not null check (rating in ('again', 'hard', 'good', 'easy')),
  response_text text,
  reviewed_at timestamptz not null default timezone('utc', now()),
  next_review_at timestamptz not null
);

create index if not exists idx_learning_entries_created_at
  on public.learning_entries(created_at desc);

create index if not exists idx_cards_next_review_at
  on public.cards(next_review_at asc);

create index if not exists idx_cards_concept_id
  on public.cards(concept_id);

create index if not exists idx_reviews_card_id_reviewed_at
  on public.reviews(card_id, reviewed_at desc);

