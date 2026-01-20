'use client'

import { useEffect } from 'react'
import { onAuthChange } from '@/lib/firebase/auth'
import { useAuthStore } from '@/lib/stores/authStore'
import type { User } from '@/lib/types/user'

/**
 * Auth hook - Manages authentication state
 */
export function useAuth() {
  const { user, isLoading, isInitialized, setUser, setLoading, setInitialized } = useAuthStore()

  useEffect(() => {
    if (isInitialized) return

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      console.log('onAuthChange triggered', { hasUser: !!firebaseUser, uid: firebaseUser?.uid })
      setLoading(true)

      if (firebaseUser) {
        // Get current user state from store (not from closure) to check for persisted data
        const currentUser = useAuthStore.getState().user

        if (currentUser) {
          console.log('Using persisted user data from store', currentUser)
        } else {
          // No persisted data - create basic user data from Firebase Auth
          // This happens on first sign in before signInWithGoogle completes
          const basicUserData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            emailVerified: firebaseUser.emailVerified,
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL,
            phoneNumber: firebaseUser.phoneNumber,
            provider: firebaseUser.providerData[0]?.providerId || 'unknown',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            language: 'en',
            isActive: true,
            preferences: {
              language: 'en',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              notificationEnabled: true,
            },
          }
          console.log('No persisted user data, creating basic data', basicUserData)
          setUser(basicUserData)
        }
      } else {
        console.log('Setting user to null')
        setUser(null)
      }

      setLoading(false)
      setInitialized(true)
    })

    return () => unsubscribe()
  }, [isInitialized, setUser, setLoading, setInitialized])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasBusiness: !!user?.business,
  }
}
