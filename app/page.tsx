import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowRight, 
  Code2, 
  LayoutGrid, 
  Users, 
  Zap,
  Globe,
  Shield,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
        icon: LayoutGrid,
      title: 'Visual Stack Builder',
      description: 'Drag and drop technologies to build your perfect stack',
      color: 'text-blue-400',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Learn from real-world stacks used by developers',
      color: 'text-purple-400',
    },
    {
      icon: Zap,
      title: 'Instant Setup Guides',
      description: 'Get step-by-step instructions tailored to your stack',
      color: 'text-yellow-400',
    },
    {
      icon: Shield,
      title: 'Best Practices',
      description: 'Built-in compatibility checks and recommendations',
      color: 'text-green-400',
    },
  ];

  const popularStacks = [
    {
      name: 'Modern SaaS Stack',
      description: 'Next.js + Supabase + Stripe',
      tags: ['Full-stack', 'Production Ready'],
      difficulty: 'intermediate',
    },
    {
      name: 'AI-Powered App',
      description: 'React + FastAPI + OpenAI',
      tags: ['AI/ML', 'Real-time'],
      difficulty: 'expert',
    },
    {
      name: 'Startup MVP',
      description: 'Vue.js + Firebase + Tailwind',
      tags: ['Rapid Development', 'Low Cost'],
      difficulty: 'beginner',
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-50" />
                <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-3">
                  <Code2 className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-100 sm:text-6xl lg:text-7xl">
              Build Your Perfect
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"> Tech Stack</span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 sm:text-xl">
              Discover, compare, and assemble technology stacks with confidence. 
              Get personalized setup guides and learn from the community.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/builder">
                <Button variant="primary" size="lg" className="min-w-[200px]">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Building
                </Button>
              </Link>
              <Link href="/stacks">
                <Button variant="secondary" size="lg" className="min-w-[200px]">
                  Browse Stacks
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-100">150+</div>
              <div className="mt-1 text-sm text-slate-400">Technologies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-100">2.5k</div>
              <div className="mt-1 text-sm text-slate-400">Stacks Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-100">10k+</div>
              <div className="mt-1 text-sm text-slate-400">Developers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-100">4.9/5</div>
              <div className="mt-1 text-sm text-slate-400">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-100 sm:text-4xl">
              Everything you need to build better
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Powerful features to help you make the right technology decisions
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} variant="glass" className="group hover:bg-slate-800/60">
                <CardContent className="p-6">
                  <div className={`mb-4 inline-flex rounded-lg bg-slate-800/50 p-3 ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-100">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Stacks */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-100">Popular Stacks</h2>
              <p className="mt-2 text-lg text-slate-400">Get started with community favorites</p>
            </div>
            <Link href="/stacks">
              <Button variant="ghost">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popularStacks.map((stack) => (
              <Card key={stack.name} variant="glass" className="group cursor-pointer hover:bg-slate-800/60">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-100 group-hover:text-blue-400">
                        {stack.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">{stack.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stack.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                    <Badge 
                      variant={
                        stack.difficulty === 'beginner' ? 'success' :
                        stack.difficulty === 'intermediate' ? 'warning' : 'danger'
                      } 
                      size="sm"
                      outline
                    >
                      {stack.difficulty}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Ready to build your stack?
              </h2>
              <p className="mb-8 text-lg text-white/90">
                Join thousands of developers building better applications with BlueKit
              </p>
              <Link href="/builder">
                <Button variant="secondary" size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}