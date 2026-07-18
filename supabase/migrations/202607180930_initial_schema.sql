create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null,
  full_name text not null,
  role text not null check (role in ('self_learner', 'student')),
  learner_mode text not null check (learner_mode in ('general', 'school', 'neet')),
  grade text,
  target_exam text,
  daily_goal_minutes integer not null default 30,
  weekly_target_cards integer not null default 50,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  accent text,
  focus text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  name text not null,
  purpose text,
  exam_priority text check (exam_priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.learning_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  deck_id uuid references public.decks(id) on delete set null,
  title text not null,
  subject text not null,
  source_type text,
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
  prompt_style text not null check (
    prompt_style in (
      'definition',
      'why',
      'comparison',
      'scenario',
      'reverse',
      'fill_blank',
      'mcq',
      'assertion_reason'
    )
  ),
  prompt text not null,
  answer text not null,
  current_interval_days integer not null default 1,
  ease numeric(3,2) not null default 2.30,
  streak integer not null default 0,
  exam_priority text check (exam_priority in ('low', 'medium', 'high')),
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

create index if not exists idx_profiles_auth_user_id
  on public.profiles(auth_user_id);

create index if not exists idx_subjects_profile_id
  on public.subjects(profile_id);

create index if not exists idx_decks_profile_id
  on public.decks(profile_id);

create index if not exists idx_learning_entries_profile_id_created_at
  on public.learning_entries(profile_id, created_at desc);

create index if not exists idx_cards_next_review_at
  on public.cards(next_review_at asc);

create index if not exists idx_cards_concept_id
  on public.cards(concept_id);

create index if not exists idx_reviews_card_id_reviewed_at
  on public.reviews(card_id, reviewed_at desc);

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.decks enable row level security;
alter table public.learning_entries enable row level security;
alter table public.concepts enable row level security;
alter table public.cards enable row level security;
alter table public.card_tags enable row level security;
alter table public.reviews enable row level security;

create policy "profiles are viewable by owner"
  on public.profiles
  for select
  using (auth.uid() = auth_user_id);

create policy "profiles are insertable by owner"
  on public.profiles
  for insert
  with check (auth.uid() = auth_user_id);

create policy "profiles are updatable by owner"
  on public.profiles
  for update
  using (auth.uid() = auth_user_id);

create policy "subjects managed by profile owner"
  on public.subjects
  for all
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = subjects.profile_id
        and profiles.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = subjects.profile_id
        and profiles.auth_user_id = auth.uid()
    )
  );

create policy "decks managed by profile owner"
  on public.decks
  for all
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = decks.profile_id
        and profiles.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = decks.profile_id
        and profiles.auth_user_id = auth.uid()
    )
  );

create policy "learning entries managed by profile owner"
  on public.learning_entries
  for all
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = learning_entries.profile_id
        and profiles.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = learning_entries.profile_id
        and profiles.auth_user_id = auth.uid()
    )
  );

create policy "concepts managed through parent entry owner"
  on public.concepts
  for all
  using (
    exists (
      select 1
      from public.learning_entries
      join public.profiles on profiles.id = learning_entries.profile_id
      where learning_entries.id = concepts.learning_entry_id
        and profiles.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.learning_entries
      join public.profiles on profiles.id = learning_entries.profile_id
      where learning_entries.id = concepts.learning_entry_id
        and profiles.auth_user_id = auth.uid()
    )
  );

create policy "cards managed through concept owner"
  on public.cards
  for all
  using (
    exists (
      select 1
      from public.concepts
      join public.learning_entries on learning_entries.id = concepts.learning_entry_id
      join public.profiles on profiles.id = learning_entries.profile_id
      where concepts.id = cards.concept_id
        and profiles.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.concepts
      join public.learning_entries on learning_entries.id = concepts.learning_entry_id
      join public.profiles on profiles.id = learning_entries.profile_id
      where concepts.id = cards.concept_id
        and profiles.auth_user_id = auth.uid()
    )
  );

create policy "card tags managed through card owner"
  on public.card_tags
  for all
  using (
    exists (
      select 1
      from public.cards
      join public.concepts on concepts.id = cards.concept_id
      join public.learning_entries on learning_entries.id = concepts.learning_entry_id
      join public.profiles on profiles.id = learning_entries.profile_id
      where cards.id = card_tags.card_id
        and profiles.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.cards
      join public.concepts on concepts.id = cards.concept_id
      join public.learning_entries on learning_entries.id = concepts.learning_entry_id
      join public.profiles on profiles.id = learning_entries.profile_id
      where cards.id = card_tags.card_id
        and profiles.auth_user_id = auth.uid()
    )
  );

create policy "reviews managed through card owner"
  on public.reviews
  for all
  using (
    exists (
      select 1
      from public.cards
      join public.concepts on concepts.id = cards.concept_id
      join public.learning_entries on learning_entries.id = concepts.learning_entry_id
      join public.profiles on profiles.id = learning_entries.profile_id
      where cards.id = reviews.card_id
        and profiles.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.cards
      join public.concepts on concepts.id = cards.concept_id
      join public.learning_entries on learning_entries.id = concepts.learning_entry_id
      join public.profiles on profiles.id = learning_entries.profile_id
      where cards.id = reviews.card_id
        and profiles.auth_user_id = auth.uid()
    )
  );
