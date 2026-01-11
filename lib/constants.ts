/**
 * App constants
 */

export const APP_NAME = 'WhatsCart'
export const APP_DESCRIPTION = 'WhatsApp Business for Small Sellers'

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_PRODUCT_IMAGES = 5

export const LOW_STOCK_THRESHOLD = 5

export const FREE_PLAN_LIMITS = {
  products: 20,
  orders: 50,
}

export const PRO_PLAN_PRICE = 99 // ₹99 per month

// Business categories
export const BUSINESS_CATEGORIES = [
  { value: 'garments', label: 'Garments', labelTa: 'ஆடைகள்' },
  { value: 'handicrafts', label: 'Handicrafts', labelTa: '�ைவிளைபொருட்கள்' },
  { value: 'home_goods', label: 'Home Goods', labelTa: 'வீட்டுப் பொருட்கள்' },
  { value: 'fabric', label: 'Fabric', labelTa: 'துணி' },
  { value: 'accessories', label: 'Accessories', labelTa: 'பொருட்கள்' },
  { value: 'other', label: 'Other', labelTa: 'மற்றவை' },
]

// Product categories
export const PRODUCT_CATEGORIES = [
  { value: 'kurtis', label: 'Kurtis', labelTa: 'குர்த்திகள்' },
  { value: 'sarees', label: 'Sarees', labelTa: 'புடவைகள்' },
  { value: 'fabric', label: 'Fabric', labelTa: 'துணி' },
  { value: 'home_decor', label: 'Home Decor', labelTa: 'வீட்டு அலங்காரம்' },
  { value: 'handicrafts', label: 'Handicrafts', labelTa: 'கைவிளைபொருட்கள்' },
  { value: 'accessories', label: 'Accessories', labelTa: 'பொருட்கள்' },
  { value: 'other', label: 'Other', labelTa: 'மற்றவை' },
]

// Default theme colors
export const DEFAULT_COLORS = [
  { value: '#3b82f6', label: 'Blue', bg: 'bg-blue-500' },
  { value: '#0ea5e9', label: 'Sky Blue', bg: 'bg-sky-500' },
  { value: '#6366f1', label: 'Indigo', bg: 'bg-indigo-500' },
  { value: '#8b5cf6', label: 'Purple', bg: 'bg-violet-500' },
  { value: '#ec4899', label: 'Pink', bg: 'bg-pink-500' },
  { value: '#f43f5e', label: 'Red', bg: 'bg-rose-500' },
  { value: '#f97316', label: 'Orange', bg: 'bg-orange-500' },
  { value: '#eab308', label: 'Yellow', bg: 'bg-yellow-500' },
  { value: '#22c55e', label: 'Green', bg: 'bg-green-500' },
  { value: '#14b8a6', label: 'Teal', bg: 'bg-teal-500' },
]

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
]
