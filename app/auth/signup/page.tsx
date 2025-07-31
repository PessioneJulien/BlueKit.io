'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUserStore } from '@/lib/stores/userStore'
import { Mail, Lock, User, Github, Globe, AlertCircle, Loader2, CheckCircle } from 'lucide-react'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const { register, isLoading, error: storeError } = useUserStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)

    // Basic validation
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    try {
      await register({
        name,
        email,
        password,
        bio: '',
        website: '',
        github: '',
        twitter: ''
      })
      
      if (!storeError) {
        setSuccess(true)
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  const handleProviderSignUp = async (provider: 'github' | 'google') => {
    // TODO: Implement provider sign up with useUserStore
    console.log('Provider sign up not implemented yet:', provider)
    alert('Provider sign up coming soon!')
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card variant="glass">
            <CardContent className="py-16 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-100 mb-2">
                Account Created!
              </h2>
              <p className="text-slate-400 mb-4">
                Please check your email to verify your account.
              </p>
              <p className="text-sm text-slate-500">
                Redirecting to login page...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              BlueKit
            </h1>
          </Link>
          <p className="mt-2 text-sm text-slate-400">
            Create your account
          </p>
        </div>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            {storeError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{storeError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                icon={<User className="h-5 w-5" />}
                required
                disabled={isLoading}
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                icon={<Mail className="h-5 w-5" />}
                required
                disabled={isLoading}
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                icon={<Lock className="h-5 w-5" />}
                required
                disabled={isLoading}
                helperText="Must be at least 6 characters"
              />

              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                icon={<Lock className="h-5 w-5" />}
                required
                disabled={isLoading}
                error={password !== confirmPassword && confirmPassword !== '' ? 'Passwords do not match' : undefined}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-slate-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  onClick={() => handleProviderSignUp('github')}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleProviderSignUp('google')}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Google
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}