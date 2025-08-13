'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUserStore } from '@/lib/stores/userStore';
import { 
  Menu, 
  X, 
  Code2, 
  LayoutGrid, 
  User, 
  Plus,
  Settings,
  LogOut,
  LogIn,
  Package
} from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { user, logout } = useUserStore();

  const navigation = [
    { name: 'Home', href: '/', icon: null },
    { name: 'Stacks', href: '/stacks', icon: LayoutGrid },
    { name: 'Builder', href: '/builder', icon: Plus },
    { name: 'Components', href: '/components', icon: Package },
  ];

  const userNavigation = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut(); // Sign out from Supabase
    await logout(); // Clear user store
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <header className={cn('sticky top-0 z-50 w-full', className)}>
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50"></div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center gap-3 mr-10 group transition-all duration-200 ease-out hover:scale-[1.02]"
            >
              <div className="p-2.5 bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-200 bg-clip-text text-transparent">
                BlueKit
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out group',
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/15 text-slate-100 shadow-sm border border-blue-500/20'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 hover:scale-[1.02]'
                  )}
                >
                  {item.icon && <item.icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />}
                  {item.name}
                  {isActive(item.href) && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 animate-pulse" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800/60 transition-all duration-200 ease-out hover:scale-105 group"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                    <span className="text-white text-sm font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsUserMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-3 w-52 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/20 z-20">
                      <div className="p-3">
                        <div className="px-3 py-3 text-sm text-slate-300 border-b border-slate-700/50 mb-2">
                          <p className="font-semibold text-slate-100">{user.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                        </div>
                        {userNavigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 rounded-xl transition-all duration-200 ease-out hover:scale-[1.02] group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <item.icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                            {item.name}
                          </Link>
                        ))}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-xl transition-all duration-200 ease-out hover:scale-[1.02] group mt-1"
                        >
                          <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform duration-200">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-200"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-xl transition-all duration-200 hover:scale-105"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-slate-700/50">
            <div className="space-y-2 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/15 text-slate-100 border border-blue-500/20'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 hover:scale-[1.02]'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />}
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

interface NavigationProps {
  className?: string;
  items: Array<{
    name: string;
    href: string;
    icon?: React.ElementType;
    badge?: string | number;
  }>;
  orientation?: 'horizontal' | 'vertical';
}

export const Navigation: React.FC<NavigationProps> = ({ 
  className, 
  items, 
  orientation = 'horizontal' 
}) => {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <nav 
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row gap-1' : 'flex-col gap-1',
        className
      )}
    >
      {items.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive(item.href)
              ? 'bg-slate-800 text-slate-100'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
          )}
        >
          {item.icon && <item.icon className="w-4 h-4" />}
          <span>{item.name}</span>
          {item.badge && (
            <span className="ml-auto bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
};