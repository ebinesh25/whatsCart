'use client'

import { useEffect } from 'react'
import { onAuthChange } from '@/lib/firebase/auth'
import { useAuthStore } from '@/lib/stores/authStore'

/**
 * Auth hook - Manages authentication state
 */
export function useAuth() {
  const { user, isLoading, isInitialized, setUser, setLoading, setInitialized } = useAuthStore()

  useEffect(() => {
    if (isInitialized) return

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setLoading(true)

      if (firebaseUser) {
        // User is signed in - get user data from Firestore
        // This will be handled by the auth service
        // For now, we just set basic user info
        setUser({
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
        })
      } else {
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
