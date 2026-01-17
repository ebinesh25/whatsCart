'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDocument, getCollection } from '@/lib/firebase/firestore'
import { useCart } from '@/lib/hooks/useCart'
import type { Business, Product } from '@/lib/types/user'
import { ShoppingBag, ArrowLeft, Plus, Minus, MessageCircle } from 'lucide-react'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const productId = params.productId as string

  const { addItem } = useCart()
  const [business, setBusiness] = useState<Business | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

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
    </div>
  )
}
