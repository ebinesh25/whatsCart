'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithGoogle } from '@/lib/firebase/auth'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAuthStore } from '@/lib/stores/authStore'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()
  const { setUser } = useAuthStore()

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      console.log('User authenticated, redirecting...', { user: user.email, hasBusiness: !!user.business })
      if (user.business) {
        router.push('/products')
      } else {
        router.push('/setup')
      }
    }
  }, [isAuthenticated, user, router])

  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign in...')
      const userData = await signInWithGoogle()
      console.log('Sign in successful', userData)

      if (userData) {
        // Manually set the user data (with business) in the store
        console.log('Setting user data in store', userData)
        setUser(userData)

        // Redirect after a short delay to ensure state is updated
        setTimeout(() => {
          if (userData.business) {
            router.push('/products')
          } else {
            router.push('/setup')
          }
        }, 100)
      }
    } catch (error) {
      console.error('Error signing in:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-8 shadow-xl">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to WhatsCart</h1>
        <p className="text-gray-600 text-sm">
          WhatsApp Business for Small Sellers in Tamil Nadu
        </p>
      </div>

      {/* Google Sign In Button */}
      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>

      {/* Footer */}
      <p className="text-center text-xs text-gray-500 mt-6">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  )
}
