import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getStackById } from '@/lib/data/stacksData';
import { 
  ArrowLeft,
  Star,
  Users,
  Clock,
  Download,
  Share2,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface StackDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StackDetailPage({ params }: StackDetailPageProps) {
  const { id } = await params;
  const stack = getStackById(id);

  if (!stack) {
    notFound();
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'expert': return 'danger';
      default: return 'default';
    }
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'free': return 'success';
      case 'freemium': return 'info';
      case 'paid': return 'warning';
      case 'mixed': return 'secondary';
      default: return 'default';
    }
  };

  const getTechnologyIcon = () => {
    // This would normally return actual technology icons
    return '🔧';
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/stacks">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Stacks
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge variant="primary">{stack.category}</Badge>
                <Badge variant={getDifficultyColor(stack.difficulty)} outline>
                  {stack.difficulty}
                </Badge>
                <Badge variant={getPricingColor(stack.pricing)} outline>
                  {stack.pricing}
                </Badge>
              </div>
              
              <h1 className="mb-4 text-4xl font-bold text-slate-100">{stack.name}</h1>
              <p className="text-lg text-slate-300">{stack.description}</p>
              
              <div className="mt-6 flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span>{stack.stars}/5</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{stack.uses} uses</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{stack.setupTimeHours}h setup</span>
                </div>
                <span>by {stack.author}</span>
              </div>
            </div>

            {/* Technologies */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['primary', 'secondary', 'optional'].map(role => {
                    const roleTechs = stack.technologies.filter(t => t.role === role);
                    if (roleTechs.length === 0) return null;
                    
                    return (
                      <div key={role}>
                        <h4 className="mb-3 text-sm font-medium capitalize text-slate-300">
                          {role} Technologies
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {roleTechs.map(tech => (
                            <div key={tech.id} className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
                              <span className="text-lg">{getTechnologyIcon()}</span>
                              <div>
                                <p className="font-medium text-slate-200">{tech.name}</p>
                                <p className="text-xs capitalize text-slate-400">{tech.category}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Use Cases */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Use Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {stack.useCases.map((useCase, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-400" />
                      <span className="text-slate-300">{useCase}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pros and Cons */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    Pros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {stack.pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    Cons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {stack.cons.map((con, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Installation Steps */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Installation Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stack.installationSteps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-medium text-blue-400">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-300">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alternatives */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Alternatives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stack.alternatives.map((alternative, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-purple-500/30">
                      {alternative}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button variant="primary" className="w-full">
                    Use This Stack
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="secondary" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                  <Button variant="ghost" className="w-full">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Stack ID
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stack Stats */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Stack Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Setup Time</span>
                    <span className="font-medium text-slate-200">{stack.setupTimeHours} hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Difficulty</span>
                    <Badge variant={getDifficultyColor(stack.difficulty)} size="sm">
                      {stack.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Pricing</span>
                    <Badge variant={getPricingColor(stack.pricing)} size="sm">
                      {stack.pricing}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Community Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      <span className="font-medium text-slate-200">{stack.stars}/5</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Total Uses</span>
                    <span className="font-medium text-slate-200">{stack.uses.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 flex-shrink-0 text-blue-400" />
                  <div className="text-sm">
                    <p className="font-medium text-slate-200">Getting Started</p>
                    <p className="mt-1 text-slate-400">
                      Follow the installation steps carefully. Each step builds on the previous one.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Stacks */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Related Stacks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stack.alternatives.slice(0, 3).map((alternative, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{alternative}</span>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}