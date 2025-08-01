import { NodeData } from '@/components/ui/VisualBuilder/CanvasNode';
import { Connection } from '@/components/ui/VisualBuilder/ConnectionLine';

export interface StackData {
  id: string;
  name: string;
  description: string;
  nodes: NodeData[];
  connections: Connection[];
  author?: string;
  createdAt?: Date;
}

export interface ComparisonMetric {
  name: string;
  stack1Value: string | number;
  stack2Value: string | number;
  winner: 'stack1' | 'stack2' | 'tie';
  category: 'complexity' | 'cost' | 'performance' | 'maintainability' | 'scalability';
  description: string;
}

export interface TechnologyComparison {
  category: string;
  stack1Technologies: NodeData[];
  stack2Technologies: NodeData[];
  commonTechnologies: NodeData[];
  uniqueToStack1: NodeData[];
  uniqueToStack2: NodeData[];
}

export interface StackComparison {
  stack1: StackData;
  stack2: StackData;
  metrics: ComparisonMetric[];
  technologyComparison: TechnologyComparison[];
  overallWinner: 'stack1' | 'stack2' | 'tie';
  recommendations: ComparisonRecommendation[];
  similarityScore: number; // 0-100
}

export interface ComparisonRecommendation {
  id: string;
  type: 'merge' | 'choose' | 'optimize';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

// Base de données des scores de performance par technologie
const PERFORMANCE_SCORES: Record<string, number> = {
  'react': 85,
  'vue': 88,
  'angular': 80,
  'nextjs': 90,
  'nuxtjs': 87,
  'gatsby': 85,
  'nodejs': 88,
  'express': 85,
  'fastify': 92,
  'nestjs': 83,
  'postgresql': 95,
  'mongodb': 85,
  'mysql': 90,
  'redis': 98,
  'supabase': 88,
  'firebase': 85,
  'vercel': 95,
  'netlify': 90,
  'aws': 95,
  'docker': 90,
  'typescript': 90,
  'javascript': 75
};

// Scores de maintenabilité
const MAINTAINABILITY_SCORES: Record<string, number> = {
  'typescript': 95,
  'javascript': 70,
  'react': 85,
  'vue': 90,
  'angular': 88,
  'nextjs': 88,
  'nodejs': 80,
  'express': 75,
  'nestjs': 90,
  'postgresql': 90,
  'mongodb': 80,
  'supabase': 92,
  'docker': 85,
  'jest': 90,
  'cypress': 88,
  'tailwind': 85
};

// Coûts estimés (échelle 1-100, plus bas = moins cher)
const COST_SCORES: Record<string, number> = {
  'react': 10, // gratuit
  'vue': 10,
  'angular': 10,
  'nextjs': 15, // coût de hosting
  'nodejs': 20, // coût serveur
  'postgresql': 30,
  'mongodb': 35,
  'supabase': 25,
  'firebase': 40,
  'vercel': 20,
  'netlify': 20,
  'aws': 50,
  'docker': 30
};

export class StackComparer {
  static compareStacks(stack1: StackData, stack2: StackData): StackComparison {
    const metrics = this.calculateMetrics(stack1, stack2);
    const technologyComparison = this.compareTechnologies(stack1, stack2);
    const similarityScore = this.calculateSimilarityScore(stack1, stack2);
    const overallWinner = this.determineOverallWinner(metrics);
    const recommendations = this.generateRecommendations(stack1, stack2, technologyComparison);

    return {
      stack1,
      stack2,
      metrics,
      technologyComparison,
      overallWinner,
      recommendations,
      similarityScore
    };
  }

  private static calculateMetrics(stack1: StackData, stack2: StackData): ComparisonMetric[] {
    const metrics: ComparisonMetric[] = [];

    // Complexité (nombre de technologies)
    const complexity1 = stack1.nodes.length;
    const complexity2 = stack2.nodes.length;
    metrics.push({
      name: 'Complexity',
      stack1Value: complexity1,
      stack2Value: complexity2,
      winner: complexity1 < complexity2 ? 'stack1' : complexity1 > complexity2 ? 'stack2' : 'tie',
      category: 'complexity',
      description: 'Lower complexity means easier to learn and maintain'
    });

    // Performance Score
    const performance1 = this.calculateAverageScore(stack1.nodes, PERFORMANCE_SCORES);
    const performance2 = this.calculateAverageScore(stack2.nodes, PERFORMANCE_SCORES);
    metrics.push({
      name: 'Performance Score',
      stack1Value: `${performance1}/100`,
      stack2Value: `${performance2}/100`,
      winner: performance1 > performance2 ? 'stack1' : performance1 < performance2 ? 'stack2' : 'tie',
      category: 'performance',
      description: 'Average performance rating of technologies'
    });

    // Maintainability
    const maintain1 = this.calculateAverageScore(stack1.nodes, MAINTAINABILITY_SCORES);
    const maintain2 = this.calculateAverageScore(stack2.nodes, MAINTAINABILITY_SCORES);
    metrics.push({
      name: 'Maintainability',
      stack1Value: `${maintain1}/100`,
      stack2Value: `${maintain2}/100`,
      winner: maintain1 > maintain2 ? 'stack1' : maintain1 < maintain2 ? 'stack2' : 'tie',
      category: 'maintainability',
      description: 'How easy it is to maintain and update the codebase'
    });

    // Cost Score (lower is better)
    const cost1 = this.calculateAverageScore(stack1.nodes, COST_SCORES);
    const cost2 = this.calculateAverageScore(stack2.nodes, COST_SCORES);
    metrics.push({
      name: 'Cost Score',
      stack1Value: `${cost1}/100`,
      stack2Value: `${cost2}/100`,
      winner: cost1 < cost2 ? 'stack1' : cost1 > cost2 ? 'stack2' : 'tie',
      category: 'cost',
      description: 'Estimated operational costs (lower is better)'
    });

    // Setup Time
    const setupTime1 = stack1.nodes.reduce((sum, node) => sum + node.setupTimeHours, 0);
    const setupTime2 = stack2.nodes.reduce((sum, node) => sum + node.setupTimeHours, 0);
    metrics.push({
      name: 'Setup Time',
      stack1Value: `${setupTime1}h`,
      stack2Value: `${setupTime2}h`,
      winner: setupTime1 < setupTime2 ? 'stack1' : setupTime1 > setupTime2 ? 'stack2' : 'tie',
      category: 'complexity',
      description: 'Time required to set up the development environment'
    });

    // Learning Curve
    const difficulty1 = this.calculateDifficultyScore(stack1.nodes);
    const difficulty2 = this.calculateDifficultyScore(stack2.nodes);
    metrics.push({
      name: 'Learning Curve',
      stack1Value: difficulty1,
      stack2Value: difficulty2,
      winner: difficulty1 === 'beginner' && difficulty2 !== 'beginner' ? 'stack1' :
               difficulty2 === 'beginner' && difficulty1 !== 'beginner' ? 'stack2' : 'tie',
      category: 'complexity',
      description: 'Overall difficulty level for developers'
    });

    return metrics;
  }

