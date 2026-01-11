'use client'

import { useCartStore, useCartTotals } from '@/lib/stores/cartStore'

/**
 * Cart hook - Manages shopping cart state
 */
export function useCart() {
  const items = useCartStore((state) => state.items)
  const customerPhone = useCartStore((state) => state.customerPhone)
  const addItem = useCartStore((state) => state.addItem)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const setCustomerPhone = useCartStore((state) => state.setCustomerPhone)

  const { totalItems, totalAmount } = useCartTotals()

  return {
    items,
    customerPhone,
    totalItems,
    totalAmount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setCustomerPhone,
  }
}
