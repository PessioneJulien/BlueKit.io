import { NodeData } from '@/components/ui/VisualBuilder/CanvasNode';

export interface CostItem {
  id: string;
  name: string;
  category: 'hosting' | 'license' | 'service' | 'development' | 'maintenance';
  costType: 'one_time' | 'monthly' | 'yearly' | 'per_user' | 'per_request';
  basePrice: number;
  currency: 'USD' | 'EUR';
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  description: string;
  scalingFactor?: number; // For per-user/per-request pricing
  freeAllowance?: {
    amount: number;
    unit: string;
  };
}

export interface CostBreakdown {
  technology: string;
  items: CostItem[];
  monthlyTotal: number;
  yearlyTotal: number;
  oneTimeTotal: number;
}

export interface CostAnalysis {
  totalMonthlyCost: number;
  totalYearlyCost: number;
  totalOneTimeCost: number;
  breakdown: CostBreakdown[];
  recommendations: CostRecommendation[];
  scalingProjections: ScalingProjection[];
}

export interface CostRecommendation {
  id: string;
  type: 'optimization' | 'alternative' | 'warning';
  title: string;
  description: string;
  potentialSavings?: number;
  impact: 'low' | 'medium' | 'high';
}

export interface ScalingProjection {
  userCount: number;
  monthlyEstimate: number;
  yearlyEstimate: number;
  recommendations: string[];
}

// Base de données des coûts par technologie
const TECHNOLOGY_COSTS: Record<string, CostItem[]> = {
  'nextjs': [
    {
      id: 'vercel-hosting',
      name: 'Vercel Hosting',
      category: 'hosting',
      costType: 'monthly',
      basePrice: 0,
      currency: 'USD',
      tier: 'free',
      description: 'Free tier: 100GB bandwidth, 1000 serverless functions executions',
      freeAllowance: { amount: 100, unit: 'GB bandwidth' }
    },
    {
      id: 'vercel-pro',
      name: 'Vercel Pro',
      category: 'hosting',
      costType: 'monthly',
      basePrice: 20,
      currency: 'USD',
      tier: 'pro',
      description: 'Pro tier: 1TB bandwidth, unlimited serverless functions, analytics'
    }
  ],
  'react': [
    {
      id: 'react-license',
      name: 'React Framework',
      category: 'license',
      costType: 'one_time',
      basePrice: 0,
      currency: 'USD',
      tier: 'free',
      description: 'Open source MIT license - completely free'
    }
  ],
  'supabase': [
    {
      id: 'supabase-free',
      name: 'Supabase Free Tier',
      category: 'service',
      costType: 'monthly',
      basePrice: 0,
      currency: 'USD',
      tier: 'free',
      description: 'Up to 50MB database, 50MB file storage, 2GB bandwidth',
      freeAllowance: { amount: 50, unit: 'MB database' }
    },
    {
      id: 'supabase-pro',
      name: 'Supabase Pro',
      category: 'service',
      costType: 'monthly',
      basePrice: 25,
      currency: 'USD',
      tier: 'pro',
      description: '8GB database, 100GB file storage, 50GB bandwidth'
    }
  ],
  'postgresql': [
    {
      id: 'aws-rds-postgres',
      name: 'AWS RDS PostgreSQL',
      category: 'hosting',
      costType: 'monthly',
      basePrice: 15,
      currency: 'USD',
      tier: 'basic',
      description: 'db.t3.micro instance with 20GB storage'
    },
    {
      id: 'railway-postgres',
      name: 'Railway PostgreSQL',
      category: 'hosting',
      costType: 'monthly',
      basePrice: 5,
      currency: 'USD',
      tier: 'basic',
      description: 'Shared PostgreSQL instance with 1GB storage'
    }
  ],
  'nodejs': [
    {
      id: 'nodejs-license',
      name: 'Node.js Runtime',
      category: 'license',
      costType: 'one_time',
      basePrice: 0,
      currency: 'USD',
      tier: 'free',
      description: 'Open source - completely free'
    },
    {
      id: 'aws-ec2-nodejs',
      name: 'AWS EC2 for Node.js',
      category: 'hosting',
      costType: 'monthly',
      basePrice: 10,
      currency: 'USD',
      tier: 'basic',
      description: 't3.micro instance for Node.js applications'
    }
  ],
  'mongodb': [
    {
      id: 'mongodb-atlas-free',
      name: 'MongoDB Atlas Free',
      category: 'service',
      costType: 'monthly',
      basePrice: 0,
      currency: 'USD',
      tier: 'free',
      description: '512MB storage, shared cluster',
      freeAllowance: { amount: 512, unit: 'MB' }
    },
    {
      id: 'mongodb-atlas-basic',
      name: 'MongoDB Atlas Basic',
      category: 'service',
      costType: 'monthly',
      basePrice: 9,
      currency: 'USD',
      tier: 'basic',
      description: 'M10 cluster with 10GB storage'
    }
  ],
  'stripe': [
    {
      id: 'stripe-payments',
      name: 'Stripe Payment Processing',
      category: 'service',
      costType: 'per_request',
      basePrice: 0.029, // 2.9% + 30¢ per transaction
      currency: 'USD',
      tier: 'basic',
      description: '2.9% + 30¢ per successful transaction',
      scalingFactor: 0.029
    }
  ],
  'sendgrid': [
    {
      id: 'sendgrid-free',
      name: 'SendGrid Free',
      category: 'service',
      costType: 'monthly',
      basePrice: 0,
      currency: 'USD',
      tier: 'free',
      description: '100 emails/day forever free',
      freeAllowance: { amount: 100, unit: 'emails/day' }
    },
    {
      id: 'sendgrid-essentials',
      name: 'SendGrid Essentials',
      category: 'service',
      costType: 'monthly',
      basePrice: 15,
      currency: 'USD',
      tier: 'basic',
      description: '50,000 emails/month, basic support'
    }
  ],
  'docker': [
    {
      id: 'docker-personal',
      name: 'Docker Personal',
      category: 'license',
      costType: 'monthly',
      basePrice: 0,
      currency: 'USD',
      tier: 'free',
      description: 'Free for personal use and small businesses'
    },
    {
      id: 'docker-pro',
      name: 'Docker Pro',
      category: 'license',
      costType: 'monthly',
      basePrice: 5,
      currency: 'USD',
      tier: 'pro',
      description: 'Advanced features for professional developers'
    }
  ],
  'figma': [
    {
      id: 'figma-free',
      name: 'Figma Free',
      category: 'service',
      costType: 'monthly',
      basePrice: 0,
      currency: 'USD',
      tier: 'free',
      description: 'Up to 3 Figma files and 3 FigJam files',
      freeAllowance: { amount: 3, unit: 'files' }
    },
    {
      id: 'figma-professional',
      name: 'Figma Professional',
      category: 'service',
      costType: 'per_user',
      basePrice: 12,
      currency: 'USD',
      tier: 'pro',
      description: 'Unlimited files, version history, advanced features',
      scalingFactor: 12
    }
  ]
};

