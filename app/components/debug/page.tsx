'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { simpleComponentsApi, type SimpleComponent } from '@/lib/api/components-simple';
import { useUserStore } from '@/lib/stores/userStore';

export default function ComponentsDebugPage() {
  const [components, setComponents] = useState<SimpleComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { user } = useUserStore();

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'frontend',
    type: 'main',
    setup_time_hours: 1,
    difficulty: 'intermediate',
    pricing: 'free',
    documentation: '',
    official_docs_url: '',
    github_url: '',
    npm_url: '',
    tags: [] as string[],
    compatible_with: [] as string[]
  });

  // Load components
  const loadComponents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading components...');
      const fetchedComponents = await simpleComponentsApi.getComponents();
      console.log('Loaded components:', fetchedComponents);
      setComponents(fetchedComponents);
    } catch (err) {
      console.error('Failed to load components:', err);
      setError(err instanceof Error ? err.message : 'Failed to load components');
    } finally {
      setLoading(false);
    }
  };

  // Create component
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Creating component with data:', formData);
      
      const newComponent = await simpleComponentsApi.createComponent(formData);
      console.log('Created component:', newComponent);
      
      setComponents([newComponent, ...components]);
      setShowCreateForm(false);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'frontend',
        type: 'main',
        setup_time_hours: 1,
        difficulty: 'intermediate',
        pricing: 'free',
        documentation: '',
        official_docs_url: '',
        github_url: '',
        npm_url: '',
        tags: [],
        compatible_with: []
      });
      
    } catch (err) {
      console.error('Failed to create component:', err);
      setError(err instanceof Error ? err.message : 'Failed to create component');
    } finally {
      setLoading(false);
    }
  };

  // Delete component
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      setLoading(true);
      await simpleComponentsApi.deleteComponent(id);
      setComponents(components.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete component:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete component');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComponents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Components Debug Page</h1>
          <p className="text-slate-400">Debug version for testing Supabase integration</p>
          
          {user ? (
            <p className="text-green-400 mt-2">Logged in as: {user.email}</p>
          ) : (
            <p className="text-red-400 mt-2">Not logged in</p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-300">Error: {error}</p>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <Button onClick={loadComponents} disabled={loading}>
            {loading ? 'Loading...' : 'Reload Components'}
          </Button>
          
          {user && (
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              variant="primary"
            >
              {showCreateForm ? 'Cancel' : 'Create Component'}
            </Button>
          )}
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Component</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category *
                    </label>
                    <Select
                      value={formData.category}
                      onChange={(value) => setFormData({ ...formData, category: value })}
                      options={[
                        { value: 'frontend', label: 'Frontend' },
                        { value: 'backend', label: 'Backend' },
                        { value: 'database', label: 'Database' },
                        { value: 'devops', label: 'DevOps' },
                        { value: 'mobile', label: 'Mobile' },
                        { value: 'ai', label: 'AI/ML' },
                        { value: 'tool', label: 'Tool' },
                        { value: 'other', label: 'Other' }
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Type
                    </label>
                    <Select
                      value={formData.type}
                      onChange={(value) => setFormData({ ...formData, type: value })}
                      options={[
                        { value: 'main', label: 'Main Component' },
                        { value: 'sub', label: 'Sub Component' }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Difficulty
                    </label>
                    <Select
                      value={formData.difficulty}
                      onChange={(value) => setFormData({ ...formData, difficulty: value })}
                      options={[
                        { value: 'beginner', label: 'Beginner' },
                        { value: 'intermediate', label: 'Intermediate' },
                        { value: 'expert', label: 'Expert' }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Pricing
                    </label>
                    <Select
                      value={formData.pricing}
                      onChange={(value) => setFormData({ ...formData, pricing: value })}
                      options={[
                        { value: 'free', label: 'Free' },
                        { value: 'freemium', label: 'Freemium' },
                        { value: 'paid', label: 'Paid' }
                      ]}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Component'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Components List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Components ({components.length})
          </h2>
          
          {components.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">No components found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {components.map((component) => (
                <Card key={component.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {component.name}
                        </h3>
                        <p className="text-slate-300 mb-3">
                          {component.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{component.category}</Badge>
                          <Badge variant="outline">{component.type}</Badge>
                          <Badge variant="outline">{component.difficulty}</Badge>
                          <Badge variant="outline">{component.pricing}</Badge>
                          {component.is_official && (
                            <Badge variant="primary">Official</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {user?.id === component.author_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(component.id)}
                            className="text-red-400 hover:text-red-300"
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-slate-500">
                      ID: {component.id} | Created: {new Date(component.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}