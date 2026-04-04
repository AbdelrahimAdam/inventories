import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import { useInventoryStore } from './inventory'

export const useProductsStore = defineStore('products', () => {
  const auth = useAuthStore()
  const inventory = useInventoryStore()
  const products = ref([])
  const currentProduct = ref(null)
  const loading = ref(false)

  const currentTenantId = computed(() => auth.currentTenantId)

  async function loadProducts() {
    if (!currentTenantId.value) return []
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, brands(name, slug)')
        .eq('tenant_id', currentTenantId.value)
        .eq('in_stock', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      products.value = data || []
      // Enrich with real stock from inventory
      await enrichProductStock()
      return products.value
    } finally {
      loading.value = false
    }
  }

  async function enrichProductStock() {
    // Get all product-item links
    const productIds = products.value.map(p => p.id)
    if (!productIds.length) return
    const { data: links } = await supabase
      .from('product_items')
      .select('product_id, item_id')
      .in('product_id', productIds)
    if (!links?.length) return

    const itemIds = [...new Set(links.map(l => l.item_id))]
    const { data: items } = await supabase
      .from('items')
      .select('id, remaining_quantity')
      .in('id', itemIds)

    const itemStockMap = new Map(items?.map(i => [i.id, i.remaining_quantity]) || [])
    const productStockMap = new Map()
    for (const link of links) {
      const current = productStockMap.get(link.product_id) || 0
      productStockMap.set(link.product_id, current + (itemStockMap.get(link.item_id) || 0))
    }

    for (const product of products.value) {
      const stock = productStockMap.get(product.id) || 0
      product.in_stock = stock > 0
      product.stock_quantity = stock
    }
  }

  async function getProductBySlug(slug) {
    if (!currentTenantId.value) return null
    const { data, error } = await supabase
      .from('products')
      .select('*, brands(name, slug)')
      .eq('slug', slug)
      .eq('tenant_id', currentTenantId.value)
      .single()
    if (error) return null
    // Get linked items stock
    const { data: links } = await supabase
      .from('product_items')
      .select('item_id')
      .eq('product_id', data.id)
    if (links?.length) {
      const itemIds = links.map(l => l.item_id)
      const { data: items } = await supabase
        .from('items')
        .select('remaining_quantity')
        .in('id', itemIds)
      const totalStock = items?.reduce((sum, i) => sum + (i.remaining_quantity || 0), 0) || 0
      data.in_stock = totalStock > 0
      data.stock_quantity = totalStock
    }
    currentProduct.value = data
    return data
  }

  return {
    products,
    currentProduct,
    loading,
    loadProducts,
    getProductBySlug
  }
})