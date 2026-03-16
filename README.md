# Droombruiloft Planner

Een mobiele, Nederlandstalige wedding planner met:

- prive admin-login
- budgetbeheer met definitief/voorlopig status
- gastenlijst met diner en dieetwensen
- to-do beheer
- deployment via Vercel

## Stack

- Next.js App Router + TypeScript
- Supabase Auth + Postgres
- Server Actions + `zod`
- Tailwind CSS 4

## Lokale setup

1. Installeer dependencies:

```bash
npm install
```

2. Kopieer de env-template:

```bash
cp .env.example .env.local
```

3. Vul in `.env.local` deze variabelen in:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ADMIN_EMAIL=admin@example.com
```

4. Maak in Supabase een project aan en voer de SQL uit uit [supabase/migrations/20260315133000_wedding_planner.sql](/Users/Ricardo/Desktop/Dream wedding planner/supabase/migrations/20260315133000_wedding_planner.sql).

5. Maak in Supabase Auth handmatig het admin-account aan dat overeenkomt met `ADMIN_EMAIL`.

6. Zet in Supabase Auth de self-signup uit:
   Authentication -> Providers -> Email -> disable "Enable email signup".

7. Start lokaal:

```bash
npm run dev
```

Open daarna [http://localhost:3000](http://localhost:3000).

## Vercel deployment

1. Push het project naar GitHub.
2. Importeer de repo in Vercel.
3. Voeg dezelfde environment variables toe in Vercel:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_EMAIL`
4. Deploy.

De site staat volledig achter `/login`; alleen het ingestelde admin-account krijgt toegang.

## Belangrijkste routes

- `/login` -> admin login
- `/` -> dashboard
- `/budget` -> budgetonderdelen beheren
- `/gasten` -> gastenlijst beheren
- `/todo` -> to-do lijst beheren

## Database-overzicht

- `budget_items`
  - `title`
  - `amount_cents`
  - `is_final`
- `guests`
  - `name`
  - `dinner_included`
  - `dietary_notes`
- `todo_items`
  - `title`
  - `due_date`
  - `completed`

Alle tabellen gebruiken `user_id` + Row Level Security, zodat data alleen zichtbaar is voor de ingelogde admin.

## Checks

```bash
npm run lint
npm run build
```
