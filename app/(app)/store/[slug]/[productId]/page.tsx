'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDocument, getCollection } from '@/lib/firebase/firestore'
import { useCart } from '@/lib/hooks/useCart'
import { formatWhatsAppMessage, generateWhatsAppURL } from '@/lib/utils/whatsapp'
import type { Business, Product } from '@/lib/types/user'
import { ShoppingBag, ArrowLeft, Plus, Minus, MessageCircle, X as XIcon } from 'lucide-react'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const productId = params.productId as string

  const { items, customerPhone, totalAmount, addItem, removeItem, updateQuantity, setCustomerPhone, clearCart } = useCart()
  const [business, setBusiness] = useState<Business | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // Get business by slug
        const businesses = await getCollection<Business>('businesses', [
          ['slug', '==', slug],
          ['isActive', '==', true],
        ])

        if (businesses.length === 0) {
          router.push('/store/' + slug)
          return
        }

        setBusiness(businesses[0])

        // Get product by ID
        const productData = await getDocument<Product>('products', productId)

        if (!productData || productData.businessId !== businesses[0].id) {
          router.push('/store/' + slug)
          return
        }

        setProduct(productData)
      } catch (err) {
        console.error('Error loading product:', err)
        router.push('/store/' + slug)
      } finally {
        setLoading(false)
      }
    }

    if (slug && productId) {
      loadData()
    }
  }, [slug, productId, router])

  const handleAddToCart = () => {
    if (!product) return

    for (let i = 0; i < quantity; i++) {
      addItem(product)
    }
    setQuantity(1)
  }

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
        <div className="text-gray-500">Loading product...</div>
      </div>
    )
  }

  if (!product || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
          <button
            onClick={() => router.push('/store/' + slug)}
            className="text-blue-600 hover:underline"
          >
            Back to Store
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/store/' + slug)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Store</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-sm">
              {product.images[selectedImageIndex] ? (
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name.en}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-24 h-24 text-gray-300" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                      selectedImageIndex === index ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name.en} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name.en}
              </h1>
              {product.name.ta && (
                <p className="text-lg text-gray-600 mb-4">{product.name.ta}</p>
              )}
              <p className="text-3xl font-bold" style={{ color: business.color }}>
                ₹{product.price}
              </p>
            </div>

            {product.description && (
              <div className="prose prose-gray">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Description
                </h3>
                <p className="text-gray-700">{product.description.en}</p>
                {product.description.ta && (
                  <p className="text-gray-600 mt-2">{product.description.ta}</p>
                )}
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-gray-700">
                    {product.stock < 10 ? `Only ${product.stock} left in stock` : 'In stock'}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-red-600">Out of stock</span>
                </>
              )}
            </div>

            {/* Quantity Selector and Add to Cart */}
            {product.stock > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-xl font-semibold text-lg transition-colors"
                  style={{
                    backgroundColor: business.color,
                    color: 'white',
                  }}
                >
                  Add {quantity > 1 ? quantity + ' ' : ''}to Cart - ₹{product.price * quantity}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cart Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setCartOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <ShoppingBag className="w-5 h-5" />
          {items.length > 0 && (
            <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

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
                <XIcon className="w-5 h-5" />
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
    </div>
  )
}
