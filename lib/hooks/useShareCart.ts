'use client'

import { useState } from 'react'
import { useCart } from './useCart'
import { useAuth } from './useAuth'
import { createSharedCart } from '@/lib/firebase/firestore'
import type { Business } from '@/lib/types/user'

export function useShareCart(business: Business | null) {
  const { items, totalAmount } = useCart()
  const { user } = useAuth()
  const [isSharing, setIsSharing] = useState(false)
  const [sharedCartUrl, setSharedCartUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const shareCart = async () => {
    if (!business || items.length === 0) {
      setError('Cannot share an empty cart')
      return null
    }

    setIsSharing(true)
    setError(null)

    try {
      const cartData: Record<string, any> = {
        storeId: business.id,
        storeName: business.name,
        storeSlug: business.slug,
        storeColor: business.color,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name.en,
          quantity: item.quantity,
          price: item.product.price,
          productImage: item.product.images[0] || undefined,
        })),
        totalAmount,
      }

      // Only include creatorUserId if user is logged in
      if (user?.uid) {
        cartData.creatorUserId = user.uid
      }

      const cartId = await createSharedCart(cartData)
      const url = `${window.location.origin}/store/${business.slug}/cart/${cartId}`

      setSharedCartUrl(url)
      return url
    } catch (err) {
      console.error('Failed to share cart:', err)
      setError('Failed to share cart. Please try again.')
      return null
    } finally {
      setIsSharing(false)
    }
  }

  const copyCartLink = async (): Promise<boolean> => {
    if (!sharedCartUrl) {
      const url = await shareCart()
      if (!url) return false
    }

    try {
      await navigator.clipboard.writeText(sharedCartUrl!)
      return true
    } catch (err) {
      console.error('Failed to copy:', err)
      setError('Failed to copy link to clipboard')
      return false
    }
  }

  return {
    shareCart,
    copyCartLink,
    isSharing,
    sharedCartUrl,
    error,
  }
}
