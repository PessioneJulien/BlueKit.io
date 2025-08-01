import { NodeData } from '@/components/ui/VisualBuilder/CanvasNode';

export interface StackSuggestion {
  id: string;
  technology: NodeData;
  reason: string;
  category: 'missing_essential' | 'enhancement' | 'alternative' | 'optimization';
  confidence: number; // 0-100
  compatibilityScore: number; // 0-100
  tags: string[];
}

export interface StackAnalysis {
  strengths: string[];
  weaknesses: string[];
  missingEssentials: string[];
  suggestions: StackSuggestion[];
  overallScore: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
}

// Database des règles de compatibilité et suggestions
const COMPATIBILITY_RULES = {
  // Frontend frameworks
  'react': {
    stronglyRecommends: ['typescript', 'tailwind', 'nextjs', 'vercel'],
    suggests: ['storybook', 'jest', 'eslint', 'prettier'],
    conflicts: ['angular', 'vue'],
    commonPairs: [
      { with: 'nextjs', score: 95 },
      { with: 'typescript', score: 90 },
      { with: 'tailwind', score: 85 }
    ]
  },
  'nextjs': {
    stronglyRecommends: ['react', 'typescript', 'vercel'],
    suggests: ['tailwind', 'prisma', 'supabase', 'stripe'],
    conflicts: ['gatsby', 'create-react-app'],
    commonPairs: [
      { with: 'supabase', score: 90 },
      { with: 'vercel', score: 95 },
      { with: 'prisma', score: 85 }
    ]
  },
  // Backend
  'nodejs': {
    stronglyRecommends: ['express', 'typescript'],
    suggests: ['prisma', 'jest', 'docker'],
    conflicts: [],
    commonPairs: [
      { with: 'express', score: 90 },
      { with: 'postgresql', score: 85 },
      { with: 'mongodb', score: 80 }
    ]
  },
  // Databases
  'postgresql': {
    stronglyRecommends: ['prisma'],
    suggests: ['redis', 'docker'],
    conflicts: ['mongodb'],
    commonPairs: [
      { with: 'prisma', score: 90 },
      { with: 'nodejs', score: 85 },
      { with: 'supabase', score: 95 }
    ]
  },
  'supabase': {
    stronglyRecommends: ['nextjs', 'react', 'typescript'],
    suggests: ['vercel', 'tailwind'],
    conflicts: ['firebase'],
    commonPairs: [
      { with: 'nextjs', score: 95 },
      { with: 'vercel', score: 90 },
      { with: 'react', score: 88 }
    ]
  }
};

// Technologies essentielles par catégorie
const ESSENTIAL_CATEGORIES = {
  frontend: ['react', 'vue', 'angular', 'nextjs', 'nuxtjs'],
  backend: ['nodejs', 'express', 'fastify', 'nestjs'],
  database: ['postgresql', 'mongodb', 'mysql', 'supabase', 'firebase'],
  testing: ['jest', 'cypress', 'playwright', 'vitest'],
  styling: ['tailwind', 'styled-components', 'material-ui', 'chakra'],
  deployment: ['vercel', 'netlify', 'aws', 'docker']
};

