# Recall Ledger

Recall Ledger is a memory-first learning tracker. You capture what you learned today, break it into atomic concepts, and review it later through active recall prompts that change shape over time.

## Current status

This repository now contains the first implementation scaffold:

- Next.js App Router app
- Initial dashboard
- Learning capture screen
- Review queue screen
- Simplified scheduling helper
- Supabase/PostgreSQL migration for core tables

## Planned stack

- Next.js
- TypeScript
- Supabase
- PostgreSQL
- Active recall prompt variants
- Adaptive spaced repetition

## Local setup

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local`
3. Add your Supabase URL and anon key
4. Run `npm run dev`

## Database model

- `learning_entries`: what you studied on a given day
- `concepts`: atomic ideas extracted from an entry
- `cards`: recall prompts generated from a concept
- `card_tags`: card metadata for filtering
- `reviews`: every recall attempt and next due date

## Next implementation step

- Wire form submission to Supabase
- Generate cards from concepts
- Replace mock data with live queries
- Add auth
- Add real review persistence
