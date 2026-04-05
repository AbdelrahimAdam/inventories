<template>
  <div class="container mx-auto px-4 py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Products</h1>
      <router-link 
        to="/products/new" 
        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Product
      </router-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="product in products" :key="product.id" class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
        <div class="h-48 bg-gray-200 flex items-center justify-center">
          <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-lg mb-1">{{ product.name?.en || product.name || 'Unnamed Product' }}</h3>
          <p class="text-gray-600 text-sm mb-2">{{ product.brands?.name || 'Unknown Brand' }}</p>
          <div class="flex justify-between items-center">
            <span class="text-xl font-bold text-green-600">${{ product.price }}</span>
            <span :class="getStockClass(product.stockQuantity)" class="px-2 py-1 text-xs rounded-full">
              Stock: {{ product.stockQuantity || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="products.length === 0" class="text-center py-12 text-gray-500">
      No products found. Click "Add Product" to create your first product.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const authStore = useAuthStore()
const languageStore = useLanguageStore()

interface Product {
  id: string
  name: any
  price: number
  stockQuantity: number
  brands?: {
    name: string
  }
}

const products = ref<Product[]>([])

const getStockClass = (stock: number) => {
  if (!stock || stock === 0) return 'bg-red-100 text-red-800'
  if (stock < 10) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const fetchProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, brands(name)')
      .eq('tenant_id', authStore.currentTenantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    if (data) {
      products.value = data
    }
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

onMounted(() => {
  fetchProducts()
})
</script>