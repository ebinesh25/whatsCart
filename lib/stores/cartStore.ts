import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/lib/types/user'

interface CartState {
  items: CartItem[]
  customerPhone: string

  // Computed
  totalItems: number
  totalAmount: number

  // Actions
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setCustomerPhone: (phone: string) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customerPhone: '',

      totalItems: 0,
      totalAmount: 0,

      addItem: (product, quantity = 1) => {
        const items = get().items
        const existingItem = items.find((item) => item.product.id === product.id)

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          })
        } else {
          set({ items: [...items, { product, quantity }] })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        })
      },

      clearCart: () => set({ items: [], customerPhone: '' }),

      setCustomerPhone: (phone) => set({ customerPhone: phone }),
    }),
    {
      name: 'whatscart-cart',
      partialize: (state) => ({ items: state.items, customerPhone: state.customerPhone }),
    }
  )
)

// Computed values helper
export const useCartTotals = () => {
  const items = useCartStore((state) => state.items)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  return { totalItems, totalAmount }
}
