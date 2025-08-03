'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  X, 
  Save, 
  Link as LinkIcon,
  FileText,
  Github,
  Package,
  Plus,
  Trash,
  Eye,
  Edit3
} from 'lucide-react';

interface Component {
  id: string;
  name: string;
  description: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'tool' | 'other';
  type: 'main' | 'sub';
  setupTimeHours: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  pricing: 'free' | 'freemium' | 'paid';
  documentation?: string;
  officialDocsUrl?: string;
  githubUrl?: string;
  npmUrl?: string;
  tags: string[];
  compatibleWith?: string[];
}

interface ComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (component: Partial<Component>) => void;
  component?: Component | null;
  existingComponents: Component[];
}

export const ComponentModal: React.FC<ComponentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  component,
  existingComponents
}) => {
  const [formData, setFormData] = useState<Partial<Component>>({
    name: '',
    description: '',
    category: 'frontend',
    type: 'main',
    setupTimeHours: 1,
    difficulty: 'intermediate',
    pricing: 'free',
    documentation: '',
    officialDocsUrl: '',
    githubUrl: '',
    npmUrl: '',
    tags: [],
    compatibleWith: []
  });
  
  const [newTag, setNewTag] = useState('');
  const [showDocEditor, setShowDocEditor] = useState(false);
  const [docPreview, setDocPreview] = useState(false);

  useEffect(() => {
    if (component) {
      setFormData({
        name: component.name,
        description: component.description,
        category: component.category,
        type: component.type,
        setupTimeHours: component.setupTimeHours,
        difficulty: component.difficulty,
        pricing: component.pricing,
        documentation: component.documentation || '',
        officialDocsUrl: component.officialDocsUrl || '',
        githubUrl: component.githubUrl || '',
        npmUrl: component.npmUrl || '',
        tags: component.tags || [],
        compatibleWith: component.compatibleWith || []
      });
    }
  }, [component]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    onSave(formData);
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.toLowerCase()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || []
    });
  };

  const handleCompatibilityToggle = (componentId: string) => {
    const isCompatible = formData.compatibleWith?.includes(componentId);
    
    if (isCompatible) {
      setFormData({
        ...formData,
        compatibleWith: formData.compatibleWith?.filter(id => id !== componentId) || []
      });
    } else {
      setFormData({
        ...formData,
        compatibleWith: [...(formData.compatibleWith || []), componentId]
      });
    }
  };

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-white">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-white">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-4 mb-2 text-white">{line.slice(2)}</h1>;
        }
        if (line.startsWith('```')) {
          return <div key={index} className="bg-slate-800 p-3 rounded-md font-mono text-sm my-2 text-slate-300">{line.slice(3)}</div>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4 list-disc text-slate-300">{line.slice(2)}</li>;
        }
        if (line.trim()) {
          return <p key={index} className="mb-2 text-slate-300">{line}</p>;
        }
        return <br key={index} />;
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <Card variant="glass" className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {component ? 'Edit Component' : 'Create New Component'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. React, Express, MongoDB"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category *
                  </label>
                  <Select
                    value={formData.category}
                    onChange={(value) => setFormData({ ...formData, category: value as 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'testing' })}
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
                  placeholder="Brief description of the component..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Technical Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Technical Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Type
                  </label>
                  <Select
                    value={formData.type}
                    onChange={(value) => setFormData({ ...formData, type: value as any })}
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
                    onChange={(value) => setFormData({ ...formData, difficulty: value as any })}
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
                    onChange={(value) => setFormData({ ...formData, pricing: value as any })}
                    options={[
                      { value: 'free', label: 'Free' },
                      { value: 'freemium', label: 'Freemium' },
                      { value: 'paid', label: 'Paid' }
                    ]}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Setup Time (hours)
                </label>
                <Input
                  type="number"
                  value={formData.setupTimeHours}
                  onChange={(e) => setFormData({ ...formData, setupTimeHours: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">External Links</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Official Documentation URL
                  </label>
                  <Input
                    type="url"
                    value={formData.officialDocsUrl}
                    onChange={(e) => setFormData({ ...formData, officialDocsUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Github className="w-4 h-4 inline mr-1" />
                    GitHub URL
                  </label>
                  <Input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Package className="w-4 h-4 inline mr-1" />
                    NPM URL
                  </label>
                  <Input
                    type="url"
                    value={formData.npmUrl}
                    onChange={(e) => setFormData({ ...formData, npmUrl: e.target.value })}
                    placeholder="https://www.npmjs.com/package/..."
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Tags</h3>
              
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Documentation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Documentation</h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDocEditor(!showDocEditor)}
                >
                  {showDocEditor ? 'Hide Editor' : 'Show Editor'}
                </Button>
              </div>
              
              {showDocEditor && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={docPreview ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => setDocPreview(false)}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant={docPreview ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setDocPreview(true)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                  
                  {docPreview ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                      <div className="prose prose-invert prose-sm max-w-none">
                        {formData.documentation ? renderMarkdown(formData.documentation) : (
                          <p className="text-slate-400 italic">No documentation written yet</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={formData.documentation}
                      onChange={(e) => setFormData({ ...formData, documentation: e.target.value })}
                      placeholder={`# ${formData.name || 'Component'} Setup Guide\n\n## Installation\n\`\`\`bash\nnpm install ${formData.name?.toLowerCase() || 'component'}\n\`\`\`\n\n## Configuration\n- Step 1: ...\n- Step 2: ...\n\n## Usage Example\n\`\`\`javascript\n// Your code here\n\`\`\``}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      rows={12}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Compatibility */}
            {formData.type === 'sub' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Compatible With</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {existingComponents
                    .filter(c => c.type === 'main' && c.id !== component?.id)
                    .map(comp => (
                      <label
                        key={comp.id}
                        className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.compatibleWith?.includes(comp.id) || false}
                          onChange={() => handleCompatibilityToggle(comp.id)}
                          className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-white">{comp.name}</span>
                      </label>
                    ))}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {component ? 'Update Component' : 'Create Component'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};