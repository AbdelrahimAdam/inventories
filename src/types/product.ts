export interface Product {
  id: string
  name: {
    en: string
    ar: string
  }
  description?: {
    en: string
    ar: string
  }
  slug: string
  brandId: string
  brandName?: string
  categoryId?: string
  price: number
  originalPrice?: number
  size: string
  concentration: string
  classification: string
  images: string[]
  isBestSeller: boolean
  isFeatured: boolean
  rating: number
  reviewCount: number
  notes: {
    top: string[]
    heart: string[]
    base: string[]
  }
  inStock: boolean
  stockQuantity: number
  sku: string
  meta?: any
  createdAt: Date
  updatedAt: Date
  tenantId: string
}