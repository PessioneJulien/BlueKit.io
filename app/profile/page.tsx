'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/Input';
import { useStackStore } from '@/lib/stores/stackStore';
import { useUserStore } from '@/lib/stores/userStore';
import { useStoreHydration } from '@/lib/hooks/useStoreHydration';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { 
  User, 
  Globe, 
  Github, 
  X,
  Edit3,
  Save,
  Star,
  Clock,
  Award,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';


export default function ProfilePage() {
  const isHydrated = useStoreHydration();
  const [isEditing, setIsEditing] = useState(false);
  
  // Use Zustand stores
  const { user, stats, updateProfile } = useUserStore();
  const { userStacks } = useStackStore();
  
  // Mock user data for demo - in real app this would come from the store
  const profile = user || {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Full-stack developer passionate about building modern web applications. Love exploring new technologies and sharing knowledge with the community.',
    website: 'https://johndoe.dev',
    github: 'johndoe',
    twitter: 'johndoe',
    joinedDate: '2024-01-01',
    isAuthenticated: true,
  };

  const userStats = isHydrated ? {
    ...stats,
    stacksCreated: userStacks.length,
    totalStars: userStacks.reduce((sum, stack) => sum + stack.stars, 0),
    contributions: 45,
  } : {
    stacksCreated: 0,
    totalStars: 0,
    contributions: 0,
    followersCount: 0,
    followingCount: 0,
  };

  const [editedProfile, setEditedProfile] = useState(profile);
  
  // Show loading until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return <LoadingScreen message="Loading profile..." />
  }

  const achievements = [
    { icon: Star, label: 'Stack Master', description: '1000+ total stars' },
    { icon: TrendingUp, label: 'Trending Creator', description: '3 stacks in top 10' },
    { icon: Award, label: 'Community Hero', description: '50+ contributions' },
  ];

  const handleSaveProfile = () => {
    updateProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile</CardTitle>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Avatar */}
                  <div className="flex justify-center">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-800">
                        <span className="text-2xl font-bold text-white">
                          {profile.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Info */}
                  {isEditing ? (
                    <>
                      <Input
                        label="Name"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      />
                      <TextArea
                        label="Bio"
                        value={editedProfile.bio}
                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                        rows={3}
                      />
                      <Input
                        label="Website"
                        value={editedProfile.website}
                        onChange={(e) => setEditedProfile({ ...editedProfile, website: e.target.value })}
                      />
                      <Input
                        label="GitHub Username"
                        value={editedProfile.github}
                        onChange={(e) => setEditedProfile({ ...editedProfile, github: e.target.value })}
                      />
                      <Input
                        label="Twitter Username"
                        value={editedProfile.twitter}
                        onChange={(e) => setEditedProfile({ ...editedProfile, twitter: e.target.value })}
                      />
                      <div className="flex gap-3">
                        <Button
                          variant="primary"
                          onClick={handleSaveProfile}
                          className="flex-1"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <h2 className="text-xl font-semibold text-slate-100">{profile.name}</h2>
                        <p className="text-sm text-slate-400">{profile.email}</p>
                      </div>
                      
                      <p className="text-sm text-slate-300">{profile.bio}</p>
                      
                      <div className="space-y-2">
                        {profile.website && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Globe className="h-4 w-4" />
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                              {profile.website.replace('https://', '')}
                            </a>
                          </div>
                        )}
                        {profile.github && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Github className="h-4 w-4" />
                            <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                              {profile.github}
                            </a>
                          </div>
                        )}
                        {profile.twitter && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <X className="h-4 w-4" />
                            <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                              @{profile.twitter}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="border-t border-slate-700 pt-4">
                        <p className="text-xs text-slate-500">
                          Member since {new Date(profile.joinedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card variant="glass" className="mt-6">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{userStats.stacksCreated}</div>
                    <div className="text-xs text-slate-400">Stacks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{userStats.totalStars}</div>
                    <div className="text-xs text-slate-400">Stars</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{userStats.contributions}</div>
                    <div className="text-xs text-slate-400">Contributions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card variant="glass" className="mt-6">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="rounded-lg bg-slate-800/50 p-2">
                        <achievement.icon className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200">{achievement.label}</p>
                        <p className="text-xs text-slate-400">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User's Stacks */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-100">My Stacks</h2>
              <Link href="/builder">
                <Button variant="primary">
                  Create New Stack
                </Button>
              </Link>
            </div>

            <div className="space-y-6">
              {userStacks.length === 0 ? (
                <Card variant="glass">
                  <CardContent className="py-16 text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                      <LayoutGrid className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">No stacks yet</h3>
                    <p className="text-slate-400 mb-6">Start building your first technology stack</p>
                    <Link href="/builder">
                      <Button variant="primary">
                        Create Your First Stack
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                userStacks.map((stack) => (
                <Card key={stack.id} variant="glass" className="hover:bg-slate-800/60">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{stack.name}</CardTitle>
                        <p className="mt-1 text-sm text-slate-400">{stack.description}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {stack.technologies.slice(0, 4).map((tech) => (
                        <Badge key={tech.id} variant="primary" size="sm">
                          {tech.name}
                        </Badge>
                      ))}
                      {stack.technologies.length > 4 && (
                        <Badge variant="default" size="sm">
                          +{stack.technologies.length - 4} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-current text-yellow-400" />
                          <span>{stack.stars}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{stack.uses} uses</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(stack.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}