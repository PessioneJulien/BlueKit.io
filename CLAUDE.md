# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

# Stack Builder Platform - Roadmap de Développement

## 📋 Résumé du Projet

**Vision** : Créer une plateforme communautaire interactive pour référencer, comparer et assembler des stacks technologiques avec des guides de mise en place pas-à-pas.

**Concept clé** : Système modulaire où chaque technologie est un "bloc" assemblable, avec validation communautaire (stars/reviews) et critères techniques objectifs pour un matching intelligent.

**Public cible** :

- Développeurs juniors (guides pas-à-pas)
- Développeurs confirmés (comparaison rapide)
- Chefs de projet (estimation coût/délai)

## 🎨 Direction Design UI/UX 2025

### Palette de couleurs moderne

- **Primaire** : Gradient violet-bleu (#6366f1 → #3b82f6)
- **Secondaire** : Vert émeraude (#10b981) pour les validations
- **Neutre** : Gris slate moderne (#1e293b, #475569, #94a3b8)
- **Accent** : Orange vibrant (#f97316) pour les CTA
- **Background** : Dark mode par défaut (#0f172a) avec light mode toggle

### Style visuel 2025

- **Glassmorphism** : Cards avec backdrop-blur et bordures subtiles
- **Micro-animations** : Hover effects fluides, transitions 300ms
- **Typography** : Inter pour le corps, JetBrains Mono pour le code
- **Iconographie** : Lucide React (cohérent et moderne)
- **Layout** : Grid system flexible, spacing harmonieux (4, 8, 16, 24px)

## 🛠 Stack Technique Choisie

### Frontend

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + Headless UI
- **Framer Motion** (animations)
- **React Hook Form** + Zod (validation)

### Backend & API

- **Supabase** (auth, database, real-time)
- **Next.js API Routes** (logique métier custom)
- **Prisma** (ORM pour requêtes complexes si nécessaire)

### Développement

- **Storybook 7** (design system)
- **Playwright** (E2E testing)
- **ESLint + Prettier** (qualité code)

### Déploiement

- **Vercel** (frontend + API routes)
- **Supabase Cloud** (backend managed)

## 🗓 Roadmap Détaillée par Phase

### Phase 1 : Fondations (Semaines 1-3)

#### Semaine 1 : Setup & Design System

**Objectifs** : Infrastructure de base + composants foundationnels + Storybook

**Frontend Setup**

```bash
# Initialisation projet
npx create-next-app@latest stack-builder --typescript --tailwind --app
cd stack-builder
npm install framer-motion @headlessui/react lucide-react
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities # Pour drag & drop
```

**Storybook Setup (PRIORITÉ)**

```bash
npx storybook@latest init
npm install @storybook/addon-designs @storybook/addon-a11y @storybook/addon-controls
```

**Composants de base à créer + Stories** :

- [ ] `Button` (variants: primary, secondary, ghost) + **Story complète**
- [ ] `Card` (avec glassmorphism) + **Story avec variants**
- [ ] `Badge` (pour tags technos) + **Story avec couleurs**
- [ ] `Input` / `Select` (formulaires) + **Story avec validation**
- [ ] `Modal` / `Drawer` + **Story interactive**
- [ ] `Header` / `Navigation` + **Story responsive**
- [ ] `Loading` / `Skeleton` + **Story avec durées**
- [ ] `TechnologyCard` (preview technologie) + **Story avec drag**

**Configuration Storybook**

- [ ] Thème dark/light synchronized avec Next.js
- [ ] Tailwind integration dans Storybook
- [ ] Addon controls pour tous les composants

**Supabase Setup**

- [ ] Créer projet Supabase
- [ ] Configuration authentification (GitHub, Google)
- [ ] Tables de base : `users`, `stacks`, `technologies`, `reviews`

#### Semaine 2 : Architecture & Pages principales

**Structure de fichiers**

```
src/
├── app/                 # Next.js App Router
├── components/          # Composants réutilisables
│   ├── ui/             # Design system
│   ├── forms/          # Formulaires spécialisés
│   └── layout/         # Layout components
├── lib/                # Utilitaires, config
├── stores/             # State management (Zustand)
├── types/              # TypeScript definitions
└── styles/             # Styles globaux
```

**Pages principales**

- [ ] `page.tsx` - Homepage avec hero + search
- [ ] `/stacks` - Listing des stacks avec filtres
- [ ] `/stack/[id]` - Détail d'une stack
- [ ] `/builder` - Interface de construction de stack
- [ ] `/profile` - Dashboard utilisateur

#### Semaine 3 : Authentification & Base de données

**Authentification**

- [ ] Login/Register avec Supabase Auth
- [ ] Middleware de protection des routes
- [ ] Gestion des sessions utilisateur

**Schéma de base de données**

```sql
-- Technologies (les "blocs")
CREATE TABLE technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  category VARCHAR NOT NULL, -- frontend, backend, database, etc.
  description TEXT,
  logo_url VARCHAR,
  documentation_url VARCHAR,
  setup_time_hours INTEGER,
  difficulty_level VARCHAR, -- beginner, intermediate, expert
  pricing VARCHAR, -- free, freemium, paid
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stacks (combinaisons de technologies)
CREATE TABLE stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  use_cases TEXT[],
  author_id UUID REFERENCES auth.users(id),
  is_official BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Relation technologies <-> stacks
CREATE TABLE stack_technologies (
  stack_id UUID REFERENCES stacks(id),
  technology_id UUID REFERENCES technologies(id),
  role VARCHAR, -- primary, secondary, optional
  PRIMARY KEY (stack_id, technology_id)
);

-- Reviews communautaires
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID REFERENCES stacks(id),
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  criteria JSONB, -- {"performance": 4, "documentation": 5, "ease_of_use": 3}
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Phase 2 : Fonctionnalités Core (Stack Builder prioritaire - Semaines 4-7)

#### Semaine 4 : Interface Stack Builder (PRIORITÉ 1)

**Storybook Stories** :

- [ ] `TechnologyBlock` - Composant drag & drop avec preview
- [ ] `StackCanvas` - Zone de construction avec grille
- [ ] `ConnectionLine` - Liens visuels entre technologies
- [ ] `CompatibilityAlert` - Warnings/validations

**Fonctionnalités core** :

- [ ] Canvas drag & drop pour assembler les technologies
- [ ] Système de connexions visuelles entre les blocs
- [ ] Validation en temps réel des compatibilités
- [ ] Preview de l'architecture côté sidebar

#### Semaine 5 : Stack Builder avancé

**Storybook Stories** :

- [ ] `StackExport` - Modal d'export avec options
- [ ] `ConfigurationPanel` - Settings par technologie
- [ ] `ArchitectureDiagram` - Vue schématique finale

**Fonctionnalités** :

- [ ] Sauvegarde des stacks créées (utilisateur connecté)
- [ ] Export en différents formats (JSON, README, docker-compose)
- [ ] Templates pré-configurés (démarrage rapide)
- [ ] Mode collaboration (partage de liens)

#### Semaine 6 : Guides interactifs & documentation

**Storybook Stories** :

- [ ] `StepByStep` - Composant guide avec progression
- [ ] `CodeBlock` - Affichage code avec copy-paste
- [ ] `InstallationGuide` - Checklist interactive

**Fonctionnalités** :

- [ ] Génération automatique du guide d'installation
- [ ] Guide step-by-step personnalisé selon l'OS
- [ ] Détection des dépendances et ordre d'installation
- [ ] Export du projet starter (zip avec boilerplate)

#### Semaine 7 : Système de filtrage & recherche

- [ ] Barre de recherche intelligente avec suggestions
- [ ] Filtres par critères (catégorie, difficulté, coût, temps setup)
- [ ] Tri par popularité/date/rating
- [ ] Sauvegarde des filtres dans l'URL

### Phase 3 : Contenu & Optimisation (Semaines 8-10)

#### Semaine 8 : Seed data - 30 Stacks officielles (Mix complet)

**30 stacks couvrant tout l'écosystème tech** :

[... contenu des 30 stacks détaillé ci-dessus ...]

**Storybook pour chaque stack** :

- [ ] `StackCard` - Affichage stack avec technos
- [ ] `TechnologyBadge` - Tags avec logos et couleurs
- [ ] `ArchitectureDiagram` - Schéma visuel de la stack
- [ ] `SetupGuide` - Component guide d'installation

#### Semaine 9 : Système de reviews + Performance

**Storybook Stories avancées** :

- [ ] `ReviewCard` - Card de review avec rating
- [ ] `StarRating` - Component de notation
- [ ] `ReviewForm` - Formulaire de création review

**Fonctionnalités reviews** :

- [ ] Interface de notation par critères multiples
- [ ] Commentaires avec markdown + preview
- [ ] Système de votes utiles/pas utiles
- [ ] Modération des reviews (admin)

**Performance** :

- [ ] Optimisation images (next/image)
- [ ] Lazy loading des composants lourds
- [ ] SEO meta tags dynamiques
- [ ] Sitemap automatique

#### Semaine 10 : Tests & qualité + Storybook final

**Tests avec Storybook** :

- [ ] Visual regression tests (Chromatic)
- [ ] Accessibility tests dans toutes les stories
- [ ] Interaction tests pour composants complexes

**Tests globaux** :

- [ ] Tests unitaires (Jest + Testing Library)
- [ ] Tests E2E critiques (Playwright)
- [ ] Performance audit (Lighthouse)
- [ ] Storybook build & deploy

### Phase 4 : Communauté & lancement (Semaines 11-12)

#### Semaine 11 : Fonctionnalités communautaires

- [ ] Système de contributions (propose new stack)
- [ ] Modération des contributions
- [ ] Dashboard admin
- [ ] Gamification (badges, leaderboard)

#### Semaine 12 : Lancement

- [ ] Landing page marketing
- [ ] Documentation utilisateur
- [ ] Beta test avec 50 utilisateurs
- [ ] Launch sur Product Hunt / dev communities

## 📊 Métriques de succès

**Phase 1** : Infrastructure stable + 5 stacks documentées
**Phase 2** : Interface fonctionnelle + système de reviews
**Phase 3** : 25 stacks + performance optimisée  
**Phase 4** : 100 utilisateurs actifs + contributions communautaires

## 🔄 Itérations post-lancement

**V2 (Mois 4-6)**

- API publique
- Intégrations CLI/IDE
- Templates de projets exportables
- Analytics avancées d'usage

**V3 (Mois 7+)**

- IA pour recommandations personnalisées
- Marketplace de templates premium
- Intégration deployment (Vercel, Netlify, AWS)

## 📝 Documentation à maintenir

- [ ] README technique complet
- [ ] Guide de contribution
- [ ] Documentation API
- [ ] Storybook des composants
- [ ] Architecture Decision Records (ADR)

## 🚨 BONNES PRATIQUES DE DÉVELOPPEMENT - TRÈS IMPORTANT

### Règles obligatoires à suivre à chaque tâche :

1. **Mise à jour continue des avancées** :
   dans next_tasks.txt

   - À chaque fois qu'une tâche est terminée, mettre à jour le statut dans la roadmap
   - Ajouter les nouvelles tâches qui découlent du travail effectué
   - Documenter les décisions techniques prises

2. **Vérification ESLint systématique** :

   - **NE JAMAIS** essayer de build ou run l'application
   - **TOUJOURS** vérifier avec ESLint après chaque modification
   - Corriger **IMMÉDIATEMENT** toutes les erreurs ESLint
   - Maintenir un code propre et cohérent

3. **Workflow de développement** :

   ```
   Modification → Vérification ESLint → Correction si nécessaire → Mise à jour documentation
   ```

4. **Priorités absolues** :
   - Qualité du code > Fonctionnalité
   - ESLint clean > Build working
   - Documentation > Code non documenté

### Checklist après chaque modification :

- [ ] ESLint ne reporte aucune erreur
- [ ] Code est propre et bien formaté
- [ ] Documentation mise à jour si nécessaire
- [ ] Avancées notées dans la roadmap
- [ ] Nouvelles tâches identifiées et ajoutées

---

Cette roadmap est conçue pour être flexible : chaque phase peut être ajustée selon les retours utilisateurs et les priorités business. L'objectif est d'avoir un MVP solide en 3 mois avec possibilité d'itération rapide.