// Technologies populaires et leurs données
const TECHNOLOGY_DATABASE: Record<string, NodeData> = {
  'typescript': {
    id: 'typescript',
    name: 'TypeScript',
    category: 'frontend',
    description: 'JavaScript with syntax for types',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'free',
    isMainTechnology: false,
    compatibleWith: ['react', 'nextjs', 'nodejs', 'express'],
    tags: ['types', 'javascript', 'development']
  },
  'tailwind': {
    id: 'tailwind',
    name: 'Tailwind CSS',
    category: 'ui-ux',
    description: 'A utility-first CSS framework',
    setupTimeHours: 1,
    difficulty: 'beginner',
    pricing: 'free',
    isMainTechnology: false,
    compatibleWith: ['react', 'nextjs', 'vue'],
    tags: ['css', 'styling', 'utility']
  },
  'prisma': {
    id: 'prisma',
    name: 'Prisma',
    category: 'backend',
    description: 'Next-generation ORM for Node.js and TypeScript',
    setupTimeHours: 3,
    difficulty: 'intermediate',
    pricing: 'freemium',
    isMainTechnology: false,
    compatibleWith: ['nodejs', 'postgresql', 'mysql', 'typescript'],
    tags: ['orm', 'database', 'typescript']
  },
  'vercel': {
    id: 'vercel',
    name: 'Vercel',
    category: 'devops',
    description: 'Platform for frontend frameworks and static sites',
    setupTimeHours: 1,
    difficulty: 'beginner',
    pricing: 'freemium',
    isMainTechnology: false,
    compatibleWith: ['nextjs', 'react', 'vue'],
    tags: ['deployment', 'hosting', 'cdn']
  },
  'storybook': {
    id: 'storybook',
    name: 'Storybook',
    category: 'documentation',
    description: 'Tool for building UI components in isolation',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'free',
    isMainTechnology: false,
    compatibleWith: ['react', 'vue', 'angular'],
    tags: ['documentation', 'ui', 'components']
  },
  'jest': {
    id: 'jest',
    name: 'Jest',
    category: 'testing',
    description: 'JavaScript testing framework',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'free',
    isMainTechnology: false,
    compatibleWith: ['react', 'nodejs', 'typescript'],
    tags: ['testing', 'javascript', 'unit-test']
  },
  'docker': {
    id: 'docker',
    name: 'Docker',
    category: 'devops',
    description: 'Platform for developing, shipping, and running applications',
    setupTimeHours: 4,
    difficulty: 'intermediate',
    pricing: 'freemium',
    isMainTechnology: true,
    tags: ['containerization', 'deployment', 'devops']
  },
  'redis': {
    id: 'redis',
    name: 'Redis',
    category: 'database',
    description: 'In-memory data structure store',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'freemium',
    isMainTechnology: false,
    compatibleWith: ['nodejs', 'postgresql'],
    tags: ['cache', 'memory', 'performance']
  }
};

export class StackAnalyzer {
  static analyzeStack(technologies: NodeData[]): StackAnalysis {
    const techIds = technologies.map(t => t.id);
    const categories = this.getCategoriesPresent(technologies);
    
    const suggestions = this.generateSuggestions(technologies);
    const missingEssentials = this.findMissingEssentials(categories);
    const strengths = this.identifyStrengths(technologies);
    const weaknesses = this.identifyWeaknesses(technologies, categories);
    
    return {
      strengths,
      weaknesses,
      missingEssentials,
      suggestions,
      overallScore: this.calculateOverallScore(technologies, suggestions),
      complexity: this.determineComplexity(technologies)
    };
  }

  private static getCategoriesPresent(technologies: NodeData[]): Set<string> {
    return new Set(technologies.map(t => t.category));
  }

