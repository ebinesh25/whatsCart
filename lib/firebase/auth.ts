import {
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, getDocs, setDoc, serverTimestamp, collection, query, where } from 'firebase/firestore'
import { auth, db } from './config'
import type { User, Business } from '@/lib/types/user'

const googleProvider = new GoogleAuthProvider()

/**
 * Sign in with Google using popup
 */
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const firebaseUser = result.user

    // Check if user document exists, if not create it
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))

    // Check if the user has business registered
    const businessDoc = await getDoc(doc(db, 'business', firebaseUser.uid))

    if (!userDoc.exists()) {
      // Create new user document
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        emailVerified: firebaseUser.emailVerified,
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
        provider: 'google.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isActive: true,
        language: detectLanguage(),
        preferences: {
          language: detectLanguage(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notificationEnabled: true,
        },
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser)
      return newUser
    }

    // Update last login
    await setDoc(
      doc(db, 'users', firebaseUser.uid),
      {
        business: businessDoc,
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )

    const userData = userDoc.data() as User

    // Fetch business for this user
    try {
      const businessQuery = query(collection(db, 'businesses'), where('userId', '==', firebaseUser.uid))
      const businessSnapshot = await getDocs(businessQuery)

      if (!businessSnapshot.empty) {
        const businessDoc = businessSnapshot.docs[0]
        const businessData = { ...businessDoc.data(), id: businessDoc.id } as Business
        console.log('Business found during sign in', businessData)
        // Attach business to user
        return { ...userData, business: businessData }
      }
    } catch (error) {
      console.error('Error fetching business during sign in:', error)
    }

    return userData
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

/**
 * Sign in with Google using redirect (for mobile)
 */
export function signInWithGoogleRedirect() {
  return signInWithRedirect(auth, googleProvider)
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

/**
 * Get current user from Firebase Auth
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback)
}

/**
 * Auto-detect language from browser locale
 * Defaults to Tamil for India, English otherwise
 */
function detectLanguage(): 'en' | 'ta' {
  if (typeof window === 'undefined') return 'en'

  const locale = navigator.language || navigator.languages?.[0] || 'en'

  // Tamil for India locale
  if (locale.startsWith('ta') || locale === 'en-IN') {
    return 'ta'
  }

  return 'en'
}
