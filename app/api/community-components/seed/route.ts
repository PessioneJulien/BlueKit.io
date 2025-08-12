import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Route pour ajouter des données de test (à utiliser une seule fois)
export async function POST(request: NextRequest) {
  console.log('[Community Components Seed] Starting seed process');
  
  try {
    const supabase = await createClient();
    
    // Pour les données de seed, on ne dépend pas de l'authentification
    console.log('Creating seed data...');
    
    // Vérifier s'il y a déjà des données
    const { count } = await supabase
      .from('community_components')
      .select('*', { count: 'exact', head: true });
    
    if (count && count > 0) {
      return NextResponse.json({
        message: `Database already has ${count} components. Skipping seed.`,
        count
      });
    }
    
    // Données de seed réalistes
    const seedComponents = [
      {
        name: 'React Query',
        description: 'Powerful asynchronous state management for React applications with intelligent caching and background updates.',
        category: 'frontend',
        type: 'component',
        setup_time_hours: 1.0,
        difficulty: 'intermediate',
        pricing: 'free',
        documentation: '# React Query\n\nReact Query (TanStack Query) is a library for fetching, caching, and updating asynchronous data in React applications.\n\n## Key Features\n- Intelligent caching\n- Background updates\n- Optimistic updates\n- Error handling\n- Pagination support',
        official_docs_url: 'https://tanstack.com/query/latest',
        github_url: 'https://github.com/TanStack/query',
        logo_url: '/logos/react-query.svg',
        tags: ['state-management', 'react', 'async', 'cache', 'hooks'],
        compatible_with: ['react', 'next.js', 'vite', 'typescript'],
        resource_requirements: {
          cpu: '0.1 cores',
          memory: '50MB'
        },
        is_official: true,
        usage_count: 45231
      },
      {
        name: 'Prisma ORM',
        description: 'Next-generation ORM for Node.js & TypeScript with type-safe database access and automatic migrations.',
        category: 'backend',
        type: 'component',
        setup_time_hours: 1.5,
        difficulty: 'beginner',
        pricing: 'free',
        documentation: '# Prisma ORM\n\nModern database toolkit that generates a type-safe client from your database schema.\n\n## Supported Databases\n- PostgreSQL\n- MySQL\n- SQLite\n- MongoDB\n- SQL Server\n\n## Key Features\n- Type-safe queries\n- Auto-generated migrations\n- Visual database browser',
        official_docs_url: 'https://www.prisma.io/docs',
        github_url: 'https://github.com/prisma/prisma',
        logo_url: '/logos/prisma.svg',
        tags: ['orm', 'database', 'typescript', 'nodejs', 'migrations'],
        compatible_with: ['postgresql', 'mysql', 'mongodb', 'sqlite', 'nextjs'],
        resource_requirements: {
          cpu: '0.5 cores',
          memory: '256MB'
        },
        is_official: true,
        usage_count: 123456
      },
      {
        name: 'LAMP Stack Container',
        description: 'Complete containerized LAMP stack with Linux, Apache 2.4, MySQL 8.0, and PHP 8.2 for traditional web development.',
        category: 'infrastructure',
        type: 'container',
        container_type: 'docker',
        setup_time_hours: 2.0,
        difficulty: 'intermediate',
        pricing: 'free',
        documentation: '# LAMP Stack Container\n\nProduction-ready LAMP stack in Docker containers.\n\n## Included Services\n- **Linux**: Ubuntu 22.04 base\n- **Apache**: 2.4 with mod_rewrite\n- **MySQL**: 8.0 with optimized configuration\n- **PHP**: 8.2 with common extensions\n- **phpMyAdmin**: Database management interface\n\n## Quick Start\n```bash\ndocker-compose up -d\n```',
        official_docs_url: 'https://hub.docker.com/_/lamp',
        github_url: 'https://github.com/docker-library/lamp',
        logo_url: '/logos/docker.svg',
        tags: ['lamp', 'web-development', 'php', 'mysql', 'apache'],
        compatible_with: ['wordpress', 'drupal', 'laravel', 'symfony'],
        contained_technologies: ['apache', 'mysql', 'php', 'phpmyadmin', 'ubuntu'],
        resource_requirements: {
          cpu: '2 cores',
          memory: '4GB',
          storage: '20GB'
        },
        is_official: true,
        usage_count: 89234
      },
      {
        name: 'Next.js Starter',
        description: 'Complete Next.js 14 setup with TypeScript, Tailwind CSS, and essential development tools.',
        category: 'frontend',
        type: 'component',
        setup_time_hours: 0.5,
        difficulty: 'beginner',
        pricing: 'free',
        documentation: '# Next.js Starter Template\n\nA production-ready Next.js template with modern tooling.\n\n## Included\n- Next.js 14 with App Router\n- TypeScript configuration\n- Tailwind CSS\n- ESLint + Prettier\n- Absolute imports\n\n## Getting Started\n```bash\nnpx create-next-app@latest my-app --typescript --tailwind\n```',
        official_docs_url: 'https://nextjs.org/docs',
        github_url: 'https://github.com/vercel/next.js',
        logo_url: '/logos/nextjs.svg',
        tags: ['react', 'typescript', 'tailwind', 'ssr', 'routing'],
        compatible_with: ['react', 'typescript', 'tailwind', 'vercel'],
        resource_requirements: {
          cpu: '1 core',
          memory: '512MB'
        },
        is_official: true,
        usage_count: 234567
      },
      {
        name: 'Monitoring Stack K8s',
        description: 'Comprehensive Kubernetes monitoring solution with Prometheus, Grafana, AlertManager and service discovery.',
        category: 'devops',
        type: 'container',
        container_type: 'kubernetes',
        setup_time_hours: 4.0,
        difficulty: 'expert',
        pricing: 'free',
        documentation: '# Kubernetes Monitoring Stack\n\nProduction-grade monitoring for Kubernetes clusters.\n\n## Components\n- **Prometheus**: Metrics collection and storage\n- **Grafana**: Visualization and dashboards\n- **AlertManager**: Alert routing and management\n- **Node Exporter**: System metrics\n- **kube-state-metrics**: Kubernetes API metrics\n\n## Installation\n```bash\nhelm install monitoring prometheus-community/kube-prometheus-stack\n```',
        official_docs_url: 'https://prometheus.io/docs',
        github_url: 'https://github.com/prometheus-operator/kube-prometheus',
        logo_url: '/logos/kubernetes.svg',
        tags: ['monitoring', 'prometheus', 'grafana', 'alertmanager', 'kubernetes'],
        compatible_with: ['kubernetes', 'helm', 'prometheus', 'grafana'],
        contained_technologies: ['prometheus', 'grafana', 'alertmanager', 'node-exporter', 'kube-state-metrics'],
        resource_requirements: {
          cpu: '4 cores',
          memory: '8GB',
          storage: '100GB'
        },
        is_official: true,
        usage_count: 34567
      }
    ];
    
    // Les composants de seed n'ont pas d'auteur spécifique (author_id sera null)
    const seedComponentsWithAuthor = seedComponents.map(comp => ({
      ...comp,
      author_id: null // Les composants officiels peuvent avoir author_id null
    }));
    
    // Insérer les données
    const { data, error } = await supabase
      .from('community_components')
      .insert(seedComponentsWithAuthor)
      .select();
    
    if (error) {
      console.error('[Community Components Seed] Error:', error);
      return NextResponse.json(
        { error: 'Failed to seed data', details: error.message },
        { status: 500 }
      );
    }
    
    console.log(`[Community Components Seed] Successfully seeded ${data.length} components`);
    
    return NextResponse.json({
      message: `Successfully seeded ${data.length} components`,
      components: data.map(c => ({ id: c.id, name: c.name, category: c.category }))
    });
    
  } catch (error) {
    console.error('[Community Components Seed] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}