'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CodeVisualToggle } from '@/components/ui/CodeVisualToggle';
import { PresentationCodeToggle } from '@/components/ui/PresentationCodeToggle';
import { 
  Code2, 
  Workflow,
  Package,
  Sparkles,
  ChevronRight,
  Github,
  ExternalLink,
  Terminal,
  Layers,
  Container,
  FileJson,
  Settings,
  Boxes,
  CircuitBoard
} from 'lucide-react';

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);

  const features = [
    {
      icon: Workflow,
      title: 'React Flow Canvas',
      description: 'Drag and drop components on an infinite canvas. Pan, zoom, and connect technologies with smart bezier curves.',
      detail: 'Implemented with ReactFlow v11',
    },
    {
      icon: Container,
      title: 'Container Integration',
      description: 'Drop components into Docker/K8s containers. Real-time resource calculation with auto/manual modes and limit alerts.',
      detail: 'NestedContainerNode system',
    },
    {
      icon: Layers,
      title: 'Sub-Technology System',
      description: 'Add tools and libraries to main technologies. Drag Tailwind onto Next.js, or Jest onto Node.js.',
      detail: 'Hierarchical component system',
    },
    {
      icon: FileJson,
      title: 'Multi-Format Export',
      description: 'Export as JSON config, Docker Compose, README.md with setup instructions, or import existing stacks.',
      detail: '5 export formats available',
    },
    {
      icon: Terminal,
      title: 'Presentation Mode',
      description: 'Present your architecture with a beautiful slide-based view. Navigate with keyboard or auto-play.',
      detail: 'SimplePresentationMode',
    },
    {
      icon: Sparkles,
      title: 'Smart Templates',
      description: 'Start with pre-configured stacks: MERN, JAMStack, Microservices, or AI-powered apps.',
      detail: '10+ official templates',
    },
  ];

  const useCases = [
    {
      title: 'Microservices Architecture',
      description: 'Design and visualize complex microservices with container orchestration',
      icon: Boxes,
    },
    {
      title: 'Full-Stack Applications',
      description: 'Plan your frontend, backend, database, and infrastructure in one view',
      icon: Layers,
    },
    {
      title: 'DevOps Planning',
      description: 'Map out CI/CD pipelines, monitoring, and deployment strategies',
      icon: Settings,
    },
  ];

  const codeExample = `// Export your visual stack as code
const stack = {
  services: [
    { name: 'frontend', image: 'next:14', ports: [3000] },
    { name: 'backend', image: 'node:20', ports: [8080] },
    { name: 'database', image: 'postgres:15', ports: [5432] }
  ],
  containers: [
    {
      name: 'web-services',
      contains: ['frontend', 'backend'],
      resources: { cpu: '2 cores', memory: '4GB' }
    }
  ]
}`;

  return (
    <div className="relative min-h-screen bg-slate-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <motion.div 
          style={{ y: y1 }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl"
        />
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(rgba(15,23,42,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.9) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(ellipse at center, transparent 20%, black 70%)'
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] flex items-center px-4 sm:px-6 lg:px-8 pt-20">
        <div className="mx-auto max-w-7xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <Badge variant="secondary" className="mb-6 bg-blue-500/10 text-blue-400 border-blue-500/20">
                Open Source Visual Stack Builder
              </Badge>
              
              <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Design your tech stack
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  visually
                </span>
              </h1>
              
              <p className="mb-8 text-xl text-slate-300 leading-relaxed">
                Drag and drop technologies, organize them into containers, and export production-ready configurations. 
                No more guessing about resource requirements.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/builder">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="min-w-[200px] h-14 text-base font-semibold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                  >
                    <Terminal className="mr-2 h-5 w-5" />
                    Start Building
                  </Button>
                </Link>
                
                <Link href="https://github.com" target="_blank">
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="min-w-[200px] h-14 text-base font-semibold border-slate-700 hover:border-slate-600"
                  >
                    <Github className="mr-2 h-5 w-5" />
                    View on GitHub
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Free & Open Source
                </div>
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  No Sign-up Required
                </div>
              </div>
            </motion.div>
            
            {/* Right Interactive Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <CodeVisualToggle className="h-[500px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 py-24 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything you need to design tech stacks
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              A complete visual toolkit for planning, documenting, and deploying your infrastructure
            </p>
          </motion.div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group relative"
              >
                <div className="relative bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-xl p-6 transition-all duration-300 h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  
                  <div className="relative">
                    <div className="mb-4 inline-flex p-3 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                      <feature.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm leading-relaxed mb-3">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-mono">
                        {feature.detail}
                      </span>
                      <ChevronRight className={`h-4 w-4 text-slate-600 transition-all duration-300 ${hoveredFeature === index ? 'translate-x-1 text-blue-400' : ''}`} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative z-10 px-4 py-24 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Built for modern development workflows
            </h2>
            <p className="text-lg text-slate-400">
              Whether you&apos;re planning a simple app or complex infrastructure
            </p>
          </motion.div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                    <useCase.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="relative z-10 px-4 py-24 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Badge variant="secondary" className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                Export to Any Format
              </Badge>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                From visual design to production code
              </h2>
              
              <p className="text-lg text-slate-300 mb-6">
                Export your visual architecture as Docker Compose, Kubernetes manifests, 
                or custom deployment scripts. Every connection, resource limit, and 
                configuration is preserved.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Docker Compose</h4>
                    <p className="text-sm text-slate-400">Ready-to-run container orchestration files</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Kubernetes</h4>
                    <p className="text-sm text-slate-400">Production-grade K8s manifests with resource limits</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Infrastructure as Code</h4>
                    <p className="text-sm text-slate-400">Terraform, Pulumi, or custom scripts</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Right Interactive Block */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <PresentationCodeToggle className="h-[500px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Start building your stack visually
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              No sign-up required. Free and open source. Export to any format.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/builder">
                <Button 
                  size="lg" 
                  className="min-w-[200px] h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-600/20"
                >
                  <Workflow className="mr-2 h-5 w-5" />
                  Launch Builder
                </Button>
              </Link>
              
              <Link href="https://github.com" target="_blank">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="min-w-[200px] h-14 text-base font-semibold border-slate-700 hover:border-slate-600"
                >
                  <Github className="mr-2 h-5 w-5" />
                  Star on GitHub
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span>CLI Coming Soon</span>
              </div>
              <div className="flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                <span>API Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>npm Package</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CircuitBoard className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold text-white">BlueKit</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Open source visual stack builder for modern developers.
              </p>
              <div className="flex gap-4">
                <Link href="https://github.com" target="_blank" className="text-slate-400 hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </Link>
                <Link href="https://twitter.com" target="_blank" className="text-slate-400 hover:text-white transition-colors">
                  <ExternalLink className="h-5 w-5" />
                </Link>
              </div>
            </div>
            
            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/builder" className="text-slate-400 hover:text-white transition-colors">Visual Builder</Link></li>
                <li><Link href="/stacks" className="text-slate-400 hover:text-white transition-colors">Stack Library</Link></li>
                <li><Link href="/components" className="text-slate-400 hover:text-white transition-colors">Components</Link></li>
                {/* <li><Link href="/pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link></li> */}
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="text-slate-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/guides" className="text-slate-400 hover:text-white transition-colors">Guides</Link></li>
                <li><Link href="/api" className="text-slate-400 hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="/changelog" className="text-slate-400 hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="text-slate-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="text-slate-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            <p>&copy; 2024 BlueKit. All rights reserved. Built with Next.js and React Flow.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}