# Audit Technique - BlueKit

## Vue d’ensemble

BlueKit est une application Next.js (App Router) centrée sur un builder visuel de stacks technologiques. L’app s’appuie sur Supabase (auth, base), Zustand (state management), et une UI custom (composants sous `components/ui`). Le périmètre comprend un builder riche (`components/ui/VisualBuilder/*`), une section admin des stacks, et de la documentation d’infra Supabase complète.

## Points forts

- **Architecture claire**: séparation en `app/*`, `components/*`, `lib/*`, `docs/*`, `supabase/*`.
- **Builder visuel avancé**: composants nombreux (Canvas, Nodes, Connections, Modals) avec `framer-motion` et logique d’édition/sauvegarde.
- **Gestion d’état**: stores Zustand `userStore` et `stackStore` persistés, avec hydratation gérée via `useStoreHydration` et middleware `onRehydrateStorage`.
- **Intégration Supabase**: clients server/client, middleware d’auth, migrations SQL et docs (setup, checklist, auth, prod) bien fournies.
- **Qualité type/lint**: ESLint/TypeScript activés, erreurs bloquantes corrigées; build production OK.
- **Tooling**: Storybook configuré, Cypress présent (e2e et composants), scripts utiles.

## Axes d’amélioration prioritaires

- **Warnings ESLint restants**: beaucoup de variables importées mais non utilisées et deps de hooks manquantes dans certains composants UI. Effet: bruit et dette potentielle.
- **Hook deps**: `react-hooks/exhaustive-deps` sur plusieurs composants (presentation modes, palettes, panels). Stabiliser les callbacks via `useCallback` au parent ou revoir la dépendance.
- **Normalisation des types UI**: éviter les `as const` disséminés; centraliser types d’onglets/variants; exposer types des Selects pour réutilisation.
- **Responsabilités de sauvegarde**: `VisualStackBuilder` gère la sauvegarde avec `stackStore`. S’assurer que la page parent n’essaie pas de dupliquer la logique (déjà corrigé) et documenter l’API publique du composant.
- **Couplage UI/Store**: certaines actions/valeurs passent via Zustand alors qu’une API de props contrôlées pourrait améliorer la testabilité (ex: injection de `onSave`, callbacks de changement, etc.).
- **Accessibilité**: vérifier roles/aria/contrastes sur les composants custom (badges, boutons, modals, canvas interactif). Ajouter tests a11y (Storybook addon a11y + CI rapide).
- **Performances du canvas**: nombreuses animations et effets; auditer re-render des gros composants (memoisation des noeuds/connexions, virtualization si listes). Profiler interaction drag/connect.
- **Sécurité**:
  - Middleware: whitelist des pages publiques OK, mais lister explicitement les routes API publiques et ajouter tests d’accès.
  - Vérifier RLS côté `stacks` (auteurs/visibilité). Ajouter tests supabase SQL ou e2e d’accès non-auth.
- **CI/CD**: pas de config CI visible. Ajouter pipeline (lint, typecheck, build, cypress) + build Storybook.

## Dette technique (sélection)

- Variables non utilisées nombreuses dans `components/ui/VisualBuilder/*` (bruit, complexité mentale).
- Quelques unions littérales répétées (onglets, catégories) au lieu de types partagés.
- Typage des entités côté Supabase partiellement dupliqué (ex: `Stack` dans store vs types SQL). Aligner avec `types/database.ts` si possible.
- Dossiers `app/api` en cours (non finalisés/untracked): clarifier et nettoyer.

## Qualité & tests

- ESLint: plus d’erreurs bloquantes après corrections; warnings existants à traiter.
- TypeScript: OK en build; envisager un script `typecheck` pour run TS strict en CI.
- Tests: Cypress présent; ajouter scénarios clés: login, builder (création/sauvegarde stack), admin CRUD, présentation.

## Documentation & DX

- Docs Supabase très complètes (setup/checklist/auth/prod).
- README minimal (générique Next.js) — refonte fournie.
- Ajouter un `CONTRIBUTING.md` rapide et une table d’architecture (composants majeurs, stores, flow sauvegarde).

## Performances & Observabilité

- Ajouter mesure simple: Web Vitals, log profilage interactions canvas (optionnel en dev).
- Activer sourcemaps production pour debug. Ajouter Sentry optionnel.

## Roadmap d’améliorations rapides (1–2 jours)

1. Nettoyage warnings ESLint ciblé (`VisualBuilder/*`, présentation): retirer imports non utilisés; compléter deps de hooks ou stabiliser callbacks.
2. Centraliser types réutilisés (onglets, catégories, variants de boutons) dans `lib/types`.
3. Documenter l’API du `VisualStackBuilder` (props, events) dans `docs/`.
4. CI GitHub Actions: jobs lint + build + test e2e (smoke).
5. Tests e2e: scénario minimal de sauvegarde d’une stack (avec Supabase locale ou mock).

## Améliorations moyen terme

- Extraire la logique canvas (nodes/edges) en hooks dédiés et composants memo pour réduire re-renders.
- Unifier types DB (Supabase) et types app (stores/UI) via générateurs (ex: `supabase-js` types ou schemas Zod).
- Ajouter i18n (fr/en) si cible internationale.

## Conclusion

Le socle est solide (architecture, stores, Supabase, builder riche). Un passage sur la propreté (warnings, deps hooks), le typage partagé et un min de CI/test e2e stabiliseront la qualité. Un README riche (ci-dessous) et une doc d’API des composants renforceront l’onboarding et la maintenabilité.
