# BlueKit

Constructeur visuel de stacks technologiques basé sur Next.js + Supabase, avec édition, sauvegarde et présentation interactive.

## Sommaire

- Aperçu
- Prérequis
- Installation rapide
- Variables d’environnement
- Démarrage
- Scripts utiles
- Tests E2E (Cypress)
- Storybook
- Architecture du projet
- Fonctionnalités clés
- Supabase (Setup & Migrations)
- Dépannage

## Aperçu

- Framework: Next.js (App Router)
- Auth & DB: Supabase (auth, RLS, tables `stacks`, `users`, `components`…)
- State: Zustand (stores persistés, hydratation gérée)
- UI: composants custom (Tailwind classes), `framer-motion`, `lucide-react`
- Builder: `components/ui/VisualBuilder/*` (noeuds, connexions, modals, export…)

## Prérequis

- Node 18+
- Accès à un projet Supabase (URL + ANON KEY)

## Installation rapide

```bash
npm install
cp .env.local.example .env.local
# Renseigner les clés Supabase dans .env.local
```

## Variables d’environnement

`lib/supabase/{client,server}.ts` s’attendent à:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Démarrage

- Développement: `npm run dev` (http://localhost:3000)
- Build: `npm run build` puis `npm start`
- Lint: `npm run lint`

## Scripts utiles

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build",
  "cypress:open": "cypress open",
  "cypress:run": "cypress run",
  "e2e": "cypress run",
  "e2e:open": "cypress open"
}
```

## Tests E2E (Cypress)

Dossiers: `cypress/e2e/*` (ex: `stack-builder.cy.ts`).

- Ouvrir l’UI: `npm run cypress:open`
- Lancer en CLI: `npm run cypress:run`

## Storybook

- Démarrer: `npm run storybook`
- Build statique: `npm run build-storybook`

## Architecture du projet

- `app/*`: routes App Router (pages publiques, auth, admin, builder)
- `components/ui/*`: composants UI (cards, modals, builder visuel)
- `lib/stores/*`: Zustand stores (`userStore`, `stackStore`)
- `lib/hooks/*`: hooks (hydratation, autosave, undo/redo…)
- `lib/supabase/*`: clients, middleware d’auth, helpers
- `lib/data/*`: données/présélections (stacks officielles, templates)
- `docs/*`: documentation Supabase et guides
- `supabase/*`: migrations SQL et données seed

## Fonctionnalités clés

- Builder visuel: créer/relier des technologies, styliser les connexions, containers (Docker/K8s), export.
- Sauvegarde: persistée côté Supabase (table `stacks`), avec auto-save local basique.
- Auth: middleware qui protège les pages privées, redirige vers `/auth/login` si non connecté.
- Présentation: mode présentation simplifié et partage.

## Supabase (Setup & Migrations)

Guide rapide: `SETUP_SUPABASE.md`

- Migrations: `supabase/migrations/*.sql`
- Seed: `supabase/seed.sql`
- Checklist/Prod/Auth: voir `docs/SUPABASE_*.md` et `docs/AUTHENTICATION.md`

## Dépannage

- Auth KO: vérifier `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Accès protégé: le middleware autorise `/`, `/auth`, `/components`, `/stacks`, `/api/components`. Adapter si besoin.
- Lint: `npm run lint` (warnings non bloquants sur certains composants – cleanup recommandé).

---

Pour un état de l’art complet (forces, améliorations, roadmap), lire `docs/AUDIT_PROJET.md`.