// Coûts de développement estimés
const DEVELOPMENT_COSTS = {
  simple: {
    hours: 40,
    hourlyRate: 50,
    description: 'Simple project with basic features'
  },
  moderate: {
    hours: 120,
    hourlyRate: 60,
    description: 'Moderate complexity with multiple integrations'
  },
  complex: {
    hours: 300,
    hourlyRate: 75,
    description: 'Complex project with advanced features'
  },
  enterprise: {
    hours: 600,
    hourlyRate: 100,
    description: 'Enterprise-grade application'
  }
};

export class CostCalculator {
  static analyzeCosts(
    technologies: NodeData[], 
    userCount: number = 1000,
    complexity: 'simple' | 'moderate' | 'complex' | 'enterprise' = 'moderate'
  ): CostAnalysis {
    const breakdown: CostBreakdown[] = [];
    let totalMonthlyCost = 0;
    let totalYearlyCost = 0;
    let totalOneTimeCost = 0;

    // Calculer les coûts pour chaque technologie
    technologies.forEach(tech => {
      const costs = TECHNOLOGY_COSTS[tech.id] || [];
      if (costs.length === 0) return;

      const techBreakdown: CostBreakdown = {
        technology: tech.name,
        items: costs,
        monthlyTotal: 0,
        yearlyTotal: 0,
        oneTimeTotal: 0
      };

      costs.forEach(cost => {
        switch (cost.costType) {
          case 'monthly':
            techBreakdown.monthlyTotal += cost.basePrice;
            techBreakdown.yearlyTotal += cost.basePrice * 12;
            break;
          case 'yearly':
            techBreakdown.yearlyTotal += cost.basePrice;
            break;
          case 'one_time':
            techBreakdown.oneTimeTotal += cost.basePrice;
            break;
          case 'per_user':
            const userCost = cost.basePrice * Math.max(1, userCount / 1000);
            techBreakdown.monthlyTotal += userCost;
            techBreakdown.yearlyTotal += userCost * 12;
            break;
          case 'per_request':
            // Estimation based on user activity
            const requestsPerMonth = userCount * 100; // 100 requests per user per month
            const requestCost = requestsPerMonth * cost.basePrice;
            techBreakdown.monthlyTotal += requestCost;
            techBreakdown.yearlyTotal += requestCost * 12;
            break;
        }
      });

      breakdown.push(techBreakdown);
      totalMonthlyCost += techBreakdown.monthlyTotal;
      totalYearlyCost += techBreakdown.yearlyTotal;
      totalOneTimeCost += techBreakdown.oneTimeTotal;
    });

    // Ajouter les coûts de développement
    const devCost = DEVELOPMENT_COSTS[complexity];
    totalOneTimeCost += devCost.hours * devCost.hourlyRate;

    breakdown.push({
      technology: 'Development',
      items: [{
        id: 'development',
        name: `${complexity.charAt(0).toUpperCase() + complexity.slice(1)} Development`,
        category: 'development',
        costType: 'one_time',
        basePrice: devCost.hours * devCost.hourlyRate,
        currency: 'USD',
        tier: 'basic',
        description: `${devCost.hours} hours at $${devCost.hourlyRate}/hour - ${devCost.description}`
      }],
      monthlyTotal: 0,
      yearlyTotal: 0,
      oneTimeTotal: devCost.hours * devCost.hourlyRate
    });

    const recommendations = this.generateRecommendations(breakdown, technologies);
    const scalingProjections = this.generateScalingProjections(technologies, totalMonthlyCost);

    return {
      totalMonthlyCost,
      totalYearlyCost,
      totalOneTimeCost,
      breakdown,
      recommendations,
      scalingProjections
    };
  }

