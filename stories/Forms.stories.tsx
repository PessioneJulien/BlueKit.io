import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Input, TextArea } from '@/components/ui/Input';
import { Select, Checkbox, RadioGroup } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, Search, User, Code2, Globe } from 'lucide-react';

const meta: Meta = {
  title: 'UI/Forms',
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
};

export default meta;

export const InputVariants: StoryObj = {
  render: () => (
    <div className="w-96 space-y-4">
      <Input placeholder="Default input" />
      <Input 
        label="Email Address" 
        type="email" 
        placeholder="you@example.com"
        icon={<Mail className="w-5 h-5" />}
      />
      <Input 
        label="Password" 
        type="password" 
        placeholder="Enter your password"
        icon={<Lock className="w-5 h-5" />}
      />
      <Input 
        label="Search" 
        placeholder="Search technologies..."
        icon={<Search className="w-5 h-5" />}
        iconPosition="right"
      />
    </div>
  ),
};

export const InputStates: StoryObj = {
  render: () => (
    <div className="w-96 space-y-4">
      <Input 
        label="Success State" 
        placeholder="Valid input"
        success
        helperText="This input is valid"
        defaultValue="Valid content"
      />
      <Input 
        label="Error State" 
        placeholder="Invalid input"
        error="Please enter a valid email address"
        defaultValue="invalid-email"
      />
      <Input 
        label="With Helper Text" 
        placeholder="Enter username"
        helperText="Username must be 3-20 characters"
      />
      <Input 
        label="Disabled State" 
        placeholder="Cannot edit"
        disabled
        defaultValue="Disabled input"
      />
    </div>
  ),
};

export const SelectExamples: StoryObj = {
  render: () => {
    const [selected, setSelected] = useState('');
    const [category, setCategory] = useState('');
    
    const frameworks = [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue.js' },
      { value: 'angular', label: 'Angular' },
      { value: 'svelte', label: 'Svelte' },
      { value: 'nextjs', label: 'Next.js' },
    ];

    const categories = [
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' },
      { value: 'database', label: 'Database' },
      { value: 'devops', label: 'DevOps' },
      { value: 'mobile', label: 'Mobile', disabled: true },
    ];

    return (
      <div className="w-96 space-y-4">
        <Select
          label="Choose Framework"
          options={frameworks}
          value={selected}
          onChange={setSelected}
          placeholder="Select a framework"
        />
        <Select
          label="Technology Category"
          options={categories}
          value={category}
          onChange={setCategory}
          helperText="Mobile category is currently disabled"
        />
        <Select
          label="With Error"
          options={frameworks}
          error="Please select a framework"
        />
        <Select
          label="Success State"
          options={frameworks}
          success
          value="react"
          helperText="Great choice!"
        />
      </div>
    );
  },
};

export const TextAreaExamples: StoryObj = {
  render: () => (
    <div className="w-96 space-y-4">
      <TextArea
        label="Project Description"
        placeholder="Describe your project..."
        rows={4}
      />
      <TextArea
        label="With Helper Text"
        placeholder="Enter detailed description..."
        helperText="Minimum 50 characters required"
        rows={3}
      />
      <TextArea
        label="Error State"
        placeholder="Enter description..."
        error="Description is too short"
        defaultValue="Short"
      />
    </div>
  ),
};

export const CheckboxAndRadio: StoryObj = {
  render: () => {
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('free');
    
    const plans = [
      { value: 'free', label: 'Free Plan' },
      { value: 'pro', label: 'Pro Plan ($9/month)' },
      { value: 'enterprise', label: 'Enterprise (Contact us)' },
    ];

    return (
      <div className="w-96 space-y-6">
        <div className="space-y-4">
          <Checkbox
            label="Enable notifications"
            defaultChecked
          />
          <Checkbox
            label="I agree to the terms and conditions"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            helperText="You must agree to continue"
          />
          <Checkbox
            label="This option is disabled"
            disabled
          />
          <Checkbox
            label="With error state"
            error="You must check this box"
          />
        </div>
        
        <div className="border-t border-slate-700 pt-6">
          <RadioGroup
            label="Select your plan"
            name="plan"
            options={plans}
            value={selectedPlan}
            onChange={setSelectedPlan}
            helperText="You can upgrade anytime"
          />
        </div>
      </div>
    );
  },
};

