# Recall Ledger

Recall Ledger is a memory-first learning tracker. You capture what you learned today, break it into atomic concepts, and review it later through active recall prompts that change shape over time.

## Current status

This repository now contains a multi-profile implementation scaffold:

- Next.js App Router app
- Profile-aware dashboard
- Learner-specific capture screen
- Profile-specific review queue
- Simplified scheduling helper
- Supabase/PostgreSQL migration for multi-user tables and RLS

## Planned stack

- Next.js
- TypeScript
- Supabase
- PostgreSQL
- Separate user accounts
- Learner mode onboarding
- Active recall prompt variants
- Adaptive spaced repetition

## Local setup

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local`
3. Add your Supabase URL and anon key
4. Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`
5. Run `npm run dev`

## Stable local workflow

- Use `npm run dev` for normal development on `http://localhost:3000`
- Use `npm run build` only when you want a production verification
- If the app ever behaves strangely, run `npm run clean` once and restart `npm run dev`

The project now keeps dev output in `.next-dev` and production build output in `.next`, which prevents the recurring stale chunk runtime error such as `Cannot find module './140.js'`.

## Database model

- `profiles`: one profile per signed-in learner
- `subjects`: learner-specific subject buckets
- `decks`: optional chapter/topic grouping
- `learning_entries`: what a learner studied on a given day
- `concepts`: atomic ideas extracted from an entry
- `cards`: recall prompts generated from a concept
- `card_tags`: card metadata for filtering
- `reviews`: every recall attempt and next due date

## Next implementation step

- Add Supabase Auth login/signup
- Create onboarding flow for `profiles`
- Wire form submission to Supabase
- Generate cards from concepts
- Replace mock data with live queries
- Add real review persistence