  private static generateRecommendations(breakdown: CostBreakdown[], technologies: NodeData[]): CostRecommendation[] {
    const recommendations: CostRecommendation[] = [];
    const techIds = technologies.map(t => t.id);

    // Vérifier pour des alternatives moins chères
    if (techIds.includes('mongodb') && !techIds.includes('postgresql')) {
      recommendations.push({
        id: 'postgres-alternative',
        type: 'alternative',
        title: 'Consider PostgreSQL',
        description: 'PostgreSQL on Railway ($5/month) could be cheaper than MongoDB Atlas for your use case',
        potentialSavings: 4,
        impact: 'medium'
      });
    }

    // Recommandations pour optimiser les coûts
    const hasExpensiveHosting = breakdown.some(b => 
      b.monthlyTotal > 50 && b.technology.toLowerCase().includes('aws')
    );
    
    if (hasExpensiveHosting) {
      recommendations.push({
        id: 'hosting-optimization',
        type: 'optimization',
        title: 'Optimize Hosting Costs',
        description: 'Consider using managed services like Vercel, Railway, or Supabase instead of AWS for lower costs',
        potentialSavings: 30,
        impact: 'high'
      });
    }

    // Warning pour les coûts élevés
    const totalMonthlyCost = breakdown.reduce((sum, b) => sum + b.monthlyTotal, 0);
    if (totalMonthlyCost > 100) {
      recommendations.push({
        id: 'high-cost-warning',
        type: 'warning',
        title: 'High Monthly Costs Detected',
        description: 'Your stack has high monthly costs. Consider free tiers and alternatives for development/testing',
        impact: 'high'
      });
    }

    return recommendations;
  }

  private static generateScalingProjections(technologies: NodeData[], baseMonthlyCost: number): ScalingProjection[] {
    const projections: ScalingProjection[] = [];
    const userCounts = [100, 1000, 10000, 100000];

    userCounts.forEach(userCount => {
      // Estimation simple basée sur la scalabilité
      const scalingMultiplier = Math.log10(userCount / 100) + 1;
      const monthlyEstimate = baseMonthlyCost * scalingMultiplier;
      const yearlyEstimate = monthlyEstimate * 12;

      const recommendations: string[] = [];
      
      if (userCount >= 10000) {
        recommendations.push('Consider CDN for static assets');
        recommendations.push('Implement caching strategies');
        recommendations.push('Database read replicas for performance');
      }
      
      if (userCount >= 100000) {
        recommendations.push('Migrate to enterprise hosting solutions');
        recommendations.push('Implement microservices architecture');
        recommendations.push('Advanced monitoring and alerting');
      }

      projections.push({
        userCount,
        monthlyEstimate,
        yearlyEstimate,
        recommendations
      });
    });

    return projections;
  }
}