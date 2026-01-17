'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getCollection } from '@/lib/firebase/firestore'
import { useCart } from '@/lib/hooks/useCart'
import { formatWhatsAppMessage, generateWhatsAppURL } from '@/lib/utils/whatsapp'
import { useAuth } from '@/lib/hooks/useAuth'
import type { Business, Product } from '@/lib/types/user'
import { ShoppingBag, X, Plus, Minus, MessageCircle } from 'lucide-react'
import { LOW_STOCK_THRESHOLD } from '@/lib/constants'

export default function BuyerStorePage() {
  const params = useParams()
  const slug = params.slug as string

  const { user } = useAuth()
  const { items, customerPhone, totalAmount, addItem, removeItem, updateQuantity, setCustomerPhone, clearCart } = useCart()

  const [business, setBusiness] = useState<Business | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    if (!slug) return
  
    async function loadStoreData() {
      try {
        setLoading(true)
  
        const businesses = await getCollection<Business>('businesses', [
          ['slug', '==', slug],
          ['isActive', '==', true],
        ])
  
        const foundBusiness = businesses[0]
        if (!foundBusiness) return
  
        setBusiness(foundBusiness)
  
        const products = await getCollection<Product>('products', [
          ['businessId', '==', foundBusiness.id],
          ['isActive', '==', true],
        ])
  
        setProducts(products)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  
    loadStoreData()
  }, [slug])


  const handleSendToWhatsApp = () => {
    if (!business || items.length === 0) return

    const message = formatWhatsAppMessage(
      business.name,
      items,
      totalAmount,
      customerPhone
    )

    const whatsappURL = generateWhatsAppURL(business.whatsappNumber, message)
    window.open(whatsappURL, '_blank')

    clearCart()
    setCartOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading store...</div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h1>
          <p className="text-gray-600">This store may have been removed or the URL is incorrect.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: business.color,
          borderColor: business.color,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Business Branding */}
            <div className="flex items-center gap-3">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: business.color }}
                >
                  {business.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="font-bold text-gray-900">{business.name}</h1>
                <p className="text-sm text-gray-600">
                  {products.length} product{products.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Products List */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600">This store hasn&apos;t added any products yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/store/${slug}/${product.id}`}
                className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  {/* Product Image - Left */}
                  <div className="w-32 h-32 sm:w-48 sm:h-48 flex-shrink-0 bg-gray-100 relative">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name.en}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    {/* Low Stock Badge */}
                    {product.stock > 0 && product.stock < LOW_STOCK_THRESHOLD && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Only {product.stock} left
                      </div>
                    )}
                    {/* Out of Stock */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-medium">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info - Right */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {product.name.en}
                      </h3>
                      {product.description && product.description.en && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {product.description.en}
                        </p>
                      )}
                      <p className="text-xl font-bold" style={{ color: business.color }}>
                        ₹{product.price}
                      </p>
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          addItem(product)
                        }}
                        disabled={product.stock === 0}
                        className="px-6 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: product.stock > 0 ? business.color : '#d1d5db',
                          color: 'white',
                        }}
                      >
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setCartOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col">
            {/* Cart Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Shopping Cart</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 border-b pb-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                        {item.product.images[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name.en}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.product.name.en}
                        </h4>
                        <p className="text-blue-600 font-semibold">
                          ₹{item.product.price}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="ml-auto text-red-500 text-sm hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{totalAmount}</span>
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Send to WhatsApp Button */}
                <button
                  onClick={handleSendToWhatsApp}
                  disabled={!customerPhone}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Send Order via WhatsApp
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating Cart Button */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <ShoppingBag className="w-5 h-5" />
        {items.length > 0 && (
          <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
            {items.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        )}
      </button>
    </div>
  )
}