  private static generateSuggestions(technologies: NodeData[]): StackSuggestion[] {
    const suggestions: StackSuggestion[] = [];
    const techIds = new Set(technologies.map(t => t.id));

    // Pour chaque technologie dans la stack
    technologies.forEach(tech => {
      const rules = COMPATIBILITY_RULES[tech.id];
      if (!rules) return;

      // Suggestions fortement recommandées
      rules.stronglyRecommends?.forEach(suggestedId => {
        if (!techIds.has(suggestedId) && TECHNOLOGY_DATABASE[suggestedId]) {
          suggestions.push({
            id: `${tech.id}-${suggestedId}`,
            technology: TECHNOLOGY_DATABASE[suggestedId],
            reason: `Strongly recommended with ${tech.name} for optimal integration`,
            category: 'missing_essential',
            confidence: 90,
            compatibilityScore: 95,
            tags: ['recommended', 'integration']
          });
        }
      });

      // Suggestions d'amélioration
      rules.suggests?.forEach(suggestedId => {
        if (!techIds.has(suggestedId) && TECHNOLOGY_DATABASE[suggestedId]) {
          suggestions.push({
            id: `${tech.id}-${suggestedId}`,
            technology: TECHNOLOGY_DATABASE[suggestedId],
            reason: `Would enhance your ${tech.name} setup with additional capabilities`,
            category: 'enhancement',
            confidence: 70,
            compatibilityScore: 85,
            tags: ['enhancement', 'optional']
          });
        }
      });

      // Paires communes populaires
      rules.commonPairs?.forEach(pair => {
        if (!techIds.has(pair.with) && TECHNOLOGY_DATABASE[pair.with]) {
          suggestions.push({
            id: `${tech.id}-${pair.with}`,
            technology: TECHNOLOGY_DATABASE[pair.with],
            reason: `Popular combination: ${tech.name} + ${TECHNOLOGY_DATABASE[pair.with].name} (${pair.score}% compatibility)`,
            category: 'optimization',
            confidence: pair.score,
            compatibilityScore: pair.score,
            tags: ['popular', 'proven']
          });
        }
      });
    });

    // Déduplication et tri par confiance
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.technology.id === suggestion.technology.id)
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8); // Limiter à 8 suggestions

    return uniqueSuggestions;
  }

  private static findMissingEssentials(categories: Set<string>): string[] {
    const missing: string[] = [];

    if (!categories.has('testing')) {
      missing.push('No testing framework detected');
    }
    if (!categories.has('devops') && !categories.has('deployment')) {
      missing.push('No deployment/hosting solution');
    }
    if (categories.has('frontend') && !categories.has('ui-ux') && !categories.has('styling')) {
      missing.push('No styling solution for frontend');
    }

    return missing;
  }

  private static identifyStrengths(technologies: NodeData[]): string[] {
    const strengths: string[] = [];
    const techIds = technologies.map(t => t.id);

    // Vérifier les combinaisons fortes
    if (techIds.includes('react') && techIds.includes('nextjs')) {
      strengths.push('Excellent React + Next.js foundation for modern web apps');
    }
    if (techIds.includes('typescript')) {
      strengths.push('Type safety with TypeScript reduces bugs and improves maintainability');
    }
    if (techIds.includes('supabase') || techIds.includes('firebase')) {
      strengths.push('Backend-as-a-Service provides rapid development capabilities');
    }

    // Diversité des catégories
    const categories = new Set(technologies.map(t => t.category));
    if (categories.size >= 4) {
      strengths.push('Well-rounded stack covering multiple aspects of development');
    }

    return strengths;
  }

  private static identifyWeaknesses(technologies: NodeData[], categories: Set<string>): string[] {
    const weaknesses: string[] = [];

    if (!categories.has('testing')) {
      weaknesses.push('Lack of testing framework may lead to quality issues');
    }
    if (technologies.length > 8) {
      weaknesses.push('Stack complexity might be overwhelming for beginners');
    }
    if (!categories.has('devops')) {
      weaknesses.push('Missing deployment and DevOps considerations');
    }

    return weaknesses;
  }

  private static calculateOverallScore(technologies: NodeData[], suggestions: StackSuggestion[]): number {
    let score = 50; // Base score

    // Points pour les technologies populaires
    const popularTechs = ['react', 'nextjs', 'typescript', 'tailwind', 'nodejs'];
    const hasPopularTechs = technologies.filter(t => popularTechs.includes(t.id)).length;
    score += hasPopularTechs * 8;

    // Points pour la diversité des catégories
    const categories = new Set(technologies.map(t => t.category));
    score += categories.size * 5;

    // Déduction pour trop de suggestions critiques
    const criticalSuggestions = suggestions.filter(s => s.category === 'missing_essential').length;
    score -= criticalSuggestions * 10;

    return Math.max(0, Math.min(100, score));
  }

  private static determineComplexity(technologies: NodeData[]): 'simple' | 'moderate' | 'complex' | 'enterprise' {
    const count = technologies.length;
    const categories = new Set(technologies.map(t => t.category)).size;
    
    if (count <= 3 && categories <= 2) return 'simple';
    if (count <= 6 && categories <= 4) return 'moderate';
    if (count <= 10 && categories <= 6) return 'complex';
    return 'enterprise';
  }
}