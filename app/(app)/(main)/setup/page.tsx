'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { addDocument } from '@/lib/firebase/firestore'
import { uploadFile } from '@/lib/firebase/storage'
import { BUSINESS_CATEGORIES, DEFAULT_COLORS } from '@/lib/constants'
import { Loader2, Upload, Check } from 'lucide-react'
import type { Business, BusinessCategory } from '@/lib/types/user'

export default function SetupPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: DEFAULT_COLORS[0].value,
    whatsappNumber: '',
    category: '' as BusinessCategory | '',
  })

  // Auto-generate slug from business name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    }))
  }

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  // Check if slug is available (mock for now)
  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    // TODO: Implement Firebase Function call
    return true
  }

  // Create business
  const handleCreateBusiness = async () => {
    if (!user) return

    setLoading(true)
    try {
      let logoUrl = ''

      // Upload logo if provided
      if (logoFile) {
        logoUrl = await uploadFile(
          `logos/${user.uid}`,
          logoFile,
          { contentType: logoFile.type }
        )
      }

      // Create business document
      const business: Omit<Business, 'id'> = {
        userId: user.uid,
        name: formData.name,
        slug: formData.slug,
        logo: logoUrl || undefined,
        color: formData.color,
        whatsappNumber: formData.whatsappNumber,
        category: formData.category as BusinessCategory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      }

      const businessId = await addDocument<Omit<Business, 'id'>>('businesses', business)

      // Update user document with business reference
      // TODO: Implement Firebase Function call

      router.push('/products')
    } catch (error) {
      console.error('Error creating business:', error)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid =
    formData.name &&
    formData.slug &&
    formData.whatsappNumber &&
    formData.category

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Set up your business</h1>
          <span className="text-sm text-gray-500">Step {step} of 3</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="glass rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., My Kurti Collection"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store URL
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm whitespace-nowrap">
                whatscart.app/store/
              </span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="mykurti"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value as BusinessCategory }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {BUSINESS_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!isFormValid}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Branding */}
      {step === 2 && (
        <div className="glass rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setLogoFile(null)
                      setLogoPreview('')
                    }}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-600">Upload your business logo</p>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: Square image, at least 200x200px
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme Color
            </label>
            <div className="flex flex-wrap gap-3">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
                  className={`w-12 h-12 rounded-lg ${color.bg} transition-all ${
                    formData.color === color.value
                      ? 'ring-4 ring-offset-2 ring-gray-400'
                      : 'ring-2 ring-transparent hover:ring-gray-300'
                  }`}
                >
                  {formData.color === color.value && (
                    <Check className="w-6 h-6 text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: WhatsApp */}
      {step === 3 && (
        <div className="glass rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Business Number
            </label>
            <input
              type="tel"
              value={formData.whatsappNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, whatsappNumber: e.target.value }))
              }
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Customers will send orders to this number
            </p>
          </div>

          {/* Preview */}
          <div className="border-t pt-6">
            <p className="text-sm font-medium text-gray-700 mb-4">Preview</p>
            <div
              className="rounded-lg p-6 border-2"
              style={{ borderColor: formData.color }}
            >
              <div className="flex items-center gap-3 mb-4">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: formData.color }}
                  >
                    {formData.name.charAt(0) || 'B'}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{formData.name || 'Business Name'}</h3>
                  <p className="text-sm text-gray-500">whatscart.app/store/{formData.slug}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-sm text-gray-500">Product 1</span>
                </div>
                <div className="flex-1 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-sm text-gray-500">Product 2</span>
                </div>
                <div className="flex-1 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-sm text-gray-500">Product 3</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              disabled={loading}
              className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleCreateBusiness}
              disabled={loading || !formData.whatsappNumber}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Complete Setup'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