export const CompleteForm: StoryObj = {
  render: () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      stack: '',
      experience: '',
      description: '',
      terms: false,
    });

    const stackOptions = [
      { value: 'mern', label: 'MERN Stack' },
      { value: 'mean', label: 'MEAN Stack' },
      { value: 'lamp', label: 'LAMP Stack' },
      { value: 'jamstack', label: 'JAMstack' },
      { value: 'custom', label: 'Custom Stack' },
    ];

    const experienceLevels = [
      { value: 'beginner', label: 'Beginner (0-2 years)' },
      { value: 'intermediate', label: 'Intermediate (2-5 years)' },
      { value: 'senior', label: 'Senior (5+ years)' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Form submitted:', formData);
    };

    return (
      <Card variant="glass" className="w-[480px]">
        <CardHeader>
          <CardTitle>Create Stack Profile</CardTitle>
          <CardDescription>Share your technology stack with the community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              placeholder="John Doe"
              icon={<User className="w-5 h-5" />}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              icon={<Mail className="w-5 h-5" />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            
            <Select
              label="Preferred Stack"
              options={stackOptions}
              value={formData.stack}
              onChange={(value) => setFormData({ ...formData, stack: value })}
              placeholder="Choose your stack"
            />
            
            <RadioGroup
              label="Experience Level"
              name="experience"
              options={experienceLevels}
              value={formData.experience}
              onChange={(value) => setFormData({ ...formData, experience: value })}
            />
            
            <TextArea
              label="Tell us about your project"
              placeholder="Describe what you're building..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              helperText={`${formData.description.length}/500 characters`}
            />
            
            <Checkbox
              label="I agree to share my stack publicly"
              checked={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
            />
            
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full"
              disabled={!formData.terms}
            >
              Submit Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  },
};

export const TechnologyForm: StoryObj = {
  render: () => {
    const [url, setUrl] = useState('');
    const [category, setCategory] = useState('');
    
    const categories = [
      { value: 'language', label: 'Programming Language' },
      { value: 'framework', label: 'Framework' },
      { value: 'database', label: 'Database' },
      { value: 'tool', label: 'Development Tool' },
      { value: 'service', label: 'Cloud Service' },
    ];

    return (
      <Card variant="glass" className="w-[480px]">
        <CardHeader>
          <CardTitle>Add New Technology</CardTitle>
          <CardDescription>Contribute to our technology database</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Input
              label="Technology Name"
              placeholder="e.g., React, PostgreSQL, Docker"
              icon={<Code2 className="w-5 h-5" />}
            />
            
            <Select
              label="Category"
              options={categories}
              value={category}
              onChange={setCategory}
              placeholder="Select category"
            />
            
            <Input
              label="Official Website"
              type="url"
              placeholder="https://example.com"
              icon={<Globe className="w-5 h-5" />}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              helperText="Include the full URL with https://"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Setup Time (hours)"
                type="number"
                placeholder="2"
                min="0"
                max="100"
              />
              
              <Select
                label="Difficulty"
                options={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'expert', label: 'Expert' },
                ]}
                placeholder="Select level"
              />
            </div>
            
            <Select
              label="Pricing Model"
              options={[
                { value: 'free', label: 'Free' },
                { value: 'freemium', label: 'Freemium' },
                { value: 'trial', label: 'Free Trial' },
                { value: 'paid', label: 'Paid Only' },
                { value: 'enterprise', label: 'Enterprise' },
              ]}
              placeholder="Select pricing"
            />
            
            <TextArea
              label="Description"
              placeholder="Brief description of the technology..."
              rows={3}
            />
            
            <Button type="submit" variant="primary" className="w-full">
              Submit Technology
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  },
};