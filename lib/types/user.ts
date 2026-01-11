/**
 * User profile type (extended from backend)
 */
export interface User {
  // Core auth info
  uid: string
  email: string
  emailVerified: boolean
  displayName: string
  photoURL: string | null
  phoneNumber: string | null
  provider: string
  createdAt: string
  updatedAt: string
  lastLoginAt: string

  // WhatsCart specific
  business?: Business
  language: 'en' | 'ta'
  isActive: boolean

  // Preferences
  preferences: UserPreferences
}

export interface UserPreferences {
  language: string
  timezone: string
  notificationEnabled: boolean
}

/**
 * Business profile type
 */
export interface Business {
  id: string
  userId: string
  name: string
  slug: string
  logo?: string
  color: string
  whatsappNumber: string
  description?: string
  category: BusinessCategory
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export enum BusinessCategory {
  GARMENTS = 'garments',
  HANDICRAFTS = 'handicrafts',
  HOME_GOODS = 'home_goods',
  FABRIC = 'fabric',
  ACCESSORIES = 'accessories',
  OTHER = 'other',
}

/**
 * Product type
 */
export interface Product {
  id: string
  businessId: string
  userId: string
  name: {
    en: string
    ta: string
  }
  description: {
    en: string
    ta?: string
  }
  price: number
  stock: number
  category: ProductCategory
  images: string[]
  videoUrl?: string
  isActive: boolean
  views: number
  createdAt: string
  updatedAt: string
}

export enum ProductCategory {
  KURTIS = 'kurtis',
  SAREES = 'sarees',
  FABRIC = 'fabric',
  HOME_DECOR = 'home_decor',
  HANDICRAFTS = 'handicrafts',
  ACCESSORIES = 'accessories',
  OTHER = 'other',
}

/**
 * Order type (Phase 2)
 */
export interface Order {
  id: string
  businessId: string
  customerPhone: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  source: 'whatsapp' | 'direct'
  utmSource?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  subtotal: number
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
}

/**
 * Cart item type (for buyer side)
 */
export interface CartItem {
  product: Product
  quantity: number
}
