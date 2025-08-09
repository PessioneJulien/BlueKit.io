'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Plus, 
  Trash, 
  Save, 
  ArrowLeft,
  Shield,
  AlertCircle,
  Check,
  X,
  Edit,
  Eye
} from 'lucide-react';
import { createStack, updateStack, deleteStack, getStacks, isAdmin, StackWithDetails } from '@/lib/supabase/stacks';
import { useUser } from '@/lib/hooks/useUser';

interface StackFormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  setup_time_hours: number;
  pricing: 'free' | 'freemium' | 'paid' | 'mixed';
  author: string;
  is_official: boolean;
  technologies: Array<{
    technology_id: string;
    technology_name: string;
    category: string;
    role: 'primary' | 'secondary' | 'optional';
  }>;
  use_cases: string[];
  pros: string[];
  cons: string[];
  installation_steps: string[];
  alternatives: string[];
}

const emptyStack: StackFormData = {
  name: '',
  slug: '',
  description: '',
  short_description: '',
  category: '',
  difficulty: 'intermediate',
  setup_time_hours: 4,
  pricing: 'free',
  author: 'BlueKit Team',
  is_official: true,
  technologies: [],
  use_cases: [],
  pros: [],
  cons: [],
  installation_steps: [],
  alternatives: []
};