  private static compareTechnologies(stack1: StackData, stack2: StackData): TechnologyComparison[] {
    const categories = new Set([
      ...stack1.nodes.map(n => n.category),
      ...stack2.nodes.map(n => n.category)
    ]);

    return Array.from(categories).map(category => {
      const stack1Techs = stack1.nodes.filter(n => n.category === category);
      const stack2Techs = stack2.nodes.filter(n => n.category === category);
      
      const stack1Ids = new Set(stack1Techs.map(t => t.id));
      const stack2Ids = new Set(stack2Techs.map(t => t.id));
      
      const commonTechnologies = stack1Techs.filter(t => stack2Ids.has(t.id));
      const uniqueToStack1 = stack1Techs.filter(t => !stack2Ids.has(t.id));
      const uniqueToStack2 = stack2Techs.filter(t => !stack1Ids.has(t.id));

      return {
        category,
        stack1Technologies: stack1Techs,
        stack2Technologies: stack2Techs,
        commonTechnologies,
        uniqueToStack1,
        uniqueToStack2
      };
    });
  }

  private static calculateSimilarityScore(stack1: StackData, stack2: StackData): number {
    const stack1Ids = new Set(stack1.nodes.map(n => n.id));
    const stack2Ids = new Set(stack2.nodes.map(n => n.id));
    
    const intersection = new Set([...stack1Ids].filter(id => stack2Ids.has(id)));
    const union = new Set([...stack1Ids, ...stack2Ids]);
    
    return Math.round((intersection.size / union.size) * 100);
  }

  private static calculateAverageScore(nodes: NodeData[], scores: Record<string, number>): number {
    const nodeScores = nodes.map(node => scores[node.id] || 70); // Default score
    return Math.round(nodeScores.reduce((sum, score) => sum + score, 0) / nodeScores.length);
  }

  private static calculateDifficultyScore(nodes: NodeData[]): string {
    const difficulties = nodes.map(n => n.difficulty);
    const expertCount = difficulties.filter(d => d === 'expert').length;
    const beginnerCount = difficulties.filter(d => d === 'beginner').length;
    
    if (expertCount > nodes.length / 2) return 'expert';
    if (beginnerCount > nodes.length / 2) return 'beginner';
    return 'intermediate';
  }

  private static determineOverallWinner(metrics: ComparisonMetric[]): 'stack1' | 'stack2' | 'tie' {
    const stack1Wins = metrics.filter(m => m.winner === 'stack1').length;
    const stack2Wins = metrics.filter(m => m.winner === 'stack2').length;
    
    if (stack1Wins > stack2Wins) return 'stack1';
    if (stack2Wins > stack1Wins) return 'stack2';
    return 'tie';
  }

  private static generateRecommendations(
    stack1: StackData, 
    stack2: StackData, 
    comparison: TechnologyComparison[]
  ): ComparisonRecommendation[] {
    const recommendations: ComparisonRecommendation[] = [];

    // Recommandation de fusion si beaucoup de similitudes
    const similarityScore = this.calculateSimilarityScore(stack1, stack2);
    if (similarityScore > 70) {
      recommendations.push({
        id: 'merge-suggestion',
        type: 'merge',
        title: 'Consider Merging Stacks',
        description: `High similarity (${similarityScore}%) suggests these stacks could be merged for better maintainability`,
        impact: 'medium'
      });
    }

    // Recommandations basées sur les technologies uniques
    comparison.forEach(cat => {
      if (cat.uniqueToStack1.length > 0 && cat.uniqueToStack2.length > 0) {
        recommendations.push({
          id: `optimize-${cat.category}`,
          type: 'optimize',
          title: `Optimize ${cat.category} Layer`,
          description: `Both stacks have different ${cat.category} solutions. Consider standardizing on the best option.`,
          impact: 'medium'
        });
      }
    });

    // Recommandation de choix si une stack est clairement meilleure
    const stack1Complexity = stack1.nodes.length;
    const stack2Complexity = stack2.nodes.length;
    
    if (Math.abs(stack1Complexity - stack2Complexity) > 3) {
      const simpler = stack1Complexity < stack2Complexity ? stack1 : stack2;
      recommendations.push({
        id: 'choose-simpler',
        type: 'choose',
        title: 'Consider the Simpler Stack',
        description: `${simpler.name} has fewer technologies and might be easier to implement and maintain`,
        impact: 'high'
      });
    }

    return recommendations;
  }
}