'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSharedCart } from '@/lib/firebase/firestore'
import { getCollection } from '@/lib/firebase/firestore'
import type { SharedCart, Product } from '@/lib/types/user'
import { ShoppingBag, ArrowLeft, X, Plus, Minus, MessageCircle } from 'lucide-react'
import { formatWhatsAppMessage, generateWhatsAppURL } from '@/lib/utils/whatsapp'
import { useCart } from '@/lib/hooks/useCart'

export default function SharedCartPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const cartId = params.cartId as string

  const [sharedCart, setSharedCart] = useState<SharedCart | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [hasIssues, setHasIssues] = useState(false) // For removed/out-of-stock items

  const { addItem } = useCart()

  useEffect(() => {
    async function loadSharedCart() {
      try {
        setLoading(true)

        // Fetch shared cart
        const cart = await getSharedCart(cartId)
        if (!cart) {
          setNotFound(true)
          return
        }

        // Verify slug matches
        if (cart.storeSlug !== slug) {
          setNotFound(true)
          return
        }

        setSharedCart(cart)

        // Fetch all products in the cart
        const productIds = cart.items.map((item) => item.productId)
        if (productIds.length === 0) {
          setHasIssues(true)
          return
        }

        // Fetch products for this store
        const allProducts = await getCollection<Product>('products', [
          ['businessId', '==', cart.storeId],
          ['isActive', '==', true],
        ])

        // Filter to only products in the cart
        const cartProducts = allProducts.filter((p) => productIds.includes(p.id))
        setProducts(cartProducts)

        // Check if any products are missing or out of stock
        const hasMissingProducts = cart.items.some(
          (cartItem) => !cartProducts.find((p) => p.id === cartItem.productId)
        )
        const hasOutOfStock = cartProducts.some((p) => {
          const cartItem = cart.items.find((item) => item.productId === p.id)
          return cartItem && cartItem.quantity > p.stock
        })

        setHasIssues(hasMissingProducts || hasOutOfStock)
      } catch (err) {
        console.error('Failed to load shared cart:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    loadSharedCart()
  }, [cartId, slug])

  const handleSendToWhatsApp = () => {
    if (!sharedCart || products.length === 0) return

    // Build cart items from shared cart data + current product data
    const cartItems = sharedCart.items
      .map((cartItem) => {
        const product = products.find((p) => p.id === cartItem.productId)
        if (!product) return null

        return {
          product,
          quantity: cartItem.quantity,
        }
      })
      .filter((item) => item !== null)

    const message = formatWhatsAppMessage(
      sharedCart.storeName,
      cartItems,
      sharedCart.totalAmount
    )

    // Use a placeholder phone number or fetch from store
    const whatsappURL = generateWhatsAppURL('', message)
    window.open(whatsappURL, '_blank')
  }

  const handleAddToMyCart = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      addItem(product)
    }
  }

  const handleAddAllToMyCart = () => {
    products.forEach((product) => {
      const cartItem = sharedCart?.items.find((item) => item.productId === product.id)
      if (cartItem) {
        // Add the item multiple times based on quantity
        for (let i = 0; i < cartItem.quantity; i++) {
          addItem(product)
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading shared cart...</div>
      </div>
    )
  }

  if (notFound || !sharedCart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cart Not Found</h1>
          <p className="text-gray-600 mb-6">
            This cart link may be invalid or has expired.
          </p>
          <Link
            href={`/store/${slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Store
          </Link>
        </div>
      </div>
    )
  }

  const availableItems = sharedCart.items.filter((cartItem) =>
    products.find((p) => p.id === cartItem.productId && p.stock > 0)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: sharedCart.storeColor,
          borderColor: sharedCart.storeColor,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/store/${slug}`}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-gray-900">Shared Cart</h1>
              <p className="text-sm text-gray-600">
                From {sharedCart.storeName} • {sharedCart.items.length} item{sharedCart.items.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Warning for issues */}
        {hasIssues && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Some items in this cart are no longer available or are out of stock.
            </p>
          </div>
        )}

        {/* Cart Items */}
        {sharedCart.items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cart is Empty</h3>
            <p className="text-gray-600">This shared cart doesn't contain any items.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sharedCart.items.map((cartItem) => {
              const product = products.find((p) => p.id === cartItem.productId)
              const isAvailable = product && product.stock > 0 && product.stock >= cartItem.quantity
              const isOutOfStock = !product || product.stock === 0
              const lowStock = product && product.stock > 0 && product.stock < cartItem.quantity

              return (
                <div
                  key={cartItem.productId}
                  className={`bg-white rounded-xl p-4 shadow-sm ${
                    !isAvailable ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 relative">
                      {cartItem.productImage ? (
                        <img
                          src={cartItem.productImage}
                          alt={cartItem.productName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <span className="text-white text-xs font-medium">Unavailable</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {cartItem.productName}
                      </h3>
                      <p className="text-lg font-bold" style={{ color: sharedCart.storeColor }}>
                        ₹{cartItem.price}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-gray-600">Qty: {cartItem.quantity}</span>
                        {lowStock && (
                          <span className="text-orange-600 text-sm">
                            Only {product?.stock} available (need {cartItem.quantity})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center">
                      {isAvailable ? (
                        <button
                          onClick={() => handleAddToMyCart(cartItem.productId)}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                          style={{
                            backgroundColor: sharedCart.storeColor,
                            color: 'white',
                          }}
                        >
                          Add to Cart
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">Unavailable</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Total & Actions */}
        {sharedCart.items.length > 0 && (
          <div className="mt-8 p-6 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-lg font-bold mb-4">
              <span>Total</span>
              <span style={{ color: sharedCart.storeColor }}>
                ₹{sharedCart.totalAmount}
              </span>
            </div>

            <div className="space-y-3">
              {/* Add All to Cart Button */}
              {availableItems.length > 0 && (
                <button
                  onClick={handleAddAllToMyCart}
                  className="w-full px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: sharedCart.storeColor,
                    color: 'white',
                  }}
                >
                  Add All to My Cart ({availableItems.length} items)
                </button>
              )}

              {/* Send to WhatsApp Button */}
              <button
                onClick={handleSendToWhatsApp}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Send Order via WhatsApp
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