export default function AdminStacksPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [stacks, setStacks] = useState<StackWithDetails[]>([]);
  const [editingStack, setEditingStack] = useState<StackFormData>(emptyStack);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      if (!loading) {
        if (!user) {
          router.push('/auth/login?redirect=/admin/stacks');
          return;
        }
        
        const admin = await isAdmin();
        if (!admin) {
          router.push('/');
          return;
        }
        
        setIsAdminUser(true);
        setIsCheckingAdmin(false);
        
        // Load existing stacks
        const existingStacks = await getStacks();
        setStacks(existingStacks);
      }
    }
    
    checkAdmin();
  }, [user, loading, router]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleAddItem = (field: keyof Pick<StackFormData, 'use_cases' | 'pros' | 'cons' | 'installation_steps' | 'alternatives'>) => {
    setEditingStack(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleUpdateItem = (field: keyof Pick<StackFormData, 'use_cases' | 'pros' | 'cons' | 'installation_steps' | 'alternatives'>, index: number, value: string) => {
    setEditingStack(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleRemoveItem = (field: keyof Pick<StackFormData, 'use_cases' | 'pros' | 'cons' | 'installation_steps' | 'alternatives'>, index: number) => {
    setEditingStack(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleAddTechnology = () => {
    setEditingStack(prev => ({
      ...prev,
      technologies: [...prev.technologies, {
        technology_id: '',
        technology_name: '',
        category: 'frontend',
        role: 'primary'
      }]
    }));
  };

  const handleUpdateTechnology = (index: number, updates: Partial<StackFormData['technologies'][0]>) => {
    setEditingStack(prev => ({
      ...prev,
      technologies: prev.technologies.map((tech, i) => 
        i === index ? { ...tech, ...updates } : tech
      )
    }));
  };

  const handleRemoveTechnology = (index: number) => {
    setEditingStack(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Validate required fields
      if (!editingStack.name || !editingStack.slug || !editingStack.description) {
        setMessage({ type: 'error', text: 'Please fill in all required fields' });
        setSaving(false);
        return;
      }

      const stackData = {
        name: editingStack.name,
        slug: editingStack.slug,
        description: editingStack.description,
        short_description: editingStack.short_description,
        category: editingStack.category,
        difficulty: editingStack.difficulty,
        setup_time_hours: editingStack.setup_time_hours,
        pricing: editingStack.pricing,
        author: editingStack.author,
        is_official: editingStack.is_official
      };

      if (editingId) {
        // Update existing stack
        const success = await updateStack(
          editingId,
          stackData,
          editingStack.technologies,
          editingStack.use_cases.filter(Boolean),
          editingStack.pros.filter(Boolean),
          editingStack.cons.filter(Boolean),
          editingStack.installation_steps.filter(Boolean),
          editingStack.alternatives.filter(Boolean)
        );
        
        if (success) {
          setMessage({ type: 'success', text: 'Stack updated successfully!' });
          const updatedStacks = await getStacks();
          setStacks(updatedStacks);
          setEditingStack(emptyStack);
          setEditingId(null);
        } else {
          setMessage({ type: 'error', text: 'Failed to update stack' });
        }
      } else {
        // Create new stack
        const newStack = await createStack(
          stackData,
          editingStack.technologies,
          editingStack.use_cases.filter(Boolean),
          editingStack.pros.filter(Boolean),
          editingStack.cons.filter(Boolean),
          editingStack.installation_steps.filter(Boolean),
          editingStack.alternatives.filter(Boolean)
        );
        
        if (newStack) {
          setMessage({ type: 'success', text: 'Stack created successfully!' });
          const updatedStacks = await getStacks();
          setStacks(updatedStacks);
          setEditingStack(emptyStack);
        } else {
          setMessage({ type: 'error', text: 'Failed to create stack' });
        }
      }
    } catch (error) {
      console.error('Error saving stack:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    }

    setSaving(false);
  };

  const handleEdit = (stack: StackWithDetails) => {
    setEditingId(stack.id);
    setEditingStack({
      name: stack.name,
      slug: stack.slug,
      description: stack.description,
      short_description: stack.short_description,
      category: stack.category,
      difficulty: stack.difficulty,
      setup_time_hours: stack.setup_time_hours,
      pricing: stack.pricing,
      author: stack.author,
      is_official: stack.is_official,
      technologies: stack.technologies.map(tech => ({
        technology_id: tech.technology_id,
        technology_name: tech.technology_name,
        category: tech.category,
        role: tech.role
      })),
      use_cases: stack.use_cases,
      pros: stack.pros,
      cons: stack.cons,
      installation_steps: stack.installation_steps,
      alternatives: stack.alternatives
    });
  };

  const handleDelete = async (stackId: string) => {
    if (!confirm('Are you sure you want to delete this stack?')) return;
    
    const success = await deleteStack(stackId);
    if (success) {
      setMessage({ type: 'success', text: 'Stack deleted successfully!' });
      const updatedStacks = await getStacks();
      setStacks(updatedStacks);
    } else {
      setMessage({ type: 'error', text: 'Failed to delete stack' });
    }
  };

  if (loading || isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAdminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 relative">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      </div>

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/stacks')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stacks
            </Button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <h1 className="text-4xl font-bold text-white">Stack Administration</h1>
            </div>
            <p className="text-slate-400">Create and manage technology stacks</p>
          </motion.div>

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
                message.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                  : 'bg-red-500/20 border border-red-500/30 text-red-300'
              }`}
            >
              {message.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              {message.text}
            </motion.div>
          )}

          {/* Stack Form */}
          <Card variant="glass" className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">
                {editingId ? 'Edit Stack' : 'Create New Stack'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Stack Name *
                  </label>
                  <Input
                    value={editingStack.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingStack(prev => ({
                        ...prev,
                        name,
                        slug: generateSlug(name)
                      }));
                    }}
                    placeholder="Modern SaaS Stack"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Slug *
                  </label>
                  <Input
                    value={editingStack.slug}
                    onChange={(e) => setEditingStack(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="modern-saas-stack"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Short Description *
                </label>
                <Input
                  value={editingStack.short_description}
                  onChange={(e) => setEditingStack(prev => ({ ...prev, short_description: e.target.value }))}
                  placeholder="Next.js + Supabase + Stripe for SaaS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Description *
                </label>
                <textarea
                  value={editingStack.description}
                  onChange={(e) => setEditingStack(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Complete full-stack solution for building scalable SaaS applications..."
                  className="w-full h-32 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Stack Properties */}
              <div className="grid gap-6 md:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <Select
                    value={editingStack.category}
                    onChange={(value) => setEditingStack(prev => ({ ...prev, category: value }))}
                    options={[
                      { value: 'Full-stack', label: 'Full-stack' },
                      { value: 'Frontend', label: 'Frontend' },
                      { value: 'Backend', label: 'Backend' },
                      { value: 'Mobile', label: 'Mobile' },
                      { value: 'AI/ML', label: 'AI/ML' },
                      { value: 'DevOps', label: 'DevOps' },
                      { value: 'E-commerce', label: 'E-commerce' },
                      { value: 'Enterprise', label: 'Enterprise' },
                      { value: 'Real-time', label: 'Real-time' },
                      { value: 'API', label: 'API' },
                      { value: 'Other', label: 'Other' }
                    ]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Difficulty
                  </label>
                  <Select
                    value={editingStack.difficulty}
                    onChange={(value) => setEditingStack(prev => ({ ...prev, difficulty: value as StackFormData['difficulty'] }))}
                    options={[
                      { value: 'beginner', label: 'Beginner' },
                      { value: 'intermediate', label: 'Intermediate' },
                      { value: 'expert', label: 'Expert' }
                    ]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Setup Time (hours)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={editingStack.setup_time_hours}
                    onChange={(e) => setEditingStack(prev => ({ ...prev, setup_time_hours: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Pricing
                  </label>
                  <Select
                    value={editingStack.pricing}
                    onChange={(value) => setEditingStack(prev => ({ ...prev, pricing: value as StackFormData['pricing'] }))}
                    options={[
                      { value: 'free', label: 'Free' },
                      { value: 'freemium', label: 'Freemium' },
                      { value: 'paid', label: 'Paid' },
                      { value: 'mixed', label: 'Mixed' }
                    ]}
                  />
                </div>
              </div>

              {/* Technologies */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-slate-300">
                    Technologies
                  </label>
                  <Button size="sm" variant="secondary" onClick={handleAddTechnology}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Technology
                  </Button>
                </div>
                <div className="space-y-3">
                  {editingStack.technologies.map((tech, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Input
                          placeholder="Technology Name"
                          value={tech.technology_name}
                          onChange={(e) => handleUpdateTechnology(index, { 
                            technology_name: e.target.value,
                            technology_id: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')
                          })}
                        />
                      </div>
                      <Select
                        value={tech.category}
                        onChange={(value) => handleUpdateTechnology(index, { category: value })}
                        options={[
                          { value: 'frontend', label: 'Frontend' },
                          { value: 'backend', label: 'Backend' },
                          { value: 'database', label: 'Database' },
                          { value: 'devops', label: 'DevOps' },
                          { value: 'mobile', label: 'Mobile' },
                          { value: 'ai', label: 'AI' },
                          { value: 'other', label: 'Other' }
                        ]}
                        className="w-40"
                      />
                      <Select
                        value={tech.role}
                        onChange={(value) => handleUpdateTechnology(index, { role: value as StackFormData['technologies'][number]['role'] })}
                        options={[
                          { value: 'primary', label: 'Primary' },
                          { value: 'secondary', label: 'Secondary' },
                          { value: 'optional', label: 'Optional' }
                        ]}
                        className="w-40"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveTechnology(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Lists */}
              {(['use_cases', 'pros', 'cons', 'installation_steps', 'alternatives'] as const).map(field => (
                <div key={field}>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-slate-300 capitalize">
                      {field.replace('_', ' ')}
                    </label>
                    <Button size="sm" variant="secondary" onClick={() => handleAddItem(field)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {editingStack[field].map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => handleUpdateItem(field, index, e.target.value)}
                          placeholder={`Enter ${field.replace('_', ' ').slice(0, -1)}`}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveItem(field, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : (editingId ? 'Update Stack' : 'Create Stack')}
                </Button>
                {editingId && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingStack(emptyStack);
                      setEditingId(null);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Existing Stacks */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-2xl">Existing Stacks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stacks.map(stack => (
                  <div
                    key={stack.id}
                    className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                  >
                    <div>
                      <h4 className="text-lg font-semibold text-white">{stack.name}</h4>
                      <p className="text-sm text-slate-400">{stack.short_description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary" size="sm">{stack.category}</Badge>
                        <Badge variant="secondary" size="sm">{stack.difficulty}</Badge>
                        <span className="text-xs text-slate-500">{stack.usage_count} uses</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/stacks/${stack.slug}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(stack)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(stack.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {stacks.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    No stacks found. Create your first stack above!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}