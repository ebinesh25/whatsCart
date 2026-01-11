import { create } from 'zustand'
import type { Business } from '@/lib/types/user'

interface BusinessState {
  business: Business | null
  isLoading: boolean
  error: string | null

  // Actions
  setBusiness: (business: Business | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearBusiness: () => void
}

export const useBusinessStore = create<BusinessState>()((set) => ({
  business: null,
  isLoading: false,
  error: null,

  setBusiness: (business) => set({ business, error: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearBusiness: () => set({ business: null, error: null }),
}))
