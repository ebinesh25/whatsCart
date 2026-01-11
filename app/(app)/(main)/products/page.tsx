'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { getCollection, addDocument } from '@/lib/firebase/firestore'
import { uploadFile } from '@/lib/firebase/storage'
import type { Product } from '@/lib/types/user'
import { Plus, Package, AlertCircle, X } from 'lucide-react'
import { PRODUCT_CATEGORIES } from '@/lib/constants'

export default function ProductsPage() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [formData, setFormData] = useState({
    nameEn: '',
    nameTa: '',
    descriptionEn: '',
    price: '',
    stock: '',
    category: '',
  })

  useEffect(() => {
    loadProducts()
  }, [user])

  const loadProducts = async () => {
    if (!user?.business) return

    try {
      const data = await getCollection<Product>('products', [])
      setProducts(data.filter((p) => p.businessId === user.business!.id))
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Limit to 5 images
    const remainingSlots = 5 - imageFiles.length
    const filesToAdd = files.slice(0, remainingSlots)

    if (filesToAdd.length < files.length) {
      alert('You can only upload up to 5 images')
    }

    setImageFiles((prev) => [...prev, ...filesToAdd])

    // Create previews
    filesToAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    console.log("User Details", user)
    if (!user?.business) return
    
    console.log("Setting Submitting")
    setSubmitting(true)
    try {
      // Upload images
      console.log("Uploading Images")
      const imageUrls: string[] = []
      for (const file of imageFiles) {
        const url = await uploadFile(
          `products/${user.business.id}/${Date.now()}-${file.name}`,
          file,
          { contentType: file.type }
        )
        imageUrls.push(url)
      }
      console.log("Images. ", imageUrls);

      // Create product
      console.log("FormData", formData)
      await addDocument('products', {
        businessId: user.business.id,
        name: {
          en: formData.nameEn,
          ta: formData.nameTa,
        },
        description: {
          en: formData.descriptionEn,
        },
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        images: imageUrls,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      })

      console.log("Products ", {
        businessId: user.business.id,
        name: {
          en: formData.nameEn,
          ta: formData.nameTa,
        },
        description: {
          en: formData.descriptionEn,
        },
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        images: imageUrls,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      })

      // Reset form
      setFormData({
        nameEn: '',
        nameTa: '',
        descriptionEn: '',
        price: '',
        stock: '',
        category: '',
      })
      setImageFiles([])
      setImagePreviews([])
      setShowAddForm(false)

      // Reload products
      await loadProducts()
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Failed to add product. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">
            {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading products...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 mb-6">Add your first product to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="glass rounded-xl overflow-hidden border border-gray-200"
            >
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 relative">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name.en}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {/* Low Stock Badge */}
                {product.stock > 0 && product.stock < 5 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Low Stock
                  </div>
                )}
                {/* Out of Stock Badge */}
                {product.stock === 0 && (
                  <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {product.name.en}
                </h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  ₹{product.price}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Stock: {product.stock}
                  </span>
                  <span className="text-gray-500 capitalize">
                    {product.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Product Name - English */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="e.g., Cotton Kurti"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Product Name - Tamil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name (Tamil)
                </label>
                <input
                  type="text"
                  value={formData.nameTa}
                  onChange={(e) => setFormData({ ...formData, nameTa: e.target.value })}
                  placeholder="e.g., பருத்தி குர்த்தி"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description - English */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (English)
                </label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  placeholder="Describe your product..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="599"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                </label>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  onClick={() => imagePreviews.length < 5 && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    imagePreviews.length >= 5
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 cursor-pointer hover:border-blue-500'
                  }`}
                >
                  <Package className={`w-12 h-12 mx-auto mb-4 ${imagePreviews.length >= 5 ? 'text-gray-300' : 'text-gray-300'}`} />
                  <p className="text-gray-600 mb-2">
                    {imagePreviews.length >= 5
                      ? 'Maximum 5 images reached'
                      : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {imagePreviews.length}/5 images uploaded
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={imagePreviews.length >= 5}
                    className="hidden"
                  />
                </div>
              </div>
            <div className="p-6 border-t flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setFormData({
                    nameEn: '',
                    nameTa: '',
                    descriptionEn: '',
                    price: '',
                    stock: '',
                    category: '',
                  })
                  setImageFiles([])
                  setImagePreviews([])
                }}
                className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Adding...' : 'Add Product'}
              </button>
            </div>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}
