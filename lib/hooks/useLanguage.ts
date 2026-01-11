'use client'

import { useAuthStore } from '@/lib/stores/authStore'
import { SUPPORTED_LANGUAGES } from '@/lib/constants'

type Language = 'en' | 'ta'

/**
 * Language hook - Manages language state
 */
export function useLanguage() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const currentLanguage = user?.language || 'en'

  const setLanguage = (language: Language) => {
    if (user) {
      setUser({
        ...user,
        language,
        preferences: {
          ...user.preferences,
          language,
        },
      })
    }
  }

  const getLanguageInfo = (lang: Language) => {
    return SUPPORTED_LANGUAGES.find((l) => l.value === lang)
  }

  const isTamil = currentLanguage === 'ta'

  return {
    language: currentLanguage,
    setLanguage,
    getLanguageInfo,
    isTamil,
    supportedLanguages: SUPPORTED_LANGUAGES,
  }
}
