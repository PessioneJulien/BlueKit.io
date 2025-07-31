import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { Spinner, LoadingDots, ProgressBar, Skeleton, LoadingOverlay, LoadingState } from '@/components/ui/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Cloud, Download } from 'lucide-react';

const meta: Meta = {
  title: 'UI/Loading & Skeleton',
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
};

export default meta;

export const Spinners: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-4">Spinner Sizes</h3>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <Spinner size="sm" />
            <p className="text-xs text-slate-400 mt-2">Small</p>
          </div>
          <div className="text-center">
            <Spinner size="md" />
            <p className="text-xs text-slate-400 mt-2">Medium</p>
          </div>
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-xs text-slate-400 mt-2">Large</p>
          </div>
          <div className="text-center">
            <Spinner size="xl" />
            <p className="text-xs text-slate-400 mt-2">Extra Large</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-4">Loading Dots</h3>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <LoadingDots size="sm" />
            <p className="text-xs text-slate-400 mt-2">Small</p>
          </div>
          <div className="text-center">
            <LoadingDots size="md" />
            <p className="text-xs text-slate-400 mt-2">Medium</p>
          </div>
          <div className="text-center">
            <LoadingDots size="lg" />
            <p className="text-xs text-slate-400 mt-2">Large</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const ProgressBars: StoryObj = {
  render: () => {
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + 10;
        });
      }, 500);
      
      return () => clearInterval(timer);
    }, []);
    
    return (
      <div className="w-96 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-4">Progress Bar Sizes</h3>
          <div className="space-y-4">
            <ProgressBar value={30} size="sm" />
            <ProgressBar value={60} size="md" />
            <ProgressBar value={90} size="lg" />
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-4">With Labels</h3>
          <ProgressBar value={75} showLabel />
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-4">Gradient Variant</h3>
          <ProgressBar value={50} variant="gradient" showLabel />
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-4">Animated Progress</h3>
          <ProgressBar value={progress} showLabel />
        </div>
      </div>
    );
  },
};

export const SkeletonStates: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-4">Text Skeleton</h3>
        <div className="space-y-2 w-96">
          <Skeleton variant="text" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-4">Shape Variants</h3>
        <div className="flex gap-4">
          <div>
            <Skeleton variant="circular" width={60} height={60} />
            <p className="text-xs text-slate-400 mt-2">Circular</p>
          </div>
          <div>
            <Skeleton variant="rounded" width={120} height={60} />
            <p className="text-xs text-slate-400 mt-2">Rounded</p>
          </div>
          <div>
            <Skeleton variant="rectangular" width={120} height={60} />
            <p className="text-xs text-slate-400 mt-2">Rectangular</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-4">Card Skeleton</h3>
        <Card variant="glass" className="w-80">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="flex-1">
                <Skeleton variant="text" width="60%" className="mb-2" />
                <Skeleton variant="text" width="40%" height={12} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton variant="rectangular" height={120} className="mb-4" />
            <div className="space-y-2">
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};

export const LoadingOverlayExample: StoryObj = {
  render: () => {
    const [isLoading, setIsLoading] = useState(false);
    
    const simulateLoading = () => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 3000);
    };
    
    return (
      <div className="space-y-4">
        <Button variant="primary" onClick={simulateLoading}>
          Simulate Loading
        </Button>
        
        <LoadingOverlay isLoading={isLoading} text="Processing your request...">
          <Card variant="glass" className="w-96">
            <CardHeader>
              <CardTitle>Stack Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-200 mb-2">Technologies</h4>
                  <div className="flex gap-2">
                    <Badge variant="primary">React</Badge>
                    <Badge variant="secondary">Node.js</Badge>
                    <Badge variant="info">PostgreSQL</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-200 mb-2">Description</h4>
                  <p className="text-sm text-slate-300">
                    A modern full-stack application built with React, Node.js, and PostgreSQL.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </LoadingOverlay>
      </div>
    );
  },
};

export const LoadingStates: StoryObj = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card variant="glass" className="w-80">
        <LoadingState />
      </Card>
      
      <Card variant="glass" className="w-80">
        <LoadingState 
          title="Fetching stacks..."
          description="We're loading the latest technology stacks for you"
        />
      </Card>
      
      <Card variant="glass" className="w-80">
        <LoadingState 
          icon={<Cloud className="w-12 h-12 text-blue-400 animate-pulse" />}
          title="Syncing with cloud"
          description="Your data is being synchronized"
        />
      </Card>
      
      <Card variant="glass" className="w-80">
        <LoadingState 
          icon={
            <div className="relative">
              <Download className="w-12 h-12 text-green-400" />
              <LoadingDots size="sm" className="absolute -bottom-2 left-1/2 -translate-x-1/2" />
            </div>
          }
          title="Downloading resources"
          description="Please wait while we prepare your files"
        />
      </Card>
    </div>
  ),
};

export const ButtonWithLoading: StoryObj = {
  render: () => {
    const [loading, setLoading] = useState(false);
    
    const handleClick = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };
    
    return (
      <div className="space-y-4">
        <Button 
          variant="primary" 
          onClick={handleClick}
          disabled={loading}
          className="min-w-[150px]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Processing...</span>
            </div>
          ) : (
            'Submit'
          )}
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={handleClick}
          disabled={loading}
          className="min-w-[150px]"
        >
          {loading ? <LoadingDots size="sm" /> : 'Save Changes'}
        </Button>
      </div>
    );
  },
};